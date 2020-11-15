import firebase from '../../../firebase/clientApp'    

/*
* /api/inventory/UpdateItem
* req.body = {string barcode, default categoryNames = [], default count = "0", 
              default itemName = "", default lowStock = -1, default packSize = "1"}
*/

export default (req,res) => { 
  let body = req.body;
  // construct parameters
  let barcode = body.barcode;
  let categoryNames = body.categoryNames ? body.categoryNames : [];
  let count = body.count ? body.count : [];
  let itemName = body.itemName ? body.itemName : "";
  let lowStock = body.lowStock ? body.lowStock : -1;
  let packSize = body.packSize ? body.packSize : 1;

  firebase.database()
    .ref('/inventory/' + barcode)
    .once('value')  
    .then(function(resp){
      // the version of the item in the database
      var dbItem = resp.val();
      firebase.database()
      .ref('/inventory/' + barcode)
      .update({count})
      .catch(function(error) {
        res.status(500);
        res.json({error: "error writing update to inventory database", errorstack: error});
      })
      .then(() => {
        res.status(200);
      });
    });
}