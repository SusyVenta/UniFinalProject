
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
                let optionNumber = parseInt(key) + 1;
                sanitizedOptions["option_" + optionNumber] = value.trim();
            }
            sanitizedDataToAdd.options = sanitizedOptions;
        }else{
            throw new Error("options must be specified");
        }

        // comments
        if(pollID === null){
            // only add comments when creating new event
            sanitizedDataToAdd.comments = [];

            // set poll owner 
            sanitizedDataToAdd.pollOwner = userID;

            // answers to poll
            sanitizedDataToAdd.answersToPoll = {};
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

    async addCommentToPoll(tripID, dataToAdd, userID, pollID){
        // adds comment to the list of poll comments
        let dataObj = {
            arrayName: "comments",
            valueToUpdate: {
                "userID": userID, 
                "commentText": dataToAdd.comment.trim(),
                "time": dataToAdd.time
            }
        }
     
        return await this.parent.updateDocumentAppendToArrayInSubcollection(
            "trips", tripID, "polls", pollID, dataObj
        );
    }

    async removeTripPoll(tripID, pollID){
        // get trip participants
        let tripDoc = await this.parent.tripQueries.getTripByID(tripID);
        let tripParticipants = Object.keys(tripDoc.participantsStatus);

        for (let participantUID of tripParticipants){
            // remove notifications if present
            let notificationID = `addedToTripPoll_${tripID}_${pollID}`;
            this.parent.notificationsQueries.removeNotification(participantUID, notificationID);
        }

        // removes trip poll from trip
        this.parent.deleteDocumentInSubcollection("trips", tripID, "polls", pollID);
        
    }

    async getPollDetails(tripID, pollID){
        // returns poll data
        return await this.parent.getDocumentInSubcollection("trips", tripID, "polls", pollID);
    }

    async savePollAnswers(tripID, dataToAdd, userID, pollID){
        // save to db. If answer is already present, overrides it
        await this.parent.updateSingleKeyValueInMapInSubcollection(
            "trips", 
            tripID, 
            "polls", 
            pollID, 
            {mapName: "answersToPoll", key: userID, newValue: dataToAdd.answersToPoll}
        )

        // remove notification
        let notificationID = `addedToTripPoll_${tripID}_${pollID}`;
        this.parent.notificationsQueries.removeNotification(userID, notificationID);

        // if all participants finished voting, notify poll owner
        let pollDetails = await this.getPollDetails(tripID, pollID);
        let numberPollParticipants = pollDetails.participants.length;
        let numberAnswersReceived = Object.keys(pollDetails.answersToPoll).length;
        if (numberPollParticipants === numberAnswersReceived){
            this.parent.notificationsQueries.sendNotification(
                userID, 
                pollDetails.pollOwner, 
                "allPollAnswersSubmitted",
                tripID,
                null,
                null,
                pollDetails.question,
                pollID,
            );
        }
    }
};