import firebase from '../../firebase/clientApp'    

const validate = async (token) => {
  // Check that the user has a valid token
  const decodedToken = await firebase.auth().verifyIdToken(token, true);
  // assign user data
  console.log("Validating an authorized user");
  const result = {
    "user": {
      authenticated: true
    },
  };
  return result;
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
    // Call the validate function above that gets the user data.
    const result = await validate(token);
    return res.status(200).send(JSON.stringify(result));
  } catch (err) {
    // Return undefined if there is no user. You may also send a different status or handle the error in any way that you wish.
    console.log(err);
    const result = undefined;
    return res.status(200).send(result);
  }
};
