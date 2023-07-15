import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';
import { tripsRouter } from '../../../../functions/routers/trips.js';


describe('tripsRouterDeleteTrip', () => {
  function adminAuth(){
  }

  const db = {
    deleteDocument: function(collectionName, docID){
      return true
    },
    updateDocumentRemoveFromArray: function(collectionName, docID, data){
      return true
    }
  };

  it("DELETE /:id should delete the specified trip and remove it from user's trips", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: 
        {
          uid: "123",
          name: "John Doe"
        }
      });
    };

    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve({
        iss: 'example-iss',
        name: 'John Doe',
        aud: 'example-aud',
        auth_time: 1624952023,
        user_id: '123',
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
      method: 'DELETE',
      url: '/123',
      cookies: {
        __session: "somesessionstring"
      }
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("send", () => {
      // wait until event "send" is fired before checking results
      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response._getData(), "Deleted 123");
    });

    return new Promise((resolve, reject) => {
      response.on("end", () => {
        resolve();
      });
    
      let router = tripsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });
  });

  it("DELETE /:id should return 401 when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'DELETE',
      url: '/123',
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("send", () => {
      assert.strictEqual(response.statusCode, 401);
    });

    let router = tripsRouter(
      adminAuth,
      db,
      getUserSessionDetails
    );
    router.handle(request, response);
  });

  it("DELETE /:id should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject(new Error("Some error"));
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'DELETE',
      url: '/123',
      cookies: {
        __session: "somesessionstring"
      }
    });
    
    let response = httpMocks.createResponse({eventEmitter: EventEmitter});
    
    response.on("send", () => {
      // wait until event "send" is fired before checking results
      assert.strictEqual(response.statusCode, 500);
      assert.deepEqual(String(response._getData()), "Some error");
    });
    
    return new Promise((resolve, reject) => {
      response.on("end", () => {
        resolve();
      });
    
      let router = tripsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });
  });

});

