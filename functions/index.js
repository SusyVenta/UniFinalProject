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
import { tripsRouter} from "./routers/trips.js";
import { profileRouter} from "./routers/profile.js";
import { authenticationRouter} from "./routers/authentication.js";
import { legalRouter} from "./routers/legal.js";
import { settingsRouter} from "./routers/settings.js";
import admin from "firebase-admin";
import { initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { serviceAccountCreds } from './config/serviceAccount.js';
import cookieParser from 'cookie-parser';
import { attachCsrfToken } from './utils/authUtils.js'
import { Database } from './db/db.js'
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


const clientAuth = getAuth(firebaseClientApp);
const adminAuth = getAdminAuth(firebaseAdminApp);


const db = new Database(firebaseAdminApp);

/* Enables all URLs defined in homeRouter and starting with http://<domain>/home */
app.use("/", homeRouter(adminAuth));
app.use("/auth", authenticationRouter(clientAuth, adminAuth, db));
app.use("/legal", legalRouter());
app.use("/trips", tripsRouter(adminAuth, db));
app.use("/profile", profileRouter(adminAuth, db));
app.use("/settings", settingsRouter(adminAuth, db));

export const exportedapp = functions.https.onRequest(app);
