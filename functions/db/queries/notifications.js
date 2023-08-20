
export class NotificationsQueries{
    constructor(parentClass){
        this.parent = parentClass;

        this.notificationTypes = {
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
            trip_invite_received: {
                data: {
                    message: "%SENDER% sent you a request to join their trip '%TRIPTITLE%'",
                    URL: "/trips/%TRIPID%/participants",
                    senderUID: "%SENDERID%",
                    notification_id: "trip_invite_received_%TRIPID%",
                    notificationType: "trip_invite_received"
                },
                notificationsSettings: "newInviteToJoinTrip"
            },
            trip_invite_accepted: {
                data: {
                    message: "%SENDER% accepted the invitation to join your trip '%TRIPTITLE%'",
                    URL: "/trips/%TRIPID%/participants",
                    senderUID: "%SENDERID%",
                    notification_id: "trip_invite_accepted_%TRIPID%",
                    notificationType: "trip_invite_accepted"
                },
                notificationsSettings: "usersAcceptYourTripInvitation"
            },
            trip_invite_rejected: {
                data: {
                    message: "%SENDER% declined the invitation to join your trip '%TRIPTITLE%'",
                    URL: "/trips/%TRIPID%/participants",
                    senderUID: "%SENDERID%",
                    notification_id: "trip_invite_rejected_%TRIPID%",
                    notificationType: "trip_invite_rejected"
                },
                notificationsSettings: "usersAcceptYourTripInvitation"
            },
            trip_must_choose_dates: {
                data: {
                    message: "Please enter your availabilities for the trip '%TRIPTITLE%'",
                    URL: "/trips/%TRIPID%/participants",
                    senderUID: "%SENDERID%",
                    notification_id: "trip_must_choose_dates_%TRIPID%",
                    notificationType: "trip_must_choose_dates"
                },
                notificationsSettings: "friendsRequestYourInput"
            },
            trip_cannot_choose_dates: {
                data: {
                    message: "The owner of your trip '%TRIPTITLE%' wants you to confirm your availability on the set dates or leave the trip.",
                    URL: "/trips/%TRIPID%/participants",
                    senderUID: "%SENDERID%",
                    notification_id: "trip_cannot_choose_dates_%TRIPID%",
                    notificationType: "trip_cannot_choose_dates"
                },
                notificationsSettings: "friendsRequestYourInput"
            },
            trip_dates_can_be_chosen: {
                data: {
                    message: "All participants of your trip '%TRIPTITLE%' have entered their dates availabilities. Please choose the trip final dates",
                    URL: "/trips/%TRIPID%/participants",
                    senderUID: "%SENDERID%",
                    notification_id: "trip_dates_can_be_chosen_%TRIPID%",
                    notificationType: "trip_dates_can_be_chosen"
                },
                notificationsSettings: "friendsRequestYourInput"
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
        return notificationToRemove;
    }

    async sendNotification(senderID, recipientID, notificationType, tripID = null){
        // if the recipient wishes to be notified, sends the specific notification
        let senderDoc = await this.parent.getDocument("users", senderID);

        let stringReplacements = {
            "%SENDERID%": senderID, 
            "%SENDER%": senderDoc.username,
            "%TRIPID%": tripID
        };

        if (tripID != null){
            let tripDoc = await this.parent.getDocument("trips", tripID);

            stringReplacements["%TRIPTITLE%"] = tripDoc.tripTitle;
        }

        // don't modify in place
        let notificationData = structuredClone(this.notificationTypes[notificationType].data);
        let notificationSettingName = this.notificationTypes[notificationType].notificationsSettings;

        // replace all placeholders 
        for (const [placeholder, value] of Object.entries(stringReplacements)) {
            for (const [notificationName, notificationValue] of Object.entries(notificationData)) {
                notificationData[notificationName] = notificationValue.replace(placeholder, value);
            }
        }

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