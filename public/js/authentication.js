import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import  'https://code.jquery.com/jquery-3.7.0.min.js';
const $ = window.$;
import { getAuth, signInWithEmailAndPassword, signOut, setPersistence, inMemoryPersistence } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js'
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

function getCookie(name) {
    const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
};

function postIdTokenToSessionLogin(url, idToken, csrfToken) {
    // POST to session login endpoint.
    return $.ajax({
      type:'POST',
      url: url,
      data: {idToken: idToken, csrfToken: csrfToken},
      contentType: 'application/x-www-form-urlencoded'
    });
};

export function logIn() {
    const email = $("#email").val();
    const password = $("#password").val();

    // https://firebase.google.com/docs/auth/admin/manage-cookies
    // As httpOnly cookies are to be used, do not persist any state client side.
    // https://firebase.google.com/docs/auth/web/auth-state-persistence#web-modular-api_1
    setPersistence(auth, inMemoryPersistence)
    .then(() => {
        /* Called when user confirms login */
        return signInWithEmailAndPassword(auth, email, password);
    })
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        if (!user.emailVerified === true) {
            signOut(auth).then(() => {
                showLoginPageModal("..Almost there!", 
                                    "Please verify your email before logging in");
            })
        } else {
            // Get the user's ID token as it is needed to exchange for a session cookie.
            return auth.currentUser.getIdToken().then(function(idToken) {
                // Session login endpoint is queried and the session cookie is set.
                // CSRF protection should be taken into account.
                const csrfToken = getCookie('csrfToken');
                
                return postIdTokenToSessionLogin('/auth/sessionLogin', idToken, csrfToken);
            });
        }
    })
    .then(() => {
        // A page redirect would suffice as the persistence is set to NONE.
        return signOut(auth);
    })
    .then(() => {
        // redirect home
        window.location.assign('/');
    })
    .catch((error) => {
        const statusCode = error.code;
        const authInfoMessage = error.message;
        showLoginPageModal("Ops! Looks like something went wrong", 
                            statusCode + "\n" + authInfoMessage);
    });
}
