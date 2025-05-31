import firebase from '../../../firebase/clientApp'

/*
* /api/admin/GetGrabnGoCheckoutInfo
* returns stored markdown for checkout page
*/

export default async function(_, res) {
  return new Promise((resolve) => {
    // no need to sign in since we're just reading
    firebase.database()
    .ref('/info/grabngocheckout/')
    .once('value')
    .then(function(resp) {
      var markdown = resp.val();
      res.status(200).json({markdown: markdown});
      return resolve();
    })
    .catch(function(error) {
      res.status(500).json({error: "Server error getting homepage info: " + error});
      return resolve();
    })
  })
}