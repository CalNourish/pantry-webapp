import firebase from '../../../firebase/clientApp'    

/*
* /api/inventory/AddCategory
* req.body = {string displayName, string iconName}
* both fields are required
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
    // require displayname and iconname
    if (!body.displayName || !body.iconName) {
        res.status(400);
        res.json({error: "missing DisplayName||IconName in request"});
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
    let displayName = body.displayName;
    let iconName = body.iconName;
    
    // check if this category exists yet based on displayName
    firebase.database().ref('/category')
    .once('value', snapshot => {
        let allDisplayNames = Object.values(snapshot.val()).map(category => category.displayName);
        if (allDisplayNames.includes(displayName)) {
            res.status(400);
            res.json({error: "A category with the display name \'" + displayName + "\' already exists"});
            return reject();
        }
        // is there throttling on anonymous sign ins?
        firebase.auth().signInAnonymously()
        .then(() => {
        // write the new category
        let dbref = firebase.database().ref('/category/');

        dbref.once('value')
            .catch(function(error){
                res.status(500);
                res.json({error: "server error getting reference to categories list", errorstack: error});
                return reject();
            })
            .then(() => {
                // first generate a random ID to use as a key
                let key = makeid(10);
                let val = {"displayName": displayName, "iconName": iconName};
                let cat = {};
                cat[key] = val;

                // write to the database
                dbref.update(cat)
                .catch(error => {
                    res.status(500);
                    res.json({error: "Error when writing new category to database"});
                    return reject();
                })
                .then(() => {
                    res.status(200);
                    res.json({message: "success"});
                    return resolve();
                })
            });
        });
    });
  })
}


function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 
 console.log(makeid(5));