import { getFirestore, FieldValue, FieldPath } from 'firebase-admin/firestore';
import { TripQueries } from './queries/trips.js';
import { UserQueries } from './queries/users.js';
import { SettingsQueries } from './queries/settings.js';
import { NotificationsQueries } from './queries/notifications.js';


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
        this.notificationsQueries = new NotificationsQueries(this);
        this.userQueries = new UserQueries(this);
        this.tripQueries = new TripQueries(this);
        this.settingsQueries = new SettingsQueries(this);
    }

    async listCollections(){
        // lists all collections i.e. tables equivalent in the DB
        let collectionsSnapshot = await this.db.listCollections();

        let collectionNames = [];
        collectionsSnapshot.forEach(snaps => {
            collectionNames.push(snaps["_queryOptions"].collectionId);
        });
        return collectionNames;
    }

    async createDocumentWithData(collectionName, dataToAdd){
        // creates document with content in the specified collection.
        // If the collection doesn't exist, it creates it.
        // document ID is assigned automatically and returned
        let tripsCollection = await this.db.collection(collectionName);
        let addedDoc = await tripsCollection.add(dataToAdd);
        
        let addedDocID = addedDoc["_path"]["segments"][1];
        return addedDocID;
    }

    async createDocumentWithDataSpecifyDocID(collectionName, docID, dataToAdd){
        // adds document to the specified collection
        // If the collection doesn't exist, it creates it.
        // document ID is specified
        let tripsCollection = await this.db.collection(collectionName);
        await tripsCollection.doc(docID).set(dataToAdd);
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

    async updateSingleKeyValueInMap(collectionName, docID, dataObj){
        /* 
        Given an existing map containing N <key, value> pairs, updates only the 
        specified <key, value> pair.
        dataObj: {mapName: <name>, key: <key>, newValue: <new value>}
        */
        let docRef = await this.db.collection(collectionName).doc(docID);
        
        let payload = {};
        payload[`${dataObj.mapName}.${dataObj.key}`] = dataObj.newValue;
        await docRef.update(payload);
    }

    async deleteKeyFromMap(collectionName, docID, dataObj){
        /* 
        Given an existing map containing N <key, value> pairs, removes the 
        specified <key, value> pair.
        dataObj: {mapName: <name>, key: <key>}
        */
        let docRef = await this.db.collection(collectionName).doc(docID);
        
        let payload = {};
        payload[`${dataObj.mapName}.${dataObj.key}`] = FieldValue.delete();
        await docRef.update(payload);
    }


    async addFieldToDocument(collectionName, docID, dataObj){
        /* 
        Given an existing document, adds a field to it.
        dataObj: {fieldName: <name>, fieldValue: <any object>}
        */
        let docRef = await this.db.collection(collectionName).doc(docID);
        let payload = {};
        payload[dataObj.fieldName] = dataObj.fieldValue;

        await docRef.update(payload);
    }

    async updateFieldsDocument(collectionName, docID, dataObj){
        /* 
        Given an existing document, updates specified fields.
        dataObj: {<attribute>: <any object>, ...}
        */
        let docRef = await this.db.collection(collectionName).doc(docID);

        await docRef.update(dataObj);
    }

    async getDocument(collectionName, docID){
        // return content of a document identified with its collection name and docID
        let querySnapshot = await this.db.collection(collectionName).where(
            FieldPath.documentId(), "==", docID).get();
        let documentSnapshot = await querySnapshot.docs[0];

        if (documentSnapshot === undefined) {
            // doc not found
            return undefined;
        }

        let document = await documentSnapshot.data();
        return document;
    }

    async deleteDocument(collectionName, docID){
        // deletes the specified document
        let docRef = await this.db.collection(collectionName).doc(docID);
        await docRef.delete();
    }
};