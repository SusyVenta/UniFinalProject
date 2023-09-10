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
import { notificationsRouter } from "./routers/notifications.js";
import { authenticationRouter} from "./routers/authentication.js";
import { legalRouter} from "./routers/legal.js";
import { settingsRouter} from "./routers/settings.js";
import { friendsRouter } from "./routers/friends.js";
import admin from "firebase-admin";
import { initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { serviceAccountCreds } from './config/serviceAccount.js';
import cookieParser from 'cookie-parser';
import { attachCsrfToken } from './utils/authUtils.js'
import { Database } from './db/db.js'
import path from "path";
import helmet from "helmet";
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

/*app.use(function(req, res, next) {
  // security settings
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('X-Content-Type-Options', "nosniff");
  res.append("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.append("Referrer-Policy", "no-referrer");
  res.header("Cross-Origin-Resource-Policy", "same-site");
  res.header("X-Frame-Options", "DENY");
  
  const options = { 
    maxAge: 8 * 60 * 60 * 1000, // 8 hours 
    httpOnly: true, 
    secure: true,
    sameSite: 'strict'// browsers will not send it in any cross-site requests.,
  };
  let sessionCookie = req.cookies.__session;
  res.cookie('__session', sessionCookie, options);
  
  //res.append("Content-Security-Policy", "default-src * data: blob: 'self' wss: ws: localhost:; script-src https:* 127.0.0.1:* *.spotilocal.com:* 'unsafe-inline' 'unsafe-eval' blob: data: 'self'; style-src data: blob: 'unsafe-inline' 'self'");
  next();
});*/

app.use(helmet());

/* Enables all URLs defined in homeRouter and starting with http://<domain>/home */
app.use("/", homeRouter(adminAuth));
app.use("/auth", authenticationRouter(clientAuth, adminAuth, db));
app.use("/legal", legalRouter());
app.use("/trips", tripsRouter(adminAuth, db));
app.use("/profile", profileRouter(adminAuth, db));
app.use("/settings", settingsRouter(adminAuth, db));
app.use("/friends", friendsRouter(adminAuth, db));
app.use("/notifications", notificationsRouter(adminAuth, db));

app.use(function(req, res, next) {
  // render 404 template for any 404 response
  let templatePath = path.join(__dirname, "views/404.ejs");
  if (req.accepts('html')) {
    return res.status(404).render(templatePath);
  }

  // respond with json
  if (req.accepts('json')) {
    res.json({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

export const exportedapp = functions.https.onRequest(app);
