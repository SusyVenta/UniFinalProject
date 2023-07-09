import { getFirestore } from 'firebase-admin/firestore';
import { TripQueries } from './queries/trips.js';


export class Database{
    // https://firebase.google.com/docs/admin/migrate-node-v10
    // https://firebase.google.com/docs/firestore/query-data/get-data
    constructor(adminAuth){
        // As an admin, the app has access to read and write all data, regardless of Security Rules
        this.db = getFirestore(adminAuth);
        this.tripQueries = new TripQueries(this.db);
    }
};