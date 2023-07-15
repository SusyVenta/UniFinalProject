import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getUserSessionDetails as importedGetUserSessionDetails} from "../utils/authUtils.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export function tripsRouter(adminAuth, db, getUserSessionDetails = importedGetUserSessionDetails) {
  const router = new express.Router();

  router.get("/", async(request, response) => {
      let indexPath = path.join(__dirname, '..',"views/trips.ejs");
      try {
        let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}
        
        if(userSessionDetails.userSessionDetails !== null){
          let tripDetails = await db.tripQueries.getTripsForUser(userSessionDetails.userSessionDetails.uid);

          let payload = {
            name: userSessionDetails.userSessionDetails.name, 
            trips: tripDetails,
            userIsAuthenticated: true
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
        return response.status(401).send("Unauthorized");
      }
    } catch(error){
      response.status(500).send(error.message);
    }
  });

  router.get("/:id", async(request, response) => {
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        // get info from DB - to implement 
        console.log('Request Id:', request.params.id);

        return response.status(200).send("will display template showing trip details");
      } else {
        return response.status(401).send("Unauthorized");
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
        return response.status(401).send("Unauthorized");
      }
    } catch(error){
      response.status(500).send(error.message);
    }
  });

  return router;
};