import { describe, it } from 'node:test';
import assert from 'node:assert';
import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';
import { authenticationRouter } from '../../../../functions/routers/authentication.js';


describe('authenticationRouter', () => {
  function createUserWithEmailAndPassword(clientAuth, email, password) {
    return Promise.resolve({ user: "someuser", displayName: "" });
  }

  function updateProfile(user, profileData) {
    return Promise.resolve({ user: "someuser", displayName: "new name" });
  }

  function sendEmailVerification(user) {
    return Promise.resolve();
  }

  function signOut(clientAuth) {
    return Promise.resolve();
  }

  function sendPasswordResetEmail(clientAuth, email) {
    return Promise.resolve();
  }

  function adminAuth(){
  }

  const db = {
    userQueries: {
      createUser: function(user, name){
        return true
      }
    }
  }

  it("POST /sessionLogout should clear session cookies", () => {
      adminAuth.revokeRefreshTokens = function(sub){
        return Promise.resolve();
      };
      adminAuth.verifySessionCookie = function(sessionCookie, boolean){
        return Promise.resolve({
          iss: 'example-iss',
          name: 'John Doe',
          aud: 'example-aud',
          auth_time: 1624952023,
          user_id: 'example-user-id',
          sub: 'example-sub',
          iat: 1,
          exp: 1,
          email: 'john@example.com',
          email_verified: true,
          firebase: { identities: { email: ['example-email'] }, sign_in_provider: 'password' },
          uid: 'example-uid',
        });
      };

      // Create a mock request object
      let request = httpMocks.createRequest({
        method: 'POST',
        url: '/sessionLogout',
        body: {
          idToken: "encryptedIDToken",
          csrfToken: "12345"
        },
        headers: {
          "accept": "text/html"
        },
        cookies: {
          csrfToken: "6789",
          __session: "somesessionstring"
        }
      });

      let response = httpMocks.createResponse({eventEmitter: EventEmitter});

      response.on("end", () => {
        // wait until event "send" is fired before checking results
        assert.strictEqual(response.statusCode, 302);
        assert.strictEqual(response.cookies.__session.value, '');
      });

      return new Promise((resolve, reject) => {
        response.on("end", () => {
          resolve();
        });
      
        let router = authenticationRouter(
          {},
          adminAuth,
          db,
          createUserWithEmailAndPassword,
          signOut,
          sendPasswordResetEmail,
          sendEmailVerification,
          updateProfile
        );
        router.handle(request, response);
      });
    });
});