import { createClient } from 'pexels';
import { pexelsAPIKey } from "../config/pexels.js";


export async function searchImage(searchTerm){
    try{
        const client = createClient(pexelsAPIKey);
        const query = searchTerm;
        
        let photos = await client.photos.search({ query, per_page: 1, size: "medium" });
    
        return photos;
    } catch(e){
        let photos = [];
        return photos;
    }
};

