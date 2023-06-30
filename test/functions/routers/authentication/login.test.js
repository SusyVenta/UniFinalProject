import { describe, it, mock, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { authenticationRouter } from '../../../../functions/routers/authentication.js';
import sinon from 'sinon';
import httpMocks from 'node-mocks-http';

describe('authenticationRouter', () => {
    var response;
    
    beforeEach(function() {
        response = httpMocks.createResponse();
        sinon.spy(response, 'render');
      });
    
      afterEach(function() {
        response.render.restore();
        response = null;
      });

    it("GET /login should render authentication.ejs with the correct payload", () => {
        let request  = httpMocks.createRequest({
            method: 'GET',
            url: '/login'
        });
    
        let response = httpMocks.createResponse();
        sinon.spy(response, 'emit');

        let payload = {authType: "login", statusCode: null, authInfoMessage: null, authInfoTitle: null};

        let router = authenticationRouter({}, {});
        router.handle(request, response);

        assert.strictEqual(response.statusCode, 200);
        assert.deepEqual(response._getRenderData(), payload);
    });
});
