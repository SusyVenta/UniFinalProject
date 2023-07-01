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
          payload.userIsAuthenticated = true;
          payload.name = userSessionDetails.userSessionDetails.name;
        }

        response.render(indexPath, payload);

      } catch(error){
        response.status(500).send(error);
      }
    });

   return router;
};
