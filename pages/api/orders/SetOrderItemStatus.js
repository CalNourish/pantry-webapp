import firebase from '../../../firebase/clientApp'    
import {validateFunc} from '../validate'

/*
* /api/orders/SetOrderItemStatus
* req.body = { string orderId, string itemId, string isPacked = true | false}
*/

function requireParams(body, res) {
    // makes sure that the input is in the right format
    // returns false and an error if not a good input 
    var {orderId} = body;
    if (!orderId) {
        res.json({error: "missing order ID"});
        res.status(400);
        return false;
    }

    // TODO: add validation for itemId (must not be undefined) and isPacked (must be true or false)

    return true;
}

export default async function(req, res) {
    // verify this request is from an authorized user
    const token = req.headers.authorization
    const allowed = await validateFunc(token)
    if (!allowed) {
        res.status(401).json({error: "you are not authenticated to perform this action"})
        return;
    }

    // verify params
    const {body} = req;
    let ok = requireParams(body, res);
    if (!ok) {
        return;
    }

    // TODO: change code below
    let orderId = req.body.orderId.toString();
    let newStatus = req.body.status.toString();

    return new Promise((resolve, reject) => {
        firebase.auth().signInAnonymously()
        .then(() => {
            var orderRef = firebase.database().ref("/order/" + orderId);
            
            orderRef.once('value')
            .catch(function(error) {
                res.status(500);
                res.json({error: "server error getting that order from database", errorstack: error});
                return resolve();
            })
            .then(function(resp) {
                // the current version of the order in the database
                var currOrder = resp.val();

                // this order was not found
                if (currOrder === null) {
                    res.status(404);
                    res.json({error: "unable to find order with ID " + orderId})
                    return resolve();
                }
                
                // otherwise the orderId exists and we can update the status
                orderRef.update({"status": newStatus})
                .catch(function(error) {
                    res.status(500);
                    res.json({error: "error updating status of order" + orderId, errorstack: error});
                    return resolve();
                })
                .then(() => {
                    res.status(200);
                    res.json({message: "success"});
                    return resolve();
                });
            })
        })
        .catch(err => {
            res.status(500);
            res.json({error: "error signing into firebase: " + err});
            return;
        })
    })
}