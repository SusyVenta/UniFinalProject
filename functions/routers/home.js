import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function homeRouter(clientAuth, adminAuth) {
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


  router.get("/", (request, response) => {
      let indexPath = path.join(__dirname, '..',"views/home.ejs");

      // see if user already created a session. If not, return unauthenticated version of the page.
      const sessionCookie = undefined;
      try {
        sessionCookie = request.cookies.session || '';
      } catch(error){
        let payload = {userIsAuthenticated: false};
        response.render(indexPath, payload);
        return;
      }
      
      // Verify the session cookie. In this case an additional check is added to detect
      // if the user's Firebase session was revoked, user deleted/disabled, etc.
      adminAuth.verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then((decodedClaims) => {
        console.log("decodedClaims: " +decodedClaims);
        // serveContentForUser('', request, response, decodedClaims);
        let payload = {userIsAuthenticated: true};
        response.render(indexPath, payload);
      })
      .catch((error) => {
        // Session cookie is unavailable or invalid. Force user to login.
        // response.redirect('/auth/login');
        let payload = {userIsAuthenticated: false};
        response.render(indexPath, payload);
      });
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
   return router;
};
