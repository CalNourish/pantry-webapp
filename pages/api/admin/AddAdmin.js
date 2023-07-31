import { getAuth, signInAnonymously } from 'firebase/auth';
import firebase from '../../../firebase/clientApp'
import { validateFunc } from '../validate'

/*
* /api/admin/AddAdmin
* req.body = {
    string name,
    string email
  }
*/

function isValidEmail(email) {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(String(email))
}

function requireParams(req, res) {
  // makes sure that the input is in the right format
  // returns false and an error if not a good input
  let { body } = req;
  if (!body.name) {
    res.status(400).json({error: `Missing or invalid name.`});
    return false;
  }

  if (!body.email || !isValidEmail(body.email)) {
    res.status(400).json({error: `Missing or invalid email.`});
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
      const { body } = req;
      const name = body.name;
      const email = body.email;

      // perform the write
      const auth = getAuth()
      signInAnonymously(auth)
      .catch((err) => {
        res.status(500).json({error: "Error signing in to firebase: " + err});
        return resolve();
      })
      .then(() => {
        let adminsRef = firebase.database().ref("/authorizedUser/");
        
        adminsRef.once('value')
        .then((resp) => {
          var user = resp.val();
          if (user[name]) {
            res.status(400).json({ error: `Admin user named "${name}" already exists` })
            return resolve();
          }

          const payload = { [name] : email }
          adminsRef.update(payload)
          .then(() => {
            res.status(200).json({ message: "success" });
            return resolve();
          })
          .catch(function (error) {
            res.status(500).json({ error: "Error adding admin user:", errorstack: error });
            return resolve();
          });
        })
      })
      .catch((err) => {
        res.status(500).json({error: "Error signing in to firebase: " + err});
        return resolve();
      })
    })
    .catch((err) => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." });
      return resolve();
    });
  })
}