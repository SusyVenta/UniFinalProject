import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import httpMocks from 'node-mocks-http';
import esmock from 'esmock';
import { EventEmitter } from 'events';


describe('authenticationRouter', () => {
    /*it("GET /signup should render authentication.ejs with the correct payload", async() => {
        const { authenticationRouter } = await esmock('../../../../functions/routers/authentication.js');
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

        let router = authenticationRouter({}, {});
        router.handle(request, response);
    });


    it("POST /signup with wrong form data should render authentication.ejs with error message", async () => {
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

      const { authenticationRouter } = await esmock('../../../../functions/routers/authentication.js');

      let router = authenticationRouter({}, {});
      router.handle(request, response);
      
    });*/

    it("POST /signup with wrong form data should render authentication.ejs with error message", async () => {
      const createUserWithEmailAndPassword = mock.fn((clientAuth, email, password) => {
        return Promise.resolve({user: "someuser", displayName: ""});
      });
      const updateProfile = mock.fn((user) => {
        return Promise.resolve({user: "someuser", displayName: "new name"});
      });
      const sendEmailVerification = mock.fn((user) => {
        return Promise.resolve();
      });
      const signOut = mock.fn((clientAuth) => {
        return Promise.resolve();
      });
      const sendPasswordResetEmail = mock.fn((clientAuth, email) => {
        return Promise.resolve();
      });

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
        let payload = {authType: "signup", statusCode: 200, title: "Thank you!", authInfoTitle: "Success!",
                       authInfoMessage: "Please verify your email, then log in"};
        assert.deepEqual(response._getRenderData(), {
          payload
        });
        console.log("||||||||||||||||||||||||||||||||||||||||||| done");
      });

      const { authenticationRouter } = await esmock('../../../../functions/routers/authentication.js');

      let router = authenticationRouter({}, 
                                        {}, 
                                        createUserWithEmailAndPassword, 
                                        signOut,
                                        sendPasswordResetEmail,
                                        sendEmailVerification,
                                        updateProfile
                                        );
      await router.handle(request, response);
      
    });
    
});
