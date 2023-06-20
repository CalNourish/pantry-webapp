import { getAuth, signInAnonymously } from 'firebase/auth';
import firebase from '../../../firebase/clientApp'
import { validateFunc } from '../validate'

/*
* /api/inventory/AddItem
* req.body = {string barcode, string array categoryName, string/int count, 
              string itemName, default string lowStock = "-1", default string packSize = "1"}
* every field is required except for lowStock and packsize
* categoryName is an array of internal category IDs
*/

// something to do with not using the next js body parsing...?
// may need to disable this in production environments
export const config = {
  api: {
    bodyParser: true,
  },
}

// checks paramters are alright, sends http response if not ok
function requireParams(body, res) {
  // require barcode and count and itemName
  if (!body.barcode) {
    res.status(400).json({ error: "Missing barcode in request." });
    return false;
  }

  if (body.count == undefined) {
    res.status(400).json({ error: "Missing count in request." });
    return false;
  }

  if (!body.itemName) {
    res.status(400).json({ error: "Missing itemName in request." });
    return false;
  }

  if (isNaN(parseInt(body.count))) {
    res.status(400).json({ error: "Invalid count (not a number)." });
    return false;
  }

  // require categories obj with at least one entry
  if (!body.categoryName || body.categoryName.length < 1) {
    res.status(400).json({ error: "Item must have at least one category." });
    return false;
  }

  return true
}

export default async function (req, res) {
  // verify this request is legit
  const token = req.headers.authorization
  
  return new Promise((resolve) => {
    validateFunc(token).then(() => {
      const { body } = req

      // verify parameters
      let ok = requireParams(body, res);
      if (!ok) {
        return resolve();
      }

      // construct parameters 
      let barcode = body.barcode.toString();
      let newItem = {
        "barcode": barcode,
        "count": parseInt(body.count),
        "itemName": body.itemName,
        "categoryName": Object.keys(body.categoryName),
        "lowStock": body.lowStock ? body.lowStock.toString() : "-1",
        "packSize": body.packSize ? body.packSize.toString() : "1",
        "displayPublic": body.displayPublic !== undefined ? body.displayPublic : true, // default true
        "defaultCart": body.defaultCart !== undefined ? body.defaultCart : false // default false
      };

      // check that all the categories are valid
      firebase.database().ref('/category')
      .once('value', snapshot => {
        let verifiedCategories = Object.keys(snapshot.val());
        for (const category in body.categoryName) {
          if (!verifiedCategories.includes(category)) {
            res.status(400).json({ error: "not all provided cateogries were valid" });
            return resolve();
          }
        }
      })
      .catch((err) => {
        res.status(500).json({error: "Error accessing firebase categories ref:" + err});
        return resolve();
      })
      .then(() => {
        // if no category issues, perform the write
        const auth = getAuth()
        signInAnonymously(auth)
        .then(() => {
          let itemRef = firebase.database().ref('/inventory/' + barcode);

          itemRef.once('value')
          .then(function (resp) {
            // the version of the item in the database
            var dbItem = resp.val();
            // this item already exists
            if (dbItem != null) {
              res.status(400).json({ error: "an item with barcode " + barcode + " already exists" })
              return resolve();
            }
            // otherwise the item doesn't exist and we can create it
            itemRef.update(newItem)
            .then(() => {
              res.status(200).json({ message: "success" });
              return resolve();
            })
            .catch(function (error) {
              res.status(500).json({ error: "error writing new item to inventory database", errorstack: error });
              return resolve();
            });
          })
          .catch(function (error) {
            res.status(500).json({ error: "server error getting reference to that item from the database", errorstack: error });
            return resolve();
          });
        })
        .catch((err) => {
          res.status(500).json({error: "Error writing to firebase:" + err});
          return resolve();
        });
      })        
    })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." });
      return resolve();
    });
  })
}