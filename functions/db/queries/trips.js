import moment from 'moment';


export class TripQueries{
    constructor(parentClass){
        this.parent = parentClass;
    };

    async createTrip(dataToAdd, uid){
        // creates document to collection 'trips'. 
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
};