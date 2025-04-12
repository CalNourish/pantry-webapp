import firebase from '../../../firebase/clientApp'    

/*
* /api/admin/GetOrderStatus
* Returns the status of the order page
*/

export default async function (_, res) {
    return new Promise((resolve) => {
        // no need to sign in since we're just reading
        firebase.database().ref('/orderStatus/').once('value')
        .then(function(resp){
            var orderStatus = resp.val();
            res.status(200).json(orderStatus);
            return resolve();
        })
        .catch(function(error){
            res.status(500).json({error: "Server error getting order status from the database", errorstack: error});
            return resolve();
        });
    })
}