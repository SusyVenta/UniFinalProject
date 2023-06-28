import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function homeRouter(adminAuth) {
  const router = new express.Router();

  router.get("/", (request, response) => {
      let indexPath = path.join(__dirname, '..',"views/home.ejs");

      // see if user already created a session. If not, return unauthenticated version of the page.
      let sessionCookie = '';
      
      try {
        sessionCookie = request.cookies.session;
      } catch(error){
        let payload = {userIsAuthenticated: false};
        response.render(indexPath, payload);
        return;
      }

      // Verify the session cookie. In this case an additional check is added to detect
      // if the user's Firebase session was revoked, user deleted/disabled, etc.
      adminAuth.verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then((decodedClaims) => {
        /* decodedClaims: 
        {
        >    iss: 'https://session.firebase.google.com/grouptripper-3c7f1',
        >    name: 'Susy Venta',
        >    aud: 'grouptripper-3c7f1',
        >    auth_time: 1687962194,
        >    user_id: 'MAZfmDajphgt4EEhe9vNWL8y0Su2',
        >    sub: 'MAZfmDajphgt4EEhe9vNWL8y0Su2',
        >    iat: 1687962194,
        >    exp: 1687990994,
        >    email: 'susanna.ventafridda@gmail.com',
        >    email_verified: true,
        >    firebase: { identities: { email: [Array] }, sign_in_provider: 'password' },
        >    uid: 'MAZfmDajphgt4EEhe9vNWL8y0Su2'
        >  }
        
        */
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!decodedClaims: ");
        console.log(decodedClaims);
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

   return router;
};
