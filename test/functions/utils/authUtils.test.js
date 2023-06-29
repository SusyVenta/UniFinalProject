import { describe, it, mock, test } from 'node:test';
import assert from 'node:assert';
import { attachCsrfToken, getUserSessionDetails } from '../../../functions/utils/authUtils.js'; 

describe('attachCsrfToken', () => {
  it('should set the cookie value when the request URL matches', () => {
    const url = '/example-url';
    const cookie = 'csrfToken';
    const value = 'example-value';

    const req = {
      url: '/example-url',
    };

    let cookieValue = '';
    const res = {
      cookie: (name, val) => {
        cookieValue = val;
      },
    };

    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    const middleware = attachCsrfToken(url, cookie, value);
    middleware(req, res, next);

    assert.strictEqual(cookieValue, value);
    assert.strictEqual(nextCalled, true);
  });

  it('should not set the cookie value when the request URL does not match', () => {
    const url = '/example-url';
    const cookie = 'csrfToken';
    const value = 'example-value';

    const req = {
      url: '/different-url',
    };

    let cookieValue = '';
    const res = {
      cookie: (name, val) => {
        cookieValue = val;
      },
    };

    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    const middleware = attachCsrfToken(url, cookie, value);
    middleware(req, res, next);

    assert.strictEqual(cookieValue, '');
    assert.strictEqual(nextCalled, true);
  });
});


describe('getUserSessionDetails', () => {
  it('should return authenticated user session details when session cookie is valid', async () => {
    const adminAuth = {
      verifySessionCookie: mock.fn(async(sessionCookie, checkRevoked) => {
        // Mock the behavior of adminAuth.verifySessionCookie when session cookie is valid
        return {
          iss: 'example-iss',
          name: 'John Doe',
          aud: 'example-aud',
          auth_time: 1624952023,
          user_id: 'example-user-id',
          sub: 'example-sub',
          iat: 1,
          exp: 1,
          email: 'john@example.com',
          email_verified: true,
          firebase: { identities: { email: ['example-email'] }, sign_in_provider: 'password' },
          uid: 'example-uid',
        };
      }),
    };

    const request = {
      cookies: {
        __session: 'example-session-cookie',
      },
    };

    const result = await getUserSessionDetails(adminAuth, request);

    assert.strictEqual(result.errors, null);
    assert.deepStrictEqual(result.userSessionDetails, {
      iss: 'example-iss',
      name: 'John Doe',
      aud: 'example-aud',
      auth_time: 1624952023,
      user_id: 'example-user-id',
      sub: 'example-sub',
      iat: 1,
      exp: 1,
      email: 'john@example.com',
      email_verified: true,
      firebase: { identities: { email: ['example-email'] }, sign_in_provider: 'password' },
      uid: 'example-uid',
    });
  });

  it('should return null user session details when user is not authenticated', async () => {
    const adminAuth = {
      verifySessionCookie: mock.fn(async(sessionCookie, checkRevoked) => {
        // Mock the behavior of adminAuth.verifySessionCookie when session cookie is invalid or not provided
        throw new Error('Invalid session cookie');
      }),
    };

    const request = {
      cookies: {},
    };

    const result = await getUserSessionDetails(adminAuth, request);

    assert.strictEqual(result.errors, null);
    assert.strictEqual(result.userSessionDetails, null);
  });

  it('should return null user session details and an error when there is an error', async () => {
    const adminAuth = {
      verifySessionCookie: mock.fn(async(sessionCookie, checkRevoked) => {
        // Mock the behavior of adminAuth.verifySessionCookie when an error occurs
        throw new Error('Some error occurred');
      }),
    };

    const request = {
      cookies: {
        __session: 'example-session-cookie',
      },
    };

    const result = await getUserSessionDetails(adminAuth, request);

    assert.notStrictEqual(result.errors, null);
    assert.strictEqual(result.userSessionDetails, null);
  });
});
