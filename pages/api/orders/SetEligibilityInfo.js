import firebase from '../../../firebase/clientApp'
import {validateFunc} from '../validate'

/*
* /api/orders/SetEligibilityInfo
* req.body = { string markdown }
*/

function requireParams(body) {
  // makes sure that the input is in the right format
  // returns false and an error if not a good input 
  if (body.markdown === undefined) {
    res.status(400).json({message: "Missing markdown string."});
    return false;
  }

  return true;
}

export default async function(req, res) {

  const token = req.headers.authorization

  return new Promise((resolve) => {
    const { body } = req

    // verify parameters
    let ok = requireParams(body, res);
    if (!ok) {
      return resolve();
    }
    
    validateFunc(token)
    .then(() => {
      firebase.auth().signInAnonymously()
      .then(() => {
        let ref = firebase.database().ref('/info/')
        ref.once('value')
        .then(() => {
          ref.update({orderEligibility: body.markdown})
        })
        .catch((err) => {
          console.log("error:", err)
          res.status(500).json({error: "server error", errorstack: err});
        });
      })
      .catch(err => {
        res.status(500);
        res.json({ error: "Error signing in to firebase: " + err });
        return resolve();
      });
    })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." })
      return resolve();
    });
  })
}