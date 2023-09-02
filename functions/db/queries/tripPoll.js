
export class TripPollQueries{
    constructor(parentClass){
        this.parent = parentClass;
    };
    async createOrModifyPoll(tripID, dataToAdd, userID, pollID=null){
        // if pollID is null, adds document to trip collection 'polls'. Otherwise modifies existing poll.
        // If the collection doesn't exist, it creates it.
        let sanitizedDataToAdd = {};

        // participants
        if (dataToAdd.hasOwnProperty('participants')){
            sanitizedDataToAdd.participants = dataToAdd.participants;
        }else{
            sanitizedDataToAdd.participants = [];
        }

        // question
        if (dataToAdd.hasOwnProperty('question')){
            let trimmedQuestion = (dataToAdd.question).trim();
            sanitizedDataToAdd.question = trimmedQuestion;
        }else{
            throw new Error("question must be specified");
        }

        // options to choose 
        if (dataToAdd.hasOwnProperty('numberOptionsToChoose')){
            let intOptionsToChoose = parseInt(dataToAdd.numberOptionsToChoose);
            sanitizedDataToAdd.numberOptionsToChoose = intOptionsToChoose;
        }else{
            throw new Error("numberOptionsToChoose must be specified");
        }

        // options
        if (dataToAdd.hasOwnProperty('options')){
            let unsanitizedOptions = dataToAdd.options;
            let sanitizedOptions = {};
            for (const [key, value] of Object.entries(unsanitizedOptions)) {
                sanitizedOptions[parseInt(key)] = value.trim();
            }
            sanitizedDataToAdd.options = sanitizedOptions;
        }else{
            throw new Error("options must be specified");
        }

        // comments
        if(pollID === null){
            // only add comments when creating new event
            sanitizedDataToAdd.comments = [];
        }
        
        if (pollID === null){
            let pollID = await this.parent.createDocumentWithDataInSubCollection("trips", tripID, "polls", sanitizedDataToAdd);
            
            // notify each poll participant that they were added to a poll
            for (let participantID of sanitizedDataToAdd.participants){
                this.parent.notificationsQueries.sendNotification(
                    userID, 
                    participantID, 
                    "addedToTripPoll",
                    tripID,
                    null,
                    null,
                    sanitizedDataToAdd.question,
                    pollID,
                );
            }
            return
        } else {
            return await this.parent.updateDocumentWithDataInSubCollection("trips", tripID, "polls", pollID, sanitizedDataToAdd);
        }
        
    }

    async addCommentToEvent(tripID, dataToAdd, userID, eventID){
        // adds comment to the list of event comments
        let dataObj = {
            arrayName: "comments",
            valueToUpdate: {
                "userID": userID, 
                "commentText": dataToAdd.comment.trim(),
                "time": dataToAdd.time
            }
        }
     
        return await this.parent.updateDocumentAppendToArrayInSubcollection(
            "trips", tripID, "events", eventID, dataObj
        );
    }

    async removeTripEvent(tripID, eventID){
        // get trip participants
        let tripDoc = await this.parent.tripQueries.getTripByID(tripID);
        let tripParticipants = Object.keys(tripDoc.participantsStatus);

        for (let participantUID of tripParticipants){
            // remove notifications if present
            let notificationID = `addedToTripEvent_${tripID}_${eventID}`;
            this.parent.notificationsQueries.removeNotification(participantUID, notificationID);
        }

        // removes trip event from trip
        this.parent.deleteDocumentInSubcollection("trips", tripID, "events", eventID);
        
    }
};