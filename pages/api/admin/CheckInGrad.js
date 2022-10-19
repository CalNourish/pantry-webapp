import { validateFunc } from "../validate";
import { google } from "googleapis";

import {service_info} from "../../../utils/decrypt.js";
import firebase from '../../../firebase/clientApp'

/*
 * /api/admin/CheckIn
 * req.body = { string calID }
 */

function requireParams(body) {
  // makes sure that the input is in the right format
  // returns false and an error if not a good input
  if (body.calID) return true;
  return false;
}

//returns the start of the week given a day
function determineStartOfWeek(currDay) {
  let startOfWeek = new Date(currDay.toLocaleDateString());
  const millisecondsPerDay = 86400000;
  const milSecondsUntilStart = millisecondsPerDay * currDay.getDay();
  startOfWeek.setTime(startOfWeek.getTime() - milSecondsUntilStart);
  return startOfWeek.getTime();
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
function getNumRowsForCheckIn(properties) {
  for (var sheet of properties["data"]["sheets"]) {
    if (sheet.properties.title == "Check Out Form") {
      return sheet.properties.gridProperties.rowCount;
    }
  }
}

//scans table of values for a visitor visiting more than once a week
//loops through each pair in the table backwords until either hits calId or a week has passed
function scanTableForVisitInPastWeek(values, startOfWeek, calId) {
  var visitedTimes = [];
  if (parseInt(calId) == 1) {
    return visitedTimes;
  }
  for (var i = values.length - 1; i >= 0; i--) {
    var currDate = new Date(values[i][0]);
    if (values[i][1] == calId) {
      if (currDate.getTime() - startOfWeek > 0) {
        visitedTimes.push(formatTimeForVisits(currDate));
      }
    } else if (currDate.getTime() - startOfWeek <= 0) {
      //reach the end of week
      break;
    }
  }
  return visitedTimes;
}

function getSheetsLink() {
  return new Promise((resolve, reject) => {
    firebase.database().ref('/sheetIDs')
    .once('value', snapshot => {
        let val = snapshot.val();
        return resolve(val.checkInGrad)
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
      res.status(400).json({ message: "Missing CalID" });
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

      getSheetsLink()
      .then(({spreadsheetId, sheetName}) => {
        var numRows = 0;
        var calID = body.calID
        let numberOfRowsToGoBack = 2000;
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
        .then((properties) => (numRows = getNumRowsForCheckIn(properties)))
        .then(function () {
          var startingRow = numRows - numberOfRowsToGoBack;
          var startOfWeek = determineStartOfWeek(checkInTime);
          if (startingRow > 0) {
            rangeQuery = sheetName + "!A" + startingRow.toString() + ":B";
          }
          const paramsForVisits = {
            spreadsheetId: spreadsheetId ,
            range: rangeQuery,
          };
          sheets.spreadsheets.values.get(paramsForVisits)
          .then((body) => {
            var scannedRows = body.data.values
            // write to google sheets
            sheets.spreadsheets.values.append(request)
            .then(() => {
              if (scannedRows != null) {
                res.json(
                  scanTableForVisitInPastWeek(
                    scannedRows,
                    startOfWeek,
                    calID
                  )
                );
              }
              else {
                var emptyVisits = [] //case where we can't scan the table due too many blank cells added at bottom of spreadsheet
                res.json(emptyVisits)
              }
              return resolve();
            }
            )
            .catch((error) => {
              res.status(500).json({error: "error writing to Pantry data sheet: " +  error})
              return resolve();
            });
          })
          .catch((error) => {
            res.status(500).json({error: "error reading from Pantry data sheet: " + error})
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
