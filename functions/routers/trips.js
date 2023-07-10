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
        
        let payload = {
          userIsAuthenticated: false, 
          name: "", 
          trips: [
            {
              title: "Title 1",
              date: "11/11/2023",
              id: "1",
              status: "upcoming"
            },
            {
              title: "Title 2",
              date: "11/11/2023",
              id: "2",
              status: "upcoming"
            },
            {
              title: "Title 3",
              date: "11/11/2023",
              id: "3",
              status: "upcoming"
            },
            {
              title: "Title 4",
              date: "11/11/2023",
              id: "4",
              status: "archived"
            }
          ]
        };

        if(userSessionDetails.userSessionDetails !== null){
          payload.userIsAuthenticated = true;
          payload.name = userSessionDetails.userSessionDetails.name;
          return response.render(indexPath, payload);
        } else {
          return response.redirect('/auth/login');
        }

      } catch(error){
        response.status(500).send(error.message);
      }
    });

  router.delete("/:id", async(request, response) => {
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        // delete from DB - to implement 
        console.log('Request Id:', request.params.id);

        return response.status(200).send("Success");
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
        // delete from DB - to implement 
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
            userSessionDetails.userSessionDetails.uid);

            // add trip ID to owner's document
            await db.updateDocument("users", userSessionDetails.userSessionDetails.uid, {trips: [tripDocId]}); 

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