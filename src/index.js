// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Safe to have on client side: https://www.youtube.com/watch?v=rQvOAnNvcNQ&t=97s min 2:20
const firebaseConfig = {
  apiKey: "AIzaSyATpqum8quulphhSYEjMJinrVv51ydABpQ",
  authDomain: "grouptripper-8c189.firebaseapp.com",
  projectId: "grouptripper-8c189",
  storageBucket: "grouptripper-8c189.appspot.com",
  messagingSenderId: "351973430979",
  appId: "1:351973430979:web:d434c234a2799aba19b476",
  measurementId: "G-84RCS16FB4"
};

// Initialize Firebase app first
const app = initializeApp(firebaseConfig);

// initialize other services
const analytics = getAnalytics(app);

const auth = getAuth(app);

const db = getFirestore(app);

// Detect auth state

onAuthStateChanged(auth, user => {
    if (user != null){
        console.log("logged in!");
    } else {
        console.log("not logged in");
    }
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
