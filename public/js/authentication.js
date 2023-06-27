import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js'
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

function showLoginPageModal(authInfoTitle, authInfoMessage) {
    document.getElementById("auth-info-title").innerHTML = authInfoTitle;
    document.getElementById("auth-info-message").innerHTML = authInfoMessage;

    if (document.contains(document.getElementById("auth-info-status-code"))) {
        document.getElementById("auth-info-status-code").remove();
    };

    let modal = new bootstrap.Modal(document.getElementById("auth-info-modal"), {});
    modal.show();
};

export function logIn() {
    const email = $("#email").val();
    const password = $("#password").val();

    /* Called when user confirms login */
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        if (!user.emailVerified === true) {
        signOut(auth).then(() => {
            showLoginPageModal("..Almost there!", 
                                "Please verify your email before logging in");
        })
        } else {
            showLoginPageModal("Thank you for logging in", 
                               "Click OK to start planning!");
            // redirect home
            document.location.href="/";
        }
    })
    .catch((error) => {
        const statusCode = error.code;
        const authInfoMessage = error.message;
        showLoginPageModal("Ops! Looks like something went wrong", 
                            statusCode + "\n" + authInfoMessage);
    });
}
