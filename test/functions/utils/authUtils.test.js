import { describe, it, mock, test } from 'node:test';
import assert from 'node:assert';

test('synchronous passing test', (t) => {
    // This test passes because it does not throw an exception.
    assert.strictEqual(1, 1);
});

test('asynchronous passing test', async (t) => {
    // This test passes because the Promise returned by the async
    // function is not rejected.
    assert.strictEqual(1, 1);
});

describe('A thing', () => {
    it('should work', () => {
        assert.strictEqual(1, 1);
    });

    it('should be ok', () => {
        assert.strictEqual(2, 2);
    });

});

test('spies on a function', () => {
    const sum = mock.fn((a, b) => {
      return a + b;
    });
  
    assert.strictEqual(sum.mock.calls.length, 0);
    assert.strictEqual(sum(3, 4), 7);
    assert.strictEqual(sum.mock.calls.length, 1);
  
    const call = sum.mock.calls[0];
    assert.deepStrictEqual(call.arguments, [3, 4]);
    assert.strictEqual(call.result, 7);
    assert.strictEqual(call.error, undefined);
  
    // Reset the globally tracked mocks.
    mock.reset();
  });