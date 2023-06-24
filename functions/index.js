import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { homeRouter} from "./routes/home.js";
import { firebaseConfig } from "./config/firebaseConfig.js";

import functions from "firebase-functions";
import express from "express";
import path from "path";
import url from "url";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

initializeApp(firebaseConfig);

const app = express();  

// enable folder /public - contains css files.
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css")); // redirect CSS bootstrap
app.use(
  "/my_js",
  express.static(__dirname + "/node_modules/bootstrap/dist/js")
);
app.use("/my_js", express.static(__dirname + "/node_modules/jquery/dist"));

// enable to use ejs
app.set("view engine", "ejs");

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


/* Enables all URLs defined in homeRouter and starting with http://<domain>/home */
app.use("/", homeRouter);
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

export const exportedapp = functions.https.onRequest(app);
