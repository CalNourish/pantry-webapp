import firebase from '../../../firebase/clientApp'    
import {validateFunc} from '../validate'
import { server } from '../../_app.js'


export const config = {
    api: {
      bodyParser: true,
    },
  }

export default async function(req,res) {   
    // verify this request is legit
    const token = req.headers.authorization;

    // we need to parse through all the items' categoryNames to check if the deleted category's ID appears 
    // in any of them. If so, delete that ID from the categoryNames list.

    
  
    return new Promise((resolve) => {
      
      function getAllItems() {
        return new Promise((resolve, reject) => {
          firebase.database().ref('/inventory/').once('value')
          .then(function(resp){
            var allItems = resp.val();
            return resolve(allItems);
          })
          .catch(function(error){
            res.status(500).json({error: "server error getting items from the database", errorstack: error});
            return reject();
          })
        })
      }
      const {body} = req;
      let targetCategoryRef = body.tag

      getAllItems().then((inventoryJson) => { 
        const allItems = Object.keys(inventoryJson);
        console.log(targetCategoryRef)
        // iterate over each item and remove any mention of the deleted category ID in the attribute categoryName
        for (const item of allItems) {
          const categoryArr = inventoryJson[item].categoryName
          //console.log(categoryArr)
          console.log(inventoryJson[item])
          const targetIndex = categoryArr.indexOf(targetCategoryRef)
          // if targetIndex is -1, the item doesn't mention the deleted category ID
          console.log(targetIndex)
          if (targetIndex != -1) {
            // remove the deleted category ID from the item
            categoryArr.splice(targetIndex, 1)

            // if the item falls under no more categories, append the 'uncategorized' category ID so item has a category
            if (categoryArr.length == 0) {
              categoryArr.push('uncategorized')

              console.log(categoryArr)

              const payload = {
                "barcode" : inventoryJson[item].barcode,
                "categoryName" : categoryArr
              }

              console.log(inventoryJson[item].barcode);
              console.log(JSON.stringify(payload))
              
              fetch(`${server}/api/inventory/UpdateItem`, { method: 'POST',
              body: JSON.stringify(payload),
              headers: {'Content-Type': "application/json", 'Authorization': token}})
              .then((response) => response.json())
              .then(json => {
                if (json.error) {
                  console.log(json.error);
                }
              })
              //   .then((result) => {
              //     console.log(999)
              //     result.json()
              //     .then((res) => {
              //       setSubmitStatus(res.error)
              //     })
              //     setFormData(newData)
              //   })
              // }

            }
          }
        }  
      })

      validateFunc(token).then(() => {
        const {body} = req;
        
        
        // category display name to be deleted typed in check-in box
        let key = body.tag; // changed from body.displayName
        
        firebase.auth().signInAnonymously()
        .then(() => {  
          let CategoryRef = firebase.database().ref('/category/' + key);
          CategoryRef.once('value')  
          .catch(function(error){
            res.status(500).json({error: "server error finding that category in the database", errorstack: error});
            return resolve();
          })
          .then(function(resp){
            // the version of the category in the database
            var dbCategory = resp.val();
            // warn the user when that category doesn't exist (shouldn't matter once we just have a button to delete a specific displayed category)
            if (dbCategory === null) {
              res.status(404).json({error: "unable to find category " + key})
              return resolve();
            }
            
            // otherwise the category exists and we can delete it
            CategoryRef.remove()
            .catch(function(error) {
              res.status(500).json({error: "deletion failed", errorstack: error});
              return resolve();
            })
            .then(() => {
              res.status(200).json({message: "successfully deleted " + key});
              return resolve();
            });
          });
        })
        .catch(error => {
          res.status(500).json({error: error})
          return resolve("Error signing in to firebase: " + error);
        });
      })
      .catch(() => {
        res.status(401).json({ error: "You are not authorized to perform this action. Make sure you are logged in to an administrator account." })
        return resolve();
      });
    })
  }