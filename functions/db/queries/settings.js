import { defaultNotifications } from "../../config/userNotifications.js"

export class SettingsQueries{
    constructor(parentClass){
        this.parent = parentClass;
    };

    async createDefaultUserSettings(uid){
        await this.parent.addFieldToDocument(
            "users", 
            uid, 
            {fieldName: "notifications", fieldValue: defaultNotifications}
        );
    }

    async getUserSettings(uid){
        let userDoc = await this.parent.getDocument(
            "users", 
            uid
        );

        let userNotificationsSettings = userDoc.notifications;

        return userNotificationsSettings;
    }

    async getOrCreateUserSettings(uid){
        let userNotificationsSettings = await this.getUserSettings(uid);

        if (typeof(userNotificationsSettings) === "undefined"){
            await this.createDefaultUserSettings(uid);
        } 

        let finalOutput = await this.getUserSettings(uid);
        return finalOutput;
    }

    async updateUserSettings(uid, settingName, settingValue){
        let dataObj = {
            mapName: "notifications",
            key: settingName,
            newValue: settingValue === 'true' // str to boolean
        };

        await this.parent.updateSingleKeyValueInMap("users", uid, dataObj);
    }
};