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

    return new Promise((resolve, reject) => {
        const {body} = req
    
        // verify parameters
        let ok = requireParams(body, res);
        if (!ok) {
            console.log("not good params")
            return reject();
        }

        validateFunc(token)
        .then(() => {
            console.log("validated")

            firebase.auth().signInAnonymously()
            .then(() => {
                console.log("signed in anonymously")
                let inventoryUpdates = {}
                for (let barcode in body) {
                    inventoryUpdates[barcode + '/count'] = firebase.database.ServerValue.increment(-1 * body[barcode]);
                }

                firebase.database().ref('/inventory/').update(inventoryUpdates)
                .catch(error => {
                    res.status(500);
                    res.json({error: `Error when checking out: ${error}`});
                    return resolve();
                })
                .then(() => {
                    console.log("updating")
                    res.status(200);
                    res.json({message: "success"});
                    return resolve();
                });
            })
        }).catch(() => {
            console.log("not validated")
            res.status(401);
            res.json({error: "you are not authenticated to perform this action"})
            return resolve();
        })
    })
}