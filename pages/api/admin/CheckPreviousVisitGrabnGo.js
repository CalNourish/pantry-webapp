import { validateFunc } from "../validate";
import { google } from "googleapis";

import {service_info} from "../../../utils/decrypt.js";
import firebase from '../../../firebase/clientApp'

/*
 * /api/admin/CheckPreviousVisit
 * req.body = { string calID, boolean isGrabnGo }
 */

function requireParams(body) {
  // makes sure that the input is in the right format
  // returns false and an error if not a good input
  if (body.calID && body.isGrabnGo != null) return true;
  return false;
}

//returns the start of the day
function determineStartOfDay() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay.getTime();
}

//converts from 2022-07-23T20:35:41.935Z to 7/23/2022 12:15:52
function formatTime(timeToConvert) {
const formattedHours = timeToConvert.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', second:'2-digit', timeZone: 'America/Los_Angeles'})
const formattedTime = timeToConvert.toLocaleDateString('en-US', {timeZone: 'America/Los_Angeles'}) + " " + formattedHours;
    return formattedTime;
}

//converts from 2022-07-23T20:35:41.935Z to Mon Jul 23 2022 at 08:35 PM
function formatTimeForVisits(timeToConvert) {
  const formattedHours = timeToConvert.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})
  const formattedTime = timeToConvert.toDateString('en-US', {timeZone: 'America/Los_Angeles'}) + " at " + formattedHours;
  return formattedTime;
  }

//get the number of rows for the Check Out sheet
function getNumRowsForCheckIn(properties, sheetname) {
  for (var sheet of properties["data"]["sheets"]) {
    if (sheet.properties.title == sheetname) {
      return sheet.properties.gridProperties.rowCount;
    }
  }
}

function scanTableForVisitInPastDay(values, calId) {
  var visitedTimes = [];

  if (parseInt(calId) === 1) {
    return visitedTimes;
  }

  const today = new Date().toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles"
  });

  for (var i = values.length - 1; i >= 0; i--) {
    if (!values[i][0]) {
      continue;
    }

    const rowDateTime = String(values[i][0]).trim();
    const rowCalId = String(values[i][1] || "").trim();

    // Example: "4/17/2026 10:41:19"
    const parts = rowDateTime.split(" ");
    const rowDate = parts[0];
    const rowTime = parts[1];

    // We have reached yesterday
    if (rowDate !== today) {
      break;
    }

    if (rowCalId === String(calId).trim()) {
      visitedTimes.push(rowTime);
    }
  }

  return visitedTimes;
}

function getSheetsLink(isGrabnGo) {
  return new Promise((resolve, reject) => {
    firebase.database().ref('/sheetIDs')
    .once('value', snapshot => {
        let val = snapshot.val();
        if (isGrabnGo) {
            return resolve(val.checkInGrabnGo)
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
      res.status(400).json({ message: "Missing CalID or grabngo boolean" });
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

      getSheetsLink(body.isGrabnGo)
      .then(({spreadsheetId, sheetName}) => {
        var numRows = 0;
        var calID = body.calID
        let numberOfRowsToGoBack = 1000;
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

        //check for visit in past calendar week
        sheets.spreadsheets.get({spreadsheetId: spreadsheetId})
        .then((properties) => (numRows = getNumRowsForCheckIn(properties, sheetName)))
        .then(function () {
          var startingRow = numRows - numberOfRowsToGoBack;
          if (startingRow > 0) {
            rangeQuery = sheetName + "!A" + startingRow.toString() + ":B";
          }
          const paramsForVisits = {
            spreadsheetId: spreadsheetId,
            range: sheetName + "!A:B",
          };
          sheets.spreadsheets.values.get(paramsForVisits)
          .then((body) => {
            var scannedRows = body.data.values || [];

            // Only check last 1000 populated rows
            scannedRows = scannedRows.slice(-1000);

            res.json(
              scanTableForVisitInPastDay(
                scannedRows,
                calID
              )
            );

            return resolve();
          })
          .catch((error) => {
            res.status(500).json({error: "error reading from Grab n Go data sheet: " + error})
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
  });
}
