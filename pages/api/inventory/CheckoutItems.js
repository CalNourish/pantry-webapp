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
            res.status(400).json({message: "bad request parameters"});
            return resolve();
        }

        validateFunc(token)
        .then(() => {
            firebase.auth().signInAnonymously()
            .then(() => {
                
                Promise.all(
                    Object.keys(body).map(barcode => {
                        return new Promise((resolve) => {
                            let ref = firebase.database().ref(`/inventory/${barcode}`)
                            ref.once("value")
                            .then(snapshot => {
                                if (snapshot.exists()) {
                                    ref.update({"count": firebase.database.ServerValue.increment(-1 * body[barcode])})
                                    .then(() => {
                                        return resolve();
                                    })
                                    .catch(error => {
                                        res.status(500);
                                        res.json({error: `Error when checking out item (barcode ${barcode}): ${error}`});
                                        return resolve();
                                    })
                                } else {
                                    console.log(`possible data corruption: invalid barcode ${barcode}`)
                                }
                            });
                        })
                    })
                ).then(() => {
                    console.log("checkout done")
                    res.status(200);
                    res.json({message: "success"});
                    return resolve();
                })
                .catch(() => {
                    console.log(`possible data corruption`)
                })
            }).catch((err) => {
                console.log("CheckoutItems signInAnonymously error:", err)
                res.status(500);
                res.json({message: "error signing in to firebase"});
                return resolve();
            })
        }).catch(() => {
            console.log("Checkout: user not authenticated")
            res.status(401);
            res.json({error: "you are not authenticated to perform this action"})
            return resolve();
        })
    })
}