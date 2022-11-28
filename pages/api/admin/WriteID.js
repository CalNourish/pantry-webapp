import { validateFunc } from "../validate";
import { google } from "googleapis";

import {service_info} from "../../../utils/decrypt.js";
import firebase from '../../../firebase/clientApp'

/*
 * /api/admin/WriteID
 * req.body = { string calID, boolean isGrad }
 */

function requireParams(body) {
  // makes sure that the input is in the right format
  // returns false and an error if not a good input
  if (body.calID && body.isGrad != null) return true;
  return false;
}

//converts from 2022-07-23T20:35:41.935Z to 7/23/2022 12:15:52
function formatTime(timeToConvert) {
const formattedHours = timeToConvert.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', second:'2-digit', timeZone: 'America/Los_Angeles'})
const formattedTime = timeToConvert.toLocaleDateString('en-US', {timeZone: 'America/Los_Angeles'}) + " " + formattedHours;
    return formattedTime;
}

function getSheetsLink(isGrad) {
  return new Promise((resolve, reject) => {
    firebase.database().ref('/sheetIDs')
    .once('value', snapshot => {
        let val = snapshot.val();
        if (isGrad) {
            return resolve(val.checkInGrad)
        }
        return resolve(val.checkIn)
    })
    .catch(error => {
      return reject(error);
    });
  })
}

export default async function (req, res) {
  const token = req.headers.authorization;
  return new Promise((resolve) => {
    const { body } = req;

    // verify parameters
    let ok = requireParams(body, res);
    if (!ok) {
      res.status(400).json({ message: "Missing CalID or grad boolean" });
      return resolve();
    }

    validateFunc(token).then(() => {
      const target = ["https://www.googleapis.com/auth/spreadsheets"];
      var sheets_auth = new google.auth.JWT(
        service_info.client_email,
        null,
        (service_info.private_key || "").replace(/\\n/g, "\n"),
        target,
        null,
        service_info.private_key_id
      );
      const sheets = google.sheets({ version: "v4", auth: sheets_auth });

      getSheetsLink(body.isGrad)
      .then(({spreadsheetId, sheetName}) => {
        var calID = body.calID
        var checkInTime = new Date();
        var rangeQuery = sheetName + "!A:B";
        const request = {
          spreadsheetId: spreadsheetId,
          range: rangeQuery,
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          resource: {
            range: rangeQuery,
            majorDimension: "ROWS",
            values: [[formatTime(checkInTime), "'" + calID]],
          },
        };
        sheets.spreadsheets.values.append(request)
        .then(() => {
          res.status(200);
          res.json({ message: "success" }); 
          return resolve();
        }
        )
        .catch((error) => {
          res.status(500).json({error: "error writing to Pantry data sheet: " +  error})
          return resolve();
        });    
        })
        .catch((error) => {
          res.status(500).json({error: "error with firebase auth: " + error})
          return resolve();
        });
      })
      .catch((error) => {
        res.status(500).json({error: "error getting google sheets link: " + error})
        return resolve();
      });
    })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." });
      return resolve();
    });
}
