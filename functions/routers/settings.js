import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getUserSessionDetails as importedGetUserSessionDetails} from "../utils/authUtils.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export function settingsRouter(adminAuth, db, getUserSessionDetails = importedGetUserSessionDetails) {
  const router = new express.Router();

  // get current settings
  router.get("/", async(request, response) => {
      let indexPath = path.join(__dirname, '..',"views/settings.ejs");
      try {
        let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}
        
        if(userSessionDetails.userSessionDetails !== null){
          let userSettings = await db.settingsQueries.getOrCreateUserSettings(
            userSessionDetails.userSessionDetails.uid
          );
          let uid = userSessionDetails.userSessionDetails.uid;

          let payload = {
            userSettings,
            userIsAuthenticated: true,
            userID: uid
          };

          return response.status(200).render(indexPath, payload);
        } else {
          return response.status(302).redirect('/auth/login');
        }

      } catch(error){
        response.status(500).send(error.message);
      }
    });
  
  // Update settings
  router.post("/", async(request, response) => {
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        try {
          await db.settingsQueries.updateUserSettings(
            userSessionDetails.userSessionDetails.uid,
            request.body.settingName,
            request.body.settingValue
          )

          return response.status(200).send("updated " + request.body.settingName);
        } catch (e){
          return response.status(500).send(e.message);
        }
        
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch(error){
      response.status(500).send(error.message);
    }
  });

  return router;
};