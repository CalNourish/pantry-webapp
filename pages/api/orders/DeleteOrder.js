import firebase from '../../../firebase/clientApp'
import { validateFunc } from '../validate'

/*
* /api/orders/DeleteOrder
* req.body = { string orderId }
*/

function requireParams(body, res) {
  // makes sure that the input is in the right format
  // returns false and an error if not a good input 
  if (!body.orderId) {
    res.status(400).json({ error: "missing order ID" });
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

  let orderId = req.body.orderId.toString();

  return new Promise((resolve) => {
    validateFunc(token).then(() => {
      firebase.auth().signInAnonymously()
      .then(() => {
        var orderRef = firebase.database().ref("/order/" + orderId);

        orderRef.once('value')
        .then(function (resp) {
          // the current version of the order in the database
          var currOrder = resp.val();

          // this order was not found
          if (currOrder === null) {
            res.status(404);
            res.json({ error: "unable to find order with ID " + orderId })
            return resolve();
          }

          // otherwise the orderId exists and we can update the status
          orderRef.remove()
          .then(() => {
            res.status(200);
            res.json({ message: "success" });
            return resolve();
          })
          .catch(function (error) {
            res.status(500);
            res.json({ error: "error deleting order" + orderId, errorstack: error });
            return resolve();
          });
        })
        .catch(function (error) {
          res.status(500);
          res.json({ error: "server error getting that order from database", errorstack: error });
          return resolve();
        })
      })
      .catch(err => {
        res.status(500);
        res.json({ error: "error signing into firebase: " + err });
        return;
      })
    })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." });
      return resolve();
    });
  })
}