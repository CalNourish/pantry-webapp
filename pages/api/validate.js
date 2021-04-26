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
  try {
    // Check if there is a token and if not return undefined.
    
    const { token } = JSON.parse(req.headers.authorization || '{}');
    if (!token) {
      return res.status(403).send({
        errorCode: 403,
        message: 'Auth token missing.',
      });
    }
    // Call the validate function above that gets the user data
    // this data ends up getting passed to every page's props
    const authenticated = await validateFunc(token);
    const result = {
      "user": {
        "Data": "Hello"
      },
    };
    return res.status(200).send(JSON.stringify(result));
  } catch (err) {
    // Return undefined if there is no user. You may also send a different status or handle the error in any way that you wish.
    console.log(err);
    const result = undefined;
    return res.status(200).send(result);
  }
};
