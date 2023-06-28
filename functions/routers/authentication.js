import { createUserWithEmailAndPassword, signOut,  
         signInWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import express from "express";
import { check, validationResult } from 'express-validator';
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const authInfoErrorTitle = "Ops! Looks like something went wrong";
const authInfoSuccessTitle = "Success!";

export function authenticationRouter(clientAuth, adminAuth){
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
      check("name").trim().escape().isLength({ min: 1 }).withMessage('Name must contain at least one letter'),
      check("surname").trim().escape().isLength({ min: 1 }).withMessage('Surname must contain at least one letter'),
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
      console.log(request.body.email);
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
        response.status(400).render(authTemplate, payload);
      }

      if (request.body.termsandconditions != "on") {
        // reload the sigup page, which will display a modal with error message
        let payload = {authType: "signup", statusCode: 400, authInfoTitle: authInfoErrorTitle,
                      authInfoMessage: "Terms and conditions must be accepted in order to register"};
        response.status(400).render(authTemplate, payload);
      }

      console.log('request.get(Content-Type: ' + request.get('Content-Type'));
      if (request.get('Content-Type') === 'application/json') {
        // response.send("sendign back json response" );
        
      } else {
        // response.send("sendign back html response" );
      }

      // create user in database 
      createUserWithEmailAndPassword(clientAuth, request.body.email, request.body.password)
      .then((userCredential) => {
        // If the new account was created, the user is signed in automatically.
        const user = userCredential.user;

        updateProfile(user, {
          displayName: request.body.name + " " + request.body.surname
        });

        console.log(user);
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

  router.post('/sessionLogin', (req, res) => {
    // Get the ID token passed and the CSRF token.
    const idToken = req.body.idToken.toString();
    const csrfToken = req.body.csrfToken.toString();
    // Guard against CSRF attacks.
    if (csrfToken !== req.cookies.csrfToken) {
      res.status(401).send('UNAUTHORIZED REQUEST!');
      return;
    }
    // Set session expiration to 8 hours - user needs to log in every 8 hours.
    const expiresIn = 8 * 60 * 60 * 1000 // 8 hours

    // Create the session cookie. This will also verify the ID token in the process.
    // The session cookie will have the same claims as the ID token.
    // To only allow session cookie setting on recent sign-in, auth_time in ID token
    // can be checked to ensure user was recently signed in before creating a session cookie.
    adminAuth.verifyIdToken(idToken)
      .then((decodedIdToken) => {
        // Only process if the user just signed in in the last 5 minutes.
        if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
          // Create session cookie and set it.
          return adminAuth.createSessionCookie(idToken, { expiresIn });
        }
        // A user that was not recently signed in is trying to set a session cookie.
        // To guard against ID token theft, require re-authentication.
        res.status(401).send('Recent sign in required!');
      })
      .then(
        (sessionCookie) => {
          // Set cookie policy for session cookie.
          const options = { maxAge: expiresIn, httpOnly: true, secure: true };
          res.cookie('session', sessionCookie, options);
          res.end(JSON.stringify({ status: 'success' }));
        },
        (error) => {
          res.status(401).send('UNAUTHORIZED REQUEST!');
        }
      );
  });

  return router;
};
