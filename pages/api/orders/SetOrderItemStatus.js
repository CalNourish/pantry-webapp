import { getAuth, signInAnonymously } from 'firebase/auth';
import firebase from '../../../firebase/clientApp'
import { validateFunc } from '../validate'

/*
* /api/orders/SetOrderItemStatus
* req.body = { string orderId, string itemId, boolean isPacked = true | false, boolean decreaseItemCount = true | false, int quantity}
*/

function requireParams(body, res) {
  // makes sure that the input is in the right format
  // returns false and an error if not a good input 
  var { orderId, itemId, isPacked, decreaseItemCount, quantity} = body;
  if (orderId == undefined) {
    res.status(400).json({ error: "missing order ID" });
    return false;
  }

  // validation for itemId (must not be undefined) and isPacked (must be true or false)
  if (itemId == undefined || isPacked == undefined || decreaseItemCount == undefined || quantity == undefined){
    res.status(400).json({ error: "missing parameter in body" });
    return false;
  }

  return true;
}

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

function updateFirebaseInventory(barcode, quantity, decreaseItemCount) {
  let multipler = decreaseItemCount ? -1 : 1
  return new Promise((resolve, reject) => {
    getAllItems()
    .then((inventoryJson) => {
      const inventoryUpdate = {}
      // make sure we have enough in inventory for order
      if (inventoryJson[barcode]) { 
        inventoryUpdate['/inventory/' + barcode + "/count"] = firebase.database.ServerValue.increment(multipler * quantity);        
      }
      else {
        return reject("Error updating firebase inventory: Invalid barcode");
      }
      firebase.database().ref().update(inventoryUpdate)
      .then(() => {
        return resolve("Succes in updating inventory!");
      })
      .catch((error) => {
        return reject("Error updating firebase inventory: " + error);
      })
    })
    .catch((error) => {
      return reject("Error getting items from inventory: " + error);
    })

  })
}

export default async function (req, res) {
  // verify this request is from an authorized user
  const token = req.headers.authorization

  // verify params
  const { body } = req;
  let ok = requireParams(body, res);
  if (!ok) {
    return Promise.resolve();
  }

  let orderId = body.orderId.toString();
  let itemId = body.itemId.toString();
  let quantity = parseInt(body.quantity);

  // accepts "false" or false, but prefer boolean type
  let isPacked = body.isPacked == "false" ? false : Boolean(body.isPacked);
  let decreaseItemCount = body.decreaseItemCount == "false" ? false : Boolean(body.isPacked);

  return new Promise((resolve) => {
    validateFunc(token).then(() => {
      const auth = getAuth()
      signInAnonymously(auth)
      .then(() => {
        var orderItemRef = firebase.database().ref("/order/" + orderId + "/items/" + itemId);

        orderItemRef.once('value')
        .catch(function (error) {
          res.status(500);
          res.json({ error: `server error getting order/item pair (${orderId}, ${itemId}) from database`, errorstack: error });
          return resolve();
        })
        .then(function (resp) {
          // the current version of the order in the database
          var currOrderItem = resp.val();

          // this order/item was not found
          if (currOrderItem === null) {
            res.status(404);
            res.json({ error: `unable to find given order ${orderId} or item ${itemId}` })
            return resolve();
          }
          updateFirebaseInventory(itemId, quantity, decreaseItemCount)
          .then(() => {
            orderItemRef.update({ "isPacked": isPacked })
            .catch(function (error) {
              res.status(500);
              res.json({ error: "error updating status of order" + orderId, errorstack: error });
              return resolve();
            })
            .then(() => {
              res.status(200);
              res.json({ message: "success" });
              return resolve();
            });
          })
          .catch(function (error) {
            res.status(500);
            res.json({ error: "error updating item quantity" + orderId, errorstack: error });
            return resolve();
          })

        })
        .catch((err) => {
          res.status(500).json({error: "Error updating order item: " + err})
          return resolve()
        })
      })
      .catch(err => {
        res.status(500).json({ error: "error signing into firebase: " + err });
        return resolve();
      })
    })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." });
      return resolve();
    });
  })
}