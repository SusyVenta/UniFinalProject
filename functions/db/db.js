import { getFirestore, FieldValue, FieldPath } from 'firebase-admin/firestore';
import { TripQueries } from './queries/trips.js';
import { UserQueries } from './queries/users.js';


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

    async updateDocumentAppendToArray(collectionName, docID, dataObj){
        /* 
        dataObj: {arrayName: <name>, valueToUpdate: <value>}
        */
        let docRef = await this.db.collection(collectionName).doc(docID);

        let payload = {};
        payload[dataObj.arrayName] = FieldValue.arrayUnion(dataObj.valueToUpdate);
        await docRef.update(payload);
    }

    async updateDocumentRemoveFromArray(collectionName, docID, dataObj){
        /* 
        dataObj: {arrayName: <name>, valueToRemove: <value>}
        */
        let docRef = await this.db.collection(collectionName).doc(docID);

        let payload = {};
        payload[dataObj.arrayName] = FieldValue.arrayRemove(dataObj.valueToRemove);
        await docRef.update(payload);
    }

    async getDocument(collectionName, docID){
        let querySnapshot = await this.db.collection(collectionName).where(
            FieldPath.documentId(), "==", docID).get();
        let documentSnapshot = await querySnapshot.docs[0];
        let document = await documentSnapshot.data();
        return document;
    }

    async deleteDocument(collectionName, docID){
        let docRef = await this.db.collection(collectionName).doc(docID);
        await docRef.delete();
    }
};