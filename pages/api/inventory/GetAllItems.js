import firebase from '../../../firebase/clientApp'    

/*
* /api/inventory/GetAllItems
*/

export default async function(_, res) {   
  return new Promise((resolve) => {

    // no need to sign in since we're just reading
    firebase.database().ref('/inventory/')
    .once('value')
    .then((resp) => {
      var allItems = resp.val();
      res.status(200).json(allItems);
      return resolve();
    })
    .catch((error) => {
      res.status(500).json({error: "server error getting items from the database", errorstack: error});
      return resolve();
    });
  })
}