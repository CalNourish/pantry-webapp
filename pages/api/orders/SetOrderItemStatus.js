import firebase from '../../../firebase/clientApp'
import { validateFunc } from '../validate'

/*
* /api/orders/SetOrderItemStatus
* req.body = { string orderId, string itemId, boolean isPacked = true | false}
*/

function requireParams(body, res) {
  // makes sure that the input is in the right format
  // returns false and an error if not a good input 
  var { orderId, itemId, isPacked } = body;
  if (orderId == undefined) {
    res.status(400).json({ error: "missing order ID" });
    return false;
  }

  // validation for itemId (must not be undefined) and isPacked (must be true or false)
  if (itemId == undefined || isPacked == undefined) {
    res.status(400).json({ error: "missing item ID or boolean isPacked" });
    return false;
  }

  return true;
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

  // accepts "false" or false, but prefer boolean type
  let isPacked = body.isPacked == "false" ? false : Boolean(body.isPacked);

  return new Promise((resolve, reject) => {
    validateFunc(token).then(() => {
      firebase.auth().signInAnonymously()
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

          // otherwise the orderId/itemId exists and we can update the status
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
      })
      .catch(err => {
        res.status(500).json({ error: "error signing into firebase: " + err });
        return;
      })
    })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." });
      return resolve();
    });
  })
}