import firebase from '../../../firebase/clientApp'    
import {validateFunc} from '../validate'

/*
* /api/inventory/AddItem
* req.body = {string barcode, string array categoryName, string count, 
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
    console.log(body)
    // require barcode and count and itemName
    if (!body.barcode || !body.count || !body.itemName) {
        console.log("Not ok1")
        res.status(400).json({error: "missing barcode||count||itemName in request"});
    }
    // require categories obj with at least one entry
    if (!body.categoryName || body.categoryName.length < 1) {
        console.log("Not ok2")
        res.status(400).json({error: "missing categories"});
    }
    return true
}

export default async function(req,res) {   
    // verify this request is legit
    const token = req.headers.authorization
    console.log("TOKEN: ", token)
    const allowed = await validateFunc(token)
    if (!allowed) {
        res.status(401).json({error: "you are not authenticated to perform this action"})
        return;
    }
    return new Promise((resolve, reject) => {
        const {body} = req
        console.log("req: ", body);

        // verify parameters
        let ok = requireParams(body, res);
        if (!ok) {
            console.log("Not ok3")
            return resolve();
        }

        // construct parameters 
        let barcode = body.barcode.toString();
        let newItem = {};
        newItem["barcode"] = barcode;
        newItem["count"] = body.count.toString();
        newItem["itemName"] = body.itemName;
        newItem["categoryName"] = Object.keys(body.categoryName); // get it in array format
        newItem["lowStock"] = body.lowStock ? body.lowStock.toString() : "-1";
        newItem["packSize"] = body.packSize ? body.packSize.toString() : "1";    
        
        // check that all the categories are valid
        firebase.database().ref('/category')
        .once('value', snapshot => {
            let verifiedCategories = Object.keys(snapshot.val());
            for (const category in body.categoryName) {
                if (!verifiedCategories.includes(category)) {
                    console.log("Not ok4")
                    res.status(400).json({error: "not all provided cateogries were valid"});
                    return resolve();
                }
            }
            
            // perform the write
            // is there throttling on anonymous sign ins?
            firebase.auth().signInAnonymously()
            .then(() => {
                let itemRef = firebase.database().ref('/inventory/' + barcode);

                itemRef.once('value')  
                .catch(function(error){
                    console.log("Not ok5")
                    res.status(500).json({error: "server error getting reference to that item from the database", errorstack: error});
                    return resolve();
                })
                .then(function(resp){
                    // the version of the item in the database
                    var dbItem = resp.val();
                    // this item already exists
                    if (dbItem != null) {
                        console.log("Not ok6")
                        res.status(400).json({error: "an item with barcode " + barcode + " already exists"})
                        return resolve();
                    }
                    // otherwise the item doesn't exist and we can create it
                    itemRef.update(newItem)
                    .catch(function(error) {
                        console.log("Not ok7")
                        res.status(500).json({error: "error writing new item to inventory database", errorstack: error});
                        return resolve();
                    })
                    .then(() => {
                        console.log("OK")
                        res.status(200).json({message: "success"});
                        return resolve();
                    });
                });
            })
        });
    })
}