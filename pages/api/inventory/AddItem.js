import firebase from '../../../firebase/clientApp'    

/*
* /api/inventory/AddItem
* req.body = {string barcode, string array categoryName, string count, 
              string itemName, default string lowStock = "-1", default string packSize = "1"}
* every field is required except for lowStock and packsize
*/

// something to do with not using the next js body parsing...?
// may need to disable this in production environments
export const config = {
  api: {
    bodyParser: true,
  },
}

// checks paramters are alright, return true if ok
function requireParams(body, res) {
    // require barcode and count and itemName
    if (!body.barcode || !body.count || !body.itemName) {
        res.status(400);
        res.json({error: "missing barcode||count||itemName in request"});
        return false;
    }
    // require categories obj with at least one entry
    if (!body.categoryName || body.categoryName.length < 1) {
        res.status(400);
        res.json({error: "missing categories"});
        return false;
    }
    return true;
}

export default async function(req,res) {   
  return new Promise((resolve, reject) => {
    const {body} = req
    console.log("req: ", body);

    // verify parameters
    let ok = requireParams(body, res);
    if (!ok) {
        return reject();
    }

    // construct parameters 
    let barcode = body.barcode.toString();
    let newItem = {};
    newItem["barcode"] = barcode;
    newItem["count"] = body.count.toString();
    newItem["itemName"] = body.itemName;
    newItem["categoryName"] = body.categoryName;
    newItem["lowStock"] = body.lowStock ? body.lowStock.toString() : "-1";
    newItem["packSize"] = body.packSize ? body.packSize.toString() : "1";    
    
    // check that all the categories are valid
    firebase.database().ref('/category')
    .once('value', snapshot => {
        let verifiedCategories = Object.keys(snapshot.val());
        Object.keys(body.categoryName).forEach(category =>{
            if (!verifiedCategories.includes(category.toLowerCase())) {
                res.status(400);
                res.json({error: "not all provided cateogries were valid"});
                return reject();
            }
        })
        // is there throttling on anonymous sign ins?
        firebase.auth().signInAnonymously()
        .then(() => {
        let itemRef = firebase.database().ref('/inventory/' + barcode);

        itemRef.once('value')  
        .catch(function(error){
            res.status(500);
            res.json({error: "server error getting reference to that item from the database", errorstack: error});
            return reject();
        })
        .then(function(resp){
            // the version of the item in the database
            var dbItem = resp.val();
            // this item already exists
            if (dbItem != null) {
            res.status(400);
            res.json({error: "an item with barcode " + barcode + " already exists"})
            return reject();
            }
            
            // otherwise the item doesn't exist and we can create it
            itemRef.update(newItem)
            .catch(function(error) {
            res.status(500);
            res.json({error: "error writing new item to inventory database", errorstack: error});
            return reject();
            })
            .then(() => {
            res.status(200);
            res.json({message: "success"});
            return resolve();
            });
        });
        })
    });
  })
}