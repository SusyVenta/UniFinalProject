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

        return await this.parent.createDocumentWithData("users", dataToAdd);
    }
};