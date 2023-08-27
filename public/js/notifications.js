// https://firebase.google.com/docs/firestore/quickstart#web-namespaced-api

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore(firebaseApp);

// use emulator DB when testing
if (location.hostname === "localhost") {
    db.useEmulator("127.0.0.1", 8080);
  }

function deleteNotification(notificationId){
    // deletes selected notification by calling API endpoint

    $.ajax({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
        xhrFields: {
            withCredentials: true
        }
    });
};

function getUserNotifications(userID){
    /* 
    Gets data for currently authenticates user in real time. 
    Whenever anything changes in this document, data is pushed to the client.
    Add notifications in from most to last recent to notifications dropdown

    https://firebase.google.com/docs/firestore/query-data/listen

    This file is imported in sharedHead partial.
    This function is called in the footer partial.
    */
    let notificationsDropDown = document.getElementById("notifications-dropdown");

    db
    .collection("users")
    .doc(userID).onSnapshot((doc) => {
        let data = doc.data();
        console.log("Current data: ", data);
        // update notifications number
        let notificationsNumber = document.getElementById("number-notifications-badge");
        notificationsNumber.innerHTML = data.notifications.length;

        // reset notifications
        notificationsDropDown.innerHTML = "";

        // add notifications as dropdown items
        let notifications = data.notifications;
        for (let notification of notifications){
            let li = document.createElement("li");
            let a = document.createElement("a");
            a.setAttribute("class", `dropdown-item`);
            a.setAttribute("href", notification.URL);
            a.setAttribute("rel", "nofollow");
            a.textContent = notification.message;

            if(
                (notification.notificationType).includes("accepted") || 
                (notification.notificationType).includes("rejected") ||
                (notification.notificationType == "trip_cannot_choose_dates") ||
                (notification.notificationType == "addedToTripEvent")
            ){
                // remove notification when user clicks on it
                a.addEventListener('click', function(event) { 
                    event.preventDefault(); 
                    deleteNotification(notification.notification_id); 
                    window.location = this.href;
                });
            }

            li.appendChild(a);
            notificationsDropDown.prepend(li);
        }
    });
}
