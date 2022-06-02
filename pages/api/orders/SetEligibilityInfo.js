import firebase from '../../../firebase/clientApp'
import {validateFunc} from '../validate'

/*
* /api/orders/SetEligibilityInfo
* req.body = { string markdown }
*/

function requireParams(body, res) {
  // makes sure that the input is in the right format
  // returns false and an error if not a good input 
  if (body.markdown) return true;
  return false;
}

export default async function(req,res) {

  const token = req.headers.authorization

  return new Promise((resolve, reject) => {
    const { body } = req
    console.log(body.markdown)

    // verify parameters
    let ok = requireParams(body, res);
    if (!ok) {
        res.status(400).json({message: "bad request parameters"});
        return resolve();
    }
    
    validateFunc(token)
    .then(() => {
      firebase.auth().signInAnonymously()
      .then(() => {
        let ref = firebase.database().ref('/info/')
        ref.once('value')
        .catch(function(error){
          res.status(500).json({error: "server error getting info", errorstack: error});
          return resolve();
        })
        .then(function(resp){
          ref.update({orderEligibility: body.markdown})
        })
        .catch((err) => {
          console.log(err)
          res.status(500).json({error: "server error", errorstack: err});
        });
      });
    });
  })
}