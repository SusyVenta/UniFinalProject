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

        let profileDetails = await db.userQueries.getUserDetails(userSessionDetails.userSessionDetails.uid);

        let tripDetails = await db.tripQueries.getTripsForUser(
          userSessionDetails.userSessionDetails.uid
          );
        let payload = {
          name: profileDetails.username, 
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
      console.log(JSON.stringify(error));
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

  router.get("/:id/participants", async(request, response) => {
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}
      let templatePath = path.join(__dirname, '..',"views/tripParticipants.ejs");

      if(userSessionDetails.userSessionDetails !== null){
        let tripID = request.params.id;
        let tripDetails = '';
        try{
          tripDetails = await db.tripQueries.getTripByID(tripID);
        } catch(e){
          // redirect to trips if requested trip no longer exists
          let sessionCookie = request.cookies.__session;
          response.cookie("__session", sessionCookie);
          return response.status(302).redirect('/trips');
        }

        let commonDateRanges = new TimeUtils().commonDateRanges(tripDetails.datesPreferences);
        let uid = userSessionDetails.userSessionDetails.uid;
        let profileDetails = await db.userQueries.getUserDetails(uid);
        let friendsProfiles = await db.userQueries.getFriendsProfiles(profileDetails);

        if (tripDetails.participantsStatus.hasOwnProperty(uid)){
          let payload = {
            name: profileDetails.username, 
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

  router.post("/:tripId/participants", async(request, response) => {
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

  /* trip itinerary --------------------------------------------------------------------*/
  router.get("/:id/itinerary", async(request, response) => {
    // opens trip itinerary details
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}
      let templatePath = path.join(__dirname, '..',"views/tripItinerary.ejs");

      if(userSessionDetails.userSessionDetails !== null){
        let tripID = request.params.id;
        let tripDetails = '';
        try{
          tripDetails = await db.tripQueries.getTripByID(tripID);
        } catch(e){
          // redirect to trips if requested trip no longer exists
          let sessionCookie = request.cookies.__session;
          response.cookie("__session", sessionCookie);
          return response.status(302).redirect('/trips');
        }
        
        let commonDateRanges = new TimeUtils().commonDateRanges(tripDetails.datesPreferences);
        let uid = userSessionDetails.userSessionDetails.uid;
        let profileDetails = await db.userQueries.getUserDetails(uid);
        let friendsProfiles = await db.userQueries.getFriendsProfiles(profileDetails);
        let tripParticipantsUIDsPictures = await db.tripQueries.getUsernamesAndPicturesForUIDsInTrip(tripID);

        if (tripDetails.participantsStatus.hasOwnProperty(uid)){
          let payload = {
            name: profileDetails.username, 
            trip: tripDetails,
            userIsAuthenticated: true,
            moment: moment,
            userIDUsernameMap: await db.tripQueries.getUsernamesForUIDsInTrip(request.params.id),
            commonAvailabilities: commonDateRanges,
            userID: uid,
            profileDetails: profileDetails,
            friendsProfiles: friendsProfiles,
            tripID: tripID,
            eventToOpen: 'null',
            tripParticipantsUIDsPictures: JSON.stringify(tripParticipantsUIDsPictures)
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

  router.post("/:tripId/itinerary/new", async(request, response) => {
    // Creates new event in the trip itinerary
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        let uid = userSessionDetails.userSessionDetails.uid;
        let tripID = request.params.tripId;

        let tripDetails = await db.tripQueries.getTripByID(tripID);
        if (tripDetails.participantsStatus.hasOwnProperty(uid)){
          try {
            await db.tripItineraryQueries.createOrModifyEvent(tripID, request.body, uid);

            return response.status(200).send("Created new trip event");
          } catch (e){

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

  router.get("/:tripId/itinerary/:eventID", async(request, response) => {
    // called when user opens notifications of new trip events received
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}
      let templatePath = path.join(__dirname, '..',"views/tripItinerary.ejs");

      if(userSessionDetails.userSessionDetails !== null){
        let tripID = request.params.tripId;
        let eventID = request.params.eventID;
        let tripDetails = '';
        try{
          tripDetails = await db.tripQueries.getTripByID(tripID);
        } catch(e){
          // redirect to trips if requested trip no longer exists
          let sessionCookie = request.cookies.__session;
          response.cookie("__session", sessionCookie);
          return response.status(302).redirect('/trips');
        }
        let commonDateRanges = new TimeUtils().commonDateRanges(tripDetails.datesPreferences);
        let uid = userSessionDetails.userSessionDetails.uid;
        let profileDetails = await db.userQueries.getUserDetails(uid);
        let friendsProfiles = await db.userQueries.getFriendsProfiles(profileDetails);
        let tripParticipantsUIDsPictures = await db.tripQueries.getUsernamesAndPicturesForUIDsInTrip(tripID);

        if (tripDetails.participantsStatus.hasOwnProperty(uid)){
          let payload = {
            name: profileDetails.username, 
            trip: tripDetails,
            userIsAuthenticated: true,
            moment: moment,
            userIDUsernameMap: await db.tripQueries.getUsernamesForUIDsInTrip(tripID),
            commonAvailabilities: commonDateRanges,
            userID: uid,
            profileDetails: profileDetails,
            friendsProfiles: friendsProfiles,
            tripID: tripID,
            eventToOpen: eventID,
            tripParticipantsUIDsPictures: JSON.stringify(tripParticipantsUIDsPictures)
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

  router.post("/:tripId/itinerary/:eventID", async(request, response) => {
    // Modifies trip itinerary event
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        let uid = userSessionDetails.userSessionDetails.uid;
        let tripID = request.params.tripId;
        let eventID = request.params.eventID;

        let tripDetails = await db.tripQueries.getTripByID(tripID);
        if (tripDetails.participantsStatus.hasOwnProperty(uid)){
          try {
            if (request.body.hasOwnProperty('comment')){
              await db.tripItineraryQueries.addCommentToEvent(tripID, request.body, uid, eventID);
            } else{
              await db.tripItineraryQueries.createOrModifyEvent(tripID, request.body, uid, eventID);
            }

            return response.status(200).send("Updated trip event");
          } catch (e){

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

  router.delete("/:tripId/itinerary/:eventID", async(request, response) => {
    // Deletes trip itinerary event
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        let uid = userSessionDetails.userSessionDetails.uid;
        let tripID = request.params.tripId;
        let eventID = request.params.eventID;

        let tripDetails = await db.tripQueries.getTripByID(tripID);
        if (tripDetails.participantsStatus.hasOwnProperty(uid)){
          try {
            // delete trip document and all dependencies
            await db.tripItineraryQueries.removeTripEvent(tripID, eventID);

            return response.status(200).send("Deleted trip event");
          } catch (e){

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

  /* trip polls --------------------------------------------------------------------*/
  router.get("/:id/polls", async(request, response) => {
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}
      let templatePath = path.join(__dirname, '..',"views/tripPolls.ejs");

      if(userSessionDetails.userSessionDetails !== null){
        let tripID = request.params.id;
        let tripDetails = '';
        try{
          tripDetails = await db.tripQueries.getTripByID(tripID);
        } catch(e){
          // redirect to trips if requested trip no longer exists
          let sessionCookie = request.cookies.__session;
          response.cookie("__session", sessionCookie);
          return response.status(302).redirect('/trips');
        }
        
        let uid = userSessionDetails.userSessionDetails.uid;
        let profileDetails = await db.userQueries.getUserDetails(uid);
        let friendsProfiles = await db.userQueries.getFriendsProfiles(profileDetails);
        let tripParticipantsUIDsPictures = await db.tripQueries.getUsernamesAndPicturesForUIDsInTrip(tripID);

        if (tripDetails.participantsStatus.hasOwnProperty(uid)){
          let payload = {
            name: profileDetails.username, 
            trip: tripDetails,
            userIsAuthenticated: true,
            userIDUsernameMap: await db.tripQueries.getUsernamesForUIDsInTrip(request.params.id),
            userID: uid,
            profileDetails: profileDetails,
            friendsProfiles: friendsProfiles,
            tripID: tripID,
            pollToOpen: 'null',
            answerPoll: "no",
            pollData: null,
            pollID: null,
            tripParticipantsUIDsPictures: JSON.stringify(tripParticipantsUIDsPictures)
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

  router.post("/:tripId/polls/new", async(request, response) => {
    // Creates new poll for the trip
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        let uid = userSessionDetails.userSessionDetails.uid;
        let tripID = request.params.tripId;

        let tripDetails = await db.tripQueries.getTripByID(tripID);
        if (tripDetails.participantsStatus.hasOwnProperty(uid)){
          try {
            await db.tripPollQueries.createOrModifyPoll(tripID, request.body, uid);

            return response.status(200).send("Created new poll");
          } catch (e){

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

  router.delete("/:tripId/polls/:pollID", async(request, response) => {
    // Deletes trip poll
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        let uid = userSessionDetails.userSessionDetails.uid;
        let tripID = request.params.tripId;
        let pollID = request.params.pollID;

        let tripDetails = await db.tripQueries.getTripByID(tripID);
        if (tripDetails.participantsStatus.hasOwnProperty(uid)){
          try {
            // delete trip document and all dependencies
            await db.tripPollQueries.removeTripPoll(tripID, pollID);

            return response.status(200).send("Deleted trip poll");
          } catch (e){

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

  router.post("/:tripId/polls/:pollID", async(request, response) => {
    // Modifies trip poll
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        let uid = userSessionDetails.userSessionDetails.uid;
        let tripID = request.params.tripId;
        let pollID = request.params.pollID;

        let tripDetails = await db.tripQueries.getTripByID(tripID);
        if (tripDetails.participantsStatus.hasOwnProperty(uid)){
          try {
            if (request.body.hasOwnProperty('comment')){
              await db.tripPollQueries.addCommentToPoll(tripID, request.body, uid, pollID);
            } else if (request.body.hasOwnProperty('answersToPoll')){
              // todo: update selected fields in poll
              await db.tripPollQueries.savePollAnswers(tripID, request.body, uid, pollID);
            } else{
              await db.tripPollQueries.createOrModifyPoll(tripID, request.body, uid, pollID);
            }

            return response.status(200).send("Updated trip poll");
          } catch (e){

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

  router.get("/:tripId/polls/:pollID", async(request, response) => {
    // called when user opens notifications of new trip polls received
    // lets users answer the poll
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}
      let templatePath = path.join(__dirname, '..',"views/tripPolls.ejs");

      if(userSessionDetails.userSessionDetails !== null){
        let tripID = request.params.tripId;
        let pollID = request.params.pollID;
        let tripDetails = '';
        try{
          tripDetails = await db.tripQueries.getTripByID(tripID);
        } catch(e){
          // redirect to trips if requested trip no longer exists
          let sessionCookie = request.cookies.__session;
          response.cookie("__session", sessionCookie);
          return response.status(302).redirect('/trips');
        }
        let uid = userSessionDetails.userSessionDetails.uid;
        let profileDetails = await db.userQueries.getUserDetails(uid);
        let friendsProfiles = await db.userQueries.getFriendsProfiles(profileDetails);
        let tripParticipantsUIDsPictures = await db.tripQueries.getUsernamesAndPicturesForUIDsInTrip(tripID);
        let pollData = await db.tripPollQueries.getPollDetails(tripID, pollID);

        if (tripDetails.participantsStatus.hasOwnProperty(uid)){
          let payload = {
            name: profileDetails.username, 
            trip: tripDetails,
            userIsAuthenticated: true,
            moment: moment,
            userIDUsernameMap: await db.tripQueries.getUsernamesForUIDsInTrip(tripID),
            userID: uid,
            profileDetails: profileDetails,
            friendsProfiles: friendsProfiles,
            tripID: tripID,
            pollToOpen: null,
            answerPoll: "yes",
            pollData: pollData,
            pollID: pollID,
            tripParticipantsUIDsPictures: JSON.stringify(tripParticipantsUIDsPictures)
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

  /* trip settings --------------------------------------------------------------------*/
  router.get("/:id/settings", async(request, response) => {
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}
      let templatePath = path.join(__dirname, '..',"views/tripSettings.ejs");

      if(userSessionDetails.userSessionDetails !== null){
        let tripID = request.params.id;
        let tripDetails = '';
        try{
          tripDetails = await db.tripQueries.getTripByID(tripID);
        } catch(e){
          // redirect to trips if requested trip no longer exists
          let sessionCookie = request.cookies.__session;
          response.cookie("__session", sessionCookie);
          return response.status(302).redirect('/trips');
        }

        let uid = userSessionDetails.userSessionDetails.uid;

        if (tripDetails.participantsStatus.hasOwnProperty(uid)){
          let payload = {
            name: userSessionDetails.userSessionDetails.name, 
            trip: tripDetails,
            userIsAuthenticated: true,
            userIDUsernameMap: await db.tripQueries.getUsernamesForUIDsInTrip(request.params.id),
            userID: uid,
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
  return router;
};