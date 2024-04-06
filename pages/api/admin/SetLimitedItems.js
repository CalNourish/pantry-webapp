import { getAuth, signInAnonymously } from 'firebase/auth';
import firebase from '../../../firebase/clientApp'
import {validateFunc} from '../validate'

/*
* req.body = {itemName1: [noDependents, Dependents], itemName2: [noDependents, Dependents]....}
* where itemName are type string and noDepndents, Dependents are type int.
*/

function requireParams(body) {
   if (!body.limitedItems) {
      return false;
   }
   return true;
}

export default async function(req,res) {

  const token = req.headers.authorization

  return new Promise((resolve) => {
    const { body } = req;
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
        items = []
        for ([itemName, [noDependents, Dependents]] of body.limitedItems) {
          let path = `info/limitedItems/${itemName}$`
          let ref = firebase.database().ref(path)
          let itemData = {
            noDependents,
            Dependents
          }
          items.push(ref.update(itemData))
        }
        Promise.all(items).then(() => {
          res.status(200).json({ message: "Success" });
          return resolve();
        })
        .catch((err) => {
          res.status(500);
          res.json({error: "server error"})
          return resolve();
        })
        
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