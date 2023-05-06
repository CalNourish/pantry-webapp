import firebase from '../../../firebase/clientApp'
import { validateFunc } from '../validate'

/*
* /api/admin/DeleteDeliveryTime
* req.body = {
    string tag
  }
*/

export const config = {
  api: {
    bodyParser: true,
  },
}

function requireParams(req, res) {
  // makes sure that the input is in the right format
  // returns false and an error if not a good input
  let { body } = req;
  if (body.tag === undefined) {
    res.status(400).json({error: `Missing tag for delivery window.`});
    return false;
  }

  return true;
}

export default async function (req, res) {
  // verify this request is legit
  const token = req.headers.authorization

  return new Promise((resolve) => {
    if (!requireParams(req, res)) {
      return resolve();
    }
    
    validateFunc(token).then(() => {
      const { body } = req
      // perform the write
      firebase.auth().signInAnonymously()
      .then(() => {
        var windowRef = firebase.database().ref("/deliveryTimes/" + body.tag);
        windowRef.once('value')
        .then((resp) => {
          // check that the window/tag exists
          var window = resp.val();
          if (window === null) {
            res.status(404);
            res.json({ error: `Unable to find delivery time with tag "${body.tag}."` })
            return resolve();
          }

          windowRef.remove()
          .then(() => {
            res.status(200);
            res.json({ message: "success" });
            return resolve();
          })
          .catch(function (error) {
            res.status(500);
            res.json({ error: `Error deleting delivery time with tag "${body.tag}."`, errorstack: error });
            return resolve();
          });
        })
      })
      .catch(() => {
        res.status(500).json({error: "Error signing in to firebase: " + err});
        return resolve();
      })
    })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." });
      return resolve();
    });
  })
}