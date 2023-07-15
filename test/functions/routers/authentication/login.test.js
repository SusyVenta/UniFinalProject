import { describe, it } from 'node:test';
import assert from 'node:assert';
import { authenticationRouter } from '../../../../functions/routers/authentication.js';
import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';


describe('authenticationRouter', () => {
    const db = {
        userQueries: {
          createUser: function(user, name){
            return true
          }
        }
    }

    it("GET /login should render authentication.ejs with the correct payload", () => {
        let request  = httpMocks.createRequest({
            method: 'GET',
            url: '/login'
        });
    
        let response = httpMocks.createResponse({eventEmitter: EventEmitter});

        let payload = {authType: "login", statusCode: null, authInfoMessage: null, authInfoTitle: null};

        response.on("render", () => {
        // wait until event "render" is fired before checking results
            assert.strictEqual(response.statusCode, 200);
            assert.deepEqual(response._getRenderData(), payload);
        });

        let router = authenticationRouter({}, {}, db);
        router.handle(request, response);
      });
});
