
export class TripQueries{
    constructor(db){
        this.db = db;
    };

    async listCollections(){
        let collectionsSnapshot = await this.db.listCollections();

        let collectionNames = [];
        collectionsSnapshot.forEach(snaps => {
            collectionNames.push(snaps["_queryOptions"].collectionId);
        });
        return collectionNames;
    }

    async createTrip(dataToAdd){
        // creates document to collection 'trips'. 
        // If the collection doesn't exist, it creates it.
        let tripsCollection = await this.db.collection("trips");
        let addedDoc = await tripsCollection.add({
            dataToAdd
        });
        
        let addedDocID = addedDoc["_path"]["segments"][1];
        return addedDocID;
    }
};