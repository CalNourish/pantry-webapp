import firebase from '../../../firebase/clientApp'




export async function getNotifications() {
  return await firebase
  .database()
  .ref('/notification')
  .orderByChild("timestamp")
  .once("value")
}

export default async function handler(req, res) {
  // Get data from your database
  const snapshot = await getNotifications();
  return res.json(snapshot.val())
}


// .on("child_added", function(snapshot) {
//   return {
//     title: snapshot.val().title,
//     body: snapshot.val().text,
//     timestamp: snapshot.val().timestamp
//   }

