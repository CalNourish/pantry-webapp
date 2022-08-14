import firebase from '../../../firebase/clientApp'

/*
* /api/orders/GetHomeInfo
*/

export default async function(req,res) {

  return new Promise((resolve, reject) => {

    // no need to sign in since we're just reading
    firebase.database()
    .ref('/info/homepage/')
    .once('value')
    .then(function(resp) {
      var markdown = resp.val();
      res.status(200).json({markdown: markdown});
      return resolve();
    })
    .catch(function(error) {
      res.status(500).json({error: "server error getting info", errorstack: error});
      return resolve();
    })
  })
}