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

import { service_info } from "../../../utils/decrypt.js"

function requireParams(body, res) {
    /* require elements: array of elements {barcode: quantity} */

    //require orders to have at least one item
    if (body.length <= 0) {
        res.json({error: "empty order"});
        res.status(400);
        return false;
    }

    // require quantities to be integers
    for (let barcode in body) {
        if (!parseInt(body[barcode])) {
            res.json({error: `unable to parse quantity '${body[barcode]}'`})
            res.status(400);
            return false;
        }
    }

    return true;
}

// Gets the spreadsheetID and sheetName from firebase. These can be changed in the admin page.
function getFirebaseInfo() {
    return new Promise((resolve) => {
        firebase.database().ref('/sheetIDs')
        .once('value', snapshot => {
            let val = snapshot.val();

            return resolve(val.checkoutLog)
        });
        //TODO: error handling
    })
}

// returns a function that can setup the formatter based on the result of a `append` call
const setupFormatColumns = (resp, pageId) => {
    // if first entry, set format for future appends
    let range = resp.data.updates.updatedRange
    let rowStart = range.match(/(?<row>\d+):/).groups.row - 1 // the index of the first newly written row
    let length = resp.data.updates.updatedRows

    return (colIndex, numberFormat, textFormat) => {
        var cstart = colIndex, cend = colIndex + 1;
        if (typeof(colIndex) == 'object') {
            cstart = colIndex[0];
            cend = colIndex[1];
        }
        return {
            repeatCell: {
                range: {
                    sheetId: pageId,
                    startRowIndex: rowStart,
                    endRowIndex: rowStart + length,
                    startColumnIndex: cstart,
                    endColumnIndex: cend
                },
                cell: {
                    userEnteredFormat: {
                        numberFormat: numberFormat,
                        textFormat: textFormat
                    }
                },
                fields: `userEnteredFormat(${numberFormat ? "numberFormat," : ""}textFormat)`
            }
        }
    }
}

function writeLog(log) {

    let {client_email, private_key} = service_info;

    return new Promise((resolve, reject) => {
        const target = ['https://www.googleapis.com/auth/spreadsheets'];
        var sheets_auth = new google.auth.JWT(
          client_email,
          null,
          (private_key || '').replace(/\\n/g, '\n'),
          target
        );
        const sheets = google.sheets({ version: 'v4', auth: sheets_auth });
    

        getFirebaseInfo().then(({spreadsheetId, sheetName, pageId}) => {
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
            .catch((err) => {
                reject("Unable to access the google sheet.")
            })
            .then((resp) => {    
                let generateFormatter = setupFormatColumns(resp, pageId)

                // this is very long and annoying :( sorry
                const sheetFormat = {
                    spreadsheetId: spreadsheetId,
                    resource: {
                        requests: [
                            generateFormatter(0, {type:"DATE", pattern:"ddddd m/dd"}, {bold:false}), // column 1 (date)
                            generateFormatter(1, {type:"TIME", pattern:"h:mm am/pm"}, {bold:false}), // column 2 (time)
                            generateFormatter(2, {type:"TEXT"}, {bold:false}),               // column 3 (barcode)
                            generateFormatter([3,6], {}, {bold:false}),                   // column 4 (quantity)
                        ]
                    }
                }
    
                sheets.spreadsheets.batchUpdate(sheetFormat).then(() => resolve())
            })
            .catch((err) => {
                console.log(err)
                resolve("warning: possible problem with sheet formatting");
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
                                        return reject();
                                    })
                                } else {
                                    console.log(`possible data corruption: invalid barcode ${barcode}`)
                                    return resolve();
                                }
                            })
                            .catch(err => {
                                res.status(500);
                                res.json({error: `Error accessing firebase (barcode ${barcode}): ${err}`});
                                return reject();
                            });
                        })
                    })
                ).then(() => {
                    // perform checkout logging
                    writeLog(log).then((msg) => {
                        res.status(200);
                        res.json({message: msg});
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
                    res.status(500);
                    res.json({message: "error modifying firebase"});
                    return resolve();
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