import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';
import { legalRouter } from '../../../../functions/routers/legal.js';


describe('privacyRouter', () => {
  it("GET /legal/privacy should render generic.ejs with privacy content", () => {
      let request = httpMocks.createRequest({
        method: 'GET',
        url: '/privacy'
      });

      let response = httpMocks.createResponse({eventEmitter: EventEmitter});

      let payload = {partialTitle: "privacy", title: "Privacy Policy"};

      response.on("render", () => {
        assert.strictEqual(response.statusCode, 200);
        assert.deepEqual(response._getRenderData(), payload);
      });

      let router = legalRouter();
      router.handle(request, response);
    });

    it("GET /legal/terms should render generic.ejs with terms and conditions content", () => {
      let request = httpMocks.createRequest({
        method: 'GET',
        url: '/terms'
      });

      let response = httpMocks.createResponse({eventEmitter: EventEmitter});

      let payload = {partialTitle: "termsAndConditions", title: "Terms and Conditions"};

      response.on("render", () => {
        assert.strictEqual(response.statusCode, 200);
        assert.deepEqual(response._getRenderData(), payload);
      });

      let router = legalRouter();
      router.handle(request, response);
    });
});

