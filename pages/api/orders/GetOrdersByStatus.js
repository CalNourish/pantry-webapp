import firebase from '../../../firebase/clientApp'
import { validateFunc } from '../validate'

import { ORDER_STATUS_OPEN, ORDER_STATUS_PROCESSING, ORDER_STATUS_COMPLETE } from "../../../utils/orderStatuses"


/*
* /api/inventory/GetOrdersByStatus
* e.x.: /api/inventory/GetOrdersByStatus?status=open
* request query parameters: status: open, processing, complete
*/

// something to do with not using the next js body parsing...?
// may need to disable this in production environments
export const config = {
  api: {
    bodyParser: true,
  }
};

function requireParams(query, res) {
  var { status } = query;
  if (![ORDER_STATUS_OPEN, ORDER_STATUS_PROCESSING, ORDER_STATUS_COMPLETE].includes(status)) {
    res.status(400).json({ error: "requested status must be either open, processing, or complete" });
    return false;
  }
  return true;
}

export default async function (req, res) {
  // verify this request is legit
  const token = req.headers.authorization

  // verify params
  const { query } = req;
  let ok = requireParams(query, res);
  if (!ok) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    validateFunc(token).then(() => {
      firebase.auth().signInAnonymously()
      .then(() => {
        var ref = firebase.database().ref("/order");
        ref.orderByChild("status").equalTo(query["status"]).once("value", snapshot => {
          res.status(200).json(snapshot.toJSON());
          return resolve();
        })
      })
      .catch(err => {
        res.status(500);
        res.json({ error: "Error signing in to firebase: " + err });
        return resolve();
      })
    })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." });
      return resolve();
    });
  })
}