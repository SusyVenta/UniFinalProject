// https://firebase.google.com/docs/firestore/quickstart#web-namespaced-api

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore(firebaseApp);

// use emulator DB when testing
if (location.hostname === "localhost") {
    db.useEmulator("127.0.0.1", 8080);
  }

function getUserNotifications(userID){
    /* 
    Gets data for currently authenticates user in real time. 
    Whenever anything changes in this document, data is pushed to the client.

    https://firebase.google.com/docs/firestore/query-data/listen

    This function is called in the footer partial
    */
    
    db
    .collection("users")
    .doc(userID).onSnapshot((doc) => {
        console.log("Current data: ", doc.data());
    });
}
