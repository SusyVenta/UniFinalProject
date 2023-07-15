import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getUserSessionDetails as importedGetUserSessionDetails} from "../utils/authUtils.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function homeRouter(adminAuth, getUserSessionDetails = importedGetUserSessionDetails) {
  const router = new express.Router();

  router.get("/", async(request, response) => {
      let indexPath = path.join(__dirname, '..',"views/home.ejs");
      try{
        // see if user already created a session. If not, return unauthenticated version of the page.
        let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}
        
        let payload = {userIsAuthenticated: false, name: ""};

        if(userSessionDetails.userSessionDetails !== null){
          let sessionCookie = request.cookies.__session;
          response.cookie("__session", sessionCookie);
          return response.status(302).redirect('/trips');
        }

        return response.render(indexPath, payload);

      } catch(error){
        return response.status(500).send(error.message);
      }
    });

   return router;
};