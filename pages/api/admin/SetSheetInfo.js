import { google } from 'googleapis';
import service from "../../../service-account.enc";
import decrypt from "../../../utils/decrypt.js";
import { validateFunc } from '../validate';
import firebase from '../../../firebase/clientApp';

/*
* /api/admin/SetSheetInfo
* req.body = {
*   string tag: {
*     string spreadsheetId,
*     string sheetName
*   },
*   ...
* }
*/

const allowedTags = ['checkoutLog', 'pantryMaster', 'bagPacking', 'doordash'];

function requireParams(req, res) {
  let {body} = req;
  for (let tag in body) {
    if (!allowedTags.includes(tag)) {
      res.json(`${tag} not a valid sheet tag.`);
      res.status(400);
      return false;
    }
    if (!body[tag].spreadsheetId || !body[tag].sheetName) {
      res.json(`Missing spreadsheetId or sheetName for tag '${tag}'`)
      return false;
    }
  }
  return true;
}

// Gets the *sheet* ID for the page of the spreadsheet that we want to write to.
function getSheetIds(sheets, spreadsheetId, sheetName) {
  return new Promise((resolve) => {
    sheets.spreadsheets.get({spreadsheetId: spreadsheetId, fields: "sheets.properties.sheetId,sheets.properties.title"})
    .then((resp) => {
      let sheetIds = resp.data.sheets;
      let sheetMatch = sheetIds.filter((info) => sheetName === info.properties.title)
      if (sheetMatch.length == 0) {
        console.log("warning: given sheet name cannot be found in this spreadsheet") // TODO: make this warning visible to user
        return resolve(0); // default to home sheet (first page)
      }
      return resolve(sheetMatch[0].properties.sheetId); // dictionary of sheetName (string) -> sheetId (number)
    })
  })
}

export default async function(req, res) {
  return new Promise((resolve) => {
    if (!requireParams(req, res)) {
      return resolve();
    }

    const token = req.headers.authorization
    validateFunc(token).then(() => {
      let service_info = JSON.parse(decrypt(service.encrypted))
      const target = ['https://www.googleapis.com/auth/spreadsheets'];
      var sheets_auth = new google.auth.JWT(
        service_info.client_email,
        null,
        (service_info.private_key)?.replace(/\\n/g, '\n'),
        target,
        null,
        service_info.private_key_id
      );
  
      const sheets = google.sheets({ version: 'v4', auth: sheets_auth });
      let sheetInfo = {}
      Promise.all(
        Object.keys(req.body).map((key) => {
          let {spreadsheetId, sheetName} = req.body[key];
          return getSheetIds(sheets, spreadsheetId, sheetName).then((pageId) => {
            sheetInfo[key] = {...req.body[key], pageId};
          })
        })
      )
      .then(() => {
        console.log(sheetInfo)
        firebase.auth().signInAnonymously()
        .then(() => {
          let itemRef = firebase.database().ref('/sheetIDs');
    
          itemRef.update(sheetInfo)
          .then(() => {
            res.json({success: "success"});
            res.status(200);
            return resolve();
          })
        });
        // write to firebase
      })
    })
  })
}