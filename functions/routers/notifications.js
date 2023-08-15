import express from "express";
import { getUserSessionDetails as importedGetUserSessionDetails} from "../utils/authUtils.js";


export function notificationsRouter(adminAuth, db, getUserSessionDetails = importedGetUserSessionDetails) {
  const router = new express.Router();

  router.delete("/:id", async(request, response) => {
    try {
      let userSessionDetails = await getUserSessionDetails(adminAuth, request); // {errors: <>/null, userSessionDetails: <obj>/null}

      if(userSessionDetails.userSessionDetails !== null){
        // delete notification
        let uid = userSessionDetails.userSessionDetails.uid;
        await db.userQueries.removeNotification(uid, request.params.id);

        return response.status(200).send("Deleted " + uid);
      } else {
        return response.status(302).redirect('/auth/login');
      }
    } catch(error){
      response.status(500).send(error.message);
    }
  });

  return router;
};