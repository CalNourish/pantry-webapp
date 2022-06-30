import firebase from '../../../firebase/clientApp'
import {validateFunc} from '../validate'

export default async function (req, res) {

  const token = req.headers.authorization

  return new Promise((resolve) => {

    validateFunc(token).then(() => {
      console.log('signed in')
      firebase.auth().signInAnonymously()
      .then(() => {
        firebase.database().ref('/sheetIDs')
        .once('value', snapshot => {
          let data = snapshot.val();
          res.status(200).json(data)
          return resolve()
        });
      });
    }).catch((err) => {
      res.status(401).json({error: err})
      return resolve()
    })
  })
}