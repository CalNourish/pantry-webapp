import firebase from '../../../firebase/clientApp'    

/*
* /api/inventory/GetAllItems
*/

export default async function(req,res) {   
  return new Promise((resolve, reject) => {

    // no need to sign in since we're just reading
    firebase.database()
        .ref('/inventory/')
        .once('value')  
        .catch(function(error){
        res.status(500);
        res.json({error: "server error getting items from the database", errorstack: error});
        return reject();
        })
        .then(function(resp){
        var allItems = resp.val();
        res.status(200);
        res.json(allItems);
        return resolve();
    });
  })
}