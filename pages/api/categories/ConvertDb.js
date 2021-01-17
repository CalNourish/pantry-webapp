
import firebase from '../../../firebase/clientApp'    

/*
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
    
    firebase.database().ref('/category')
    .once('value', snapshot => {
        firebase.auth().signInAnonymously()
        .then(() => {
        // write the updated category
        let dbref = firebase.database().ref('/category/');

        dbref.once('value', snapshot => {
            // map category names to uniqueIDs
            let categories = snapshot.val();
            let namesToIDs = {}
            for (const [key, info] of Object.entries(categories)) {
                namesToIDs[info.displayName.toLowerCase()] = key;
            }
            namesToIDs["frozen"] = namesToIDs["frozen foods"];
            namesToIDs["canned"] = namesToIDs["canned foods"];

            // go through items in inventory and rewrite them
            firebase.database().ref('/inventory')
            .once('value')
            .then(function(resp) {
                let allItems = resp.val();
                for (let barcode of Object.keys(allItems)) {
                    
                    // update this item
                    let itemRef = firebase.database().ref('/inventory/' + barcode);
                    itemRef.once('value')
                    .then(function(resp) {
                        let item = resp.val();
                        if (item.categoryName) {
                            let newCategories = []
                            for (let catName of Object.keys(item.categoryName)) {
                                let newID = namesToIDs[catName.toLowerCase()];
                                newCategories.push(newID);
                                //newCategories[newID] = newID;
                            }
                            //console.log(barcode, newCategories);
                            //itemRef.update({"categoryName": newCategories});
                        } else {
                            console.log("Item " + barcode + " is missing a categories list");
                        }

                    })
                }
            })
            
        })
        });
    });
    res.status(200);
    res.json({});
    return resolve();
  })
}
*/