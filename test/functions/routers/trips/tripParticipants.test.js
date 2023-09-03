import { describe, it } from 'node:test';
import assert from 'node:assert';
import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';
import { tripsRouter } from '../../../../functions/routers/trips.js';
import moment from 'moment';


describe('tripsRouterTripParticipants', () => {
  function adminAuth(){
  }
  const db = {
    tripQueries: {
      getTripByID: function(tripID){
        let tripDetails = {
          datesPreferences: {},
          participantsStatus: {
            "user_123": {},

          }
        }
        return tripDetails;
      },
      getUsernamesForUIDsInTrip: function(tripID){
        return {};
      }
    },
    userQueries:{
      getUserDetails: function(uid){
        return {};
      },
      getFriendsProfiles: function(profileDetails){
        return {};
      }
    }
  };

  it("GET /:id/participants should render trip.ejs with trip participants details when user is logged in", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: 
        {
          uid: "user_123",
          name: "John Doe"
        }
      });
    };
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'GET',
      url: '/123/participants',
      cookies: {
        __session: "somesessionstring"
      }
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    let payload = {
      name: "John Doe", 
      trip: {}, 
      userIsAuthenticated: true,
      moment: moment,
      userIDUsernameMap: {},
      commonAvailabilities: [],
      userID: "user_123",
      profileDetails: {},
      friendsProfiles: {},
      tripID: "123"
    };

    response.on("render", () => {
      // wait until event "send" is fired before checking results
      assert.strictEqual(response.statusCode, 200);
      assert.deepEqual(response._getRenderData(), payload);
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

  it("GET /:id/participants should redirect to /trips when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'GET',
      url: '/123/participants',
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("end", () => {
      assert.strictEqual(response.statusCode, 302);
    });

    let router = tripsRouter(
      adminAuth,
      db,
      getUserSessionDetails
    );
    router.handle(request, response);
  });

  it("GET /:id/participants should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject({code: "Some error", message: "Some error message"});
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'GET',
      url: '/123/participants',
      cookies: {
        __session: "somesessionstring"
      }
    });
    
    let response = httpMocks.createResponse({eventEmitter: EventEmitter});
    
    response.on("send", () => {
      // wait until event "send" is fired before checking results
      assert.strictEqual(response.statusCode, 500);
      assert.deepEqual(String(response._getData()), "Some error message");
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

  it("POST /:id/participants should return status 200 when user is logged in", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: 
        {
          uid: "user_123",
          name: "John Doe"
        }
      });
    };
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/123/participants',
      cookies: {
        __session: "somesessionstring"
      }
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("send", () => {
      // wait until event "send" is fired before checking results
      assert.strictEqual(response.statusCode, 200);
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

  it("POST /:id/participants should redirect to /auth/login when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/123/participants',
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("end", () => {
      assert.strictEqual(response.statusCode, 302);
    });

    let router = tripsRouter(
      adminAuth,
      db,
      getUserSessionDetails
    );
    router.handle(request, response);
  });

  it("POST /:id/participants should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject({code: "Some error", message: "Some error message"});
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/123/participants',
      cookies: {
        __session: "somesessionstring"
      }
    });
    
    let response = httpMocks.createResponse({eventEmitter: EventEmitter});
    
    response.on("send", () => {
      // wait until event "send" is fired before checking results
      assert.strictEqual(response.statusCode, 500);
      assert.deepEqual(String(response._getData()), "Some error message");
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

