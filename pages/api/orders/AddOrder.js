import {validateFunc} from '../validate'
import { google } from 'googleapis';
//mport { firebase as fb} from 'googleapis/build/src/apis/firebase';
//import firebase from '../../../firebase/clientApp';    
import firebase from "firebase/app";
export const config = { // https://nextjs.org/docs/api-routes/api-middlewares
  api: {
    bodyParser: true,
  },
} 

// when you call addorder.js, it returns a promise 
function requireParams(body, res) {
    /* require elements: First name, last name, email address, address, calID, 
    delivery_date, order_timestamp, items in the order (orderschema as of now)
    items are represented as an object with barcode as key and quantity (count) as value*/

    if (!body.firstName || !body.lastName || !body.address ||
        !body.emailAddress || !body.calID || !body.items || !body.deliveryDate) {
          res.json({error: "missing firstName||lastName||EmailAddress||Address||calID||items||deliveryDate\
             in request"}); //orderTimeStamp is part of order, but not something the user cares about
            res.status(400);
            return false;
        }
    //require order items object with at least one entry (order array)
    if (body.items.length <= 0) {
        res.json({error: "missing order item"}); //this line could be more clear
        res.status(400);
        return false;
    } 
    return true;
}



function addOrder(firstName, lastName, address, emailAddress, calID, items, deliveryDate) {
  const target = ['https://www.googleapis.com/auth/spreadsheets'];
  const jwt = new google.auth.JWT(
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    null,
    (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    target
  );
 // console.log(process.env.GOOGLE_SHEETS_CLIENT_EMAIL, process.env.GOOGLE_SHEETS_PRIVATE_KEY, "email, key");
  //let sheetRange = "Sheet1!A" + rowNum + ":H" + rowNum;
  const sheets = google.sheets({ version: 'v4', auth: jwt });
  const request = {
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: "Sheet1!A:H",
    valueInputOption: "USER_ENTERED", //as opposed to RAW
    //includeValuesInResponse: true, //this was for values.update()
    insertDataOption: "INSERT_ROWS",
    resource: {
        range: "Sheet1!A:H",
        "majorDimension": "ROWS",
        "values": [
         [firstName, lastName, address, emailAddress, calID, JSON.stringify(items), deliveryDate, Date.now()] //each inner array is a row if we specify ROWS as majorDim
        ] 
      } 
  }
  let inventoryUpdates = {}
  for (let item in items) {
    inventoryUpdates['/inventory/' + item + "/count"] = firebase.database.ServerValue.increment(-1 * items[item]);
  }


  firebase.database().ref().update(inventoryUpdates); 

//   const response = await sheets.spreadsheets.values.update(params, valueRangeBody); 
  //return sheets.spreadsheets.values.update(request);
  return sheets.spreadsheets.values.append(request);
  } 
  
export default async function(req,res) {   
    // verify this request is legit
    const token = req.headers.authorization
    console.log("TOKEN: ", token)
    const allowed = await validateFunc(token)
    if (!allowed) {
        res.status(401)
        res.json({error: "you are not authenticated to perform this action"})
        return Promise.reject();
    } 
    const {body} = req //this line unpacks the request object 
    console.log("req: ", body);
    
    // verify parameters, this part is causing a weird error, so i will remove it for now
    let ok = requireParams(body, res); 
    if (!ok) {
      return Promise.reject();
    } 
    firebase.auth().signInAnonymously()
    .then(() => {
      addOrder(body.firstName, body.lastName, body.address, body.emailAddress, 
        body.calID, body.items, body.deliveryDate).then(data => {
          console.loga(data, "data");
        })
        .catch(error => {
          consoleg.log("error:", error)
        })
    }
      ,(errorObject) => {
        console.log('The read failed: ' + errorObject);
      }
    )}
   /* .then(() => { 
      //const ref = firebase.database().ref('orderRowNum'); 
      //ref.on('value', (snapshot) => { 
        //const updates = {}
        //updates['orderRowNum'] = firebase.database.ServerValue.increment(1);
        //firebase.database().ref().update(updates);
        //console.log("value", snapshot.val());
        //let rowNum = snapshot.val(); //need to look into .val()?
        addOrder(body.firstName, body.lastName, body.address, body.emailAddress, 
          body.calID, body.items, body.deliveryDate).then(data => {
            console.log(data, "data");
           })
           .catch(error => {
            console.log("error on line 107", error);
          });
       }, (errorObject) => {
         console.log('The read failed: ' + errorObject);
       }); 
  })
} */