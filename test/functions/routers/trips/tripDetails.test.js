import { describe, it } from 'node:test';
import assert from 'node:assert';
import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';
import { tripsRouter } from '../../../../functions/routers/trips.js';


describe('tripsRouterTripDetails', () => {
  function adminAuth(){
  }
  const db = {
    tripQueries: {
      getTripsForUser: function(uid){
        return trips;
      }
    }
  };

  it("GET /:id should render trip.ejs with trip details when user is logged in", () => {
    // to implement once the route behavior implementation is complete
  });

  it("GET /:id should return 401 when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'GET',
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

  it("GET /:id should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject(new Error("Some error"));
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'GET',
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

