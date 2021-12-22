import {validateFunc} from '../validate'
import { google } from 'googleapis';
//mport { firebase as fb} from 'googleapis/build/src/apis/firebase';
//import firebase from '../../../firebase/clientApp';    
import firebase from "firebase/app";
import useSWR from 'swr';
import { resolveHref } from 'next/dist/next-server/lib/router/router';
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


function updateInventory(items) {
  let inventory = fetch("http://localhost:3000/api/inventory/GetAllItems"); //returns inventory as object
  return inventory.then((value) => {
    value.json().then((inventoryJson) => {
       const inventoryUpdates = {}
       for (let item in items) {
         console.log(inventoryJson[item]);

         if (inventoryJson[item]['count'] >= items[item]) { //if how much we have in inventory >= how much user wants
          inventoryUpdates['/inventory/' + item + "/count"] = firebase.database.ServerValue.increment(-1 * items[item]);
         }
         else {
           console.log("Sorry, requested count for " + inventoryJson[item]["itemName"] + " exceeds inventory");
           return Promise.reject("Quantity exceeded");
         }
       }
       return firebase.database().ref().update(inventoryUpdates); 
    })  
  })

  .catch((reason) => {
    console.log('order did not go through: ', reason);
    return Promise.reject();
  }) 
}

function addOrder(firstName, lastName, address, emailAddress, calID, items, deliveryDate) {
      //add order data to google sheets
    const target = ['https://www.googleapis.com/auth/spreadsheets'];
    const jwt = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      null,
      (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      target
    );
    // console.log(process.env.GOOGLE_SHEETS_CLIENT_EMAIL, process.env.GOOGLE_SHEETS_PRIVATE_KEY, "email, key");
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
          [firstName, lastName, address, emailAddress, calID, JSON.stringify(items), deliveryDate, Date()] //each inner array is a row if we specify ROWS as majorDim
          ] 
        } 
    }
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
      updateInventory(body.items).then((value) => {
       // console.log("value line 114: ", value);
        addOrder(body.firstName, body.lastName, body.address, body.emailAddress, 
          body.calID, body.items, body.deliveryDate).then(() => {
            console.log("Added to google sheets");
          })
          .catch(error => {
            console.log("error:", error)
          })
          ,(errorObject) => {
            console.log('The read failed: ' + errorObject);
          }
      })
      .catch(error => {
        console.log("The order failed: ", error);
      }
        )
    }
  )}