import firebase from '../../../firebase/clientApp'    

/*
* /api/admin/GetHours
* Returns map of day of week to hours
*/

export default async function (_, res) {
    return new Promise((resolve) => {
        // no need to sign in since we're just reading
        firebase.database().ref('/hours/').once('value')
        .then(function(resp){
            var hoursMap = resp.val();
            Object.keys(hoursMap).map((key) => hoursMap[key] = hoursMap[key].hours)
            res.status(200).json(hoursMap);
            return resolve();
        })
        .catch(function(error){
            res.status(500).json({error: "Server error getting hours from the database", errorstack: error});
            return resolve();
        });
    })
}