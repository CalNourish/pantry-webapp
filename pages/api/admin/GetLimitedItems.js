import firebase from "../../../firebase/clientApp"

/*
* /api/admin/GetlimitedItems
*  returns the limited items data for checkout page
*/


export default async function (_, res) {
   return new Promise ((resolve) =>  {
   firebase.database()
    .ref('/info/limitedItems/')
    .once('value')
    .then(function(resp) {

      var limitedItems = resp.val();
      res.status(200).json({limitedItems: limitedItems});
      return resolve();
    })
    .catch(function(error) {
      res.status(500).json({error: "Server error getting limited Items " + error});
      return resolve();
    })
   })
}