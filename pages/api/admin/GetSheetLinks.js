import firebase from '../../../firebase/clientApp'

/*
* /api/admin/GetSheetLinks
*/

export default async function (_, res) {
  return new Promise((resolve) => {
    firebase.database().ref('/sheetIDs/')
    .once('value', snapshot => {
      let data = snapshot.val();
      res.status(200).json(data);
      return resolve();
    })
    .catch(error => {
      res.status(500).json({error: "Error reading firebase sheet IDs: " + error});
      return resolve();
    });
  });
}