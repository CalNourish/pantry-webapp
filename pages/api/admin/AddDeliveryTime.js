import firebase from '../../../firebase/clientApp'
import { validateFunc } from '../validate'
import { daysInOrder } from '../../hours';

/*
* /api/admin/AddDeliveryTime
* req.body = {
    string day,
    int start,
    string start_AMPM ["AM", "PM"],
    int end,
    string end_AMPM ["AM", "PM"]
  }
*/

export const config = {
  api: {
    bodyParser: true,
  },
}

const AMPM_opt = ["AM", "PM"]

function requireParams(req, res) {
  // makes sure that the input is in the right format
  // returns false and an error if not a good input
  let { body } = req;
  if (!daysInOrder.includes(body.day)) {
    res.status(400).json({error: `'${body.day}' not a day of the week.`});
    return false;
  }
  
  if (body.start === undefined || AMPM_opt.includes(body.start_AMPM)) {
    res.status(400).json({error: `Missing start hours or start AM/PM.`});
    return false;
  }

  if (body.end === undefined || AMPM_opt.includes(body.end_AMPM)) {
    res.status(400).json({error: `Missing end hours or end AM/PM.`});
    return false;
  }

  return true;
}

export default async function (req, res) {
  // verify this request is legit
  const token = req.headers.authorization

  return new Promise((resolve) => {
    if (!requireParams(req, res)) {
      return resolve();
    }
    
    validateFunc(token).then(() => {
      const { body } = req
      let day = body.day.toString();
      let start = body.start.toString()
      let start_AMPM = body.start_AMPM.toString()
      let end = body.end.toString()
      let end_AMPM = body.end_AMPM.toString()

      // perform the write
      firebase.auth().signInAnonymously()
      .then(() => {
        let database_key = day.substring(0,3).toLowerCase() + start + "-" + end
        let payload = {
          "dayOfWeek": day,
          "display": `${day} ${start}-${end} ${end_AMPM}`,
          "startTime": start + " " + start_AMPM,
          "endTime": end + " " + end_AMPM
        }
      })
      .catch(() => {
        res.status(500).json({error: "Error signing in to firebase: " + err});
        return resolve();
      })
    })
    .catch(() => {
      res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." });
      return resolve();
    });
  })
}

/** Rough start to a function used to validate hours of the food pantry, currently
 *  not utilized. TODO
 */
export function validateHours(hours) {

  let trimmedHours = hours.trim()
  if (trimmedHours.toString() === "Closed" || trimmedHours.toString() === "closed") {
    return true;
  }

  let brokenUpHours = trimmedHours.split(" ");
  if (brokenUpHours.length !== 5) {
    return false;
  }

  let startTime = brokenUpHours[0]
  let startMerdiem = brokenUpHours[1].toString()
  let endTime = brokenUpHours[3]
  let endMerdiem = brokenUpHours[4].toString()
  let brokenUpStartTime = startTime.split(':');
  let brokenUpEndTime = endTime.split(':');
  if (brokenUpEndTime.length !== 2 || brokenUpStartTime.length !== 2) {
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
  if (isNaN(endMn) || isNaN(endHr) || endHr > 12 || endHr < 1 || endMn > 59 || endMn < 0) {

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

/** 
 * Helper function for validateHours to convert from standard time to military time
 */
const convertTime12to24toMinutes = (hours, minutes, merdiem) => {

  if (hours === 12) {
    hours = 0;
  }

  if (merdiem === 'PM') {
    hours = hours + 12;
  }

  return hours * 60 + minutes;

}


