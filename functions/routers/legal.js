import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function legalRouter() {
  const router = new express.Router();

  router.get("/privacy", async(request, response) => {
      let indexPath = path.join(__dirname, '..',"views/generic.ejs");
      try{
        let payload = {partialTitle: "privacy", title: "Privacy Policy"};

        response.render(indexPath, payload);

      } catch(error){
        response.status(500).send(error);
      }
  });

  router.get("/terms", async(request, response) => {
    let indexPath = path.join(__dirname, '..',"views/generic.ejs");
    try{
      let payload = {partialTitle: "termsAndConditions", title: "Terms and Conditions"};

      response.render(indexPath, payload);

    } catch(error){
      response.status(500).send(error);
    }
  });

   return router;
};
