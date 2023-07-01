import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';
import { homeRouter } from '../../../../functions/routers/home.js';


describe('homeRouter', () => {
  function adminAuth(){
  }

  it("GET / should render home.ejs for authenticated users when user is logged in", () => {
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
        method: 'GET',
        url: '/',
        cookies: {
          __session: "somesessionstring"
        }
      });

      let response = httpMocks.createResponse({eventEmitter: EventEmitter});

      let payload = {userIsAuthenticated: true, name: "John Doe"};

      response.on("render", () => {
        // wait until event "send" is fired before checking results
        assert.strictEqual(response.statusCode, 200);
        assert.deepEqual(response._getRenderData(), payload);
      });

      return new Promise((resolve, reject) => {
        response.on("end", () => {
          resolve();
        });
      
        let router = homeRouter(
          adminAuth
        );
        router.handle(request, response);
      });
    });

    it("GET / should render home.ejs for unauthenticated users when user is logged out", () => {
      adminAuth.verifySessionCookie = function(sessionCookie, boolean){
        return Promise.resolve();
      };

      // Create a mock request object
      let request = httpMocks.createRequest({
        method: 'GET',
        url: '/',
        cookies: {}
      });

      let response = httpMocks.createResponse({eventEmitter: EventEmitter});

      let payload = {userIsAuthenticated: false, name: ""};

      response.on("render", () => {
        // wait until event "send" is fired before checking results
        assert.strictEqual(response.statusCode, 200);
        assert.deepEqual(response._getRenderData(), payload);
      });

      return new Promise((resolve, reject) => {
        response.on("end", () => {
          resolve();
        });
      
        let router = homeRouter(
          adminAuth
        );
        router.handle(request, response);
      });
    });

    it("GET / should send an error if anything goes wrong", () => {
      adminAuth.verifySessionCookie = function(sessionCookie, boolean){
        return Promise.resolve();
      };
      let getUserSessionDetails = function(adminAuth, request){
        return Promise.reject(new Error("Some error"));
      };
      
      // Create a mock request object
      let request = httpMocks.createRequest({
        method: 'GET',
        url: '/',
        cookies: {
          __session: "somesessionstring"
        }
      });
      
      let response = httpMocks.createResponse({eventEmitter: EventEmitter});
      
      response.on("send", () => {
        // wait until event "send" is fired before checking results
        assert.strictEqual(response.statusCode, 500);
        assert.deepEqual(String(response._getData()), "Error: Some error");
      });
      
      return new Promise((resolve, reject) => {
        response.on("end", () => {
          resolve();
        });
      
        let router = homeRouter(
          adminAuth,
          getUserSessionDetails
        );
        router.handle(request, response);
      });
    });
});

