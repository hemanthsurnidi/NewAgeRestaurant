/**
 * Automated Tests: Checkout Validation, Out-of-Stock Prevention & Mock Payments
 * Verifies business constraints:
 * - Reject checkout for 86'd unavailable products
 * - Mock payment gateway success, decline, and timeout handling
 * - Delivery radius geofence checks and nearest outlet suggestions
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { server } from '../server.js';
import { toggleOutletStock } from '../database.js';

function dispatchRequest({ method = 'GET', url = '/', body = null, headers = {} }) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.headers = { host: 'localhost:3000', ...headers };

    let resHeaders = {};
    let statusCode = 200;
    let resData = '';

    const res = {
      writeHead(code, h) {
        statusCode = code;
        resHeaders = { ...resHeaders, ...h };
      },
      setHeader(k, v) {
        resHeaders[k] = v;
      },
      write(chunk) {
        resData += chunk;
      },
      end(chunk) {
        if (chunk) resData += chunk;
        resolve({
          statusCode,
          headers: resHeaders,
          body: resData,
          json: () => JSON.parse(resData)
        });
      }
    };

    server.emit('request', req, res);

    if (body) {
      req.emit('data', typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.emit('end');
  });
}

test('Checkout Constraint: Prevents ordering items that are marked out-of-stock (86 item)', async () => {
  const targetOutlet = 'out-kondapur';
  const targetItem = 'item-mutton-haleem';

  // 1. Temporarily pause stock of Mutton Haleem at Kondapur
  toggleOutletStock(targetOutlet, targetItem, false);

  // 2. Customer tries to checkout with the unavailable Mutton Haleem
  const orderRes = await dispatchRequest({
    method: 'POST',
    url: '/api/orders',
    body: {
      outlet_id: targetOutlet,
      customer_name: 'Imran Siddiqui',
      customer_phone: '+91 97777 66666',
      delivery_address: 'Kondapur, Hyderabad',
      items: [
        {
          item_id: targetItem,
          name: 'Shahi Mutton Haleem',
          quantity: 2,
          unit_price: 350
        }
      ],
      payment_method: 'UPI'
    }
  });

  // 3. Must be rejected with 400 Bad Request
  assert.equal(orderRes.statusCode, 400);
  const errData = orderRes.json();
  assert.ok(errData.error.includes('sold out'));

  // 4. Restore stock
  toggleOutletStock(targetOutlet, targetItem, true);
});

test('Mock Payment Gateway: Handles success, banking decline, and network timeout', async () => {
  // 1. Test Successful Payment
  const successRes = await dispatchRequest({
    method: 'POST',
    url: '/api/payments/process',
    body: {
      amount: 1180,
      method: 'UPI',
      test_action: 'SUCCESS'
    }
  });

  assert.equal(successRes.statusCode, 200);
  const succData = successRes.json();
  assert.equal(succData.success, true);
  assert.equal(succData.status, 'PAID');
  assert.ok(succData.transaction_id.startsWith('TXN-UPI-'));
  assert.equal(succData.environment, 'TEST_MODE');

  // 2. Test Card Decline Simulation
  const declineRes = await dispatchRequest({
    method: 'POST',
    url: '/api/payments/process',
    body: {
      amount: 1180,
      method: 'CARD',
      test_action: 'DECLINE'
    }
  });

  assert.equal(declineRes.statusCode, 402);
  const declineData = declineRes.json();
  assert.equal(declineData.success, false);
  assert.equal(declineData.status, 'PAYMENT_DECLINED');
  assert.ok(declineData.error.includes('declined'));

  // 3. Test Gateway Timeout Simulation
  const timeoutRes = await dispatchRequest({
    method: 'POST',
    url: '/api/payments/process',
    body: {
      amount: 1180,
      method: 'UPI',
      test_action: 'TIMEOUT'
    }
  });

  assert.equal(timeoutRes.statusCode, 504);
  const timeoutData = timeoutRes.json();
  assert.equal(timeoutData.success, false);
  assert.equal(timeoutData.status, 'GATEWAY_TIMEOUT');
  assert.ok(timeoutData.error.includes('timed out'));
});

test('Delivery Radius Check: Verifies address inside vs outside delivery radius', async () => {
  // 1. Address inside Kondapur delivery radius (e.g. Kondapur Main Road)
  const insideRes = await dispatchRequest({
    method: 'POST',
    url: '/api/outlets/check-delivery',
    body: {
      address: 'Plot 15, Raghavendra Colony, Kondapur, Hyderabad',
      latitude: 17.4699,
      longitude: 78.3578
    }
  });

  assert.equal(insideRes.statusCode, 200);
  const insideData = insideRes.json();
  assert.equal(insideData.serviceable, true);
  assert.ok(insideData.recommended_outlet);
  assert.ok(insideData.serviceable_outlets.length > 0);

  // 2. Far away location outside any outlet radius (e.g. Shamshabad Airport, ~30km away)
  const outsideRes = await dispatchRequest({
    method: 'POST',
    url: '/api/outlets/check-delivery',
    body: {
      address: 'Rajiv Gandhi International Airport, Shamshabad, Hyderabad',
      latitude: 17.2403,
      longitude: 78.4294
    }
  });

  assert.equal(outsideRes.statusCode, 200);
  const outsideData = outsideRes.json();
  assert.equal(outsideData.serviceable, false);
  assert.ok(outsideData.nearest_outlet);
  assert.ok(outsideData.distance_km > 10);
  assert.ok(outsideData.message.includes('outside the'));
});

