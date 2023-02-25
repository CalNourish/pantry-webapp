import firebase from '../../../firebase/clientApp'
import { validateFunc } from '../validate'

/*
* /api/inventory/AddCategory
* req.body = {string displayName}
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
  // require displayname 
  if (!body.displayName ) {
    res.status(400);
    res.json({ error: "missing DisplayName" });
    return false;
  }
  return true;
}

export default async function (req, res) {

  const token = req.headers.authorization

  return new Promise((resolve) => {
    validateFunc(token).then(() => {
      const { body } = req

      // verify parameters
      let ok = requireParams(body, res);
      if (!ok) {
        return resolve();
      }

      // construct parameters 
      let displayName = body.displayName;

      // check if this category exists yet based on displayName
      firebase.database().ref('/category')
      .once('value', snapshot => {
        let allDisplayNames = Object.values(snapshot.val()).map(category => category.displayName);
        if (allDisplayNames.includes(displayName)) {
          res.status(400).json({ error: "A category with the display name '" + displayName + "' already exists" });
          return resolve();
        }
        // is there throttling on anonymous sign ins?
        firebase.auth().signInAnonymously()
        .then(() => {
          // write the new category
          let dbref = firebase.database().ref('/category/');

          dbref.once('value')
          .then(() => {
            // first generate a random ID to use as a key
            let key = makeid(10); //make display name but lowercase
            let val = { "displayName": displayName};
            let cat = {};
            cat[key] = val;

            // write to the database
            dbref.update(cat)
            .then(() => {
              res.status(200).json({ message: "success" });
              return resolve();
            })
            .catch(error => {
              res.status(500).json({ error: "Error when writing new category to database: " + error });
              return resolve();
            })
          })
          .catch(function (error) {
            res.status(500).json({ error: "server error getting reference to categories list", errorstack: error });
            return resolve();
          });
        })
        .catch((err) => {
          res.status(500).json({error: "Error writing to firebase:" + err});
          return resolve();
        });
      });
    })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." });
      return resolve();
    });
  });
}


function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//  console.log(makeid(5));