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
        let db_tag = day.substring(0,3).toLowerCase() + start + "-" + end
        let payload = {
          "dayOfWeek": day,
          "display": `${day} ${start}-${end} ${end_AMPM}`,
          "startTime": start + " " + start_AMPM,
          "endTime": end + " " + end_AMPM
        }

        let windowRef = firebase.database().ref("/deliveryTimes/" + db_tag);
        windowRef.once('value')
          .then((resp) => {
            var window = resp.val();
            if (window != null) {
              res.status(400).json({ error: "delivery time with tag " + db_tag + " already exists" })
              return resolve();
            }

            windowRef.update(payload)
            .then(() => {
              res.status(200).json({ message: "success" });
              return resolve();
            })
            .catch(function (error) {
              res.status(500).json({ error: "error adding delivery window", errorstack: error });
              return resolve();
            });
          })
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