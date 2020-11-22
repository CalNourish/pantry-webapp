import firebase from '../../firebase/clientApp'

export default async function getInventory() {
    const REF = firebase.database().ref('/inventory');
    console.log("hello world")
    REF.once("value", snapshot => {
        console.log(snapshot.val())
        return snapshot.val()
    });
    
  }