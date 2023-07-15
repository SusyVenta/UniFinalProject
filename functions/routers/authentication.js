import { 
  createUserWithEmailAndPassword as importedCreateUserWithEmailAndPassword, 
  signOut as importedSignOut, 
  sendPasswordResetEmail as importedSendPasswordResetEmail, 
  sendEmailVerification as importedSendEmailVerification, 
  updateProfile as importedUpdateProfile
} from "firebase/auth";
import express, { json } from "express";
import { check, validationResult } from 'express-validator';
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getUserSessionDetails } from "../utils/authUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const authInfoErrorTitle = "Ops! Looks like something went wrong";
const authInfoSuccessTitle = "Success!";

export function authenticationRouter(
  clientAuth, 
  adminAuth, 
  db,
  // default parameters to be able to mock from unit tests:
  createUserWithEmailAndPassword = importedCreateUserWithEmailAndPassword,
  signOut = importedSignOut,
  sendPasswordResetEmail = importedSendPasswordResetEmail,
  sendEmailVerification = importedSendEmailVerification,
  updateProfile = importedUpdateProfile
  ){
    const router = new express.Router();

    router.get("/login", (request, response) => {
        let authTemplate = path.join(__dirname, '..',"views/authentication.ejs");
        let payload = {authType: "login", statusCode: null, authInfoMessage: null, authInfoTitle: null};
        response.render(authTemplate, payload);
      }
    );

    router.get("/signup", (request, response) => {
      let authTemplate = path.join(__dirname, '..',"views/authentication.ejs");
      let payload = {authType: "signup", statusCode: null, authInfoMessage: null, authInfoTitle: null};
      response.render(authTemplate, payload);
    });

    router.post(
      "/signup", [ 
        check("name").trim().escape().isLength({ min: 1 }).withMessage('Username must contain at least one letter'),
        check('email').isEmail().withMessage('Email address is invalid'),
        // https://express-validator.github.io/docs/api/validation-chain/#isstrongpassword
        check('password').isStrongPassword({
          minLength: 8,
          maxLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
          returnScore: false,
          pointsPerUnique: 1,
          pointsPerRepeat: 0.5,
          pointsForContainingLower: 10,
          pointsForContainingUpper: 10,
          pointsForContainingNumber: 10,
          pointsForContainingSymbol: 10,
        }).withMessage('Password must be between 8 and 12 characters long, contain at least 1 uppercase letter,' +
                      'at least 1 lowercase letter, at least 1 number, and at least one symbol'),
        check("termsandconditions").trim().escape().isLength({ min: 2 }).withMessage('Terms and conditions must be accepted to register'),
      ], 
      (request, response) => {
        let authTemplate = path.join(__dirname, '..',"views/authentication.ejs");

        try {
          // throw error if anything fails in the validation
          const result = validationResult(request);
          result.throw();
          // accessing request.body.<attribute> now returns sanitized input as specified above
        } catch (e) {
          // reload the sigup page, which will display a modal with error message
          let payload = {authType: "signup", statusCode: 400, 
                        authInfoMessage: e.array({ onlyFirstError: true })[0].msg,
                        authInfoTitle: authInfoErrorTitle};

          return response.status(400).render(authTemplate, payload);
          throw new Error('breaking');
        }

        if (request.body.termsandconditions != "on") {
          // reload the sigup page, which will display a modal with error message
          let payload = {authType: "signup", statusCode: 400, authInfoTitle: authInfoErrorTitle,
                        authInfoMessage: "Terms and conditions must be accepted in order to register"};
          response.status(400).render(authTemplate, payload);
          throw new Error('breaking');
        }

        if (request.body.betaCode !== "girotondo") {
          // reload the sigup page, which will display a modal with error message
          let payload = {authType: "signup", statusCode: 400, authInfoTitle: authInfoErrorTitle,
                        authInfoMessage: "Please be patient.. For the time being, registration is restricted to beta test users only."};
          response.status(400).render(authTemplate, payload);
          throw new Error('breaking');
        }

        // create user in database 
        createUserWithEmailAndPassword(clientAuth, request.body.email, request.body.password)
        .then((userCredential) => {
          // If the new account was created, the user is signed in automatically.
          const user = userCredential.user;

          updateProfile(user, {
            displayName: request.body.name
          });

          // save user data to 'users' collection
          db.userQueries.createUser(user, request.body.name);

          sendEmailVerification(user)
          .then(() => {
            signOut(clientAuth).then(() => {
              let payload = {authType: "signup", statusCode: 200, title: "Thank you!", authInfoTitle: authInfoSuccessTitle,
                            authInfoMessage: "Please verify your email, then log in"};
              response.status(200).render(authTemplate, payload);
            })
            
          })
          .catch((error) => {
            // display internal server error if fails to send email
            const statusCode = error.code;
            const authInfoMessage = error.message;
            // reload the sigup page, which will display a modal with error message
            let payload = {authType: "signup", statusCode: 500, authInfoTitle: authInfoErrorTitle,
                          authInfoMessage: statusCode + "\n" + authInfoMessage};
            response.status(500).render(authTemplate, payload);
          });
          
        })
        .catch((error) => {
          const statusCode = error.code;
          const authInfoMessage = error.message;
          // reload the sigup page, which will display a modal with error message
          let payload = {authType: "signup", statusCode: 400, authInfoTitle: authInfoErrorTitle,
                        authInfoMessage: statusCode + "\n" + authInfoMessage};
          response.status(400).render(authTemplate, payload);
        });
  });

  router.post('/sessionLogin', async (request, response) => {
    // Get the ID token passed and the CSRF token.
    const idToken = request.body.idToken.toString();
    const csrfToken = request.body.csrfToken.toString();
    // Guard against CSRF attacks.
    if (csrfToken !== request.cookies.csrfToken) {
      response.status(401).send('UNAUTHORIZED REQUEST!');
      return;
    }
    // Set session expiration to 8 hours - user needs to log in every 8 hours.
    const expiresIn = 8 * 60 * 60 * 1000 // 8 hours

    try {
      // Create the session cookie. This will also verify the ID token in the process.
      // The session cookie will have the same claims as the ID token.
      // To only allow session cookie setting on recent sign-in, auth_time in ID token
      // can be checked to ensure user was recently signed in before creating a session cookie.
      let decodedIdToken = await adminAuth.verifyIdToken(idToken);
      // Only process if the user just signed in in the last 5 minutes.
      if ((new Date().getTime() / 1000 - Number(decodedIdToken.auth_time)) < (5 * 60)) {
        // Create session cookie and set it.
        let sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
        // Set cookie policy for session cookie.
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        // https://firebase.google.com/docs/hosting/manage-cache#using_cookies
        // https://stackoverflow.com/questions/44929653/firebase-cloud-function-wont-store-cookie-named-other-than-session
        response.cookie('__session', sessionCookie, options);
        response.status(200).send('success');
        return;
      } else {
        // A user that was not recently signed in is trying to set a session cookie.
        // To guard against ID token theft, require re-authentication.
        response.status(401).send('Recent sign in required!');
        return;
      }
    } catch(error){
      response.status(500).send(error);
    }
  });

  router.post('/sessionLogout', async (request, response) => {
    // adapted from: https://firebase.google.com/docs/auth/admin/manage-cookies#sign_out
    const userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}
    await adminAuth.revokeRefreshTokens(userSessionDetails.userSessionDetails.sub);
    response.clearCookie('__session');
    response.redirect('/');
  });

  router.get("/resetPassword", (request, response) => {
    let authTemplate = path.join(__dirname, '..',"views/authentication.ejs");
    let payload = {authType: "resetPassword", statusCode: null, authInfoMessage: null, authInfoTitle: null};
    response.render(authTemplate, payload);
  });

  router.post("/resetPassword", async(request, response) => {
    let authTemplate = path.join(__dirname, '..',"views/authentication.ejs");
    const successMessage = `We sent instructions to reset your password to ${request.body.email}`;

    try {
      await sendPasswordResetEmail(clientAuth, request.body.email);

      // Password reset email sent!
      let payload = {authType: "login", statusCode: 200,
                      authInfoTitle: authInfoSuccessTitle,
                      authInfoMessage: successMessage};

      response.status(200).render(authTemplate, payload);
    } catch(error) {
      // don't let users know what addresses exist or not for security reasons
      let message = error.code + "\n" + error.message;
      let code = 500;
      let title = authInfoErrorTitle;

      if(error.code === "auth/user-not-found"){
        code = 200;
        title = authInfoSuccessTitle;
        message = successMessage;
      }
      // reload the page, which will display a modal with error message
      let payload = {authType: "resetPassword", statusCode: code, authInfoTitle: title,
                     authInfoMessage: message};
      response.status(code).render(authTemplate, payload);
    }
    
  });

  return router;
};
