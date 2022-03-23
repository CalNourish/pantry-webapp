import firebase from '../../../firebase/clientApp'


export async function getInventory() {
  return await firebase
  .database()
  .ref('/inventory')
  .once("value")
}

export default async function handler(req, res) {
  // Get data from your database
  const snapshot = await getInventory();
  return res.json(snapshot.val())
}

