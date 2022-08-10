import firebase from '../../../firebase/clientApp'    

/*
* /api/admin/getHours
* Gets the current hours of the pantry
* req is empty 
*/

export default async function (req, res) {
    return new Promise((resolve, reject) => {

        // no need to sign in since we're just reading
        firebase.database()
        .ref('/hours/')
        .once('value')  
        .catch(function(error){
            res.status(500).json({error: "server error getting items from the database", errorstack: error});
            return resolve();
        })
        .then(function(resp){
            var hoursMap = resp.val();
            Object.keys(hoursMap).map((key) => hoursMap[key] = hoursMap[key].hours)
            res.status(200).json(hoursMap);
            return resolve();
        });
    })
}