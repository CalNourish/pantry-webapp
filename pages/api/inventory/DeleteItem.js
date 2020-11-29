import firebase from '../../../firebase/clientApp'    

/*
* /api/inventory/DeleteItem
* req.body = {string barcode}
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

    // require barcode
    if (!body.barcode) {
      res.status(400);
      res.json({error: "missing barcode in request"});
      return reject();
    }

    let barcode = body.barcode.toString();
    
    // is there throttling on anonymous sign ins?
    firebase.auth().signInAnonymously()
    .then(() => {  
      let itemRef = firebase.database().ref('/inventory/' + barcode);
      itemRef.once('value')  
      .catch(function(error){
        res.status(500);
        res.json({error: "server error finding that item in the database", errorstack: error});
        return reject();
      })
      .then(function(resp){
        // the version of the item in the database
        var dbItem = resp.val();
        // this item was not found...we should warn when the user tries to 
        // delete an item that doesn't exist
        if (dbItem === null) {
          res.status(404);
          res.json({error: "unable to find item with barcode " + barcode})
          return reject();
        }
        
        // otherwise the item exists and we can delete it
        itemRef.remove()
        .catch(function(error) {
          res.status(500);
          res.json({error: "deletion failed", errorstack: error});
          return reject();
        })
        .then(() => {
          res.status(200);
          res.json({message: "successfully deleted " + barcode});
          return resolve();
        });
      });
    })
    
  })
}