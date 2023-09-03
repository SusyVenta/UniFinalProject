import { describe, it } from 'node:test';
import assert from 'node:assert';
import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';
import moment from 'moment';
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

  it("POST /sessionLogin with incorrect csrfToken should return 401 unauthorized", () => {
      // Create a mock request object
      let request = httpMocks.createRequest({
        method: 'POST',
        url: '/sessionLogin',
        body: {
          idToken: "encryptedIDToken",
          csrfToken: "12345"
        },
        headers: {
          "accept": "text/html"
        },
        cookies: {
          csrfToken: "6789"
        }
      });

      let response = httpMocks.createResponse({eventEmitter: EventEmitter});

      response.on("send", () => {
        // wait until event "send" is fired before checking results
        assert.strictEqual(response.statusCode, 401);
        assert.deepEqual(response._getData(), 'UNAUTHORIZED REQUEST!');
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

  it("POST /sessionLogin with decodedIdToken.auth_time refreshed more than " +
      "5 minutes ago should return 401 unauthorized", () => {
    adminAuth.verifyIdToken = function(idToken){
      let now = new Date();
      let minusTwentyMin = moment(now).subtract(20, "minutes").toDate().getTime() / 1000; // in seconds
      return Promise.resolve({ auth_time: minusTwentyMin });
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/sessionLogin',
      body: {
        idToken: "encryptedIDToken",
        csrfToken: "12345"
      },
      headers: {
        "accept": "text/html"
      },
      cookies: {
        csrfToken: "12345"
      }
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("send", () => {
      // wait until event "send" is fired before checking results
      assert.strictEqual(response.statusCode, 401);
      assert.deepEqual(response._getData(), 'Recent sign in required!');
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

  it("POST /sessionLogin successfully generates session cookie", async() => {
    adminAuth.verifyIdToken = function(idToken){
      let now = new Date();
      let minusTwentyMin = moment(now).subtract(1, "minutes").toDate().getTime() / 1000; // in seconds
      return Promise.resolve({ auth_time: minusTwentyMin });
    };
    adminAuth.createSessionCookie = function(idToken, expiresIn){
      return Promise.resolve();
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/sessionLogin',
      body: {
        idToken: "encryptedIDToken",
        csrfToken: "12345"
      },
      headers: {
        "accept": "text/html"
      },
      cookies: {
        csrfToken: "12345"
      }
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("send", () => {
      // wait until event "send" is fired before checking results
      assert.strictEqual(response.statusCode, 200);
      assert.deepEqual(response._getData(), 'success');
      assert.deepEqual(response.cookies, {
        __session: {
          value: undefined,
          options: { maxAge: 28800000, httpOnly: true, secure: true, SameSite: 'strict' }
        }
      });
    });

    return new Promise((resolve, reject) => {
      response.on("send", () => {
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

  it("POST /sessionLogin throws error", async() => {
    adminAuth.verifyIdToken = function(idToken){
      let now = new Date();
      let minusTwentyMin = moment(now).subtract(1, "minutes").toDate().getTime() / 1000; // in seconds
      return Promise.resolve({ auth_time: minusTwentyMin });
    };

    adminAuth.createSessionCookie = function(idToken, expiresIn) {
      return Promise.reject(new Error("Some error"));
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/sessionLogin',
      body: {
        idToken: "encryptedIDToken",
        csrfToken: "12345"
      },
      headers: {
        "accept": "text/html"
      },
      cookies: {
        csrfToken: "12345"
      }
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("send", () => {
      // wait until event "send" is fired before checking results
      assert.strictEqual(response.statusCode, 500);
      assert.deepEqual(String(response._getData()), 'Error: Some error');
    });

    return new Promise((resolve, reject) => {
      response.on("send", () => {
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