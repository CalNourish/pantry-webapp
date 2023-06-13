import { getAuth, signInAnonymously } from 'firebase/auth';
import firebase from '../../../firebase/clientApp'    
import { validateFunc } from '../validate'

/*
* /api/orders/GetAllOrders
*/

// something to do with not using the next js body parsing...?
// may need to disable this in production environments
export const config = {
    api: {
        bodyParser: true,
    }
};

export default async function(req,res) {   
    // verify this request is legit
    const token = req.headers.authorization

    return new Promise((resolve) => {
      validateFunc(token)
        .then(() => {
          const auth = getAuth()
          signInAnonymously(auth)
          .then(() => {
            firebase.database().ref('/order/')
            .once('value')
            .then(function(resp){
              // the version of the order in the database
              var dbItem = resp.val();
              res.status(200);
              res.json(dbItem);
              return resolve();
            })
            .catch(function(error){
              res.status(500);
              res.json({error: "server error getting that order from the database", errorstack: error});
              return resolve();
            });
          })
          .catch(err => {
            res.status(500);
            res.json({ error: "error updating firebase: " + err });
            return;
          })
        })
        .catch((err) => {
          res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." });
          return resolve();
        });
    })
}