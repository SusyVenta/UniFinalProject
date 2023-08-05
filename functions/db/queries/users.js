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
            let data = promise.data();
            let docID = promise.id;
            data.uid = docID;
            allResults.push(data);
        }

        return await allResults;
    }

    async addFriend(uid, friendID){
        /* 
        Updates authenticated user's friends list and the target friend's friend list
        Friendship status can be: {sent_pending, received_pending, friends}

        New UID's 'friends' field: {<reference to friendID>: "sent_pending"}
        New friend's 'friends' field: {<reference to UID>: "received_pending"}
        */

        // check if users are already friends or there is already a pending action
        let user = await this.parent.getDocument("users", uid);
        let userFriends = user.friends;
        let friendActionAlreadyPresent = userFriends.hasOwnProperty(friendID);

        if (friendActionAlreadyPresent !== true){
            // add friend to UID's friend
        
            let dataObj = {
                mapName: "friends",
                key: friendID,
                newValue: "sent_pending"
            };

            await this.parent.updateSingleKeyValueInMap("users", uid, dataObj);

            // add UID to friend's friends 

            let dataObj2 = {
                mapName: "friends",
                key: uid,
                newValue: "received_pending"
            };

            await this.parent.updateSingleKeyValueInMap("users", friendID, dataObj2);
        }
    }

    async getFriendsProfiles(userData){
        /* userData: content of document for UID */
        let friendsProfiles = {};

        for (const [uid, value] of Object.entries(userData.friends)){
            friendsProfiles[uid] = await this.getUserDetails(uid);
        } 
        return friendsProfiles;
    }
};