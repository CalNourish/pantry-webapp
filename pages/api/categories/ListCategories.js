import firebase from '../../../firebase/clientApp'    

/*
* /api/categories/ListCategories
*/

// something to do with not using the next js body parsing...?
// may need to disable this in production environments
export const config = {
  api: {
    bodyParser: true,
  },
}



export default async function(req,res) {   
  return new Promise((resolve, reject) => {
    
    firebase.database()
      .ref('/category/')
      .once('value', snapshot => {
        res.status(200);
        res.json({"categories": Object.values(snapshot.val())})
        return resolve();
      })  
      .catch(function(error){
        res.status(500);
        res.json({error: "server error getting categories from the database", errorstack: error});
        return reject();
      })
    })
}