import { getAuth, signInAnonymously } from 'firebase/auth';
import firebase from '../../../firebase/clientApp'
import { validateFunc } from '../validate'

/*
* /api/orders/SetOrderInfo
* req.body = { string markdown }
* Updates the closed order page message
*/

function requireParams(body) {
    // makes sure that the input is in the right format
    // returns false and an error if not a good input
    if (body.markdown !== undefined) return true;
    return false;
}

export default async function(req, res) {

  const token = req.headers.authorization;

  return new Promise((resolve) => {
    if (!requireParams(req, res)) {
      res.status(400).json({message: "bad request parameters"});
      return resolve();
    }
    
    validateFunc(token)
    .then(() => {
      const auth = getAuth();
      signInAnonymously(auth)
      .then(() => {
        let ref = firebase.database().ref('/info')
        ref.update({orderClosedMessage: body.markdown})
        .then(() => {
          res.status(200).json({message: "success"})
          return resolve();
        })
        .catch((err) => {
          res.status(500).json({error: "server error", errorstack: err});
          return resolve("Error updating ref: " + err);
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
  });
}
