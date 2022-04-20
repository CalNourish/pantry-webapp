import {validateFunc} from '../validate';
import { google } from 'googleapis'; 
import firebase from "firebase/app";
import { server } from '../../_app.js'
import { resolveHref } from 'next/dist/next-server/lib/router/router';

const test = true;
const client_email = test ? process.env.GOOGLE_SHEETS_CLIENT_EMAIL_TEST : process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const private_key = test? process.env.GOOGLE_SHEETS_PRIVATE_KEY_TEST : process.env.GOOGLE_SHEETS_PRIVATE_KEY;

const pantry_sheet = test ? process.env.SPREADSHEET_ID_TEST : process.env.PANTRY_DATA_SPREADSHEET_ID;
const doordash_sheet = test ? process.env.SPREADSHEET_ID_TEST : process.env.DOORDASH_SPREADSHEET_ID;
const bag_packing_sheet = test ? process.env.SPREADSHEET_ID_TEST : process.env.BAG_PACKING_SPREADSHEET_ID;

export const config = { // https://nextjs.org/docs/api-routes/api-middlewares
  api: {
    bodyParser: true,
  },
}

function requireParams(body, res) {
    /* require elements: First name, last name, frequency, address, calID, 
    delivery_date, order_timestamp, items in the order (orderschema as of now)
    items are represented as an object with barcode as key and quantity (count) as value*/

    if (!body.firstName || !body.lastName || !body.calID) {
      res.status(400).json({error: "Missing name or CalID in request."});
      return false;
    } 
    
    if (!body.address || !body.city) {
      res.status(400).json({error: "Missing part of delivery address in request."});
      return false;
    }

    if (isNaN(parseInt(body.dependents))) {
      res.status(400).json({error: "Number of dependents is not a valid number."});
      return false;
    }

    if (!body.email || !body.phone) {
      res.status(400).json({error: "Missing contact email or phone number."});
      return false;
    }
    
    if (!body.frequency || !body.deliveryDate || !body.deliveryWindow) {
      res.status(400).json({error: "Missing delivery date or time in request."});
      return false;
    }

    //require order items object with at least one entry (order array)
    if (!body.items || body.items.length <= 0) {
      res.status(400).json({error: "There are no items in this order."});
      return false;
    }

    return true;
}

/* decrement inventory amounts in firebase */
// TODO: also convert barcodes to item names for bag packing sheet?
function updateInventory(items) {
  let itemNames = {};

  return new Promise((resolve, reject) => {
    fetch(`${server}/api/inventory/GetAllItems`)
    .then((value) => {
      value.json().then((inventoryJson) => {
        const inventoryUpdates = {}
        for (let item in items) {
          if (inventoryJson[item]['count'] >= items[item]) { // make sure we have enough in inventory for order
            inventoryUpdates['/inventory/' + item + "/count"] = firebase.database.ServerValue.increment(-1 * items[item]);
            itemNames[inventoryJson[item]['itemName']] = items[item];
          }
          else {
            console.log("Sorry, requested count for " + inventoryJson[item]["itemName"] + " exceeds inventory");
            return reject("Quantity exceeded");
          }
        }

        firebase.database().ref().update(inventoryUpdates).then(() => {
          return resolve(itemNames);
        })
        .catch((error) => {
          console.log("error updating to firebase: ", error);
          return reject();
        })
      })
    })
  })
}

/* Write order to three google sheets (pantry, bag-packing, doordash), and add order to firebase. */
function addOrder(body, itemNames) {

  let { firstName, lastName, address, address2, city, zip,
        frequency, dependents, dietaryRestrictions, additionalRequests,
        calID, items, deliveryDate, deliveryWindow, email, phone,
        dropoffInstructions } =  body;

  return new Promise((resolve, reject) => {
    const target = ['https://www.googleapis.com/auth/spreadsheets'];
    var sheets_auth = new google.auth.JWT(
      client_email,
      null,
      (private_key || '').replace(/\\n/g, '\n'),
      target
    );

    const sheets = google.sheets({ version: 'v4', auth: sheets_auth });

    /* Sheet 1: Food pantry master data sheet for tracking calIDs */
    
    // Generate orderID: random six digit value.
    // We check later to make sure that the ID isn't in use already.
    const orderID = Math.random().toString().slice(2, 8);
    console.log("orderID", orderID);

    let d = new Date();
    const currentDate = (d.getMonth() + 1) + "/" + d.getDate();
    
    // Schema is [current date, CalID (encrypted), unique order id, email]
    const request1 = {
      spreadsheetId: pantry_sheet,
      range: "'TechTesting'!A:D",
      valueInputOption: "USER_ENTERED", 
      insertDataOption: "INSERT_ROWS",
      resource: {
          "range": "'TechTesting'!A:D",
          "majorDimension": "ROWS",
          "values": [
            [currentDate, calID, orderID, email] //each inner array is a row if we specify ROWS as majorDim
          ] 
        } ,
      auth: sheets_auth
    }

    sheets.spreadsheets.values.append(request1)
    .catch((error) => {
      return reject("error writing to Pantry data sheet: ", error);
    });

    // determine approximate # of bags by # of items
    var totalItems = 0;
    for (let item in items) {
      totalItems += items[item];
    }
    let numberOfBags = Math.ceil(totalItems / 10);
    if (numberOfBags > 3) {
      numberOfBags = 3;
    }


    /* Sheet 2: Bag packing sheet */
    /* [confirmed date (delivery date), first name + last initial, delivery window, # of bags,
     *  frequency, # of dependents, dietary restrictions, additional requests, order id, items] */

    // frequency: one-time or recurring (once a week or every two weeks for now)

    const request2 = {
      spreadsheetId: bag_packing_sheet,
      range: "[Testing] Spring Delivery Packing Info!A:J",
      valueInputOption: "USER_ENTERED", 
      insertDataOption: "INSERT_ROWS",
      resource: {
          "range": "[Testing] Spring Delivery Packing Info!A:J",
          "majorDimension": "ROWS",
          "values": [
            [deliveryDate, firstName + " " + lastName.slice(0,1), deliveryWindow, numberOfBags, frequency, 
             dependents, dietaryRestrictions, additionalRequests, orderID, JSON.stringify(itemNames)]
          ] 
        }
    }

    sheets.spreadsheets.values.append(request2)
    .catch((error) => {
      return reject("error writing to bag-packing data sheet: ", error);
    });
  
    /* Sheet 3: DoorDash information */
    /* [deliveryDate, delivery window start/end, first name, last NAME, address, item code (always F), # of bags (must be <= 3) ] */
    let deliveryWindowStart = deliveryWindow.split("-")[0]
    let deliveryWindowEnd = deliveryWindow.split("-")[1]

    const request3 = {
      spreadsheetId: doordash_sheet,
      range: "Customer Information!A:U",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: {
          "range": "Customer Information!A:U",
          "majorDimension": "ROWS",
          "values": [
            [
              "UCB BNC Food Pantry", "VENTURA-01", "F", deliveryDate, deliveryWindowStart, deliveryWindowEnd,
              "US/Pacific", firstName, lastName, address, address2, city, "CA", zip, phone, numberOfBags,
              dropoffInstructions, "UCB BNC Food Pantry"
            ] 
          ] 
        } 
    }
    
    sheets.spreadsheets.values.append(request3)
    .catch((error) => {
      return reject("error writing to Doordash data sheet: ", error);
    });


    /* Add order to firebase */
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
        res.status(500).json({error: "server error getting reference to  from the database", errorstack: error});
        return resolve();
      })
      .then(function(resp){
        // the version of the item in the database
        var dbItem = resp.val();
        // this item already exists
        if (dbItem != null) {
            console.log("Not ok6")
            return reject(`${orderID} already exists`);
        }
        // otherwise the item doesn't exist and we can create it
        itemRef.update(newOrder)
        .catch(function(error) {
            console.log("Not ok7: ", error)
            return reject("Error writing to firebase");
        })
        .then(() => {
            console.log("OK")
            return resolve(orderID);
        });
      });
    });

    // return resolve(orderID);

  })
} 
  
export default async function(req, res) {   
  // verify this request is legit

  return new Promise((resolve, reject) => {
    const {body} = req //unpacks the request object 
    if (!body.frequency) {
      body.frequency = "one-time";
    }
    let ok = requireParams(body, res); 
    if (!ok) {
      return resolve();
    }

    console.log("ok:", ok)
    firebase.auth().signInAnonymously()
    .then(() => {
      updateInventory(body.items).then((itemNames) => {
        addOrder(body, itemNames).then((orderID) => {
          res.status(200).json({success: `Successfully added order! Order ID: ${orderID}`});
          return resolve();
        })
        .catch((error) => {
          res.status(400).json({error:`Error adding order: ${error}`});
          return resolve();
        })
      }
      , rejection => {
        console.log("Can't update inventory:", rejection);
        res.status(400).json({error: rejection});
        return resolve();
      })
    })
  })
}