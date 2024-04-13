import { getAuth, signInAnonymously } from "firebase/auth";
import firebase from "../../../firebase/clientApp";
import { validateFunc } from "../validate";

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

export default async function (req, res) {
  const token = req.headers.authorization;
  return new Promise((resolve) => {
    const { body } = req;
    console.log(body);
    let ok = requireParams(body, res);
    if (!ok) {
      res.status(400).json({ message: "bad request parameters" });
      return resolve();
    }

    validateFunc(token)
      .then(() => {
        const auth = getAuth();
        signInAnonymously(auth)
          .then(() => {
            let ref = firebase.database().ref("/info/");
            ref
              .update({ limitedItem: body.limitedItems })
              .then(() => {
                res.status(200).json({ message: "success", ref: ref });
                return resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ error: "server error", errorstack: err });
                return resolve("Error updating ref: " + err);
              });
          })
          .catch((err) => {
            res.status(500).json({ error: "server error", errorstack: err });
            return resolve("Error signing in to firebase: " + err);
          });
      })
      .catch(() => {
        res.status(401).json({
          error:
            "You are not authorized to perform this action. Make sure you are logged in to an administrator account.",
        });
        return resolve();
      });
  });
}
