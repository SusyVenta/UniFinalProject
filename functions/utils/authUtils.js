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
  - If user is authenticated: 

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

  - if user is not authenticated:
      undefined
  ____________________________________________________
  Source: https://firebase.google.com/docs/auth/admin/manage-cookies
  */
  let sessionCookie = '';
      
  try {
    sessionCookie = request.cookies.session;
  } catch(error){
    console.log("error: " + error);
    return error; //return undefined;
  }
  console.log("sessionCookie: " + sessionCookie);
  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.
  try {
    let decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    console.log("decodedClaims: " + decodedClaims);
    return decodedClaims;
  } catch {
    // Session cookie is unavailable or invalid. 
    return error; //return undefined;
  }
}; 