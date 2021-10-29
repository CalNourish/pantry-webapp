import firebase from '../../../firebase/clientApp'    



export default async function (req,res) { 


    return returnPromise().then((dayToHours) => {
        console.log(dayToHours);
        return dayToHours;
      });
    }
    
    function returnPromise() {
        var dayToHours = new Map();
        var days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
        return new Promise(function(resolve, reject) {
          
        for (let day in days) {       
            var ref = firebase.database().ref("/hours/"+days[day]);
            ref.once("value")
            
            .then(function(snapshot) {
                var hours = snapshot.child("hours").val();
                dayToHours.set(days[day],hours);
            });
            
            
        }
        resolve(dayToHours)    
      });

    

    
    
}