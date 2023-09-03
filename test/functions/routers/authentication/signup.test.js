import { describe, it } from 'node:test';
import assert from 'node:assert';
import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';
import { authenticationRouter } from '../../../../functions/routers/authentication.js';


describe('authenticationRouter', () => {
  const db = {
    userQueries: {
      createUser: function(user, name){
        return true
      }
    }
  };

  it("GET /signup should render authentication.ejs with the correct payload", () => {
    let request  = httpMocks.createRequest({
        method: 'GET',
        url: '/signup'
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});
    let payload = {authType: "signup", statusCode: null, authInfoMessage: null, authInfoTitle: null};


    response.on("render", () => {
      // wait until event "render" is fired before checking results
      assert.strictEqual(response.statusCode, 200);
      assert.deepEqual(response._getRenderData(), payload);
    });

    let router = authenticationRouter({}, {}, db);
    router.handle(request, response);
  });

  it("POST /signup with wrong form data should render authentication.ejs with error message", () => {
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/signup',
      body: {
        name: "CorrectName",
        email: "invalidemail",
        password: "Mypassword-123",
        termsandconditions: "on"
      },
      headers: {
        "accept": "text/html"
      }
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("render", () => {
      // wait until event "render" is fired before checking results
      assert.strictEqual(response.statusCode, 400);
      assert.deepEqual(response._getRenderData(), {
        authType: "signup",
        statusCode: 400,
        authInfoMessage: 'Email address is invalid',
        authInfoTitle: "Ops! Looks like something went wrong"
      });
    });

    let router = authenticationRouter({}, {}, db);
    router.handle(request, response);
      
  });

  it("POST /signup with correct form data should render authentication.ejs with success message", () => {
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

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/signup',
      body: {
        name: "CorrectName",
        email: "correct@gmail.com",
        password: "Mypassword-123",
        termsandconditions: "on",
        betaCode: "girotondo"
      },
      headers: {
        "accept": "text/html"
      }
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("render", () => {
      // wait until event "render" is fired before checking results
      assert.strictEqual(response.statusCode, 200);
      let payload = {authType: "signup", statusCode: 200, title: "Thank you!", authInfoTitle: "Success!",
                      authInfoMessage: "Please verify your email, then log in"};
      assert.deepEqual(response._getRenderData(), payload);
    });

    return new Promise((resolve, reject) => {
      response.on("end", () => {
        resolve();
      });
    
      let router = authenticationRouter(
        {},
        {},
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
