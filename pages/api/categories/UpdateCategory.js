import firebase from '../../../firebase/clientApp'
import { validateFunc } from '../validate'

/*
* /api/inventory/UpdateCategory
* req.body = {string displayName, string iconName}
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
    res.json({ error: "missing DisplayName||IconName in request" });
    return false;
  }
  return true;
}

export default async function (req, res) {

  // verify this request is legit
  const token = req.headers.authorization

  return new Promise((resolve, reject) => {
    validateFunc(token).then(() => {
      const { body } = req

      // verify parameters
      let ok = requireParams(body, res);
      if (!ok) {
        return resolve();
      }

      let displayName = body.displayName;
      let iconName = body.iconName;

      firebase.database().ref('/category')
      .once('value', snapshot => {
        // make sure this cateogry exists
        let categories = snapshot.val();
        let allDisplayNames = Object.values(categories).map(category => category.displayName);
        if (!allDisplayNames.includes(displayName)) {
          res.status(400);
          res.json({ error: "A category with the display name \'" + displayName + "\' does not exist" });
          return resolve();
        }

        // the internal key mapping to the given category
        let key = Object.keys(categories).find(key => categories[key].displayName === displayName);

        // is there throttling on anonymous sign ins?
        firebase.auth().signInAnonymously()
        .then(() => {
          // write the updated category
          let dbref = firebase.database().ref('/category/' + key);

          dbref.once('value')
          .then(() => {
            // write to the database, only have to update iconName since displayName is immutable
            dbref.update({ "iconName": iconName })
            .then(() => {
              res.status(200).json({ message: "success" });
              return resolve();
            })
            .catch(error => {
              res.status(500).json({ error: "Error when writing updated category to database: " + error });
              return resolve();
            })
          })
          .catch(function (error) {
            res.status(500).json({ error: "server error getting reference to categories ref", errorstack: error });
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
  })
}