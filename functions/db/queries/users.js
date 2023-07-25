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
        return await this.parent.createDocumentWithDataSpecifyDocID("users", userObject.uid, dataToAdd);
    }

    async getUserDetails(userID){
        // retrieves all trip documents that the user has access to
        let userDoc = await this.parent.getDocument("users", userID);
        return await userDoc;
    }

    async updateProfile(atributesToUpdate, uid){
        await this.parent.updateFieldsDocument("users", uid, atributesToUpdate);
    }
};