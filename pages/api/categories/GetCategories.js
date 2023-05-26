import firebase from '../../../firebase/clientApp'    

/*
* /api/categories/GetCateogries
*/

export default async function(_, res) {   
    return new Promise((resolve) => {
  
      // no need to sign in since we're just reading
      firebase.database()
      .ref('/category/')
      .once('value')
      .catch(function(error){
        res.status(500).json({error: "server error getting deliveryTime options", errorstack: error});
        return resolve();
      })
      .then(function(resp){
        var data = resp.val();
        if (data == null) data = {}
        res.status(200).json(data);
        return resolve();
      });
    })
  }
  