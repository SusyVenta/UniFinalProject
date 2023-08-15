
export class NotificationsQueries{
    constructor(parentClass){
        this.parent = parentClass;

        this.notificationTypes = {
            friendship_request_accepted: {
                data: {
                    message: "%SENDER% accepted your friendship request",
                    URL: "/friends",
                    senderUID: "%SENDERID%",
                    notification_id: "friendship_request_accepted_%SENDERID%",
                    notificationType: "friendship_request_accepted"
                },
                notificationsSettings: "usersAcceptYourFriendshipRequest"
            },
            friendship_request_rejected: {
                data: {
                    message: "%SENDER% rejected your friendship request or removed you from their friends",
                    URL: "/friends",
                    senderUID: "%SENDERID%",
                    notification_id: "friendship_request_rejected_%SENDERID%",
                    notificationType: "friendship_request_rejected"
                },
                notificationsSettings: "usersAcceptYourFriendshipRequest"
            },
            friendship_request_received: {
                data: {
                    message: "%SENDER% sent you a friendship request",
                    URL: "/friends",
                    senderUID: "%SENDERID%",
                    notification_id: "friendship_request_received_%SENDERID%",
                    notificationType: "friendship_request_received"
                },
                notificationsSettings: "newFriendshipRequestReceived"
            },
            trip_invite_received: {
                data: {
                    message: "%SENDER% sent you a request to join their trip",
                    URL: "/trips/%TRIPID%",
                    senderUID: "%SENDERID%",
                    notification_id: "trip_invite_received_%TRIPID%",
                    notificationType: "trip_invite_received"
                },
                notificationsSettings: "newInviteToJoinTrip"
            }
        }
    };

    async removeNotification(recipientUid, notificationID){

        let userDoc = await this.parent.getDocument("users", recipientUid);
        let notifications = userDoc.notifications;

        let notificationToRemove = null;
        for (let notification of notifications){
            if (notification.notification_id === notificationID){
                notificationToRemove = notification;
                break;
            }
        }
        
        this.parent.updateDocumentRemoveFromArray(
            "users", 
            recipientUid, 
            {
                arrayName: "notifications",
                valueToRemove: notificationToRemove
            }
        );
    }

    async sendNotification(senderID, recipientID, notificationType, tripID = null){
        // if the recipient wishes to be notified, sends the specific notification
        let senderDoc = await this.parent.getDocument("users", senderID);
        let stringReplacements = {
            "%SENDERID%": senderID, 
            "%SENDER%": senderDoc.username,
            "%TRIPID%": tripID
        };

        let notificationData = this.notificationTypes[notificationType].data;
        let notificationSettingName = this.notificationTypes[notificationType].notificationsSettings;

        // replace all placeholders 
        Object.keys(notificationData).forEach(function(key){ 
            notificationData[key] = notificationData[key].replace(
                /%\w+%/g, 
                function(all) {
                    return stringReplacements[all] || all;
                }) 
        });

        let recipientdDoc = await this.parent.getDocument("users", recipientID);

        if (recipientdDoc.notificationsSettings[notificationSettingName] === true){
            await this.parent.updateDocumentAppendToArray(
                "users", 
                recipientID, 
                {
                    arrayName: "notifications",
                    valueToUpdate: notificationData
                }
            );
        }
    }

};