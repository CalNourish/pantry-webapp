import { getAuth, signInAnonymously } from "firebase/auth";
import firebase from "../../../firebase/clientApp";
import { validateFunc } from "../validate";

/*
 * /api/inventory/ResetInventory
 */

function getAllItems() {
  return new Promise((resolve, reject) => {
    firebase
      .database()
      .ref("/inventory/")
      .once("value")
      .then(function (resp) {
        var allItems = resp.val();
        return resolve(allItems);
      })
      .catch(function (error) {
        res.status(500).json({
          error: "server error getting items from the database",
          errorstack: error,
        });
        return reject();
      });
  });
}

export default async function (req, res) {
  const token = req.headers.authorization;

  const inventoryUpdates = {};
  return new Promise((resolve) => {
    validateFunc(token).then(() => {
      const auth = getAuth()
      signInAnonymously(auth)
        .then(() =>
          getAllItems().then((inventoryJson) => {
            for (let item in inventoryJson) {
              inventoryUpdates["/inventory/" + item + "/count"] =
                firebase.database.ServerValue.increment(
                  -1 * inventoryJson[item]["count"]
                );
            }
            firebase
              .database()
              .ref()
              .update(inventoryUpdates)
              .then(() => {
                res.status(200);
                res.json({ message: "Succesfully reset Inventory" });
                return resolve("Succesfully Reset Inventory");
              })
              .catch((error) => {
                res.status(500);
                res.json({ message: "Error updating firebase inventory" });
                return resolve("Error updating firebase inventory: " + error);
              });
          }).catch((error) => {
            res.status(500);
            res.json({ message: "Error fetching inventory" });
            return resolve("Error fetching inventory: " + error);
          })
        );
    }).catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." })
      return resolve();
    });
  });
}
