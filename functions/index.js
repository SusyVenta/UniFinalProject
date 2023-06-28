import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config/firebaseConfig.js";
import functions from "firebase-functions";
import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { homeRouter} from "./routers/home.js";
import { authenticationRouter} from "./routers/authentication.js";
import admin from "firebase-admin";
import { initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { serviceAccountCreds } from './config/serviceAccount.js';
import cookieParser from 'cookie-parser';
import { attachCsrfToken } from './utils/authUtils.js'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const firebaseAdminApp = initializeAdminApp({
  // this should be optional when running in Google environments (Cloud functions in our case)
  // https://firebase.google.com/docs/admin/setup#initialize-sdk
  // However, needed to test locally
  // https://firebase.google.com/docs/auth/admin/create-custom-tokens#letting_the_admin_sdk_discover_a_service_account
  credential: admin.credential.cert(serviceAccountCreds) 
});


const firebaseClientApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseClientApp);

const app = express();  

// enable folder /public - contains css files.
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css")); // redirect CSS bootstrap
app.use(
  "/my_js",
  express.static(__dirname + "/node_modules/bootstrap/dist/js")
);
app.use("/my_js", express.static(__dirname + "/node_modules/jquery/dist"));
app.use(express.static(__dirname + '/public'));

// enable to use ejs
app.set("view engine", "ejs");

// Support cookie manipulation.
app.use(cookieParser());

// Attach CSRF token on each request.
app.use(attachCsrfToken('/', 'csrfToken', (Math.random()* 100000000000000000).toString()));

// initialize other services
//const analytics = getAnalytics(firebaseApp);

const clientAuth = getAuth(firebaseClientApp);
const adminAuth = getAdminAuth(firebaseAdminApp);

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
app.use("/", homeRouter(adminAuth));
app.use("/auth", authenticationRouter(clientAuth, adminAuth));
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
