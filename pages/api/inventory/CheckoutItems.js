import firebase from '../../../firebase/clientApp'
import { validateFunc } from '../validate'
import { setupFormatColumns } from '../../../utils/sheets'
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
 * In this code, `sheetId` is something like `June22`, but `spreadsheetId` is a long string of characters in the url.
*/

import { service_info } from "../../../utils/decrypt.js"
import { getAuth, signInAnonymously } from 'firebase/auth';

const CHECKOUT_MAX = 1000;

function requireParams(body, res) {
  /* require elements: array of elements {barcode: quantity} */

  //require orders to have at least one item
  if (body.length <= 0) {
    res.status(400).json({ error: "Order does not contain any items." });
    return false;
  }

  // require quantities to be parse-able as integers
  for (let barcode in body) {
    let quantity = parseInt(body[barcode])
    if (quantity != 0 && !quantity) {
      res.status(400).json({ error: `Unable to parse quantity for barcode ${barcode}: '${body[barcode]}'` })
      return false;
    }
    if (quantity > CHECKOUT_MAX) {
      res.status(400).json({ error: `Quantity of ${barcode} exceeds max quantity (${body[barcode]} > ${CHECKOUT_MAX}).`})
      return false;
    }
  }

  return true;
}

// Gets the spreadsheetID and sheetName from firebase. These can be changed in the admin page.
function getCheckoutSheet(isPantryCheckout, isGrabnGoCheckout) {
  return new Promise((resolve, reject) => {
    firebase.database().ref('/sheetIDs')
    .once('value', snapshot => {
      let val = snapshot.val();

      // Send to correct checkout log & make sure there are not more than 1 true value.
      if (!(isPantryCheckout & isGrabnGoCheckout)) {
        if (isPantryCheckout) {
          return resolve(val.checkoutLog)
        } else if (isGrabnGoCheckout) {
          return resolve(val.grabnGoCheckoutLog)
        }
      }
    })
    .catch((err) => {
      console.log("error getting google sheet links from firebase")
      return reject(err)
    });
  })
}

// log: Checked out items. isPantryCheckout: Boolean whether it is for pantry or not.
function writeLog(log, isPantryCheckout, isGrabnGoCheckout) {
  let { client_email, private_key } = service_info;
  return new Promise((resolve, reject) => {
    const target = ['https://www.googleapis.com/auth/spreadsheets'];
    var sheets_auth = new google.auth.JWT(
      client_email,
      null,
      (private_key || '').replace(/\\n/g, '\n'),
      target
    );
    const sheets = google.sheets({ version: 'v4', auth: sheets_auth });

    getCheckoutSheet(isPantryCheckout, isGrabnGoCheckout)
    .then(({ spreadsheetId, sheetName, pageId }) => {
      let now = new Date();

      // Add single quote to force text format
      let date = "'" + now.toLocaleDateString('en-US', { weekday: 'long', month: 'numeric', day: 'numeric', timeZone: 'America/Los_Angeles' }).replace(',', '');
      let time = "'" + now.toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", timeZone: 'America/Los_Angeles' });

      // create payload to write to sheet. only first row of checkout should have timestamp
      let input = []
      for (let barcode in log) {
        let itemLog = log[barcode]
        if (itemLog.quantity <= 0){
          continue;
        }

        input.push([date, time, barcode, itemLog.quantity, itemLog.itemName, itemLog.newQuantity])
        date = "";
        time = "";
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
        },
        auth: sheets_auth
      }

      sheets.spreadsheets.values.append(values)
      .catch((err) => {
        reject("Unable to access the google sheet: " + err)
      })
      .then((resp) => {
        let requestFormat = setupFormatColumns(resp, pageId)

        // reformat the cells written
        const sheetFormat = {
          spreadsheetId: spreadsheetId,
          resource: {
            requests: [
              requestFormat([0, 3], { type: "TEXT" }),                   // column 1-3 (date, time, barcode)
              requestFormat([3, 6]),                                     // column 4-6 (quantity, name, new quantity)
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
    .catch((err) => {
      return reject(err)
    });
  })
}

export default async function (req, res) {
  return new Promise((resolve) => {
    const { body } = req
    let log = {};

    // check request parameters
    if (!requireParams(body, res)) {
      return resolve();
    }


    const isPantryCheckout = (req.headers.ispantrycheckout == 'true')
    const isGrabnGoCheckout = (req.headers.isgrabngocheckout == 'true')    
    const token = req.headers.authorization
    validateFunc(token)
    .then(() => {
      const auth = getAuth()
      signInAnonymously(auth)
      .then(() => {
        // update quantities for each item in inventory and get item info for logging
        Promise.all(
          Object.keys(body).map(barcode => {
            return new Promise((resolve, reject) => {
              let ref = firebase.database().ref(`/inventory/${barcode}`)
              ref.once("value")
              .then(snapshot => {
                const itemInfo = snapshot.val();
                if (snapshot.exists()) {
                  ref.update({ "count": firebase.database.ServerValue.increment(-1 * body[barcode]) })
                  .then(() => {
                    log[barcode] = {
                      quantity: body[barcode],
                      itemName: itemInfo.itemName,
                      newQuantity: (itemInfo.count - body[barcode])
                    }
                    return resolve();
                  })
                  .catch(error => {
                    console.log("Error updating ref:", error)
                    return reject(`Cannot update item (barcode: ${barcode})`);
                  })
                } else {
                  console.log(`Possible data corruption. Nonexistent barcode ${barcode}`)
                  return reject(`Nonexistent item (barcode: ${barcode})`);
                }
              })
              .catch(err => {
                console.log("Unable to access firebase database.", err)
                return reject(`Unable to access firebase database (barcode ${barcode})`);
              });
            })
          })
        ).then(() => {
          // perform checkout logging
          writeLog(log, isPantryCheckout, isGrabnGoCheckout).then((msg) => {
            res.status(200);
            res.json({ success: msg });
            return resolve();
          })
          .catch((err) => {
            console.log("Error writing to checkoutLog.", err)
            res.status(200).json({ warning: `Error writing to log. Inventory was still updated.` });
            return resolve();
          })
        })
        .catch((err) => {
          res.status(500).json({ error: "Database Error. " + err });
          return resolve();
        })
      }).catch((err) => {
        res.status(500);
        res.json({ error: "Error signing in to firebase. " + err });
        return resolve();
      })
    }).catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." })
      return resolve();
    })
  })
}