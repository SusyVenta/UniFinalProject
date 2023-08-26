import moment from 'moment';


export class TripItineraryQueries{
    constructor(parentClass){
        this.parent = parentClass;
    };

    async createOrModifyEvent(tripID, dataToAdd, eventID=null){
        // if eventID is null, adds document to trip collection 'events'. Otherwise modifies existing event.
        // If the collection doesn't exist, it creates it.
        let sanitizedDataToAdd = {};

        // participants
        if (dataToAdd.hasOwnProperty('participants')){
            sanitizedDataToAdd.participants = dataToAdd.participants;
        }else{
            sanitizedDataToAdd.participants = [];
        }

        // eventType
        if (dataToAdd.hasOwnProperty('eventType')){
            let trimmedEventType = (dataToAdd.eventType).trim();
            const acceptedTypes = new Set([
                "City", "Accommodation", "Transportation", "Attraction / Event", "Food & Drinks", "Task to do"]);
            if(acceptedTypes.has(trimmedEventType)){
                sanitizedDataToAdd.eventType = trimmedEventType;
            } else {
                throw new Error("Event Type must be specified");
            }
        }else{
            throw new Error("Event Type must be specified");
        }

        // title
        if (dataToAdd.hasOwnProperty('title')){
            sanitizedDataToAdd.title = (dataToAdd.title).trim();
        }else{
            sanitizedDataToAdd.title = "";
        }

        // startDatetime
        if (dataToAdd.hasOwnProperty('startDatetime')){
            // datetime format: "20/08/2023 01:00 PM"
            let stringifiedDate = moment((dataToAdd.startDatetime).trim(), 'DD/MM/YYYY hh:mm A').toDate();
            sanitizedDataToAdd.startDatetime = stringifiedDate;
        }else{
            throw new Error("Start Datetime must be specified");
        }

        // endDatetime
        if (dataToAdd.hasOwnProperty('endDatetime')){
            // datetime format: "20/08/2023 01:00 PM"
            let stringifiedDate = moment((dataToAdd.endDatetime).trim(), 'DD/MM/YYYY hh:mm A').toDate();
            sanitizedDataToAdd.endDatetime = stringifiedDate;
        }else{
            throw new Error("End Datetime must be specified");
        }

        // address
        if (dataToAdd.hasOwnProperty('address')){
            sanitizedDataToAdd.address = (dataToAdd.address).trim();
        }else{
            sanitizedDataToAdd.address = "";
        }

        // description
        if (dataToAdd.hasOwnProperty('description')){
            sanitizedDataToAdd.description = (dataToAdd.description).trim();
        }else{
            sanitizedDataToAdd.description = "";
        }

        // askParticipantsIfTheyJoin
        if (dataToAdd.hasOwnProperty('askParticipantsIfTheyJoin')){
            sanitizedDataToAdd.askParticipantsIfTheyJoin = (dataToAdd.askParticipantsIfTheyJoin === "false") ? false: true;
        }else{
            sanitizedDataToAdd.askParticipantsIfTheyJoin = false;
        }

        // status
        if (dataToAdd.hasOwnProperty('status')){
            sanitizedDataToAdd.status = (dataToAdd.status).trim();
        }else{
            sanitizedDataToAdd.status = false;
        }

        // comments
        if (dataToAdd.hasOwnProperty('comments')){
            sanitizedDataToAdd.comments = comments;
        }else{
            sanitizedDataToAdd.comments = [];
        }
        
        if (eventID === null){
            return await this.parent.createDocumentWithDataInSubCollection("trips", tripID, "events", sanitizedDataToAdd);
        } else {
            return await this.parent.updateDocumentWithDataInSubCollection("trips", tripID, "events", eventID, sanitizedDataToAdd);
        }
        
    }
};