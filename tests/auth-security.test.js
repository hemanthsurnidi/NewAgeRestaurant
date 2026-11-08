/**
 * Automated Tests: Authentication, Password Hashing, Session Management & RBAC
 * Verifies secure scrypt hashing, session issuance, role-based guards, and outlet data isolation
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { server } from '../server.js';
import { hashPassword, verifyPassword, registerUser, authenticateUser, createSession, getUserByToken } from '../database.js';

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

test('Security: Native scrypt password hashing and verification', () => {
  const plainPassword = 'BiryaniMaster@2026';
  const { hash, salt } = hashPassword(plainPassword);

  assert.ok(hash && hash.length === 128); // 64 bytes in hex
  assert.ok(salt && salt.length === 32);  // 16 bytes in hex

  // Verify correct password
  assert.equal(verifyPassword(plainPassword, hash, salt), true);

  // Verify wrong password fails
  assert.equal(verifyPassword('WrongPassword@123', hash, salt), false);
});

test('Auth API: User registration and token session creation', async () => {
  const uniqueEmail = `test.guest.${Date.now()}@example.com`;
  const res = await dispatchRequest({
    method: 'POST',
    url: '/api/auth/register',
    body: {
      name: 'Dr. Tariq Anwar',
      email: uniqueEmail,
      phone: '+91 98888 77777',
      password: 'StrongSecret@123'
    }
  });

  assert.equal(res.statusCode, 201);
  const data = res.json();
  assert.ok(data.success);
  assert.ok(data.token && data.token.length === 64);
  assert.equal(data.user.email, uniqueEmail.toLowerCase());
  assert.equal(data.user.role, 'customer');
});

test('Auth API: Login with valid credentials vs invalid credentials', async () => {
  // 1. Valid customer demo account login
  const validRes = await dispatchRequest({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email: 'customer@dumco.in',
      password: 'Customer@123'
    }
  });

  assert.equal(validRes.statusCode, 200);
  const validData = validRes.json();
  assert.ok(validData.success);
  assert.equal(validData.user.role, 'customer');
  assert.ok(validData.token);

  // 2. Invalid password
  const invalidRes = await dispatchRequest({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email: 'customer@dumco.in',
      password: 'IncorrectPassword'
    }
  });

  assert.equal(invalidRes.statusCode, 401);
  assert.ok(invalidRes.json().error.includes('Invalid email or password'));
});

test('Auth API: GET /api/auth/me returns authenticated user profile', async () => {
  // First login as Chef Mohammed Qasim (Kondapur kitchen)
  const loginRes = await dispatchRequest({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email: 'kondapur@dumco.in',
      password: 'Kitchen@123'
    }
  });

  const { token, user } = loginRes.json();

  // Now call /api/auth/me with Bearer token
  const meRes = await dispatchRequest({
    method: 'GET',
    url: '/api/auth/me',
    headers: { authorization: `Bearer ${token}` }
  });

  assert.equal(meRes.statusCode, 200);
  const meData = meRes.json();
  assert.equal(meData.authenticated, true);
  assert.equal(meData.user.role, 'kitchen_staff');
  assert.equal(meData.user.outlet_id, 'out-kondapur');
});

test('RBAC & Outlet Isolation: Kitchen staff cannot update orders of another outlet', async () => {
  // Login as Gachibowli kitchen staff (out-gachibowli-ck)
  const loginRes = await dispatchRequest({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email: 'gachibowli@dumco.in',
      password: 'Kitchen@123'
    }
  });
  const gachibowliToken = loginRes.json().token;

  // Try to update WEB-778120 which belongs to Kondapur Flagship (out-kondapur)
  const attemptRes = await dispatchRequest({
    method: 'PATCH',
    url: '/api/orders/WEB-778120/status',
    headers: { authorization: `Bearer ${gachibowliToken}` },
    body: { status: 'READY_FOR_PICKUP' }
  });

  // Must be rejected with 403 Forbidden!
  assert.equal(attemptRes.statusCode, 403);
  assert.ok(attemptRes.json().error.includes('Forbidden: Kitchen staff can only manage orders for their assigned outlet'));
});

test('RBAC: Customers cannot modify menu or advance kitchen status', async () => {
  // Login as customer
  const custLogin = await dispatchRequest({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email: 'customer@dumco.in',
      password: 'Customer@123'
    }
  });
  const customerToken = custLogin.json().token;

  // Attempt to advance kitchen status
  const kitchenStatusRes = await dispatchRequest({
    method: 'PATCH',
    url: '/api/orders/WEB-778120/status',
    headers: { authorization: `Bearer ${customerToken}` },
    body: { status: 'COMPLETED' }
  });
  assert.equal(kitchenStatusRes.statusCode, 403);

  // Attempt to create menu item
  const menuCreateRes = await dispatchRequest({
    method: 'POST',
    url: '/api/menu/items',
    headers: { authorization: `Bearer ${customerToken}` },
    body: { name: 'Unauthorized Biryani', base_price: 500 }
  });
  assert.equal(menuCreateRes.statusCode, 403);
});

test('RBAC: Admin has central permission to create and delete menu items', async () => {
  // Login as Admin Zafar Khan
  const adminLogin = await dispatchRequest({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email: 'admin@dumco.in',
      password: 'Admin@123'
    }
  });
  const adminToken = adminLogin.json().token;

  // 1. Create special festival menu item
  const createRes = await dispatchRequest({
    method: 'POST',
    url: '/api/menu/items',
    headers: { authorization: `Bearer ${adminToken}` },
    body: {
      name: 'Nizami Zaffrani Biryani (Special)',
      category: 'Specialties',
      description: 'Slow-dum aged basmati infused with Kashmiri saffron and tender spring mutton.',
      base_price: 490,
      is_veg: 0,
      spice_level: 'Medium',
      prep_complexity_minutes: 16
    }
  });

  assert.equal(createRes.statusCode, 201);
  const created = createRes.json();
  assert.ok(created.id);
  assert.equal(created.base_price, 490);

  // 2. Clean up / delete the item
  const deleteRes = await dispatchRequest({
    method: 'DELETE',
    url: `/api/menu/items/${created.id}`,
    headers: { authorization: `Bearer ${adminToken}` }
  });

  assert.equal(deleteRes.statusCode, 200);
  assert.ok(deleteRes.json().success);
});
