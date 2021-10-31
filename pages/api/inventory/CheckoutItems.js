import firebase from '../../../firebase/clientApp'    
import {validateFunc} from '../validate'

/*
* /api/inventory/CheckoutItems.js
* req.body = {barcode1: quantity1, barcode2: quantity2, ...}
*/

function requireParams(body, res) {
    /* require elements: array of elements {barcode: quantity} */

    //require orders to have at least one item
    if (body.length <= 0) {
        res.json({error: "empty order"});
        res.status(400);
        return false;
    }

    return true;
}

export default async function(req,res) {  
    
    const token = req.headers.authorization
    // console.log("TOKEN: ", token)
    const allowed = await validateFunc(token)

    if (!allowed) {
        res.status(401);
        res.json({error: "you are not authenticated to perform this action"})
        return Promise.reject();
    }

    return new Promise((resolve, reject) => {
        const {body} = req
        console.log("(post-call) req: ", body);
    
        // verify parameters
        let ok = requireParams(body, res);
        if (!ok) {
            return reject();
        }
    
        for (let barcode in body) {
            let count = body[barcode];
            console.log(`${barcode}: ${count}`)
        }

        // if (!barcode) {
        //     res.status(400);
        //     res.json({error: `item (barcode = ${barcode}) does not exist`});
        //     return reject();
        // }

        firebase.auth().signInAnonymously()
        .then(() => {
            let inventoryUpdates = {}
            for (let barcode in body) {
              inventoryUpdates['/inventory/' + barcode + "/count"] = firebase.database.ServerValue.increment(-1 * body[barcode]);
            }

            firebase.database().ref().update(inventoryUpdates); 

            res.status(200);
            res.json({message: "success"});
            return resolve();
        })
    })
}