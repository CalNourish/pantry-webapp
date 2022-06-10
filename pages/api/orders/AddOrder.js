import { google } from 'googleapis'; 
import firebase from '../../../firebase/clientApp';
import { server } from '../../_app.js'
import {ORDER_STATUS_OPEN} from "../../../utils/orderStatuses"

const test = process.env.NEXT_PUBLIC_VERCEL_ENV == undefined;
const client_email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const private_key = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

const pantry_sheet = test ? process.env.SPREADSHEET_ID_TEST : "1bCtOsgTJa_hAFp7zxGK7y7snEj8zlHKKLM-5GF_3vF4";
const bag_packing_sheet = test ? process.env.SPREADSHEET_ID_TEST : "1Pu5pHqtd9FmJpVK3s-sL43c2Lh2OPw2DQD8MyWBXUvo";
const doordash_sheet = test ? process.env.SPREADSHEET_ID_TEST : "13BcniNuHl6P5uoG3SPJ7aP-yJeS0n1eB6EUL0wYcV4o";

const sheetNames = ["TechTesting",  "[Testing] Spring Delivery Packing Info", "Customer Information"]

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
    
    if (!body.frequency || !body.deliveryDay || !body.deliveryWindowStart || !body.deliveryWindowEnd) {
      res.status(400).json({error: "Missing delivery date or time in request."});
      return false;
    }

    // require order items object with at least one entry (order array)
    if (!body.items || body.items.length <= 0) {
      res.status(400).json({error: "There are no items in this order."});
      return false;
    }

    return true;
}

/* decrement inventory amounts in firebase */
function updateInventory(items) {
  let itemNames = {};

  return new Promise((resolve, reject) => {
    fetch(`${server}/api/inventory/GetAllItems`)
    .then((value) => {
      value.json().then((inventoryJson) => {
        const inventoryUpdates = {}
        for (let item in items) {
          // make sure we have enough in inventory for order
          if (inventoryJson[item]['count'] >= items[item]) {

            // TODO: require quantities to be positive and within range
            // this is enforced in frontend, but should maybe enforce on backend as well for security?
            
            inventoryUpdates['/inventory/' + item + "/count"] = firebase.database.ServerValue.increment(-1 * items[item]);
            itemNames[inventoryJson[item]['itemName']] = items[item];
          }
          else {
            return reject(`Requested count for "${inventoryJson[item]["itemName"]}" exceeds current stock (${inventoryJson[item]['count']})`);
          }
        }

        firebase.database().ref().update(inventoryUpdates).then(() => {
          return resolve(itemNames);
        })
        .catch((error) => {
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
        calID, items, deliveryDay, deliveryWindowStart, deliveryWindowEnd, altDelivery,
        email, phone, dropoffInstructions } =  body;

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

    let now = new Date();
    const currentDate = (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear();

    const days = {"Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6}
    const dayOfWeekIdx = days[deliveryDay]

    let d = new Date();
    let deliveryMMDD = new Date(
      d.setDate(
        d.getDate() + (((dayOfWeekIdx + 7 - d.getDay()) % 7) || 7)
      )
    );
    deliveryMMDD = (deliveryMMDD.getMonth() + 1) + "/" + deliveryMMDD.getDate()

    let deliveryWindow = `${deliveryWindowStart} - ${deliveryWindowEnd}`
    
    // Schema is [current date, CalID (encrypted), unique order id, email]
    const request1 = {
      spreadsheetId: pantry_sheet,
      range: sheetNames[0] + "!A:F",
      valueInputOption: "USER_ENTERED", 
      insertDataOption: "INSERT_ROWS",
      resource: {
          "range": sheetNames[0] + "!A:F",
          "majorDimension": "ROWS",
          "values": [
            [currentDate, calID, orderID, email,
              `${deliveryDay} ${deliveryWindow}`,
              altDelivery] //each inner array is a row if we specify ROWS as majorDim
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
      range: sheetNames[1] + "!A:J",
      valueInputOption: "USER_ENTERED", 
      insertDataOption: "INSERT_ROWS",
      resource: {
          "range": sheetNames[1] + "!A:J",
          "majorDimension": "ROWS",
          "values": [
            [deliveryMMDD, firstName + " " + lastName.slice(0,1), deliveryWindow, numberOfBags, frequency, 
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
    const request3 = {
      spreadsheetId: doordash_sheet,
      range: sheetNames[2] + "!A:U",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: {
          "range": sheetNames[2] + "!A:U",
          "majorDimension": "ROWS",
          "values": [
            [
              "UCB BNC Food Pantry", "VENTURA-01", "F", deliveryMMDD, deliveryWindowStart, deliveryWindowEnd,
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
    newOrder["status"] = ORDER_STATUS_OPEN;

    // TODO: need to handle the multiple delivery options better
    newOrder["deliveryDate"] = deliveryMMDD;
    newOrder["deliveryWindow"] = deliveryWindow;

    // add the isPacked entry to match order schema
    newOrder["items"] = {}
    Object.keys(items).forEach((bcode) => {
      newOrder["items"][bcode] = {quantity: items[bcode], isPacked: false}
    })

    newOrder["guestNote"] = additionalRequests;
    newOrder["dietaryRestriction"] = dietaryRestrictions;
    newOrder["firstName"] = firstName;
    newOrder["lastInitial"] = lastName.slice(0, 1);

    firebase.auth().signInAnonymously()
    .then(() => {
      let itemRef = firebase.database().ref('/order/' + orderID);

      itemRef.once('value')
      .catch(function(error){
        return reject("Unable to access database");
      })
      .then(function(resp){
        // the version of the item in the database
        var dbItem = resp.val();
        // this item already exists
        if (dbItem != null) {
            return reject(`${orderID} already exists`);
        }
        // otherwise the item doesn't exist and we can create it
        itemRef.update(newOrder)
        .catch(function(error) {
            return reject("Error writing to firebase");
        })
        .then(() => {
            return resolve(orderID);
        });
      });
    });
  })
} 
  
export default async function(req, res) {   
  // verify this request is legit

  return new Promise((resolve) => {
    const {body} = req //unpacks the request object 
    if (!body.frequency) {
      body.frequency = "one-time";
    }
    let ok = requireParams(body, res); 
    if (!ok) {
      return resolve();
    }

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
        res.status(400).json({error: rejection});
        return resolve();
      })
    })
  })
}