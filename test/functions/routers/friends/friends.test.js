import { describe, it } from 'node:test';
import assert from 'node:assert';
import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';
import { friendsRouter } from '../../../../functions/routers/friends.js';
import moment from 'moment';


describe('TestsFriendsRouter', () => {
  function adminAuth(){
  }
  const db = {
    userQueries:{
      getUserDetails: function(uid){
        return {};
      },
      getFriendsProfiles: function(profileDetails){
        return {};
      },
      getUsersMatchingSearch: function(searchString){
        return {};
      },
      addFriend: function(uid, friendID){
        return {};
      },
      removeFriend: function(uid, friendID){
        return {};
      },
      acceptFriend: function(uid, friendID){
        return {};
      }
    }
  };

  it("GET / should render profile.ejs with details when user is logged in", () => {
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
      url: '/',
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
      activeTab: "friends",
      friendsProfiles: {}
    };

    response.on("render", () => {
      // wait until event "send" is fired before checking results
      assert.strictEqual(response.statusCode, 200);
      delete response._getRenderData()["moment"]; // causes error when comparing
      assert.deepEqual(response._getRenderData(), payload);
    });

    return new Promise((resolve, reject) => {
      response.on("end", () => {
        resolve();
      });
    
      let router = friendsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });

  });
  
  it("GET / should redirect to /trips when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'GET',
      url: '/',
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("end", () => {
      assert.strictEqual(response.statusCode, 302);
    });

    let router = friendsRouter(
      adminAuth,
      db,
      getUserSessionDetails
    );
    router.handle(request, response);
  });

  it("GET / should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject({code: "Some error", message: "Some error message"});
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
      assert.deepEqual(String(response._getData()), "Some error message");
    });
    
    return new Promise((resolve, reject) => {
      response.on("end", () => {
        resolve();
      });
    
      let router = friendsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });
  });
  
  it("POST /search/:string should return status 200 when user is logged in", () => {
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
      url: '/search/somestring',
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
    
      let router = friendsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });

  });
  
  it("POST /search/:string should redirect to /auth/login when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/search/somestring',
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("end", () => {
      assert.strictEqual(response.statusCode, 302);
    });

    let router = friendsRouter(
      adminAuth,
      db,
      getUserSessionDetails
    );
    router.handle(request, response);
  });

  it("POST /search/:string should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject({code: "Some error", message: "Some error message"});
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/search/somestring',
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
    
      let router = friendsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });
  });

  it("GET /search/:string should redirect to /friends when user is logged in", () => {
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
      url: '/search/somestring',
      cookies: {
        __session: "somesessionstring"
      }
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("send", () => {
      // wait until event "send" is fired before checking results
      assert.strictEqual(response.statusCode, 302);
    });

    return new Promise((resolve, reject) => {
      response.on("end", () => {
        resolve();
      });
    
      let router = friendsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });

  });
  
  it("GET /search/:string should redirect to /auth/login when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'GET',
      url: '/search/somestring',
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("end", () => {
      assert.strictEqual(response.statusCode, 302);
    });

    let router = friendsRouter(
      adminAuth,
      db,
      getUserSessionDetails
    );
    router.handle(request, response);
  });

  it("GET /search/:string should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject({code: "Some error", message: "Some error message"});
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'GET',
      url: '/search/somestring',
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
    
      let router = friendsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });
  });
  it("POST /add should redirect to /friends when user is logged in", () => {
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
      url: '/add',
      cookies: {
        __session: "somesessionstring"
      },
      body: {
        friendID: "678"
      }
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("send", () => {
      // wait until event "send" is fired before checking results
      assert.strictEqual(response.statusCode, 302);
    });

    return new Promise((resolve, reject) => {
      response.on("end", () => {
        resolve();
      });
    
      let router = friendsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });

  });
  
  it("POST /add should redirect to /auth/login when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/add',
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("end", () => {
      assert.strictEqual(response.statusCode, 302);
    });

    let router = friendsRouter(
      adminAuth,
      db,
      getUserSessionDetails
    );
    router.handle(request, response);
  });

  it("POST /add should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject({code: "Some error", message: "Some error message"});
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/add',
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
    
      let router = friendsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });
  });
  it("DELETE /:id should redirect to /friends when user is logged in", () => {
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
      url: '/456',
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
    
      let router = friendsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });

  });
  
  it("DELETE /add should redirect to /auth/login when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'DELETE',
      url: '/456',
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("end", () => {
      assert.strictEqual(response.statusCode, 302);
    });

    let router = friendsRouter(
      adminAuth,
      db,
      getUserSessionDetails
    );
    router.handle(request, response);
  });

  it("DELETE /add should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject({code: "Some error", message: "Some error message"});
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'DELETE',
      url: '/456',
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
    
      let router = friendsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });
  });

  it("POST /accept should redirect to /friends when user is logged in", () => {
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
      url: '/accept',
      cookies: {
        __session: "somesessionstring"
      }
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("send", () => {
      // wait until event "send" is fired before checking results
      assert.strictEqual(response.statusCode, 302);
    });

    return new Promise((resolve, reject) => {
      response.on("end", () => {
        resolve();
      });
    
      let router = friendsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });

  });
  
  it("POST /accept should redirect to /auth/login when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/accept',
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("end", () => {
      assert.strictEqual(response.statusCode, 302);
    });

    let router = friendsRouter(
      adminAuth,
      db,
      getUserSessionDetails
    );
    router.handle(request, response);
  });

  it("POST /accept should send an error if anything goes wrong", () => {
    adminAuth.verifySessionCookie = function(sessionCookie, boolean){
      return Promise.resolve();
    };
    let getUserSessionDetails = function(adminAuth, request){
      return Promise.reject({code: "Some error", message: "Some error message"});
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/accept',
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
    
      let router = friendsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });
  });

});

