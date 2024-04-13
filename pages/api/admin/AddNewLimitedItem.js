import { getAuth, signInAnonymously } from "../../../lib/firebase-admin";
import firebase from "../../../firebase/clientApp";
import { validateFunc } from "../validate";

/* 
    req.body = {
        string name,
        int noDependence,
        int dependence
    }
*/

function requireParams(req, res) {
  let { body } = req;
  if (!body.name || !body.dependence || !body.noDependence) {
    res
      .status(400)
      .json({ error: `Missing or invalid name, dependence or noDependence.` });
    return false;
  }
  if (body.name == "" || body.dependence <= 0 || body.noDependence <= 0) {
    res
      .status(400)
      .json({ error: `Missing or invalid name, dependence or noDependence.` });
    return false;
  }
  return true;
}

export default async function (req, res) {
  const token = req.headers.authorization;

  return new Promise((resolve) => {
    if (!requireParams(req, res)) {
      return resolve();
    }

    validateFunc(token).then(() => {
      const { body } = req;
      const auth = getAuth();
      signInAnonymously(auth)
        .catch((err) => {
          res
            .status(500)
            .json({ error: "Error signing in to firebase: " + err });
          return resolve();
        })
        .then(() => {
          let limitedItemsRef = firebase.database().ref("/info/limitedItem/");
        });
    });
  });
}
