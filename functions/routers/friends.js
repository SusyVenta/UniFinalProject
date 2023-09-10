import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getUserSessionDetails as importedGetUserSessionDetails} from "../utils/authUtils.js";
import moment from 'moment';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export function friendsRouter(adminAuth, db, getUserSessionDetails = importedGetUserSessionDetails) {
  const router = new express.Router();
  router.get("/", async(request, response) => {
    // loads friends page
    try {
      let templatePath = path.join(__dirname, '..',"views/profile.ejs");
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        try {
          let uid = userSessionDetails.userSessionDetails.uid;
          let profileDetails = await db.userQueries.getUserDetails(uid);
          let friendsProfiles = await db.userQueries.getFriendsProfiles(profileDetails);

          let payload = {
            profileDetails: profileDetails, 
            userIsAuthenticated: true,
            moment: moment,
            userID: uid,
            friendsSearchResult: null,
            activeTab: "friends",
            friendsProfiles: friendsProfiles
          };

          return response.status(200).render(templatePath, payload);

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

  router.post("/search/:string", async(request, response) => {
    // search for users whose username or email matches the searched string
    try {
      let templatePath = path.join(__dirname, '..',"views/profile.ejs");
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        try {
          let uid = userSessionDetails.userSessionDetails.uid;
          let profileDetails = await db.userQueries.getUserDetails(uid);
          let searchString = request.body.searchString;
          
          let searchResult = await db.userQueries.getUsersMatchingSearch(searchString);
          let friendsProfiles = await db.userQueries.getFriendsProfiles(profileDetails);

          let payload = {
            profileDetails: profileDetails, 
            userIsAuthenticated: true,
            moment: moment,
            userID: uid,
            friendsSearchResult: searchResult,
            activeTab: "friends",
            friendsProfiles: friendsProfiles
          };

          return response.status(200).render(templatePath, payload);

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

  router.get("/search/:string", async(request, response) => {
    // redirect to profile page
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        let sessionCookie = request.cookies.__session;
        response.cookie("__session", sessionCookie);
        return response.status(302).redirect('/friends');
        
      } else {
        return response.status(302).redirect('/auth/login');
      }
    } catch(error){
      response.status(500).send(error.message);
    }
  });

  router.post("/add", async(request, response) => {
    // search for users whose username or email matches the searched string
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        try {
          let uid = userSessionDetails.userSessionDetails.uid;
          let friendID = request.body.friendID;
          await db.userQueries.addFriend(uid, friendID);

          let sessionCookie = request.cookies.__session;
          response.cookie("__session", sessionCookie);
          return response.status(302).redirect('/friends');

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

  router.delete("/:id", async(request, response) => {
    // remove friend or decline friendship request
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        try {
          let uid = userSessionDetails.userSessionDetails.uid;
          let friendID = request.params.id;
          await db.userQueries.removeFriend(uid, friendID);

          return response.status(200).send('successfully deleted');

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

  router.post("/accept", async(request, response) => {
    // accept friend request
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        try {
          let uid = userSessionDetails.userSessionDetails.uid;
          let friendID = request.body.friendID;
          await db.userQueries.acceptFriend(uid, friendID);

          let sessionCookie = request.cookies.__session;
          response.cookie("__session", sessionCookie);
          return response.status(302).redirect('/friends');

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