import { google } from 'googleapis'; 
//mport { firebase as fb} from 'googleapis/build/src/apis/firebase';
//import firebase from '../../../firebase/clientApp';    
export const config = { // https://nextjs.org/docs/api-routes/api-middlewares
  api: {
    bodyParser: true,
  },
} 

export default function(firstName, lastName, address, emailAddress, calID, items, deliveryDate) {
    //add order data to google sheets
  const target = ['https://www.googleapis.com/auth/spreadsheets'];
  const jwt = new google.auth.JWT(
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    null,
    (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    target
  );
  const sheets = google.sheets({ version: 'v4', auth: jwt });
  const request = {
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: "Sheet1!A:H",
    valueInputOption: "USER_ENTERED", 
    insertDataOption: "INSERT_ROWS",
    resource: {
        range: "Sheet1!A:H",
        "majorDimension": "ROWS",
        "values": [
        [firstName, lastName, address, emailAddress, calID, JSON.stringify(items), deliveryDate, Date()] //each inner array is a row if we specify ROWS as majorDim
        ] 
      } 
  }
  return sheets.spreadsheets.values.append(request);
} 