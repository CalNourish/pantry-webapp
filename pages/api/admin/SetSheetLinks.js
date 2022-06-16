import firebase from '../../../firebase/clientApp'
import {validateFunc} from '../validate'

function requireParams(body, res) {
  
  const fieldOptions = ["checkoutLog", "checkoutLogSheet"]

  for (let name in body) {
    if (!fieldOptions.includes(name)) {
      res.json({error: "not a valid field name"});
      res.status(400);
      return false;
    }
  }

  return true;
}

export default async function (req, res) {

  const token = req.headers.authorization

  // TODO: check to make sure that this sheet actually exists?

  return new Promise((resolve) => {

    const {body} = req

    // verify parameters
    let ok = requireParams(body, res);
    if (!ok) {
      return resolve();
    }

    validateFunc(token).then(() => {
      firebase.auth().signInAnonymously()
      .then(() => {
        firebase.database().ref(`/sheetIDs`).update(body);
      });
    })
  })
}