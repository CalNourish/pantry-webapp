import firebase from '../../../firebase/clientApp'    
import {validateFunc} from '../validate'

export const config = {
    api: {
      bodyParser: true,
    },
  }

export default async function(req,res) {   
    // verify this request is legit
    const token = req.headers.authorization
  
    return new Promise((resolve) => {
      validateFunc(token).then(() => {
        const {body} = req

        let ok = requireParams(body, res);
        if (!ok) {
            return resolve();
        }
  
        // category display name to be deleted typed in check-in box
        let displayName = body.displayName;
        
        firebase.auth().signInAnonymously()
        .then(() => {  
          let CategoryRef = firebase.database().ref('/category/' + displayName);
          CategoryRef.once('value')  
          .catch(function(error){
            res.status(500).json({error: "server error finding that category in the database", errorstack: error});
            return resolve();
          })
          .then(function(resp){
            // the version of the category in the database
            var dbCategory = resp.val();
            // warn the user when that category doesn't exist (shouldn't matter once we just have a button to delete a specific displayed category)
            if (dbCategory === null) {
              res.status(404).json({error: "unable to find category " + displayName})
              return resolve();
            }
            
            // otherwise the category exists and we can delete it
            CategoryRef.remove()
            .catch(function(error) {
              res.status(500).json({error: "deletion failed", errorstack: error});
              return resolve();
            })
            .then(() => {
              res.status(200).json({message: "successfully deleted " + displayName});
              return resolve();
            });
          });
        })
        .catch(error => {
          res.status(500).json({error: error})
          return resolve("Error signing in to firebase: " + error);
        });
      })
      .catch(() => {
        res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." })
        return resolve();
      });
    })
  }