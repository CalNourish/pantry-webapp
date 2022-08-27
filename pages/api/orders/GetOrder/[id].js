import firebase from '../../../../firebase/clientApp'
import { validateFunc } from '../../validate'

/*
* /api/orders/GetOrder/<id>
*/

// something to do with not using the next js body parsing...?
// may need to disable this in production environments
export const config = {
  api: {
    bodyParser: true,
  }
};


export default async function (req, res) {
  // verify this request is legit
  const token = req.headers.authorization

  return new Promise((resolve) => {
    const {
      query: { id },
    } = req;

    validateFunc(token).then(() => {
      firebase.auth().signInAnonymously()
      .then(() => {
        firebase.database().ref('/order/' + id)
        .once('value')
        .then(function (resp) {
          // the version of the order in the database
          var dbItem = resp.val();
          console.log("Item:", dbItem)
          // this order was not found
          if (dbItem === null) {
            res.status(404);
            res.json({ error: "unable to find order with id " + id })
            return resolve();
          }
          else {
            res.status(200);
            res.json(dbItem);
            return resolve();
          }
        })
        .catch(function (error) {
          res.status(500);
          res.json({ error: "server error getting that order from the database", errorstack: error });
          return resolve();
        });
      })
    })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." });
      return resolve();
    })
  })
}