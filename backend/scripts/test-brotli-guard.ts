import assert from 'node:assert';
import { rejectBrotliContentEncoding } from '../src/app.js';
import type { Request, Response, NextFunction } from 'express';

function runUnitTests() {
  console.log('--- Unit Testing rejectBrotliContentEncoding middleware ---');

  // Test Case 1: 'br' encoding should be rejected with 415
  {
    let statusSet: number | null = null;
    let jsonPayload: any = null;
    let nextCalled = false;

    const req = {
      headers: {
        'content-encoding': 'br'
      }
    } as unknown as Request;

    const res = {
      status(code: number) {
        statusSet = code;
        return this;
      },
      json(body: any) {
        jsonPayload = body;
        return this;
      }
    } as unknown as Response;

    const next: NextFunction = () => {
      nextCalled = true;
    };

    rejectBrotliContentEncoding(req, res, next);

    assert.strictEqual(statusSet, 415, 'Expected status 415 for content-encoding: br');
    assert.strictEqual(jsonPayload?.code, 'BROTLI_ENCODING_REJECTED');
    assert.strictEqual(nextCalled, false, 'next() should NOT be called on rejected payload');
    console.log('✔ Case 1 Passed: Single "br" header rejected with HTTP 415');
  }

  // Test Case 2: 'brotli' or mixed case should be rejected with 415
  {
    let statusSet: number | null = null;
    let nextCalled = false;

    const req = {
      headers: {
        'content-encoding': 'Brotli'
      }
    } as unknown as Request;

    const res = {
      status(code: number) {
        statusSet = code;
        return this;
      },
      json() {
        return this;
      }
    } as unknown as Response;

    const next: NextFunction = () => {
      nextCalled = true;
    };

    rejectBrotliContentEncoding(req, res, next);

    assert.strictEqual(statusSet, 415, 'Expected status 415 for content-encoding: Brotli');
    assert.strictEqual(nextCalled, false);
    console.log('✔ Case 2 Passed: Mixed-case "Brotli" header rejected with HTTP 415');
  }

  // Test Case 3: Compound encoding ('gzip, br') should be rejected with 415
  {
    let statusSet: number | null = null;
    let nextCalled = false;

    const req = {
      headers: {
        'content-encoding': 'gzip, br'
      }
    } as unknown as Request;

    const res = {
      status(code: number) {
        statusSet = code;
        return this;
      },
      json() {
        return this;
      }
    } as unknown as Response;

    const next: NextFunction = () => {
      nextCalled = true;
    };

    rejectBrotliContentEncoding(req, res, next);

    assert.strictEqual(statusSet, 415, 'Expected status 415 for content-encoding: gzip, br');
    assert.strictEqual(nextCalled, false);
    console.log('✔ Case 3 Passed: Multi-encoding "gzip, br" header rejected with HTTP 415');
  }

  // Test Case 4: Normal 'gzip' encoding should pass through to next()
  {
    let statusSet: number | null = null;
    let nextCalled = false;

    const req = {
      headers: {
        'content-encoding': 'gzip'
      }
    } as unknown as Request;

    const res = {
      status(code: number) {
        statusSet = code;
        return this;
      },
      json() {
        return this;
      }
    } as unknown as Response;

    const next: NextFunction = () => {
      nextCalled = true;
    };

    rejectBrotliContentEncoding(req, res, next);

    assert.strictEqual(statusSet, null, 'Status should not be set for valid gzip payload');
    assert.strictEqual(nextCalled, true, 'next() should be called for valid gzip payload');
    console.log('✔ Case 4 Passed: "gzip" encoding passes cleanly to next middleware');
  }

  // Test Case 5: Standard uncompressed request (no content-encoding) passes through
  {
    let statusSet: number | null = null;
    let nextCalled = false;

    const req = {
      headers: {
        'content-type': 'application/json'
      }
    } as unknown as Request;

    const res = {
      status(code: number) {
        statusSet = code;
        return this;
      },
      json() {
        return this;
      }
    } as unknown as Response;

    const next: NextFunction = () => {
      nextCalled = true;
    };

    rejectBrotliContentEncoding(req, res, next);

    assert.strictEqual(statusSet, null);
    assert.strictEqual(nextCalled, true, 'next() should be called for normal request');
    console.log('✔ Case 5 Passed: Standard request without content-encoding passes cleanly');
  }

  // Test Case 6: Array-based header representation
  {
    let statusSet: number | null = null;
    let nextCalled = false;

    const req = {
      headers: {
        'content-encoding': ['deflate', 'br']
      }
    } as unknown as Request;

    const res = {
      status(code: number) {
        statusSet = code;
        return this;
      },
      json() {
        return this;
      }
    } as unknown as Response;

    const next: NextFunction = () => {
      nextCalled = true;
    };

    rejectBrotliContentEncoding(req, res, next);

    assert.strictEqual(statusSet, 415);
    assert.strictEqual(nextCalled, false);
    console.log('✔ Case 6 Passed: Array-based ["deflate", "br"] header rejected with HTTP 415');
  }

  console.log('\nAll 6 defense-in-depth safeguard checks passed successfully!');
}

runUnitTests();
