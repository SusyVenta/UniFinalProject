import { getFirestore } from 'firebase-admin/firestore';
import { TripQueries } from './queries/trips.js';


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
        this.tripQueries = new TripQueries(this.db);
    }
};