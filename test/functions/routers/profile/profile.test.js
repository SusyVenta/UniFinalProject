import { describe, it } from 'node:test';
import assert from 'node:assert';
import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';
import { profileRouter } from '../../../../functions/routers/profile.js';
import moment from 'moment';


describe('profile', () => {
  function adminAuth(){
  }
  const db = {
    userQueries: {
      getUserDetails: function(uid){
        return {};
      },
      getFriendsProfiles: function(profileDetails){
        return {};
      },
      updateProfile: function(profileDetails){
        return true;
      },
    },
    deleteDocument: function(trips, uid){
      return true;
    },
    updateDocumentRemoveFromArray: function(users, uid, data){
      return true;
    }
  };

  it("GET /:id should render profile.ejs with details when user is logged in", () => {
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
      url: '/123',
      cookies: {
        __session: "somesessionstring"
      }
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    let payload = {
      profileDetails: {},
      userIsAuthenticated: true,
      userID: "user_123",
      friendsSearchResult: null,
      activeTab: "profileDetails",
      friendsProfiles: {}
    };

    response.on("render", () => {
      // wait until event "render" is fired before checking results
      assert.strictEqual(response.statusCode, 200);
      delete response._getRenderData()["moment"]; // causes error when comparing
      assert.deepEqual(response._getRenderData(), payload);
    });

    return new Promise((resolve, reject) => {
      response.on("end", () => {
        resolve();
      });
    
      let router = profileRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });

  });
  
  it("GET /:id should redirect to /auth/login when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'GET',
      url: '/123',
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("end", () => {
      assert.strictEqual(response.statusCode, 302);
    });

    let router = profileRouter(
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
      return Promise.reject({code: "Some error", message: "Some error message"});
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
      assert.deepEqual(String(response._getData()), "Some error message");
    });
    
    return new Promise((resolve, reject) => {
      response.on("end", () => {
        resolve();
      });
    
      let router = profileRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });
  });

  it("DELETE /:id should return status 200 when user is logged in", () => {
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
    });

    return new Promise((resolve, reject) => {
      response.on("end", () => {
        resolve();
      });
    
      let router = profileRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });

  });
  
  it("DELETE /:id should redirect to /auth/login when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'DELETE',
      url: '/123',
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("end", () => {
      assert.strictEqual(response.statusCode, 302);
    });

    let router = profileRouter(
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
      return Promise.reject({code: "Some error", message: "Some error message"});
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
      assert.deepEqual(String(response._getData()), "Some error message");
    });
    
    return new Promise((resolve, reject) => {
      response.on("end", () => {
        resolve();
      });
    
      let router = profileRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });
  });
  it("POST /:id should return status 200 when user is logged in", () => {
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
      url: '/123',
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
    
      let router = profileRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });

  });
  
  it("POST /:id should redirect to /auth/login when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/123',
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("end", () => {
      assert.strictEqual(response.statusCode, 302);
    });

    let router = profileRouter(
      adminAuth,
      db,
      getUserSessionDetails
    );
    router.handle(request, response);
  });

  it("POST /:id should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject({code: "Some error", message: "Some error message"});
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/123',
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
    
      let router = profileRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });
  });
  /*
  it("POST /:tripId/polls/new should return status 200 when user is logged in", () => {
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
      url: '/123/polls/new',
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
  
  it("POST /:tripId/polls/new should redirect to /auth/login when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/123/polls/new',
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

  it("POST /:tripId/polls/new should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject({code: "Some error", message: "Some error message"});
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/123/polls/new',
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

  it("DELETE /:tripId/polls/:pollID should return status 200 when user is logged in", () => {
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
      method: 'DELETE',
      url: '/123/polls/456',
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
  
  it("DELETE /:tripId/polls/:pollID should redirect to /auth/login when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'DELETE',
      url: '/123/polls/456',
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

  it("DELETE /:tripId/polls/:pollID should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject({code: "Some error", message: "Some error message"});
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'DELETE',
      url: '/123/polls/456',
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

  it("POST /:tripId/polls/:pollID should return status 200 when user is logged in", () => {
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
      url: '/123/polls/456',
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
  
  it("POST /:tripId/polls/:pollID should redirect to /auth/login when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/123/polls/456',
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

  it("POST /:tripId/polls/:pollID should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject({code: "Some error", message: "Some error message"});
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/123/polls/456',
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

  it("GET /:tripId/polls/:pollID should render tripPolls.ejs with details when user is logged in", () => {
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
      url: '/123/polls/456',
      cookies: {
        __session: "somesessionstring"
      }
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    let payload = {
      name: "John Doe", 
      trip: {"datesPreferences":{},"participantsStatus":{"user_123":{}}}, 
      userIsAuthenticated: true,
      userIDUsernameMap: {},
      commonAvailabilities: [],
      userID: "user_123",
      profileDetails: {},
      friendsProfiles: {},
      tripID: "123",
      pollToOpen: null,
      answerPoll: "yes",
      pollData: true,
      pollID: "456",
      tripParticipantsUIDsPictures: "{}"
    };

    response.on("render", () => {
      // wait until event "render" is fired before checking results
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
  
  it("GET /:tripId/polls/:pollID should redirect to /trips when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'GET',
      url: '/123/polls/456',
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

  it("GET /:tripId/polls/:pollID should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject({code: "Some error", message: "Some error message"});
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'GET',
      url: '/123/polls/456',
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
*/
});

