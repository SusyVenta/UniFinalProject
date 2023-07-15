import { describe, it } from 'node:test';
import assert from 'node:assert';
import { authenticationRouter } from '../../../../functions/routers/authentication.js';
import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';


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
            console.log("MOCK CREATE USER CALLED");
            return true
          }
        }
    }

    it("GET /resetPassword should render authentication.ejs with the correct payload", () => {
        let request  = httpMocks.createRequest({
            method: 'GET',
            url: '/resetPassword'
        });
    
        let response = httpMocks.createResponse({eventEmitter: EventEmitter});

        let payload = {authType: "resetPassword", statusCode: null, authInfoMessage: null, authInfoTitle: null};

        response.on("render", () => {
        // wait until event "render" is fired before checking results
            assert.strictEqual(response.statusCode, 200);
            assert.deepEqual(response._getRenderData(), payload);
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

      it("POST /resetPassword called with valid email should send email and " + 
         "render authentication.ejs with the correct payload", () => {
        let request  = httpMocks.createRequest({
            method: 'POST',
            url: '/resetPassword',
            body: {
                email: "correct@email.com"
            },
        });
    
        let response = httpMocks.createResponse({eventEmitter: EventEmitter});

        let payload = {authType: "login", statusCode: 200,
                      authInfoTitle: "Success!",
                      authInfoMessage: `We sent instructions to reset your password to correct@email.com`};

        response.on("render", () => {
        // wait until event "render" is fired before checking results
            assert.strictEqual(response.statusCode, 200);
            assert.deepEqual(response._getRenderData(), payload);
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

      it("POST /resetPassword called with invalid email should " + 
         "render authentication.ejs with the error message", () => {
        function sendPasswordResetEmail(clientAuth, email) {
            return Promise.reject({code: "Some error", message: "Some error message"});
        }

        let request  = httpMocks.createRequest({
            method: 'POST',
            url: '/resetPassword',
            body: {
                email: "correct@email.com"
            },
        });
    
        let response = httpMocks.createResponse({eventEmitter: EventEmitter});

        let payload = {authType: "resetPassword", statusCode: 500,
                      authInfoTitle: "Ops! Looks like something went wrong",
                      authInfoMessage: "Some error\nSome error message"};

        response.on("render", () => {
            // wait until event "render" is fired before checking results
            assert.strictEqual(response.statusCode, 500);
            assert.deepEqual(response._getRenderData(), payload);
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

      it("POST /resetPassword called with invalid email but auth/user-not-found error should " + 
         "render authentication.ejs with the success message", () => {
        function sendPasswordResetEmail(clientAuth, email) {
            return Promise.reject({code: "auth/user-not-found", message: "Some error message"});
        }

        let request  = httpMocks.createRequest({
            method: 'POST',
            url: '/resetPassword',
            body: {
                email: "correct@email.com"
            },
        });
    
        let response = httpMocks.createResponse({eventEmitter: EventEmitter});

        let payload = {authType: "resetPassword", statusCode: 200,
                      authInfoTitle: "Success!",
                      authInfoMessage: `We sent instructions to reset your password to correct@email.com`};

        response.on("render", () => {
            // wait until event "render" is fired before checking results
            assert.strictEqual(response.statusCode, 200);
            assert.deepEqual(response._getRenderData(), payload);
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
