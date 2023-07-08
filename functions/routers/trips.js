import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getUserSessionDetails as importedGetUserSessionDetails} from "../utils/authUtils.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function tripsRouter(adminAuth, getUserSessionDetails = importedGetUserSessionDetails) {
  const router = new express.Router();

  router.get("/", async(request, response) => {
      let indexPath = path.join(__dirname, '..',"views/trips.ejs");
      try{
        // see if user already created a session. If not, return unauthenticated version of the page.
        let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}
        
        let payload = {
          userIsAuthenticated: false, 
          name: "", 
          trips: [
            {
              title: "Title 1",
              date: "11/11/2023",
              id: "1"
            },
            {
              title: "Title 2",
              date: "11/11/2023",
              id: "2"
            },
            {
              title: "Title 3",
              date: "11/11/2023",
              id: "3"
            },
            {
              title: "Title 4",
              date: "11/11/2023",
              id: "4"
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
        response.status(500).send(error);
      }
    });

   return router;
};