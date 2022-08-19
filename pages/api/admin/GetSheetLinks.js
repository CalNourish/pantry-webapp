import firebase from '../../../firebase/clientApp'

export default async function (req, res) {
  return new Promise((resolve) => {
    firebase.auth().signInAnonymously()
    .then(() => {
      firebase.database().ref('/sheetIDs')
      .once('value', snapshot => {
        let data = snapshot.val();
        res.status(200).json(data)
        return resolve()
      })
      .catch(error => {
        res.status(500).json("Error accessing firebase: " + error)
      });
    })
    .catch(error =>{
      res.status(500).json({error: error})
      return reject("Error signing in to firebase: " + error);
    });
  });
}