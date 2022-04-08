import {validateFunc} from '../validate';
import { google } from 'googleapis'; 
import firebase from "firebase/app";
import { server } from '../../_app.js'
import { resolveHref } from 'next/dist/next-server/lib/router/router';
export const config = { // https://nextjs.org/docs/api-routes/api-middlewares
  api: {
    bodyParser: true,
  },
} 

function requireParams(body, res) {
    /* require elements: First name, last name, frequency, address, calID, 
    delivery_date, order_timestamp, items in the order (orderschema as of now)
    items are represented as an object with barcode as key and quantity (count) as value*/

    if (!body.firstName || !body.lastName || !body.address || !body.frequency ||
        isNaN(parseInt(body.dependents)) || !body.dietaryRestrictions || !body.additionalRequests || 
        !body.calID || !body.items || !body.deliveryDate || !body.deliveryWindow) {
          res.json({error: "missing firstName||lastName||frequency||Address||dependents||calID||items||deliveryDate\
             in request"}); 
            res.status(400);
            return false;
        }
    //require order items object with at least one entry (order array)
    if (body.items.length <= 0) {
        res.json({error: "missing order item"}); 
        res.status(400);
        return false;
    } 
    return true;
}


function updateInventory(items) { //updates inventory in firebase
  return new Promise((resolve, reject) => {
    let inventory = fetch(`${server}/api/inventory/GetAllItems`); 
    //let inventory = fetch(process.env.GET_ALL_ITEMS); //twe can get rid of this 
    inventory.then((value) => {
      value.json().then((inventoryJson) => {
         const inventoryUpdates = {}
         for (let item in items) {
           if (inventoryJson[item]['count'] >= items[item]) { //if we have enough in inventory for order
            inventoryUpdates['/inventory/' + item + "/count"] = firebase.database.ServerValue.increment(-1 * items[item]);
           }
           else {
             console.log("Sorry, requested count for " + inventoryJson[item]["itemName"] + " exceeds inventory");
             return reject("Quantity exceeded"); 
           }
         }
         firebase.database().ref().update(inventoryUpdates).then(() => {
           return resolve("Inventory updated");
         })
         .catch((error) => {
           console.log("error updating to firebase: ", error);
           return reject();
         }) 
      })  
    }) 
  })
}


function addOrder(firstName, lastName, address, frequency, dependents, dietaryRestrictions, additionalRequests, calID, items, deliveryDate, deliveryWindow) {
    //add order data to google sheets and firebase
    // I used this: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
    //add order data to three google sheets (pantry, bag-packing, doordash ) and add order to firebase
  return new Promise((resolve, reject) => {
    const target = ['https://www.googleapis.com/auth/spreadsheets'];
    var jwt = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      //process.env.GOOGLE_SHEETS_CLIENT_EMAIL_TEST,
      null,
      (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      //(process.env.GOOGLE_SHEETS_PRIVATE_KEY_TEST || '').replace(/\\n/g, '\n'),
      target
    );
    const sheets = google.sheets({ version: 'v4', auth: jwt });

    //generate orderID: random six digit value. We check later to make sure that the item doesn't exist
    const orderID = Math.random().toString().slice(2, 8);
    console.log("orderID", orderID);

    let d = new Date();
    const currentDate = (d.getMonth() + 1) + "/" + d.getDate();
    //Food pantry master data sheet for tracking calIDs 
    //current schema is [current date, CalID (encrypted), unique order id]
    const request1 = {
      //spreadsheetId: process.env.SPREADSHEET_ID_TEST,//PANTRY_DATA_SPREADSHEET_ID, 
      spreadsheetId: process.env.PANTRY_DATA_SPREADSHEET_ID,
      //range: "Sheet1!A:C", 
      range: "'TechTesting'!A:C",
      valueInputOption: "USER_ENTERED", 
      insertDataOption: "INSERT_ROWS",
      resource: {
          //"range": "Sheet1!A:C",
          "range": "'TechTesting'!A:C",
          "majorDimension": "ROWS",
          "values": [
          [currentDate, calID, orderID] //each inner array is a row if we specify ROWS as majorDim
          ] 
        } ,
      auth: jwt
    }

    
    sheets.spreadsheets.values.append(request1)
    .catch((error) => {
      return reject("error writing to Pantry data sheet: ", error);
    });  

    //determine approximate # of bags by # of items
    var totalItems = 0;
    for (let item in items) {
      totalItems += items[item];
    }
    let numberOfBags = Math.ceil(totalItems / 10);
    if (numberOfBags > 3) {
      numberOfBags = 3;
    }


    /*bag packing sheet with [confirmed date (delivery date), first name + last initial, delivery window, # of bags, frequency, # of dependents, dietary restrictions,
   additional requests, order id, items] 
    frequency: one-time or recurring (once a week or every two weeks for now) */
    const request2 = {
      //spreadsheetId: process.env.SPREADSHEET_ID_TEST,//BAG_PACKING_SPREADSHEET_ID,
      spreadsheetId: process.env.BAG_PACKING_SPREADSHEET_ID,
      //range: "Sheet1!A:J",
      range: "[Testing] Spring Delivery Packing Info!A:J",
      valueInputOption: "USER_ENTERED", 
      insertDataOption: "INSERT_ROWS",
      resource: {
          //range: "Sheet1!A:J",
          "range": "[Testing] Spring Delivery Packing Info!A:J",
          "majorDimension": "ROWS",
          "values": [
            [deliveryDate, firstName + " " + lastName.slice(0,1), deliveryWindow, numberOfBags, frequency, 
          dependents, dietaryRestrictions, additionalRequests, orderID, JSON.stringify(items)]
          ] 
        } 
    }
    sheets.spreadsheets.values.append(request2)
    .catch((error) => {
      return reject("error writing to bag-packing data sheet: ", error);
    });

    //door dash sheet with [deliveryDate, delivery window start/end, first name, last NAME, address, item code (always F), # of bags (must be <= 3) ]
    const request3 = {
      //spreadsheetId: process.env.SPREADSHEET_ID_TEST,//DOORDASH_SPREADSHEET_ID,
      spreadSheetId: process.env.DOORDASH_SPREADSHEET_ID,
      //range: "Sheet1!A:H",
      range: "Customer Information!A:H",
      valueInputOption: "USER_ENTERED", 
      insertDataOption: "INSERT_ROWS",
      resource: {
          //range: "Sheet1!A:H",
          "range": "Customer Information!A:H",
          "majorDimension": "ROWS",
          "values": [
          ["VENTURA-01", deliveryDate, deliveryWindow, firstName, lastName, address, "F", numberOfBags] 
          ] 
        } 
    }
    sheets.spreadsheets.values.append(request3)
    .catch((error) => {
      return reject("error writing to Doordash data sheet: ", error);
    });


    /*add order to firebase. I used AddItem code
    */

    let newOrder = {};
    newOrder["orderID"] = orderID;
    newOrder["status"] = "Not started";
    //newOrder["type"] = "Delivery";
    newOrder["deliveryDate"] = deliveryDate;
    newOrder["deliveryWindow"] = deliveryWindow;
    newOrder["items"] = items;
    newOrder["notes from guest"] = "I'm, like, allergic to peanuts :( ";
    newOrder["firstName"] = firstName;
    newOrder["lastInitial"] = lastName.slice(0, 1);

    firebase.auth().signInAnonymously()
            .then(() => {
              console.log("orderID", orderID);
              let itemRef = firebase.database().ref('/order/' + orderID);
              itemRef.once('value')
              .catch(function(error){
                console.log("Not ok5")
                res.status(500).json({error: "server error getting reference to that item from the database", errorstack: error});
                return resolve();
            })
            .then(function(resp){
              // the version of the item in the database
              var dbItem = resp.val();
              // this item already exists
              if (dbItem != null) {
                  console.log("Not ok6")
                  return resolve();
              }
              // otherwise the item doesn't exist and we can create it
              itemRef.update(newOrder)
              .catch(function(error) {
                  console.log("Not ok7: ", error)
                  return resolve();
              })
              .then(() => {
                  console.log("OK")
                  return resolve();
              });
          });
            });

    return resolve();

  })
} 
  
export default async function(req, res) {   
    // verify this request is legit
    const token = req.headers.authorization
    console.log("TOKEN: ", token)
    const allowed = await validateFunc(token)
    if (!allowed) {
        res.status(401)
        res.json({error: "you are not authenticated to perform this action"})
        return Promise.reject();
    } 
    const {body} = req //unpacks the request object 
    if (!body.frequency) {
      body.frequency = "one-time";
    }
    let ok = requireParams(body, res); 
    if (!ok) {
      return Promise.reject();
    } 
    firebase.auth().signInAnonymously()
    .then(() => {
      updateInventory(body.items).then((success) => {
        addOrder(body.firstName, body.lastName, body.address, body.frequency, body.dependents, 
          body.dietaryRestrictions, body.additionalRequests,
          body.calID, body.items, body.deliveryDate, body.deliveryWindow).then(() => {
            console.log("Added to google sheets");
          })
          .catch((error) => {
            console.log("error:", error)
          })
          ,(errorObject) => {
            console.log('The read failed: ' + errorObject);
          }
      }
      , rejection => {
        console.log("order didn't go through: ", rejection);
      }) 
    }
  )}