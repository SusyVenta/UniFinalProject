import { createClient } from 'pexels';
import { pexelsAPIKey } from "../config/pexels.js";


export async function searchImage(searchTerm){
    const client = createClient(pexelsAPIKey);
    try{
        let query = searchTerm;
        let photos = await client.photos.search({ query, per_page: 1, size: "medium" });

        if (photos === []){
            // default picture
            query = "trip";
            photos = await client.photos.search({ query, per_page: 1, size: "medium" });
        }
        return photos;
    } catch(e){
        // default picture
        const query = "trip";
        let photos = await client.photos.search({ query, per_page: 1, size: "medium" });
        return photos;
    }
};
