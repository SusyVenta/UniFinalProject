import { createUserWithEmailAndPassword, signOut,  
         signInWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import express from "express";
import { check, validationResult } from 'express-validator';
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { loadPersistence, savePersistence } from "../utils/auth/authPersistence.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function authenticationRouter(auth){
  const router = new express.Router();

  router.get("/login", (request, response) => {
      let authTemplate = path.join(__dirname, '..',"views/authentication.ejs");
      let payload = {authType: "login", errorCode: null, errorMessage: null};
      response.render(authTemplate, payload);
    }
  );

  router.post("/login", (request, response) => {
      let authTemplate = path.join(__dirname, '..',"views/authentication.ejs");

      signInWithEmailAndPassword(auth, request.body.email, request.body.password)
        .then((userCredential) => {
          // Signed in 
          const user = userCredential.user;
          if (!user.emailVerified === true) {
            signOut(auth).then(() => {
              // reload the sigup page, which will display a modal with error message
              let payload = {authType: "login", errorCode: 400, 
                            errorMessage: "Please verify your email before logging in!"};
              savePersistence(auth);
              response.status(400).render(authTemplate, payload);
            })
          } else {
            // 
            console.log("logged in!");
            savePersistence(auth);
            response.status(200).redirect("/");
          }
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // reload the sigup page, which will display a modal with error message
          let payload = {authType: "login", errorCode: 400, 
                        errorMessage: errorCode + "\n" + errorMessage};
          response.status(400).render(authTemplate, payload);
        });
      }
  );

  router.get("/signup", (request, response) => {
    let authTemplate = path.join(__dirname, '..',"views/authentication.ejs");
    let payload = {authType: "signup", errorCode: null, errorMessage: null};
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
        let payload = {authType: "signup", errorCode: 400, errorMessage: e.array({ onlyFirstError: true })[0].msg};
        response.status(400).render(authTemplate, payload);
      }

      if (request.body.termsandconditions != "on") {
        // reload the sigup page, which will display a modal with error message
        let payload = {authType: "signup", errorCode: 400, 
                      errorMessage: "Terms and conditions must be accepted in order to register"};
        response.status(400).render(authTemplate, payload);
      }

      console.log('request.get(Content-Type: ' + request.get('Content-Type'));
      if (request.get('Content-Type') === 'application/json') {
        // response.send("sendign back json response" );
        
      } else {
        // response.send("sendign back html response" );
      }

      // create user in database 
      createUserWithEmailAndPassword(auth, request.body.email, request.body.password)
      .then((userCredential) => {
        // If the new account was created, the user is signed in automatically.
        const user = userCredential.user;
        savePersistence(auth);
        
        updateProfile(user, {
          displayName: request.body.name + " " + request.body.surname
        });

        console.log(user);
        sendEmailVerification(user)
        .then(() => {
          signOut(auth).then(() => {
            let payload = {authType: "signup", errorCode: 200, title: "Thank you!", 
                          errorMessage: "Please verify your email, then log in"};
            savePersistence(auth);
            response.status(200).render(authTemplate, payload);
          })
          
        })
        .catch((error) => {
          // display internal server error if fails to send email
          const errorCode = error.code;
          const errorMessage = error.message;
          // reload the sigup page, which will display a modal with error message
          let payload = {authType: "signup", errorCode: 500, 
                        errorMessage: errorCode + "\n" + errorMessage};
          response.status(500).render(authTemplate, payload);
        });
        
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // reload the sigup page, which will display a modal with error message
        let payload = {authType: "signup", errorCode: 400, 
                      errorMessage: errorCode + "\n" + errorMessage};
        response.status(400).render(authTemplate, payload);
      });

  });

  return router;
};