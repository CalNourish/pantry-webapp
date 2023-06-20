import firebase from '../../../firebase/clientApp'
import { validateFunc } from '../validate'

import { ORDER_STATUS_OPEN, ORDER_STATUS_PROCESSING, ORDER_STATUS_COMPLETE } from "../../../utils/orderStatuses"
import { getAuth, signInAnonymously } from 'firebase/auth';

/*
* /api/orders/SetOrderStatus
* req.body = { string orderId, string status = "open" || "processing" || "complete" }
*/

function requireParams(body, res) {
  var { orderId, status } = body;
  if (!orderId) {
    res.status(400).json({ error: "Missing order ID" });
    return false;
  }

  if (![ORDER_STATUS_OPEN, ORDER_STATUS_PROCESSING, ORDER_STATUS_COMPLETE].includes(status)) {
    res.status(400).json({ error: "Requested status must be either open, processing, or complete" });
    return false;
  }
  return true;
}

export default async function (req, res) {
  // verify this request is legit
  const token = req.headers.authorization

  // verify params
  const { body } = req;
  let ok = requireParams(body, res);
  if (!ok) {
    return Promise.resolve();
  }

  let orderId = req.body.orderId.toString();
  let newStatus = req.body.status.toString();

  return new Promise((resolve) => {
    validateFunc(token).then(() => {
      const auth = getAuth()
      signInAnonymously(auth)
      .then(() => {
        var orderRef = firebase.database().ref("/order/" + orderId);

        orderRef.once('value')
          .catch((error) => {
            res.status(500);
            res.json({ error: "server error getting that order from database", errorstack: error });
            return resolve();
          })
          .then((resp) => {
            // the current version of the order in the database
            var currOrder = resp.val();

            // this order was not found
            if (currOrder === null) {
              res.status(404);
              res.json({ error: "unable to find order with ID " + orderId })
              return resolve();
            }

            // otherwise the orderId exists and we can update the status
            orderRef.update({ "status": newStatus })
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
          .catch((error) => {
            res.status(500).json({ error: "server error updating order", errorstack: error });
            return resolve();
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