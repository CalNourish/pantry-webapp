import firebase from '../../../firebase/clientApp'    
import {validateFunc} from '../validate'
import { google } from 'googleapis'; 

/*
* /api/inventory/CheckoutItems.js
* req.body = {barcode1: quantity1, barcode2: quantity2, ...}
*/

import service from "../../../service-account.enc";
import decrypt from "../../../utils/decrypt.js"
const spreadsheetId = "1waiCSO7hm8kmWLaG8OdB8_7ksfEbm_B3CyKHbXTIf5E"
const sheetName = "June22"

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

function getSheetIds(sheets) {
    return new Promise((resolve) => {
        sheets.spreadsheets.get({spreadsheetId: spreadsheetId, fields: "sheets.properties.sheetId,sheets.properties.title"})
        .then((sheetIds) => {
            let sheetDict = {}
            sheetIds.data.sheets.forEach((x) => sheetDict[x.properties.title] = x.properties.sheetId)
            resolve(sheetDict); // dictionary of sheetName (string) -> sheetId (number)
        })
    })
}

function writeLog(items) {

    let {client_email, private_key} = JSON.parse(decrypt(service.encrypted));

    return new Promise((resolve) => {
        const target = ['https://www.googleapis.com/auth/spreadsheets'];
        var sheets_auth = new google.auth.JWT(
          client_email,
          null,
          (private_key || '').replace(/\\n/g, '\n'),
          target
        );
        const sheets = google.sheets({ version: 'v4', auth: sheets_auth });
    
        let now = new Date();

        let input = []
        let row1 = now.toLocaleString("en-US",{timeZone:"America/Los_Angeles"}).replace(',', '')
        for (let barcode in items) {
            input.push([row1, row1, barcode, items[barcode]])
            row1 = "";
        }
    
        const values = {
            spreadsheetId: spreadsheetId,
            range: sheetName + "!A:C",
            valueInputOption: "USER_ENTERED", 
            insertDataOption: "INSERT_ROWS",
            resource: {
                "range": sheetName + "!A:C",
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

            getSheetIds(sheets).then((sheetIds) => {
                let pageID = sheetIds[sheetName]
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
                                    endColumnIndex: 4
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
    })
}

export default async function(req,res) {  
    
    const token = req.headers.authorization

    return new Promise((resolve, reject) => {
        const {body} = req
    
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
                                if (snapshot.exists()) {
                                    ref.update({"count": firebase.database.ServerValue.increment(-1 * body[barcode])})
                                    .then(() => {
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
                    writeLog(body).then(() => {
                        res.status(200);
                        res.json({message: "success"});
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