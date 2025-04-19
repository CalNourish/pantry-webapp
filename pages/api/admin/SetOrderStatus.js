import { getAuth, signInAnonymously } from 'firebase/auth';
import firebase from '../../../firebase/clientApp'
import { validateFunc } from '../validate'

/*
* /api/admin/SetOrderStatus
* req.body = { boolean status }
* Updates the status of the order page
*/

export const config = {
    api: {
      bodyParser: true,
    },
  }

function requireParams(body, res) {
  if (typeof body.status === 'undefined') {
    res.status(400).json({ error: "Missing status in request." });
    return false;
  }
  return true;
}

export default async function(req, res) {
    // verify this request is legit
    const token = req.headers.authorization;

    return new Promise((resolve) => {
      const { body } = req;

      if (!requireParams(body, res)) {
        res.status(400).json({message: "bad request parameters"});
        return resolve();
      }
      
      validateFunc(token)
      .then(() => {
        const auth = getAuth();
        signInAnonymously(auth)
        .then(() => {
          var orderStatusRef = firebase.database().ref('/orderStatus/');
          orderStatusRef.set(body.status)
          .then(() => {
            res.status(200);
            res.json({ message: "success" });
            return resolve();
          })
          .catch((err) => {
            res.status(500).json({error: "server error", errorstack: err});
            return resolve("Error updating firebase: " + err);
          });
        })
        .catch(error => {
          res.status(500).json({error: "server error", errorstack: error});
          return resolve("Error signing in to firebase: " + error);
        });
      })
      .catch(() => {
        res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." });
        return resolve();
      });
  })
}