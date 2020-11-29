import firebase from '../../../firebase/clientApp'    

/*
* /api/inventory/UpdateItem
* req.body = {string barcode, string array categoryNames, string count, 
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
  return new Promise((resolve, reject) => {
    const {body} = req
    console.log("req: ", body);

    // construct parameters 
    // list of item fields that can be updated
    const FIELDS = ["categoryNames", "count", "itemName", "lowStock", "packSize"];
    let updatedFields = {};
    // make sure barcode is a string
    let barcode = body.barcode.toString();

    FIELDS.forEach(field => {
      if (body[field]) {
        updatedFields[field] = body[field];
      }
    });

    console.log("Fields to update: ", updatedFields)
    
    // is there throttling on anonymous sign ins?
    firebase.auth().signInAnonymously()
    .then(() => {
      firebase.database()
      .ref('/inventory/' + body.barcode)
      .once('value')  
      .catch(function(error){
        res.status(500);
        res.json({error: "server error getting that item from the database", errorstack: error});
        return reject();
      })
      .then(function(resp){
        // the version of the item in the database
        var dbItem = resp.val();
        // this item was not found
        if (dbItem === null) {
          res.status(404);
          res.json({error: "unable to find item with barcode " + barcode})
          return reject();
        }
        
        // otherwise the item exists and we can update it
        firebase.database()
        .ref('/inventory/' + body.barcode)
        .update(updatedFields)
        .catch(function(error) {
          res.status(500);
          res.json({error: "error writing update to inventory database", errorstack: error});
          return reject();
        })
        .then(() => {
          res.status(200);
          res.json({message: "success"});
          return resolve();
        });
      });
    })
    
  })
}