import firebase from '../../../firebase/clientApp'    
import {validateFunc} from '../validate'

/*
* /api/inventory/UpdateItem
* req.body = {string barcode, string array categoryName, string/int count, 
              string itemName, string lowStock, string packSize}
*/

// something to do with not using the next js body parsing...?
// may need to disable this in production environments
export const config = {
  api: {
    bodyParser: true,
  },
}

export default async function(req,res) {   
  // verify this request is legit
  const token = req.headers.authorization

  return new Promise((resolve, reject) => {
    const {body} = req

    // require barcode
    if (!body.barcode) {
      res.status(400).json({error: "missing barcode in request"});
      return resolve();
    }

    // construct parameters 
    // list of item fields that can be updated
    const FIELDS = ["categoryName", "count", "itemName", "lowStock", "packSize"];
    let updatedFields = {};
    // make sure barcode is a string
    let barcode = body.barcode.toString();

    // convert count to integer
    if (body["count"]) {
      body["count"] = parseInt(body["count"]);
      if (isNaN(body["count"])) {
        res.status(400).json({error: "invalid count (not a number)"});
        return resolve();
      }
    }

    if (body["categoryName"]) {
      body["categoryName"] = Object.keys(body["categoryName"])
      if (body["categoryName"].length == 0) {
        res.status(400).json({error: "must have at least one category"});
        return resolve();
      }
    }

    FIELDS.forEach(field => {
      if (body[field] !== undefined) {
        updatedFields[field] = body[field];
      }
    });

    validateFunc(token).then(() => {
      firebase.auth().signInAnonymously()
      .then(() => {
        let itemRef = firebase.database().ref('/inventory/' + barcode);

        itemRef.once('value')  
        .catch(function(error){
          res.status(500);
          res.json({error: "server error getting that item from the database", errorstack: error});
          return resolve();
        })
        .then(function(resp){
          // the version of the item in the database
          var dbItem = resp.val();
          // this item was not found
          if (dbItem === null) {
            res.status(404);
            res.json({error: "unable to find item with barcode " + barcode})
            return resolve();
          }

          // otherwise the item exists and we can update it
          itemRef.update(updatedFields)
          .catch(function(error) {
            res.status(500);
            res.json({error: "error writing update to inventory database", errorstack: error});
            return resolve();
          })
          .then(() => {
            res.status(200);
            res.json({message: "success"});
            return resolve();
          });
        });
      })
    })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an authorized account." });
      return resolve();
    });
  })
}