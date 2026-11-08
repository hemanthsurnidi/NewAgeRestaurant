/**
 * Automated Integration Tests: Full HTTP Server API Routes
 * Tests all REST endpoints without requiring external network socket bindings
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { server } from '../server.js';

// Helper to simulate HTTP requests through Node's request handler
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

    // Emit request to the server
    server.emit('request', req, res);

    if (body) {
      req.emit('data', typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.emit('end');
  });
}

test('API GET /api/health returns healthy status', async () => {
  const res = await dispatchRequest({ method: 'GET', url: '/api/health' });
  assert.equal(res.statusCode, 200);
  const data = res.json();
  assert.equal(data.status, 'healthy');
  assert.equal(data.version, '1.0.0');
});

test('API GET /api/outlets returns all 17 Hyderabad locations', async () => {
  const res = await dispatchRequest({ method: 'GET', url: '/api/outlets' });
  assert.equal(res.statusCode, 200);
  const outlets = res.json();
  assert.equal(outlets.length, 17);
  const kondapur = outlets.find(o => o.slug === 'kondapur');
  assert.ok(kondapur);
  assert.equal(kondapur.city, 'Hyderabad');
  assert.equal(kondapur.min_prep_time_minutes, 25);
  assert.equal(kondapur.fssai_license, '13622014000491');
});

test('API GET /api/menu returns items with portions, add-ons and availability', async () => {
  const res = await dispatchRequest({ method: 'GET', url: '/api/menu?outlet_id=out-kondapur' });
  assert.equal(res.statusCode, 200);
  const menu = res.json();
  assert.ok(menu.length >= 8);

  const biryani = menu.find(m => m.id === 'item-chicken-dum-biryani');
  assert.ok(biryani);
  assert.equal(biryani.base_price, 380);
  assert.equal(biryani.is_veg, 0);
  assert.ok(biryani.portions.length >= 3);
});

test('API GET /api/orders returns sample seeded orders WEB-778120, WEB-778131, WEB-778146', async () => {
  const res = await dispatchRequest({ method: 'GET', url: '/api/orders' });
  assert.equal(res.statusCode, 200);
  const orders = res.json();
  assert.ok(orders.length >= 3);

  const web778120 = orders.find(o => o.id === 'WEB-778120');
  assert.ok(web778120);
  assert.equal(web778120.outlet_id, 'out-kondapur');
  assert.equal(web778120.total_amount, 1180);
  assert.ok(['PREPARING', 'READY_FOR_PICKUP'].includes(web778120.status));

  const web778131 = orders.find(o => o.id === 'WEB-778131');
  assert.ok(web778131);
  assert.equal(web778131.outlet_id, 'out-gachibowli-ck');
  assert.equal(web778131.total_amount, 640);
  assert.equal(web778131.status, 'READY_FOR_PICKUP');

  const web778146 = orders.find(o => o.id === 'WEB-778146');
  assert.ok(web778146);
  assert.equal(web778146.outlet_id, 'out-kukatpally');
  assert.equal(web778146.late_alert_triggered, 1);
});

test('API POST /api/orders successfully places order with AI prep time and loyalty cashback', async () => {
  const newOrderPayload = {
    outlet_id: 'out-kondapur',
    customer_name: 'Dr. Sameer Pasha',
    customer_phone: '+91 99000 88888',
    delivery_address: 'Plot 12, Whitefields, Kondapur, Hyderabad',
    items: [
      {
        item_id: 'item-chicken-dum-biryani',
        name: 'Chicken Dum Biryani',
        portion: 'Regular',
        quantity: 2,
        unit_price: 380,
        prep_complexity_minutes: 12
      },
      {
        item_id: 'item-double-ka-meetha',
        name: 'Double Ka Meetha',
        portion: 'Single Serving',
        quantity: 2,
        unit_price: 140,
        prep_complexity_minutes: 4
      }
    ],
    discount_code: 'DIRECT15',
    payment_method: 'UPI',
    dpdp_marketing_consent: 1
  };

  const res = await dispatchRequest({
    method: 'POST',
    url: '/api/orders',
    body: newOrderPayload
  });

  assert.equal(res.statusCode, 201);
  const data = res.json();
  assert.ok(data.order.id.startsWith('WEB-'));
  // Subtotal = 2*380 + 2*140 = 760 + 280 = 1040
  // Discount 15% on 1040 = 156 (capped at 150) -> Total = 1040 - 150 = 890
  assert.equal(data.order.subtotal, 1040);
  assert.equal(data.order.discount_amount, 150);
  assert.equal(data.order.total_amount, 890);
  assert.ok(data.prep_estimate.promised_minutes >= 25);
  assert.ok(data.notification.message_text.includes(data.order.id));
});

test('API PATCH /api/orders/:id/status updates prep stage', async () => {
  const res = await dispatchRequest({
    method: 'PATCH',
    url: '/api/orders/WEB-778120/status',
    body: { status: 'READY_FOR_PICKUP' }
  });

  assert.equal(res.statusCode, 200);
  const data = res.json();
  assert.equal(data.order.status, 'READY_FOR_PICKUP');
});

test('API GET /api/analytics returns ₹1.14 Cr savings metrics', async () => {
  const res = await dispatchRequest({ method: 'GET', url: '/api/analytics' });
  assert.equal(res.statusCode, 200);
  const data = res.json();
  assert.equal(data.projected_annual_savings, '₹1.14 Crore');
  assert.ok(data.commissions_saved > 0);
  assert.ok(data.app_fees_avoided > 0);
  assert.equal(data.outlets.length, 17);
});

test('API POST /api/party-orders validates 24h advance notice', async () => {
  // Reject order requested today (0 hours notice)
  const now = new Date();
  const invalidRes = await dispatchRequest({
    method: 'POST',
    url: '/api/party-orders',
    body: {
      customer_name: 'Faizan',
      customer_phone: '+91 98765 43210',
      email: 'faizan@example.com',
      event_date: now.toISOString().split('T')[0],
      event_time: '14:00',
      guest_count: 50,
      outlet_id: 'out-kondapur',
      requirements_text: 'Urgent 50 biryanis'
    }
  });

  assert.equal(invalidRes.statusCode, 400);
  assert.ok(invalidRes.json().error.includes('24 hours advance notice'));

  // Accept order 3 days in advance
  const future = new Date(Date.now() + 72 * 3600 * 1000);
  const validRes = await dispatchRequest({
    method: 'POST',
    url: '/api/party-orders',
    body: {
      customer_name: 'Mirza Baig',
      customer_phone: '+91 98765 43210',
      email: 'mirza@example.com',
      event_date: future.toISOString().split('T')[0],
      event_time: '19:30',
      guest_count: 50,
      outlet_id: 'out-kondapur',
      requirements_text: 'Reception dinner 50 guests'
    }
  });

  assert.equal(validRes.statusCode, 201);
  assert.ok(validRes.json().id.startsWith('PARTY-'));
});
