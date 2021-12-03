import firebase from '../../../firebase/clientApp'    

/*
* /api/admin/getHours
* Gets the current hours of the pantry
* req is empty 
*/

export default async function handler(req,res) { 

    var dayToHours = new Map();
    let days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    let promiseArray = [];

    for (let day in days) {       
        let p = returnPromise(days[day])
        promiseArray.push(p)
    }
    
    return await Promise.all(promiseArray)
    .then((snapshots) => {
        for (let snapshot in snapshots) {
            var hours = snapshots[snapshot].child("hours").val();
            dayToHours.set(days[snapshot],hours);
        }        
        res.status(201).json({
            message:Array.from(dayToHours.entries())
        });
      })
    .catch(error => {
        console.error(error.message)
        res.status(500).json({
            success: false,
            blob: error,
          });
    });
    }

    async function returnPromise(day) {
        return new Promise(function(resolve, reject) {
            const ref = firebase.database().ref("/hours/"+day);
            return resolve(ref.once("value"))
      });
    
    }







