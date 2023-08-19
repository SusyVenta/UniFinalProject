import moment from 'moment';


export class TripQueries{
    constructor(parentClass){
        this.parent = parentClass;
    };

    async createTrip(dataToAdd, uid){
        // adds document to collection 'trips'. 
        // If the collection doesn't exist, it creates it.
        if (dataToAdd.askAllParticipantsDates === "2"){
            dataToAdd.askAllParticipantsDates = false;
        } else {
            dataToAdd.askAllParticipantsDates = true;
        }

        dataToAdd.tripOwner = uid;

        if(dataToAdd.askAllParticipantsDates === false){
            dataToAdd.finalizedStartDate = moment(
                dataToAdd.datesPreferences[0].slice(0, 10), 'MM/DD/YYYY').toDate();
            dataToAdd.finalizedEndDate = moment(
                dataToAdd.datesPreferences[0].slice(13), 'MM/DD/YYYY').toDate();
        } else{
            dataToAdd.finalizedStartDate = null;
            dataToAdd.finalizedEndDate = null;
        }
        
        dataToAdd.status = "upcoming";
        dataToAdd.creationDatetimeUTC = moment.utc();
        dataToAdd.lastUpdatedDatetimeUTC = moment.utc();
        dataToAdd.participantsStatus = {[uid]: "owner"};
        dataToAdd.workingDaysAvailability = {[uid]: parseInt(dataToAdd.workingDaysAvailability)};
        dataToAdd.totalDaysAvailability = {[uid]: parseInt(dataToAdd.totalDaysAvailability)};
        
        let processedDatespreferences = {};
        for (let i = 0; i < dataToAdd.datesPreferences.length; i++){
            let dateSubmitted = dataToAdd.datesPreferences[i];
            let startDate = moment(dateSubmitted.slice(0, 10), 'MM/DD/YYYY').toDate();
            let endDate = moment(dateSubmitted.slice(13), 'MM/DD/YYYY').toDate();
            processedDatespreferences[i] = [startDate, endDate];
        }
        dataToAdd.datesPreferences = {[uid]: processedDatespreferences};

        return await this.parent.createDocumentWithData("trips", dataToAdd);
    }

    async getTripByID(tripID){
        let tripDetail = await this.parent.getDocument("trips", tripID);
        tripDetail.tripID = tripID;

        if(tripDetail.finalizedStartDate !== null){
            tripDetail.finalizedStartDate = moment(tripDetail.finalizedStartDate.toDate()).format("DD MMM YYYY");
            tripDetail.finalizedEndDate = moment(tripDetail.finalizedEndDate.toDate()).format("DD MMM YYYY");
        }

        return await tripDetail;
    }

    async getTripsForUser(userID){
        // retrieves all trip documents that the user has access to
        let userDoc = await this.parent.getDocument("users", userID);
        let tripIDs = userDoc.trips;

        let tripDetails = [];
        for (let tripID of tripIDs){
            let tripDetail = await this.getTripByID(tripID);
            tripDetails.push(tripDetail);
        }

        return await tripDetails;
    }  

    async getUsernamesForUIDsInTrip(tripID){
        // each trip has 1+ participants. Participants' UIDs are listed 
        // in field 'participantsStatus'. This function returns a map
        // {uid: username} for all users in the trip
        let tripDetail = await this.parent.getDocument("trips", tripID);
        let userIDs = Object.keys(tripDetail.participantsStatus); // array

        let idUsernameMap = {};

        for (let uid of userIDs){
            let userData = await this.parent.getDocument("users", uid);
            let username = userData.username;

            idUsernameMap[uid] = username;
        }
        return await idUsernameMap;
    }  

    async updateTrip(data, userID){
        /* 
        Called when adding friends to trip:
            data: {friendsToAdd: [], tripID: <str: tripID>, askAllParticipantsDates: <true / false>}
            Updates field 'participantsStatus': {uid: 'pending'}
            Sends a notification to the added friend
        Called when updating personal preferences:
            data: {datesPreferences: [], workingDaysAvailability, totalDaysAvailability, tripID: <str: tripID>}
        */

        // https://stackoverflow.com/questions/6622224/jquery-removes-empty-arrays-when-sending
        for (const [key, value] of Object.entries(data)) {
            if(value == ""){
                data[key] = []
            }
        }

        if(data.friendsToAdd){
            for (let friendID of data.friendsToAdd){
                // update participantsStatus
                await this.parent.updateSingleKeyValueInMap(
                    "trips", 
                    data.tripID, 
                    {
                        mapName: "participantsStatus",
                        key: friendID,
                        newValue: "pending"
                    }
                );
    
                // notify friend
                await this.parent.notificationsQueries.sendNotification(
                    userID, 
                    friendID, 
                    "trip_invite_received",
                    data.tripID
                );
            }
        }
        // update dates preferences
        if (data.datesPreferences){
            let processedDatespreferences = {};
            for (let i = 0; i < data.datesPreferences.length; i++){
                let dateSubmitted = data.datesPreferences[i];
                let startDate = moment(dateSubmitted.slice(0, 10), 'MM/DD/YYYY').toDate();
                let endDate = moment(dateSubmitted.slice(13), 'MM/DD/YYYY').toDate();
                processedDatespreferences[i] = [startDate, endDate];
            }

            let updates = {
                workingDaysAvailability: parseInt(data.workingDaysAvailability),
                totalDaysAvailability: parseInt(data.workingDaysAvailability),
                datesPreferences: processedDatespreferences
            }

            for (const [key, value] of Object.entries(updates)) {
                if((Object.keys(value).length == 0) && (typeof(value) == "object")){
                    await this.parent.deleteKeyFromMap("trips", data.tripID, {mapName: key, key: userID});
                } else {
                    await this.parent.updateSingleKeyValueInMap(
                        "trips", 
                        data.tripID, 
                        {
                            mapName: key,
                            key: userID,
                            newValue: value
                        }
                    );
                }
            }

            await this.parent.notificationsQueries.removeNotification(
                userID, "trip_must_choose_dates_" + data.tripID
            );

            await this.parent.updateFieldsDocument("trips", data.tripID, {lastUpdatedDatetimeUTC: moment.utc()});

            // if askAllParticipantsDates === true and all participants entered dates 
            // preferences, send notification to trip owner
            let tripDoc = await this.getTripByID(data.tripID);
            let askAllParticipantsDates = tripDoc.askAllParticipantsDates;
            if(askAllParticipantsDates === true){
                let participantsStatus = tripDoc.participantsStatus;
                
                for (const [participantID, status] of Object.entries(participantsStatus)) {
                    if (status == "pending"){
                        return;
                    }
                }

                let participantsIDs = Object.keys(participantsStatus);
                let datesPreferences = tripDoc.datesPreferences;
                for (let participantID of participantsIDs){
                    if(!(datesPreferences.hasOwnProperty(participantID))){
                        return;
                    }
                }

                // notify trip owner that final dates can be chosen
                this.parent.notificationsQueries.sendNotification(
                    tripDoc.tripOwner, 
                    tripDoc.tripOwner, 
                    "trip_dates_can_be_chosen",
                    data.tripID
                );
            }
        }
        // update trip title
        if(data.tripTitle){
            await this.parent.updateFieldsDocument("trips", data.tripID, {tripTitle: data.tripTitle});
        }
        // user accepts trip invite
        if(data.userAcceptingTripInvite){
            // update participantsStatus
            this.parent.updateSingleKeyValueInMap(
                "trips", 
                data.tripID, 
                {
                    mapName: "participantsStatus",
                    key: userID,
                    newValue: "collaborator"
                }
            );
            
            // add tripID to user's trips
            this.parent.updateDocumentAppendToArray(
                "users", 
                userID, 
                {
                    arrayName: "trips",
                    valueToUpdate: data.tripID
                }
            );

            // remove trip invite from user's notifications
            let notificationDetails = await this.parent.notificationsQueries.removeNotification(
                userID, "trip_invite_received_" + data.tripID
            );
            
            // notify inviter that invitation was accepted
            this.parent.notificationsQueries.sendNotification(
                userID, 
                notificationDetails.senderUID, 
                "trip_invite_accepted",
                data.tripID
            );

            // if askAllParticipantsDates === true, notify user that they need to choose dates
            let tripDoc = await this.getTripByID(data.tripID);
            let askAllParticipantsDates = tripDoc.askAllParticipantsDates;

            if ( askAllParticipantsDates === true){
                this.parent.notificationsQueries.sendNotification(
                    userID, 
                    userID, 
                    "trip_must_choose_dates",
                    data.tripID
                );
            } else {
                // if askAllParticipantsDates === false, notify user that the dates are set. join or leave
                this.parent.notificationsQueries.sendNotification(
                    userID, 
                    userID, 
                    "trip_cannot_choose_dates",
                    data.tripID
                );
            }
            
        }
    }

    async removeUserFromTrip(data){
        /* 
        Removes user from trip or rejects invitation to join a trip
        data = { friendToRemove: friendUID, tripID: tripID}
        */ 
        // remove UID from participantsStatus field
        await this.parent.deleteKeyFromMap(
            "trips", 
            data.tripID, 
            {
                mapName: "participantsStatus",
                key: data.friendToRemove
            }
        );

        // remove UID from datesPreferences field
        await this.parent.deleteKeyFromMap(
            "trips", 
            data.tripID, 
            {
                mapName: "datesPreferences",
                key: data.friendToRemove
            }
        );

        // remove UID from totalDaysAvailability field
        await this.parent.deleteKeyFromMap(
            "trips", 
            data.tripID, 
            {
                mapName: "totalDaysAvailability",
                key: data.friendToRemove
            }
        );

        // remove UID from workingDaysAvailability field
        await this.parent.deleteKeyFromMap(
            "trips", 
            data.tripID, 
            {
                mapName: "workingDaysAvailability",
                key: data.friendToRemove
            }
        );
        
        // remove tripID from user's trips
        await this.parent.updateDocumentRemoveFromArray(
            "users", 
            data.friendToRemove, 
            {
                arrayName: "trips",
                valueToRemove: data.tripID
            }
        );

        // remove tripID from user's notifications
        let notificationDetails = await this.parent.notificationsQueries.removeNotification(
            data.friendToRemove, "trip_invite_received_" + data.tripID
        );

        await this.parent.notificationsQueries.removeNotification(
            data.friendToRemove, "trip_must_choose_dates_" + data.tripID
        );

        if (notificationDetails != null){
            // notify trip owner of invitation declined
            this.parent.notificationsQueries.sendNotification(
                data.friendToRemove, 
                notificationDetails.senderUID, 
                "trip_invite_rejected", 
                data.tripID
            );
        } 
    }

    async removeTrip(tripID){
        /* 
        removes trip from trips collection, removes trip from all trip participants'
        trips in user collections, and removes invitations to join trip */

        let tripDetails = await this.getTripByID(tripID);
        let participantsUIDs = Object.keys(tripDetails.participantsStatus);

        for (let participantUID of participantsUIDs){
            // remove tripID from user's trips
            if (tripDetails.participantsStatus[participantUID] != "pending"){
                await this.parent.updateDocumentRemoveFromArray(
                    "users", 
                    participantUID, 
                    {arrayName: "trips", valueToRemove: tripID}
                );
            }

            // remove tripID from user's notifications
            await this.parent.notificationsQueries.removeNotification(
                participantUID, "trip_invite_received_" + tripID
            );
        }

        // delete trip document
        await this.parent.deleteDocument("trips", tripID);
    }
};