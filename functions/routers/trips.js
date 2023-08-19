import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getUserSessionDetails as importedGetUserSessionDetails} from "../utils/authUtils.js";
import { searchImage } from "../utils/imageSearch.js";
import moment from 'moment';
import { TimeUtils } from "../utils/timeUtils.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export function tripsRouter(adminAuth, db, getUserSessionDetails = importedGetUserSessionDetails) {
  const router = new express.Router();

  router.get("/", async(request, response) => {
    // list all trips for user
    let indexPath = path.join(__dirname, '..',"views/trips.ejs");
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        let tripDetails = await db.tripQueries.getTripsForUser(
          userSessionDetails.userSessionDetails.uid
          );
        let payload = {
          name: userSessionDetails.userSessionDetails.name, 
          trips: tripDetails,
          userIsAuthenticated: true,
          userID: userSessionDetails.userSessionDetails.uid
        };

        return response.status(200).render(indexPath, payload);
      } else {
        return response.status(302).redirect('/auth/login');
      }

    } catch(error){
      response.status(500).send(error.message);
    }
  });

  router.delete("/:id", async(request, response) => {
    // delete trip
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        // delete trip document and all dependencies
        await db.tripQueries.removeTrip(request.params.id);

        return response.status(200).send("Deleted " + request.params.id);
      } else {
        return response.status(302).redirect('/auth/login');
      }
    } catch(error){
      response.status(500).send(error.message);
    }
  });

  router.get("/:id", async(request, response) => {
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}
      let templatePath = path.join(__dirname, '..',"views/trip.ejs");

      if(userSessionDetails.userSessionDetails !== null){
        let tripID = request.params.id;
        let tripDetails = await db.tripQueries.getTripByID(tripID);
        let commonDateRanges = new TimeUtils().commonDateRanges(tripDetails.datesPreferences);
        let uid = userSessionDetails.userSessionDetails.uid;
        let profileDetails = await db.userQueries.getUserDetails(uid);
        let friendsProfiles = await db.userQueries.getFriendsProfiles(profileDetails);

        if (tripDetails.participantsStatus.hasOwnProperty(uid)){
          let payload = {
            name: userSessionDetails.userSessionDetails.name, 
            trip: tripDetails,
            userIsAuthenticated: true,
            moment: moment,
            userIDUsernameMap: await db.tripQueries.getUsernamesForUIDsInTrip(request.params.id),
            commonAvailabilities: commonDateRanges,
            userID: uid,
            profileDetails: profileDetails,
            friendsProfiles: friendsProfiles,
            tripID: tripID
          };
  
          return response.status(200).render(templatePath, payload);
        } else {
          let sessionCookie = request.cookies.__session;
          response.cookie("__session", sessionCookie);
          return response.status(302).redirect('/trips');
        }
      } else {
        let sessionCookie = request.cookies.__session;
        response.cookie("__session", sessionCookie);
        return response.status(302).redirect('/trips');
      }
    } catch(error){
      response.status(500).send(error.message);
    }
  });

  router.post("/", async(request, response) => {
    // Creates new trip
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        try {
          // get image matching the title of the trip
          let pictures = await searchImage(request.body.tripTitle);
          let picture = pictures.photos[0];
          request.body.picture = picture;

          let tripDocId = await db.tripQueries.createTrip(
            request.body, 
            userSessionDetails.userSessionDetails.uid
          );

          // add trip ID to owner's document
          await db.updateDocumentAppendToArray(
            "users", 
            userSessionDetails.userSessionDetails.uid, 
            {arrayName: "trips", valueToUpdate: tripDocId}
          ); 

          return response.status(200).send("Created trip");
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

  router.post("/:id", async(request, response) => {
    // Modifies trip details
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        let uid = userSessionDetails.userSessionDetails.uid;
        let tripDetails = await db.tripQueries.getTripByID(request.body.tripID);
        if (tripDetails.participantsStatus.hasOwnProperty(uid)){
          try {
            if(
              request.body.hasOwnProperty("friendsToAdd") || 
              request.body.hasOwnProperty("datesPreferences") || 
              request.body.hasOwnProperty("tripTitle") || 
              request.body.hasOwnProperty("userAcceptingTripInvite") ||
              request.body.hasOwnProperty("finalizedDates")
              ){
              await db.tripQueries.updateTrip(
                request.body, 
                uid
              );
            }
            if (request.body.hasOwnProperty("friendToRemove")){
              await db.tripQueries.removeUserFromTrip(
                request.body
              );
            }

            return response.status(200).send("Modified trip");
          } catch (e){
            console.log(e.message);
            return response.status(500).send(e.message);
          }
        } else {
          return response.status(302).redirect('/auth/login');
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