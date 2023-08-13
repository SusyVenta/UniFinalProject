// https://firebase.google.com/docs/firestore/quickstart#web-namespaced-api


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore();

// use emulator DB when testing
if (location.hostname === "localhost") {
    db.useEmulator("127.0.0.1", 8080);
  }

function getUserNotifications(){
    /* 
    Gets data for currently authenticates user in real time. 
    Whenever anything changes in this document, data is pushed to the client.

    https://firebase.google.com/docs/firestore/query-data/listen
    */
    
    //const user = firebase.auth().currentUser;
    let userID = "Ms56h9q9p1b8QUdBharFxyr0NV53";
    db
    .collection("users")
    .doc(userID).onSnapshot((doc) => {
        console.log("Current data: ", doc.data());
    });
}

getUserNotifications()