import { describe, it } from 'node:test';
import assert from 'node:assert';
import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';
import { settingsRouter } from '../../../../functions/routers/settings.js';
import { defaultNotifications } from "../../../../functions/config/userNotifications.js"


describe('settingsRouterUpdateSettings', () => {
  function adminAuth(){
  }

  let notifications = defaultNotifications;

  const db = {
    settingsQueries: {
      updateUserSettings: function(uid, settingName, settingValue){
        
        notifications[settingName] = settingValue;
        return notifications;
      }
    }
  };

  it("POST / should update setting when user is logged in", () => {
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
      method: 'POST',
      url: '/',
      cookies: {
        __session: "somesessionstring"
      },
      body: {
        settingName: "allParticipantsVoted",
        settingValue: false
      }
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("send", () => {
      // wait until event "send" is fired before checking results
      assert.deepEqual(response._getData(), "updated allParticipantsVoted");
      assert.strictEqual(response.statusCode, 200);
      
      
    });

    return new Promise((resolve, reject) => {
      response.on("end", () => {
        resolve();
      });
    
      let router = settingsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });
  });

  it("GET / should redirect to /auth/login when user is logged out", () => {
    function getUserSessionDetails(adminAuth, request){
      return Promise.resolve({userSessionDetails: null});
    };

    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/'
    });

    let response = httpMocks.createResponse({eventEmitter: EventEmitter});

    response.on("end", () => {
      assert.strictEqual(response.statusCode, 302);
    });

    let router = settingsRouter(
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
      return Promise.reject(new Error("Some error"));
    };
    
    // Create a mock request object
    let request = httpMocks.createRequest({
      method: 'POST',
      url: '/',
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
    
      let router = settingsRouter(
        adminAuth,
        db,
        getUserSessionDetails
      );
      router.handle(request, response);
    });
  });

});

