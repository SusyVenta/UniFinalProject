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
    // delete user profile and all dependencies
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        let uid = userSessionDetails.userSessionDetails.uid;
        if(uid === request.params.id){
          await db.userQueries.deleteUserProfile(request.params.id);
          await adminAuth.deleteUser(uid); // delete from auth as well
          return response.status(200).send("Deleted " + request.params.id);
        } else {
          response.status(500).send("You can only delete your own profile");
        }
        
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