import { defaultNotifications } from "../../config/userNotifications.js"

export class UserQueries{
    constructor(parentClass){
        this.parent = parentClass;
    };

    async createUser(userObject, username){
        // adds new document to collection 'users'. 
        // If the collection doesn't exist, it creates it.
        let dataToAdd = {
            email: await userObject.reloadUserInfo.email,
            username: username,
            picturePath: null,
            friends: {},
            trips: [],
            notifications: defaultNotifications
        };
        let existingUser = await this.getUserDetails(userObject.uid);

        if (existingUser === undefined) {
            // if no user document present in DB, create it
            return await this.parent.createDocumentWithDataSpecifyDocID("users", userObject.uid, dataToAdd);
        }
    }

    async getUserDetails(userID){
        // retrieves all trip documents that the user has access to
        let userDoc = await this.parent.getDocument("users", userID);
        return await userDoc;
    }

    async updateProfile(attributesToUpdate, uid){
        try{
            await this.parent.updateFieldsDocument("users", uid, attributesToUpdate);
        } catch( error ){
            console.log(error);
        }
        
    }

    async getUsersMatchingSearch(searchString){
        // searches database for users with username or email matching query string
        // returns Array of results. Empty array if no results found
        
        let querySnapshotsName = await this.parent.db.collection("users").where(
            "username", "==", searchString).get();
        let querySnapshotNameDoc = await querySnapshotsName.docs;
        if(querySnapshotNameDoc === undefined){
            querySnapshotNameDoc = [];
        }

        let querySnapshotsEmail = await this.parent.db.collection("users").where(
            "email", "==", searchString).get();
        let querySnapshotsEmailDoc = await querySnapshotsEmail.docs;
        if(querySnapshotsEmailDoc === undefined){
            querySnapshotsEmailDoc = [];
        }

        let allResultsPromises = querySnapshotNameDoc.concat(querySnapshotsEmailDoc);
        let allResults = [];

        for(let promise of allResultsPromises){
            allResults.push(promise.data());
        }

        return await allResults;
    }
};