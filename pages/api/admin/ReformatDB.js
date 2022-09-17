import firebase from '../../../firebase/clientApp'
// import { validateFunc } from '../validate'

/*
* /api/admin/ReformatDB
*/

export const config = {
  api: {
    bodyParser: true,
  },
}

export default async function (req, res) {
  // verify this request is legit
  // const token = req.headers.authorization

  return new Promise((resolve) => {
    
    // validateFunc(token).then(() => {
      firebase.auth().signInAnonymously()
      .then(() => {
        // add displayPublic boolean (default true)
        let itemsRef = firebase.database().ref('/inventory')
        
        itemsRef.once('value')
        .then(function(resp) {
          let allItems = resp.val();
          let updatedInventory = {}
          Object.keys(allItems).map(barcode => {
            updatedInventory[barcode] = {...allItems[barcode], "displayPublic": true}
          })

          itemsRef.update(updatedInventory)
          .then(() => {
            res.status(200).json({message: "success!"})
            return resolve();
          }).catch((err) => {
            res.status(500).json({error: "Error writing to firebase: " + err});
            return resolve();
          });
        })
        .catch((err) => {
          res.status(500).json({error: "Error writing to firebase: " + err});
          return resolve();
        });
      })
      .catch(() => {
        res.status(500).json({error: "Error signing in to firebase: " + err});
        return resolve();
      })
    // })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." });
      return resolve();
    });
  })
}