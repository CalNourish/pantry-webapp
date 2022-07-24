import { google } from 'googleapis'; 
import service from "../../../service-account.enc";
import decrypt from "../../../utils/decrypt.js"

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

const allowedTags = ['checkoutLog', 'pantryMaster', 'bagPacking', 'doordash']

function requireParams(req, res) {
  let {body} = req;
  for (let tag in body) {
    console.log(tag);
    console.log(body[tag]);
    if (!allowedTags.includes(tag)) {
      res.json(`${tag} not a valid sheet tag.`).status(400);
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
      let sheetIds = resp.data.sheets//.forEach((x) => sheetDict[x.properties.title] = x.properties.sheetId)
      let sheetMatch = sheetIds.filter((info) => sheetName === info.properties.title)
      if (sheetMatch.length == 0) {
        console.log("warning: given sheet name cannot be found in this spreadsheet")
        resolve(0); // default to home sheet (first page)
      }
      resolve(sheetMatch[0].properties.sheetId); // dictionary of sheetName (string) -> sheetId (number)
    })
  })
}

export default async function(req, res) {
  console.log("reqbody:", req.body)

  return new Promise((resolve) => {
    if (!requireParams(req, res)) {
      console.log("bad params")
      return resolve();
    }

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
        getSheetIds(sheets, spreadsheetId, sheetName).then((pageId) => {
          sheetInfo[key] = {...req.body[key], pageId};
        })
      })
    ).then(() => {
      console.log(sheetInfo)
      res.json({success: "success"}).status(200);
      // write to firebase
    })
  })
}