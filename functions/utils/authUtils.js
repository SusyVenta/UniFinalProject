export function attachCsrfToken(url, cookie, value) {
  // https://github.com/firebase/quickstart-nodejs/blob/master/auth-sessions/app.js#L80
  return function(req, res, next) {
    if (req.url == url) {
      res.cookie(cookie, value);
    }
    next();
  }
};


export async function getUserSessionDetails(adminAuth, request) {
  /* 
  Returns:
  - If user is authenticated: {errors: null, userSessionDetails: <the below>}

    {
    >    iss: 'https://session.firebase.google.com/grouptripper-3c7f1',
    >    name: 'Susy Venta',
    >    aud: 'grouptripper-3c7f1',
    >    auth_time: 1687962194,
    >    user_id: 'MAZfmDajphgt4EEhe9vNWL8y0Su2',
    >    sub: 'MAZfmDajphgt4EEhe9vNWL8y0Su2',
    >    iat: 1687962194,
    >    exp: 1687990994,
    >    email: 'susanna.ventafridda@gmail.com',
    >    email_verified: true,
    >    firebase: { identities: { email: [Array] }, sign_in_provider: 'password' },
    >    uid: 'MAZfmDajphgt4EEhe9vNWL8y0Su2'
    >  }

  - if user is not authenticated: {errors: null, userSessionDetails: null}
  - if there was an error: {errors: <some error>, userSessionDetails: null}
  ____________________________________________________
  Source: https://firebase.google.com/docs/auth/admin/manage-cookies
  */
  
  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.
  let returnObject = {errors: null, userSessionDetails: null};

  try {
    // https://firebase.google.com/docs/hosting/manage-cache#using_cookies
    let sessionCookie = request.cookies.__session;

    if (typeof sessionCookie !== "undefined"){
      let decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
      returnObject.userSessionDetails = decodedClaims;
    }
  } catch(error) {
    // Session cookie is unavailable or invalid. 
    returnObject.errors = error; 
  }
  return returnObject;
}; 