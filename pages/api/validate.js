import admin from '../../utils/auth/firebaseAdmin'    

export const validateFunc = async (token) => {
  return new Promise((resolve, reject) => {
    // apparently getting headers that don't exist return "undefined" the string ¯\_(ツ)_/¯
    if (token === "undefined" || typeof token === "undefined") {
      return reject("No token provided")
    }
    // get list of authorized users
    admin.database().ref('/authorizedUser')
    .once('value', snapshot => {
      // check if the token is valid
      return admin.auth().verifyIdToken(token, true)
      .then(decoded => {
        // the ID token is valid
        // now check if the user pulled from the token is authorized
        var vals = snapshot.val()
        for (const key in vals) {
          if (vals[key] === decoded.email && decoded.email_verified) {
            return resolve(true)
          }
        }
        return reject("Valid token but unallowed email")
      })
      .catch(error => {
        return reject(error)
      })
    })
    .catch(error => {
      return reject(error)
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
  return validateFunc(token)
  .then(() => {
    return res.status(200).json({message: "Success!"});
  })
  .catch(err => {
    return res.status(403).json({message: "No user found.", error: err});
  })
};
