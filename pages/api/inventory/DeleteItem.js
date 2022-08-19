import firebase from '../../../firebase/clientApp'    
import {validateFunc} from '../validate'

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
  // verify this request is legit
  const token = req.headers.authorization

  return new Promise((resolve, reject) => {
    validateFunc(token).then(() => {
      const {body} = req
      console.log("req: ", body);

      // require barcode
      if (!body.barcode) {
        res.status(400).json({error: "missing barcode in request"});
        return resolve();
      }

      let barcode = body.barcode.toString();
      
      // is there throttling on anonymous sign ins?
      firebase.auth().signInAnonymously()
      .then(() => {  
        let itemRef = firebase.database().ref('/inventory/' + barcode);
        itemRef.once('value')  
        .catch(function(error){
          res.status(500).json({error: "server error finding that item in the database", errorstack: error});
          return resolve();
        })
        .then(function(resp){
          // the version of the item in the database
          var dbItem = resp.val();
          // this item was not found...we should warn when the user tries to 
          // delete an item that doesn't exist
          if (dbItem === null) {
            res.status(404).json({error: "unable to find item with barcode " + barcode})
            return resolve();
          }
          
          // otherwise the item exists and we can delete it
          itemRef.remove()
          .catch(function(error) {
            res.status(500).json({error: "deletion failed", errorstack: error});
            return resolve();
          })
          .then(() => {
            res.status(200).json({message: "successfully deleted " + barcode});
            return resolve();
          });
        });
      })
      .catch(error =>{
        res.status(500).json({error: error})
        return resolve("Error signing in to firebase: " + error);
      });
    })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an authorized account." })
      return resolve();
    });
  })
}