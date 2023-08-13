import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getUserSessionDetails as importedGetUserSessionDetails} from "../utils/authUtils.js";
import moment from 'moment';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export function profileRouter(adminAuth, db, getUserSessionDetails = importedGetUserSessionDetails) {
  const router = new express.Router();

  router.get("/:id", async(request, response) => {
    // get profile of a user
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}
      let templatePath = path.join(__dirname, '..',"views/profile.ejs");

      if(userSessionDetails.userSessionDetails !== null){
        let uid = userSessionDetails.userSessionDetails.uid;
        let profileDetails = await db.userQueries.getUserDetails(uid);
        let friendsProfiles = await db.userQueries.getFriendsProfiles(profileDetails);

        let payload = {
          profileDetails: profileDetails, 
          userIsAuthenticated: true,
          moment: moment,
          userID: uid,
          friendsSearchResult: null,
          activeTab: "profileDetails",
          friendsProfiles: friendsProfiles
        };

        return response.status(200).render(templatePath, payload);
      } else {
        return response.status(302).redirect('/auth/login');
      }
    } catch(error){
      response.status(500).send(error.message);
    }
  });

  router.delete("/:id", async(request, response) => {
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        // delete trip document
        await db.deleteDocument("trips", request.params.id);
        // remove tripID from user's trips
        await db.updateDocumentRemoveFromArray(
          "users", 
          userSessionDetails.userSessionDetails.uid, 
          {arrayName: "trips", valueToRemove: request.params.id}
          );

        return response.status(200).send("Deleted " + request.params.id);
      } else {
        return response.status(302).redirect('/auth/login');
      }
    } catch(error){
      response.status(500).send(error.message);
    }
  });

  router.post("/:id", async(request, response) => {
    // Updates the profile attributes received in request body
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        try {
          let attributesToUpdate = request.body;
          let uid = userSessionDetails.userSessionDetails.uid;
          await db.userQueries.updateProfile(attributesToUpdate, uid);

          return response.status(200).send("Updated profile");
        } catch (e){
          return response.status(500).send(e.message);
        }
        
      } else {
        return response.status(302).redirect('/auth/login');
      }
    } catch(error){
      response.status(500).send(error.message);
    }
  });

  return router;
};