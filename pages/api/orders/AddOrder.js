import { google } from 'googleapis'; 
import firebase from '../../../firebase/clientApp';
import {ORDER_STATUS_OPEN} from "../../../utils/orderStatuses"

import { service_info } from "../../../utils/decrypt";
import { setupFormatColumns } from '../../../utils/sheets';

export const config = { // https://nextjs.org/docs/api-routes/api-middlewares
  api: {
    bodyParser: true,
  },
}

const dayNameToIndex = {"Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6}

function getAllItems() {
  return new Promise((resolve, reject) => {
    firebase.database().ref('/inventory/').once('value')
    .then(function(resp){
      var allItems = resp.val();
      return resolve(allItems);
    })
    .catch(function(error){
      res.status(500).json({error: "server error getting items from the database", errorstack: error});
      return reject();
    })
  })
}

function requireParams(body, res) {
    /* require elements: First name, last name, frequency, address, calID, 
    delivery_date, order_timestamp, items in the order (orderschema as of now).
    Items are represented as an object with barcode as key and quantity (count) as value*/

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
      res.status(400).json({error: "Missing delivery frequency, date, or time in request."});
      return false;
    }

    // require order items object with at least one entry (order array)
    if (!body.items || body.items.length <= 0) {
      res.status(400).json({error: "Order must contain at least one item."});
      return false;
    }

    return true;
}

/* decrement inventory amounts in firebase */
function updateFirebase(items) {
  let itemNames = {};

  return new Promise((resolve, reject) => {
    getAllItems().then((inventoryJson) => {
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
        return reject("Error updating firebase inventory: " + error);
      })
    })
  })
}

function getOrderSheets() {
  return new Promise((resolve, reject) => {
    firebase.database().ref('/sheetIDs/').once('value')
    .then(function(resp) {
      return resolve(resp.val());
    })
    .catch(function(error){
      return reject("Error getting sheet links from firebase: " + error);
    })
  })
}

function calculateDeliveryDate(deliveryDay) {
  bufferDays = 2 //amount of days the order needs to be placed before delivery day
  let d = new Date();
  let deliveryMMDD;
  d.getDate() + (((dayOfWeekIdx + 7 - d.getDay()) % 7) || 7)
  if (d.getDate() + (((dayOfWeekIdx + 7 - d.getDay()) < bufferDays))) {
    deliveryMMDD = new Date(
      d.setDate(
        d.getDate() +  (7 - d.getDay()) + dayOfWeekIdx //set delivery date for next week
      )
    );
  }
  else {
    deliveryMMDD = new Date(
      d.setDate(
        d.getDate() + (dayOfWeekIdx + 7 - d.getDay()) //set delivry for this week
      )
    );

  }
}

/* Write order to three google sheets (pantry, bag-packing, doordash), and add order to firebase. */
function writeToSheets(body, itemNames) {
  let { firstName, lastName, address, address2, city, zip,
        frequency, dependents, dietaryRestrictions, additionalRequests,
        calID, items, deliveryDay, deliveryWindowStart, deliveryWindowEnd, altDelivery,
        email, phone, dropoffInstructions } =  body;

  return new Promise((resolve, reject) => {
    getOrderSheets().then((sheetsInfo)=> {
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
  
      /* --- Sheet 1: pantryMaster --- */
      /* Food pantry master data sheet for tracking calIDs.
       * [timestamp, calID, orderID, email, deliveryDate(, alternate dates)] */
      
      // Generate orderId: random six digit value.
      // We check later to make sure that the ID isn't in use already.
      const orderId = Math.random().toString().slice(2, 8);
  
      let now = new Date();

      // format as 1/23 14:56
      const currentDate = now.toLocaleString('en-US', {
        timeZone: "America/Los_Angeles",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });

      const dayOfWeekIdx = dayNameToIndex[deliveryDay]
  
      let d = new Date();
      let deliveryMMDD = new Date(
        d.setDate(
          d.getDate() +  (7 - d.getDay()) + dayOfWeekIdx
        )
      );
      deliveryMMDD = (deliveryMMDD.getMonth() + 1) + "/" + deliveryMMDD.getDate()
  
      let deliveryWindow = `${deliveryWindowStart} - ${deliveryWindowEnd}`
      
      // Schema is [current date, CalID (encrypted), unique order id, email, deliveryDate, alternateDates]
      const pantryInfo = sheetsInfo["pantryMaster"]
      const pantry_master_req = {
        spreadsheetId: pantryInfo.spreadsheetId,
        range: pantryInfo.sheetName + "!A:F",
        valueInputOption: "USER_ENTERED", 
        insertDataOption: "INSERT_ROWS",
        resource: {
            "range": pantryInfo.sheetName + "!A:F",
            "majorDimension": "ROWS",
            "values": [
              [currentDate, calID, orderId, email,
                `${deliveryDay} ${deliveryWindow}`,
                "(" + altDelivery + ")"] //each inner array is a row if we specify ROWS as majorDim
            ] 
          } ,
        auth: sheets_auth
      }
  
      sheets.spreadsheets.values.append(pantry_master_req)
      .then(result => {
        if (result.status == 200) {
          let generateFormatRequest = setupFormatColumns(result, pantryInfo.pageId)

          // reformat the cells written
          const sheetFormat1 = {
            spreadsheetId: pantryInfo.spreadsheetId,
            resource: {
              requests: [
                generateFormatRequest(0, {type:"DATE", pattern:"m/dd h:mm"}),
                generateFormatRequest([1,6]) // default formatting is fine, we just want non-bold text
              ]
            }
          }

          sheets.spreadsheets.batchUpdate(sheetFormat1).then(() => resolve())
        } else {
          throw result.statusText
        }
      })
      .catch((error) => {
        return reject("error writing to Pantry data sheet: " + error);
      })
  
      /* --- Sheet 2: bagPacking --- */
      /* [confirmed date (delivery date), first name + last initial, delivery window, # of bags,
       *  frequency, # of dependents, dietary restrictions, additional requests, order id, items] */
  
      // frequency: one-time or recurring (once a week or every two weeks for now)
      
      // determine approximate # of bags by # of items
      var totalItems = 0;
      for (let item in items) {
        totalItems += items[item];
      }
      let numberOfBags = Math.ceil(totalItems / 10);
      if (numberOfBags > 3) {
        numberOfBags = 3;
      }

      const bagPackingInfo = sheetsInfo["bagPacking"]
      const bag_packing_req = {
        spreadsheetId: bagPackingInfo.spreadsheetId,
        range: bagPackingInfo.sheetName + "!A:J",
        valueInputOption: "USER_ENTERED", 
        insertDataOption: "INSERT_ROWS",
        resource: {
            "range": bagPackingInfo.sheetName + "!A:J",
            "majorDimension": "ROWS",
            "values": [
              [deliveryMMDD, firstName + " " + lastName.slice(0,1), deliveryWindow, numberOfBags, frequency, 
               dependents, dietaryRestrictions, additionalRequests, orderId, JSON.stringify(itemNames)]
            ] 
          }
      }
  
      sheets.spreadsheets.values.append(bag_packing_req)
      .then(result => {
        if (result.status == 200) {
          let generateFormatRequest = setupFormatColumns(result, bagPackingInfo.pageId)

          // reformat the cells written
          const sheetFormat2 = {
            spreadsheetId: bagPackingInfo.spreadsheetId,
            resource: {
              requests: [
                generateFormatRequest(0, {type:"DATE", pattern:"m/dd"}),
                generateFormatRequest([1,10]) // default formatting is fine, we just want non-bold text
              ]
            }
          }

          sheets.spreadsheets.batchUpdate(sheetFormat2).then(() => resolve())
        } else {
          throw result.statusText
        }
      })
      .catch((error) => {
        return reject("error writing to bag-packing data sheet: " + error);
      })
    
      /* --- Sheet 3: doordash --- */
      /* [..., deliveryDate, delivery window start, end, timezone, first name, last name,
       * address, apt, city, state, zip, phone, # of bags (must be <= 3), delivery instructions, ... ] */
      const doordashInfo = sheetsInfo["doordash"]
      const doordash_req = {
        spreadsheetId: doordashInfo.spreadsheetId,
        range: doordashInfo.sheetName + "!A:U",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        resource: {
            "range": doordashInfo.sheetName + "!A:U",
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
      
      sheets.spreadsheets.values.append(doordash_req)
      .then(result => {
        if (result.status == 200) {
          let generateFormatRequest = setupFormatColumns(result, doordashInfo.pageId)

          // reformat the cells written
          const sheetFormat3 = {
            spreadsheetId: doordashInfo.spreadsheetId,
            resource: {
              requests: [
                generateFormatRequest([0,3]),
                generateFormatRequest(3, {type:"DATE", pattern:"m/dd/yyyy"}),
                generateFormatRequest([4,6], {type:"TIME", pattern:"h:mm am/pm"}),
                generateFormatRequest([6,26])
              ]
            }
          }

          sheets.spreadsheets.batchUpdate(sheetFormat3).then(() => resolve())
        } else {
          throw result.statusText
        }
      })
      .catch((error) => {
        return reject("error writing to Doordash data sheet: " + error);
      })  
  
      /* Add order to firebase */
      let newOrder = {};
      newOrder["orderId"] = orderId;
      newOrder["status"] = ORDER_STATUS_OPEN;
  
      // TODO: need to handle the multiple delivery options somewhere
      newOrder["deliveryDate"] = deliveryMMDD;
      newOrder["deliveryWindow"] = deliveryWindow;
  
      // add the isPacked entry to match order schema
      newOrder["items"] = {}
      Object.keys(items).forEach((bcode) => {
        newOrder["items"][bcode] = {quantity: items[bcode], isPacked: false}
      })

      newOrder["dependents"] = dependents;
      newOrder["guestNote"] = additionalRequests;
      newOrder["dietaryRestriction"] = dietaryRestrictions;
      newOrder["firstName"] = firstName;
      newOrder["lastInitial"] = lastName.slice(0, 1);
  
      firebase.auth().signInAnonymously()
      .then(() => {
        let itemRef = firebase.database().ref('/order/' + orderId);
  
        itemRef.once('value')
        .then(function(resp){
          var dbItem = resp.val();

          // can't add order if orderID already in use
          if (dbItem != null) {
              return reject(`${orderId} already exists`);
          }
          // otherwise the item doesn't exist and we can create it
          itemRef.update(newOrder)
          .then(() => {
              return resolve(orderId);
          })
          .catch(error => {
              return reject("Error updating firebase:" + error);
          });
        })
        .catch(error => {
          return reject("Unable to access item reference in DB:" + error);
        });
      })
      .catch(error =>{
        return reject("Error signing in to firebase: " + error);
      });
    })
    .catch(error => {
      return reject(error);
    })
  })
} 
  
export default async function(req, res) {   
  const {body} = req //unpacks the request object   
  return new Promise((resolve) => {
    if (!body.frequency) {
      body.frequency = "one-time";
    }
    let ok = requireParams(body, res); 
    if (!ok) {
      return resolve();
    }

    firebase.auth().signInAnonymously()
    .then(() => {
      updateFirebase(body.items).then((itemNames) => {
        writeToSheets(body, itemNames).then((orderId) => {
          res.status(200).json({success: `Successfully added order! Order ID: ${orderId}`});
          return resolve();
        })
        .catch((error) => {
          res.status(500).json({error:`Error adding order: ${error}`});
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