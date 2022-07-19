import {validateFunc} from '../validate'
import { google } from 'googleapis'; 

const test = true;
const client_email = test ? process.env.GOOGLE_SHEETS_CLIENT_EMAIL_TEST : process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const private_key = test? process.env.GOOGLE_SHEETS_PRIVATE_KEY_TEST : process.env.GOOGLE_SHEETS_PRIVATE_KEY;
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
      const target = ['https://www.googleapis.com/auth/spreadsheets'];
      var sheets_auth = new google.auth.JWT(
        client_email,
        null,
        (private_key || '').replace(/\\n/g, '\n'),
        target
      );

      const sheets = google.sheets({ version: 'v4', auth: sheets_auth });

      // write to google sheets
      var timestamp = new Date();
      const request = {
        spreadsheetId: checkin_sheet,
        range: "Check In!A:B",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        resource: {
            "range": "Check In!A:B",
            "majorDimension": "ROWS",
            "values": [
              [
                timestamp, body.calID
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