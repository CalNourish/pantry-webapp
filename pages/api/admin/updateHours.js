import firebase from '../../../firebase/clientApp'
import { validateFunc } from '../validate'
import {onSave, onCancel} from '../../hours'


export const config = {
    api: {
        bodyParser: true,
    },
}


export default async function(req, res) {
    // verify this request is legit
    const token = req.headers.authorization
    console.log("TOKEN: ", token)
    const allowed = await validateFunc(token)
    if (!allowed) {
        res.status(401).json({ error: "you are not authenticated to perform this action" })
        return resolve();
    }

    return new Promise((resolve, reject) => {

            // construct parameters 
        // list of item fields that can be updated
        const FIELDS = ["hours"];
        let updatedFields = {};

        FIELDS.forEach(field => {
        if (body[field]) {
            updatedFields[field] = body[field];
        }
        });
        

        // perform the write
        firebase.auth().signInAnonymously()
            .then(() => {
                let day = firebase.database().ref('/hours/' + day);

                dayRef.once('value')
                    .catch(function (error) {
                        res.status(500);
                        res.json({ error: "server error getting that day from the database", errorstack: error });
                        return resolve();
                    })
                    .then(function (resp) {
                        
                        dayRef.update(updatedTime)
                            .catch(function (error) {
                                res.status(500);
                                res.json({ error: "error writing update to hours", errorstack: error });
                                return resolve();
                            })
                            .then(() => {
                                res.status(200);
                                res.json({ message: "success" });
                                return resolve();
                            });
                    });
            })
    })
}


export function validateHours(hours) {
    let trimmedHours = hours.trim()
    if(trimmedHours.toString() === "Closed" || trimmedHours.toString() === "closed") {
        return true;
    }
    let brokenUpHours = trimmedHours.split(" ");
    if(brokenUpHours.length !== 5) {
        console.log("Bad input1");
        console.log(hours);
        return false;
    }
    let startTime = brokenUpHours[0]
    let startMerdiem = brokenUpHours[1].toString()
    let endTime = brokenUpHours[3]
    let endMerdiem = brokenUpHours[4].toString()
    let brokenUpStartTime = startTime.split(':');
    let brokenUpEndTime = endTime.split(':');
    if(brokenUpEndTime.length !== 2 || brokenUpStartTime.length !== 2) {
        console.log("Bad input2");
        return false;
    }
    let [startHr, startMn] = startTime.split(':');
    let [endHr, endMn] = endTime.split(':');
    startHr = parseInt(startHr)
    startMn = parseInt(startMn)
    endHr = parseInt(endHr)
    endMn = parseInt(endMn)
    if (isNaN(startMn) || isNaN(startHr) || startHr > 12 || startHr < 1 || startMn > 59 || startMn < 0) {
        console.log("Bad input3");        
        return false;
    }
    if (isNaN(endMn) || isNaN(endHr)|| endHr > 12 || endHr < 1 || endMn > 59 || endMn < 0) {

        console.log("Bad input4");        
        return false;
    }
    if ((startMerdiem !== "AM" && startMerdiem !== "PM") || (endMerdiem !== "AM" && endMerdiem !== "PM")) {
        console.log("Bad input5");
        console.log(startMerdiem !== "AM")
        console.log(endMerdiem)   
        return false;
 
    }
    let militaryMinutesStart = convertTime12to24toMinutes(startHr, startMn, startMerdiem);
    let militaryMinutesEnd = convertTime12to24toMinutes(endHr, endMn, endMerdiem);
    if (militaryMinutesEnd <= militaryMinutesStart) {
        console.log("Bad input6");   
    }
    return true;

    



}
const convertTime12to24toMinutes = (hours, minutes, merdiem) => {

    if (hours === 12) {
        hours = 0;
    }

    if (merdiem === 'PM') {
        hours = hours + 12;
    }


    return hours * 60 + minutes;
}







