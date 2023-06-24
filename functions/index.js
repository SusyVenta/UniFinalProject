// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

import functions from "firebase-functions";
import express from "express";
import path from "path";
import url from "url";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Safe to have on client side: https://www.youtube.com/watch?v=rQvOAnNvcNQ&t=97s min 2:20
const firebaseConfig = {
    apiKey: "AIzaSyDtHeMzVRqgQzT1hzxAchIkreKc0fIQD8o",
    authDomain: "grouptripper-3c7f1.firebaseapp.com",
    projectId: "grouptripper-3c7f1",
    storageBucket: "grouptripper-3c7f1.appspot.com",
    messagingSenderId: "641850876844",
    appId: "1:641850876844:web:cbd89f2d8c5c1447a55009",
    measurementId: "G-91CCC2ME55"
  };  

initializeApp(firebaseConfig);
// Initialize Firebase app first
const myapp = express();  //initializeApp(firebaseConfig); 

// enable to use ejs
myapp.set("view engine", "ejs");

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


myapp.get("/home", (request, response) => {
    console.log("test 2");
    let indexPath = path.join(__dirname, "views/home.ejs");
    let payload = {};
    response.render(indexPath, payload);
  });

  const router = new express.Router();
  router.get("/", (req, res) => {
    res.send(`<h1>Example page</h1>`);
});

myapp.use("/example", router);
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

export const exportedapp = functions.https.onRequest(myapp);
