import firebase from '../../../../firebase/clientApp'    

/*
* /api/inventory/GetItem/<barcode>
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

    const {
        query: { barcode },
    } = req
    firebase.database()
      .ref('/inventory/' + barcode)
      .once('value')  
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
        else {
            res.status(200);
            res.json(dbItem);
            return resolve();
        }
      });
    })
}