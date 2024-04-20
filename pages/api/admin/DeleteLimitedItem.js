import { getAuth, signInAnonymously } from "firebase/auth";
import firebase from "../../../firebase/clientApp";
import { validateFunc } from "../validate";

export default async function deleteItem(req, res) {
    const token = req.headers.authorization;
    const { itemId } = req.body; // Assuming the item ID is provided in the request body

    // Validate request parameters
    if (!itemId) {
        res.status(400).json({ message: "Bad request parameters: item ID is missing" });
        return;
    }

    try {
        // Validate the user's authorization
        await validateFunc(token);

        // Authenticate anonymously with Firebase
        const auth = getAuth();
        await signInAnonymously(auth);

        // Reference to the specific item in Firebase Realtime Database
        const itemRef = firebase.database().ref(`/info/limitedItem/${itemId}`);

        // Remove the item from Firebase
        await itemRef.remove();

        // Respond to the client with success
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (err) {
        // Handle errors and respond with error status and message
        console.error(`Error deleting item with ID ${itemId}:`, err);
        res.status(500).json({ error: "Server error", errorstack: err });
    }
}