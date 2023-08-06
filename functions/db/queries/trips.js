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
        data: {friendsToAdd: [], tripID: <str: tripID>, askAllParticipantsDates: <true / false>}
        Updates the following fields: 
            - participantsStatus: {uid: 'pending'}
            - totalDaysAvailability: {uid: null}
            - workingDaysAvailability: {uid: null}
            - if askAllParticipantsDates === true -> datesPreferences: {uid: []}
        */
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
            
            if(data.askAllParticipantsDates === "true"){
                // update totalDaysAvailability
                await this.parent.updateSingleKeyValueInMap(
                    "trips", 
                    data.tripID, 
                    {
                        mapName: "totalDaysAvailability",
                        key: friendID,
                        newValue: null
                    }
                );
                // update workingDaysAvailability
                await this.parent.updateSingleKeyValueInMap(
                    "trips", 
                    data.tripID, 
                    {
                        mapName: "workingDaysAvailability",
                        key: friendID,
                        newValue: null
                    }
                );
            }
            // add trip invite to friend so they get notified
            await this.parent.updateDocumentAppendToArray(
                "users", 
                friendID, 
                {
                    arrayName: "tripInvites",
                    valueToUpdate: {senderID: userID, tripID: data.tripID}
                }
            );
        }
    }
};