import firebase from '../../../firebase/clientApp'    
import {validateFunc} from '../validate'
import { google } from 'googleapis'; 

/*
* /api/inventory/CheckoutItems.js
* req.body = {barcode1: quantity1, barcode2: quantity2, ...}
*/

/*
 * NOTE: there is a distinction between a spreadsheet and a sheet:
 *  - `spreadsheet` refers to a single google sheet document
 *  - `sheet` or `page` refers to a named page within a spreadsheet. a spreadsheet can contain 1 or more sheets.
 *
 * In this code, `sheetId` is something like `June22`, but `spreadsheetId` is a long string of characters
*/

import service from "../../../service-account.enc";
import decrypt from "../../../utils/decrypt.js"

function requireParams(body, res) {
    /* require elements: array of elements {barcode: quantity} */

    //require orders to have at least one item
    if (body.length <= 0) {
        res.json({error: "empty order"});
        res.status(400);
        return false;
    }

    return true;
}

// Gets the spreadsheetID and sheetName from firebase. These can be changed in the admin page.
function getFirebaseInfo() {
    return new Promise((resolve) => {
        firebase.auth().signInAnonymously()
        .then(() => {
            firebase.database().ref('/sheetIDs')
            .once('value', snapshot => {
                let val = snapshot.val();
                return resolve({spreadsheetId: val.checkoutLog, sheetName: val.checkoutLogSheet})
            });
        })
    })
}

// Gets the *sheet* ID for the page of the spreadsheet that we want to write to.
function getSheetIds(sheets, spreadsheetId, sheetName) {
    return new Promise((resolve) => {
        sheets.spreadsheets.get({spreadsheetId: spreadsheetId, fields: "sheets.properties.sheetId,sheets.properties.title"})
        .then((resp) => {
            let sheetIds = resp.data.sheets//.forEach((x) => sheetDict[x.properties.title] = x.properties.sheetId)
            let sheetMatch = sheetIds.filter((info) => sheetName === info.properties.title)
            if (sheetMatch.length == 0) {
                console.log("warning: given sheet name cannot be found in this spreadsheet")
                resolve(0); // default to home sheet (first page)
            }
            resolve(sheetMatch[0].properties.sheetId); // dictionary of sheetName (string) -> sheetId (number)
        })
    })
}

function writeLog(log) {

    let {client_email, private_key} = JSON.parse(decrypt(service.encrypted));

    return new Promise((resolve, reject) => {
        const target = ['https://www.googleapis.com/auth/spreadsheets'];
        var sheets_auth = new google.auth.JWT(
          client_email,
          null,
          (private_key || '').replace(/\\n/g, '\n'),
          target
        );
        const sheets = google.sheets({ version: 'v4', auth: sheets_auth });
    

        getFirebaseInfo().then(({spreadsheetId, sheetName}) => {

            let now = new Date();

            let input = []
            let row1 = now.toLocaleString("en-US",{timeZone:"America/Los_Angeles"}).replace(',', '')

            // create payload to write to sheet. only first row of checkout should have timestamp
            for (let barcode in log) {
                let itemLog = log[barcode]
                input.push([row1, row1, barcode, itemLog.quantity, itemLog.itemName, itemLog.newQuantity])
                row1 = "";
            }
        
            const values = {
                spreadsheetId: spreadsheetId,
                range: `${sheetName}!A:F`,
                valueInputOption: "USER_ENTERED", 
                insertDataOption: "INSERT_ROWS",
                resource: {
                    "range": `${sheetName}!A:F`,
                    "majorDimension": "ROWS",
                    "values": input
                  } ,
                auth: sheets_auth
            }
    
            sheets.spreadsheets.values.append(values)
            .then((resp) => {
    
                // if first entry, set format for future appends
                let range = resp.data.updates.updatedRange
                let rstart = range.match(/(?<row>\d+):/).groups.row - 1 // the index of the first newly written row
    
                getSheetIds(sheets, spreadsheetId, sheetName).then((pageID) => {    
                   
                    // this is very long and annoying :( sorry
                    const sheetFormat = {
                        spreadsheetId: spreadsheetId,
                        resource: {
                            requests: [
                            { // column 1 (date)
                                repeatCell: {
                                    range: {
                                        sheetId: pageID,
                                        startRowIndex: rstart,
                                        endRowIndex: rstart + input.length,
                                        startColumnIndex: 0,
                                        endColumnIndex: 1
                                    },
                                    cell: {
                                        userEnteredFormat: {
                                            numberFormat: {
                                                type: "DATE",
                                                pattern: "ddddd m/dd"
                                            },
                                            textFormat: {
                                                bold: false
                                            }
                                        }
                                    },
                                    fields: "userEnteredFormat(numberFormat,textFormat)"
                                }
                            },
                            { // column 2 (time)
                                repeatCell: {
                                    range: {
                                        sheetId: pageID,
                                        startRowIndex: rstart,
                                        endRowIndex: rstart + input.length,
                                        startColumnIndex: 1,
                                        endColumnIndex: 2
                                    },
                                    cell: {
                                        userEnteredFormat: {
                                            numberFormat: {
                                                type: "TIME",
                                                pattern: "h:mm am/pm"
                                            },
                                            textFormat: {
                                                bold: false
                                            }
                                        }
                                    },
                                    fields: "userEnteredFormat(numberFormat,textFormat)"
                                }
                            },
                            { // column 3 (barcode)
                                repeatCell: {
                                    range: {
                                        sheetId: pageID,
                                        startRowIndex: rstart,
                                        endRowIndex: rstart + input.length,
                                        startColumnIndex: 2,
                                        endColumnIndex: 3
                                    },
                                    cell: {
                                        userEnteredFormat: {
                                            numberFormat: {
                                                type: "TEXT",
                                            },
                                            textFormat: {
                                                bold: false
                                            }
                                        }
                                    },
                                    fields: "userEnteredFormat(numberFormat,textFormat)"
                                }
                            },
                            { // column 4 (quantity)
                                repeatCell: {
                                    range: {
                                        sheetId: pageID,
                                        startRowIndex: rstart,
                                        endRowIndex: rstart + input.length,
                                        startColumnIndex: 3,
                                        endColumnIndex: 6
                                    },
                                    cell: {
                                        userEnteredFormat: {
                                            textFormat: {
                                                bold: false
                                            }
                                        }
                                    },
                                    fields: "userEnteredFormat(textFormat)"
                                }
                            },
                            ]
                        }
                    }
    
                    sheets.spreadsheets.batchUpdate(sheetFormat).then(() => resolve())
                })
            })
            .catch((err) => {
                reject("Unable to access the google sheet.")
            })
        })
    })
}

export default async function(req,res) {  
    
    const token = req.headers.authorization

    return new Promise((resolve, reject) => {
        const {body} = req
        let log = {};
    
        // verify parameters
        let ok = requireParams(body, res);
        if (!ok) {
            res.status(400).json({message: "bad request parameters"});
            return resolve();
        }

        validateFunc(token)
        .then(() => {
            firebase.auth().signInAnonymously()
            .then(() => {
                
                Promise.all(
                    Object.keys(body).map(barcode => {
                        return new Promise((resolve) => {
                            let ref = firebase.database().ref(`/inventory/${barcode}`)
                            ref.once("value")
                            .then(snapshot => {
                                const itemInfo = snapshot.val();
                                if (snapshot.exists()) {
                                    ref.update({"count": firebase.database.ServerValue.increment(-1 * body[barcode])})
                                    .then(() => {
                                        log[barcode] = {quantity: body[barcode], itemName: itemInfo.itemName, newQuantity: (itemInfo.count - body[barcode])}
                                        return resolve();
                                    })
                                    .catch(error => {
                                        res.status(500);
                                        res.json({error: `Error when checking out item (barcode ${barcode}): ${error}`});
                                        return resolve();
                                    })
                                } else {
                                    console.log(`possible data corruption: invalid barcode ${barcode}`)
                                }
                            });
                        })
                    })
                ).then(() => {
                    // perform checkout logging
                    writeLog(log).then(() => {
                        res.status(200);
                        res.json({message: "success"});
                        return resolve();
                    })
                    .catch((err) => {
                        // TODO: shows to user as successful. can try to notify the user of an error though?
                        console.log(`Error writing to log (${err}). Inventory was still updated.`)
                        res.status(200);
                        res.json({message: `Error writing to log (${err}). Inventory was still updated.`});
                        return resolve();
                    })
                })
                .catch(() => {
                    console.log(`possible data corruption`)
                })
            }).catch((err) => {
                console.log("CheckoutItems signInAnonymously error:", err)
                res.status(500);
                res.json({message: "error signing in to firebase"});
                return resolve();
            })
        }).catch(() => {
            console.log("Checkout: user not authenticated")
            res.status(401);
            res.json({error: "you are not authenticated to perform this action"})
            return resolve();
        })
    })
}