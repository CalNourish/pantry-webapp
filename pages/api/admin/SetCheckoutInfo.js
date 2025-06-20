import { getAuth, signInAnonymously } from 'firebase/auth';
import firebase from '../../../firebase/clientApp'
import {validateFunc} from '../validate'

/*
* /api/orders/SetCheckoutInfo
* req.body = { string markdown }
*/

function requireParams(body, res) {
  // makes sure that the input is in the right format
  // returns false and an error if not a good input 
  if (body.markdown !== undefined && body.isPantryCheckout !== undefined) return true;
  res.status(400).json({message: "Missing markdown string or isPantryCheckout."});
  return false;
}

async function updateInfo(ref, body) {
  if (body.isPantryCheckout) {
    await ref.update({checkout: body.markdown})
  } else {
    await ref.update({grabngocheckout: body.markdown})
  }
}

export default async function(req,res) {

  const token = req.headers.authorization

  return new Promise((resolve) => {
    const { body } = req
    let ok = requireParams(body, res);
    if (!ok) {
        res.status(400).json({message: "bad request parameters"});
        return resolve();
    }
    
    validateFunc(token)
    .then(() => {
      const auth = getAuth()
      signInAnonymously(auth)
      .then(() => {
        let ref = firebase.database().ref('/info')
        
        updateInfo(ref, body)
        .then(() => {
          res.status(200).json({message: "success"})
          return resolve();
        })
        .catch((err) => {
          res.status(500).json({error: "server error", errorstack: err});
          return resolve("Error updating ref: " + err);
        });
      })
      .catch(error =>{
        res.status(500).json({error: error})
        return resolve("Error signing in to firebase: " + error);
      });
    })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." });
      return resolve();
    });
  })
}