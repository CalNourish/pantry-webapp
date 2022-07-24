import {validateFunc} from '../validate'
import { google } from 'googleapis'; 

import service from "../../../service-account.enc";
import decrypt from "../../../utils/decrypt.js";

const test = process.env.NEXT_PUBLIC_VERCEL_ENV == undefined;
const checkin_sheet = test ? process.env.SPREADSHEET_ID_TEST : process.env.CHECKIN_SPREADSHEET_ID;

/*
* /api/admin/checkin
* req.body = { string calID }
*/

function requireParams(body, res) {
  // makes sure that the input is in the right format
  // returns false and an error if not a good input 
  if (body.calID) return true;
  return false;
}


//converts from 2022-07-23T20:35:41.935Z to 7/23/2022 12:15:52
function formatTime(timeToConvert) {
    const formattedHours = timeToConvert.getHours()+":"+timeToConvert.getMinutes()+":"+timeToConvert.getSeconds()
    const formattedTime = timeToConvert.toLocaleDateString() + " " + formattedHours
    return formattedTime
}

function getNumRowsForCheckIn(properties) {
    for (var sheet of properties["data"]["sheets"]) {
        if(sheet.properties.title == "Check Out Form") {
          return sheet.properties.gridProperties.rowCount
        }
    }
}

function checkForVisitInLastWeek(numRows,calID,sheets) {
  let numberOfRowsToGoBack = 10
  var rangeQuery = "Check Out Form!A:B"
  var startingRow = numRows - numberOfRowsToGoBack 
  if (startingRow > 0) { //number of rows we want to scan is larger than table so scan whole table
    rangeQuery = "Check Out Form!A"+(startingRow).toString()+":B"
  }
  const paramsForVisits = {
    spreadsheetId: checkin_sheet,
    range: rangeQuery,
  }
  const ID = sheets.spreadsheets.values.get(paramsForVisits)
  .then((result) => console.log(result.data))
  .catch((error) => {
    return console.log("error reading from Pantry data sheet: ", error);
  });
}


export default async function(req, res) {
  console.log("Checking In")
  const token = req.headers.authorization

  return new Promise((resolve, reject) => {
    const { body } = req

    // verify parameters
    let ok = requireParams(body, res);
    if (!ok) {
        res.status(400).json({message: "bad request parameters"});
        return resolve();
    }

    validateFunc(token)
    .then(() => {
      let service_info = JSON.parse(decrypt(service.encrypted))

      const target = ['https://www.googleapis.com/auth/spreadsheets'];
      var sheets_auth = new google.auth.JWT(
        service_info.client_email,
        null,
        (service_info.private_key || '').replace(/\\n/g, '\n'),
        target,
        null,
        service_info.private_key_id
      )

      // for (sheet in spreadsheet.sheets) {
      //     Timber.d("sheetId=${sheet.properties.sheetId}, title=${sheet.properties.title}, rows=${sheet.properties.gridProperties.rowCount}")
      // }
      //read from google sheets to determine last visit
      const paramsForCheckIn = {
        spreadsheetId: checkin_sheet,

      }
      const sheets = google.sheets({ version: 'v4', auth: sheets_auth });
      var numRows = 0;
      sheets.spreadsheets.get(paramsForCheckIn).then((properties) => numRows = getNumRowsForCheckIn(properties))
                                               .then(() => checkForVisitInLastWeek(numRows,body.calID,sheets))

      


      // write to google sheets
      var timestamp = new Date();
      timestamp.getDate
      const request = {
        spreadsheetId: checkin_sheet,
        range: "Check In!A:B",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        resource: {
            "range": "Check Out From!A:B",
            "majorDimension": "ROWS",
            "values": [
              [
                formatTime(timestamp), body.calID
              ]
            ]
          }
      }

      sheets.spreadsheets.values.append(request)
      .catch((error) => {
        return reject("error writing to Pantry data sheet: ", error);
      });

      // format output (date-time format, non-bold, bg color, etc.)

      // read & search for previous check-ins

      // respond with <write success>, <most recent visit>, <number of visits this week>, <last 2 visits?> 
    });
  });
}