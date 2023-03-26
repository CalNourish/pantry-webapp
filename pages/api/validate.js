import admin from '../../utils/auth/firebaseAdmin'    

export const validateFunc = async (token) => {
  
  return new Promise((resolve, reject) => {
    // apparently getting headers that don't exist return "undefined" the string ¯\_(ツ)_/¯
    if (token === "undefined" || typeof token === "undefined") {
      reject("No token provided")
      return false
    }
    // get list of authorized users
    admin.database().ref('/authorizedUser') 
    .once('value', snapshot => {
      // check if the token is valid
      return admin.auth().verifyIdToken(token, true)
      .catch(error => {
        reject(error)
        return false
      })
      .then(decoded => {
        // the ID token is valid
        // now check if the user pulled from the token is authorized
        var vals = snapshot.val()
        for (const key in vals) {
          if (vals[key] === decoded.email && decoded.email_verified) {
            resolve(true)
          }
        }
        reject("Valid token but unallowed email")
      })      
    });
  })
};

export default async (req, res) => {
  // Check if there is a token and if not return undefined.
  
  const { token } = JSON.parse(req.headers.authorization || '{}');
  if (!token) {
    return res.status(403).json({
      message: 'Auth token missing.'
    });
  }
  // Call the validate function above that gets the user data
  // this data ends up getting passed to every page's props
  validateFunc(token).then(() => {
    const result = {
      "user": {
        "Data": "Hello"
      },
    };
    return res.status(200).json(result);
  }).catch(err => {
    console.log(err)
    return res.status(403).json({message: "No user found."});
  })
};
