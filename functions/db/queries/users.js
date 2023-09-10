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
            notificationsSettings: defaultNotifications,
            notifications: [],
            uid: userObject.uid
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

            await this.parent.notificationsQueries.sendNotification(uid, friendID, "friendship_request_received");
        }
    }

    async getFriendsProfiles(userData){
        /* userData: content of document for UID 
        Because of EJS rendering problems (URLs), removes user notifications 
        */
        let friendsProfiles = {};

        for (const [uid, value] of Object.entries(userData.friends)){
            let userDetails = await this.getUserDetails(uid);
            delete userDetails["notifications"];
            friendsProfiles[uid] = userDetails;
        } 
        return friendsProfiles;
    }

    async removeFriend(uid, friendID){
        /* 
        Removes frienship from user pair or declines friendship request 
        users need to be friends to remove friendship.
        If the friend has any trips in common with the user, throw error
        */
        let user = await this.parent.getDocument("users", uid);
        let userTripIDs = user.trips;

        for (let tripID of userTripIDs){
            let userTrip = await this.parent.getDocument("trips", tripID);
            let participants = userTrip.participantsStatus;
            if (participants.hasOwnProperty(friendID)){
                throw new Error("Can't remove friend as you have trips in common. Please remove yourself from these trips or remove your friend from them before retrying.");  
            }
        }
        
        let userFriends = user.friends;
        if(userFriends.hasOwnProperty(friendID)){
            // delete from authenticated user 
            let dataObj = {
                mapName: "friends",
                key: friendID
            };

            this.parent.deleteKeyFromMap("users", uid, dataObj);

            // delete from friend
            let dataObjFriend = {
                mapName: "friends",
                key: uid
            };

            this.parent.deleteKeyFromMap("users", friendID, dataObjFriend);

            await this.parent.notificationsQueries.removeNotification(uid, "friendship_request_received_" + friendID);
            await this.parent.notificationsQueries.sendNotification(uid, friendID, "friendship_request_rejected");
        }
    }

    async acceptFriend(uid, friendID){
        /* Accepts frienship in user pair */
        // users need to have pending friends to accept friendship
        let user = await this.parent.getDocument("users", uid);
        let userFriends = user.friends;
        if(userFriends.hasOwnProperty(friendID) && userFriends[friendID].includes("pending")){
            // delete from authenticated user 
            let dataObj = {
                mapName: "friends",
                key: friendID,
                newValue: "friends"
            };

            this.parent.updateSingleKeyValueInMap("users", uid, dataObj);

            // delete from friend
            let dataObjFriend = {
                mapName: "friends",
                key: uid,
                newValue: "friends"
            };

            this.parent.updateSingleKeyValueInMap("users", friendID, dataObjFriend);

            await this.parent.notificationsQueries.removeNotification(uid, "friendship_request_received_" + friendID);
            await this.parent.notificationsQueries.sendNotification(uid, friendID, "friendship_request_accepted");
        }
    }

    async deleteUserProfile(uid){
        let user = await this.parent.getDocument("users", uid);

        let friendsIDs = Object.keys(user.friends);

        // remove friends notifications that were sent by you
        for (let friendID of friendsIDs ){
            let friend = await this.parent.getDocument("users", friendID);
            let friendNotifications = friend.notifications;
            for(let notification of friendNotifications){
                if(notification.senderUID === uid){
                    await this.parent.notificationsQueries.removeNotification(
                        friendID, notification.notification_id, searchStartsWith=false)
                }
            }
        }

        // delete trips if you're the owner
        let tripsIDs = user.trips;

        // also delete trips from the collaborators' profiles
        for (let tripID of tripsIDs){
            let trip = await this.parent.getDocument("trips", tripID);
            if(trip.tripOwner === uid){
                await this.parent.tripQueries.removeTrip(tripID);
            }
        }

        // delete user document
        await this.parent.deleteDocument("users", uid);
    }
};