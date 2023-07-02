import 'https://code.jquery.com/jquery-3.7.0.min.js';
import { firebaseApp } from "./authentication.js";
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-lite.js';

export function enableChatMessaging(io){
    // Initialize Firebase
    var db = getFirestore(firebaseApp);

    // Initialize Socket.io
    var socket = io("https://grouptripper-3c7f1.web.app/");
    console.log(socket);
    // Send message
    /*document.getElementById('chat-form').addEventListener('submit', (e) => {
        e.preventDefault();
        var message = document.getElementById('chat-message').value;
        console.log(message);
        db.collection('chat_messages').add({
            message: message,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        document.getElementById('message').value = '';
    });*/
    var message = document.getElementById('chat-message').value;
    // Listen for new messages
    socket.on('message', (message) => {
        var li = document.createElement('li');
        li.innerHTML = message.message;
        document.getElementById('messages').appendChild(li);
    });

    socket.emit('message', message);

    console.log("emitted message: " + message);

    socket.on('message1', (message) => {
        console.log("RECEIVED from server: " + message);
    });
}
