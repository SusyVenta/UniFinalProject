import functions from "firebase-functions";
import express from "express";
import { check, validationResult } from 'express-validator';
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

/* ENDPOINT: http://localhost:5004/auth/login */
router.get("/login", (request, response) => {
    let indexPath = path.join(__dirname, '..',"views/authentication.ejs");
    let payload = {authType: "login"};
    response.render(indexPath, payload);
  });

router.get("/signup", (request, response) => {
  let indexPath = path.join(__dirname, '..',"views/authentication.ejs");
  let payload = {authType: "signup"};
  response.render(indexPath, payload);
});

router.post(
  "/signup", [ 
    check("name").trim().escape().isLength({ min: 1 }),
    check("surname").trim().escape().isLength({ min: 1 }),
    check('email').isEmail().normalizeEmail(),
    // https://express-validator.github.io/docs/api/validation-chain/#isstrongpassword
    check('password').isStrongPassword({
      minLength: 8,
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
    }),
    check("termsandconditions").trim().escape().isLength({ min: 2 }),
  ], 
  (request, response) => {
  console.log(request.body);
  const result = validationResult(request);
  console.log(result);
  if (request.body.termsandconditions != "on") {
    response.status(400);
    response.send("Terms and conditions must be accepted in order to register" );
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

export const authenticationRouter = router;
