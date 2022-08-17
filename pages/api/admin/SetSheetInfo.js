import { google } from 'googleapis';
import { service_info } from "../../../utils/decrypt.js";
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

const sheetTags = ['checkoutLog', 'pantryMaster', 'bagPacking', 'doordash', 'checkIn'];

function requireParams(req, res) {
  let {body} = req;
  for (let tag in body) {
    if (!sheetTags.includes(tag)) {
      res.status(400).json({error: `'${tag}' not a valid sheet tag.`});
      return false;
    }
    if (!body[tag].spreadsheetId || !body[tag].sheetName) {
      res.status(400).json({error: `Missing ${body[tag].spreadsheetId ? "sheet name" : "spreadsheet ID"}`})
      return false;
    }
  }
  return true;
}

// Gets the *sheet* ID for the page of the spreadsheet that we want to write to.
function getSheetIds(sheets, spreadsheetId, sheetName) {
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.get({spreadsheetId: spreadsheetId, fields: "sheets.properties.sheetId,sheets.properties.title"})
    .then((resp) => {
      let sheetIds = resp.data.sheets;
      let sheetMatch = sheetIds.filter((info) => sheetName === info.properties.title)
      if (sheetMatch.length == 0) {
        return reject("This sheet name does not exist.");
      }
      return resolve(sheetMatch[0].properties.sheetId); // dictionary of sheetName (string) -> sheetId (number)
    })
    .catch((err) => {
      return reject("Need permission to access sheet.")
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
        Object.keys(req.body).map(async (key) => {
          let {spreadsheetId, sheetName} = req.body[key];
          const pageId = await getSheetIds(sheets, spreadsheetId, sheetName);
          sheetInfo[key] = { ...req.body[key], pageId };
        })
      )
      .then(() => {
        firebase.auth().signInAnonymously()
        .then(() => {
          let itemRef = firebase.database().ref('/sheetIDs');
    
          itemRef.update(sheetInfo)
          .then(() => {
            res.json({success: "success"});
            res.status(200);
            return resolve();
          })
        })
        .catch((err) => {
          res.status(500).json({error: "Error writing to firebase:" + err});
          return resolve();
        });
      }).catch((errMsg) => {
        // can't find the sheetName in the specified spreadsheet,
        // or the sheet is private and the sheet-writer can't access it
        res.status(400).json({error: errMsg})
        return reject();
      })
    })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an authorized account." });
      return resolve();
    });
  })
}