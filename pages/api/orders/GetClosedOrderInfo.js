import firebase from '../../../firebase/clientApp';

/*
* /api/orders/GetClosedOrderInfo
* Returns stored message for closed order page
*/

export default async function(_, res) {
    return new Promise((resolve) => {
      // no need to sign in since we're just reading
      firebase.database()
      .ref('/info/orderClosedMessage/')
      .once('value')
      .then(function(resp) {
        var markdown = resp.val();
        res.status(200).json({markdown: markdown});
        return resolve();
      })
      .catch(function(error) {
        res.status(500).json({error: "Server error getting order info: " + error});
        return resolve();
      });
    });
  }