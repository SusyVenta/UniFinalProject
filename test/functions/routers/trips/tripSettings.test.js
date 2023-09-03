import { describe, it } from 'node:test';
import assert from 'node:assert';
import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';
import { tripsRouter } from '../../../../functions/routers/trips.js';
import moment from 'moment';


describe('tripsRouterTripSettings', () => {
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
        return Promise.resolve(tripDetails);
      },
      getUsernamesForUIDsInTrip: function(tripID){
        return Promise.resolve({});
      },
      getUsernamesAndPicturesForUIDsInTrip: function(tripID){
        return Promise.resolve({});
      }
    },
    userQueries:{
      getUserDetails: function(uid){
        return {};
      },
      getFriendsProfiles: function(profileDetails){
        return {};
      }
    },
    tripItineraryQueries: {
      createOrModifyEvent: function(tripID, requestBody, uid){
        return true;
      },
      removeTripEvent: function(tripID, eventID){
        return true;
      }
    },
    tripPollQueries: {
      createOrModifyPoll: function(tripID, requestBody, uid){
        return true;
      },
      removeTripPoll: function(tripID, pollID){
        return true;
      },
      getPollDetails: function(tripID, pollID){
        return true;
      }
    }
  };

  it("GET /:id/settings should render tripSettings.ejs with details when user is logged in", () => {
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
      url: '/123/settings',
      cookies: {
        __session: "somesessionstring"
      }
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    let payload = {
      name: "John Doe", 
      trip: {}, 
      userIsAuthenticated: true,
      userIDUsernameMap: {},
      userID: "user_123",
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
  
  it("GET /:id/settings should redirect to /trips when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'GET',
      url: '/123/settings',
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

  it("GET /:id/settings should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject({code: "Some error", message: "Some error message"});
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'GET',
      url: '/123/settings',
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

