import functions from "firebase-functions";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const router = new express.Router();

// initialize other services
//const analytics = getAnalytics(firebaseApp);

//const auth = getAuth(app);

//const db = getFirestore(app);

// Detect auth state

/*onAuthStateChanged(auth, user => {
    if (user != null){
        console.log("logged in!");
    } else {
        console.log("not logged in");
    }
}); */

/* ENDPOINT: http://localhost:5004/home */
router.get("/", (request, response) => {
    let indexPath = path.join(__dirname, '..',"views/home.ejs");
    let payload = {};
    response.render(indexPath, payload);
  });

/*
// create firestore collection
const newTestCollection = collection(db, "new_test_collection");

// get document from collection
const snapshot = await getDocs(newTestCollection);

// Get a list of cities from your database
async function getCities(db) {
    const citiesCol = collection(db, 'cities');
    const citySnapshot = await getDocs(citiesCol);
    const cityList = citySnapshot.docs.map(doc => doc.data());
    return cityList;
  }
  */

export const homeRouter = router;
