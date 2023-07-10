import { getFirestore } from 'firebase-admin/firestore';
import { TripQueries } from './queries/trips.js';
import { UserQueries } from './queries/users.js';

import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";


export class Database{
    /* 
    NOTE: when testing with emulator, firebase used: http://localhost:4000/firestore

    Useful docs:
        - https://firebase.google.com/docs/admin/migrate-node-v10
        - https://firebase.google.com/docs/firestore/query-data/get-data#web-modular-api_6
        - https://cloud.google.com/firestore/docs/samples/firestore-data-set-id-random-collection
    */
    constructor(adminAuth){
        // As an admin, the app has access to read and write all data, regardless of Security Rules
        this.db = getFirestore(adminAuth);
        this.tripQueries = new TripQueries(this);
        this.userQueries = new UserQueries(this);
    }

    async listCollections(){
        let collectionsSnapshot = await this.db.listCollections();

        let collectionNames = [];
        collectionsSnapshot.forEach(snaps => {
            collectionNames.push(snaps["_queryOptions"].collectionId);
        });
        return collectionNames;
    }

    async createDocumentWithData(collectionName, dataToAdd){
        // creates document to collection 'trips'. 
        // If the collection doesn't exist, it creates it.
        let tripsCollection = await this.db.collection(collectionName);
        let addedDoc = await tripsCollection.add(dataToAdd);
        
        let addedDocID = addedDoc["_path"]["segments"][1];
        return addedDocID;
    }

    async updateDocument(collectionName, docID, dataObj){
        // to do finish logic to append to existing fields
        let docRef = await this.db.collection(collectionName).doc("Aa6x5je3EsA2q9yPaA4R");
        console.log(docRef);
        console.log(JSON.stringify(docRef));
        dataObj.trips = arrayUnion(dataObj.trips[0]);
        docRef.update(dataObj);
    }
};