import firebase from '../../../firebase/clientApp'    
import {validateFunc} from '../validate'


/*
* /api/inventory/GetOrdersByStatus
* e.x.: /api/inventory/GetOrdersByStatus?status=open
* request query parameters: status: open, processing, complete
*/

// something to do with not using the next js body parsing...?
// may need to disable this in production environments
export const config = {
    api: {
        bodyParser: true,
    }
};

export const ORDER_STATUS_OPEN = "open";
export const ORDER_STATUS_PROCESSING = "processing";
export const ORDER_STATUS_COMPLETE = "complete";

function requireParams(query, res) {
    var {status} = query;
    if (status != ORDER_STATUS_OPEN && status != ORDER_STATUS_PROCESSING && status != ORDER_STATUS_COMPLETE) {
        res.json({error: "requested status must be either open, processing, or complete"});
        res.status(400);
        return false;
    }
    return true;
}

export default async function(req,res) {   
    // verify this request is legit
    const token = req.headers.authorization
    const allowed = await validateFunc(token)
    if (!allowed) {
        res.status(401).json({error: "you are not authenticated to perform this action"})
        return;
    }

    // verify params
    const {query} = req;
    let ok = requireParams(query, res);
    if (!ok) {
        return;
    }

    return new Promise((resolve, reject) => {
        return firebase.auth().signInAnonymously()
            .then(() => {
                var ref = firebase.database().ref("/order");                
                ref.orderByChild("status").equalTo(query["status"]).once("value", snapshot => {
                    const orders = snapshot.toJSON();
                    res.status(200).json(orders);
                    return;
                })
            })
            .catch(err => {
                res.status(500);
                res.json({error: "Error when checking out items: " + err});
                return;
            })
    })
}