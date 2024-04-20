import { getAuth, signInAnonymously } from "firebase/auth";
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
  if (
    !body.newLimitedItem.name ||
    !body.newLimitedItem.dependence ||
    !body.newLimitedItem.noDependence
  ) {
    res
      .status(400)
      .json({ error: `Missing or invalid name, dependence or noDependence.` });
    return false;
  }
  if (
    body.newLimitedItem.name == "" ||
    parseInt(body.newLimitedItem.dependence) <= 0 ||
    parseInt(body.newLimitedItem.noDependence) <= 0
  ) {
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

    validateFunc(token)
      .then(() => {
        const { body } = req;
        const newLimitedItem = body.newLimitedItem;
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
            limitedItemsRef.once("value").then((resp) => {
              let allItems = resp.val();
              let found = allItems.find(
                (ele) => ele.name === newLimitedItem.name
              );
              if (found) {
                res.status(400).json({
                  error: `Limited item ${found.name} already existed.`,
                });
                return resolve();
              }
              allItems.push(newLimitedItem);
              limitedItemsRef
                .update(allItems)
                .then(() => {
                  res
                    .status(200)
                    .json({ message: "successfully add new limited item" });
                  return resolve();
                })
                .catch((err) => {
                  res.status(500).json({
                    message: "Error adding new limited item",
                    error: err,
                  });
                  return resolve();
                })
                .catch((err) => {
                  res
                    .status(500)
                    .json({ error: "Error signing in to firebase: " + err });
                  return resolve();
                });
            });
          });
      })
      .catch((err) => {
        res.status(401).json({
          error:
            "You are not authorized to perform this action. Make sure you are logged in to an administrator account.",
        });
        return resolve();
      });
  });
}
