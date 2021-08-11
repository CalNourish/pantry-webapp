import {validateFunc} from '../validate'
import { google } from 'googleapis';
// when you call addorder.js, it returns a promise 
function requireParams(body, res) {
    /* require elements: First name, last name, email address, address, calID, 
    delivery_date, order_timestamp, items in the order (orderschema as of now)*/

    if (!body.firstName || !body.lastName || !body.address ||
        body.emailAddress || body.calID || body.deliveryDate) {
          res.json({error: "missing firstName||lastName||EmailAddres||Address||calID||deliveryDate\
             in request"}); //orderTimeStamp is part of order, but not something the user cares about
            res.status(400);
            return false;
        }
    //require order items object with at least one entry (order array)
    if (body.order.length <= 0) {
        res.json({error: "missing order item"}); //this line could be more clear
        res.status(400);
        return false;
    }
    return true;
}

  function addOrder(firstName, lastName, address, emailAddress, calID, deliveryDate) {
  const target = ['https://www.googleapis.com/auth/spreadsheets'];
  const jwt = new google.auth.JWT(
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    null,
    (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    target
  );

  const sheets = google.sheets({ version: 'v4', auth: jwt });
   const request = {
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: "Sheet1!A1:G1",
    valueInputOption: "USER_ENTERED", //as opposed to RAW
    includeValuesInResponse: true,
    resource: {
        "range": "Sheet1!A1:G1",
        "majorDimension": "ROWS",
        "values": [
          [firstName, lastName, address, emailAddress, calID, deliveryDate, Date.now()] //each inner array is a row if we specify ROWS as majorDim
        ] 
      }
  }
//   const response = await sheets.spreadsheets.values.update(params, valueRangeBody); 
return sheets.spreadsheets.values.update(request);
//const response = (await sheets.spreadsheets.values.update(request)).data;
  // TODO: Change code below to process the `response` object:
 // console.log(JSON.stringify(response, null, 2));
 

 /*   try {
      
    } catch (err) {
      console.log(err);
      return Promise.reject();
    } */
  //  return Promise.resolve();
  }
  
export default async function(req,res) {   
    // verify this request is legit
    const token = req.headers.authorization
    console.log("TOKEN: ", token)
    const allowed = await validateFunc(token)
    if (!allowed) {
        res.status(401)
        res.json({error: "you are not authenticated to perform this action"})
        return Promise.reject();
    } 

    const {body} = req //this line unpacks the request object 
        console.log("req: ", body);
    
        // verify parameters
        let ok = requireParams(body, res);
        if (!ok) {
            return Promise.reject();
        }
        // construct parameters 
  //  let orderItems = body.order.toString();
 /*   let newItem = {};
    newItem["firstName"] = body.firstName;
    newItem["lastName"] = body.lastName;
    newItem["address"] = body.address;
    newItem["emailAddress"] = body.emailAddress;
    newItem["calID"] = body.calID;
    newItem["deliveryDate"] = body.deliveryDate;
    newItem["orderTimeStamp"] = body.orderTimeStamp; */
     addOrder("1", "2", "3", "4", "5", "6").then(data => {
      console.log(data);
     })
     .catch(error => {
       console.log(error);
     });

} 