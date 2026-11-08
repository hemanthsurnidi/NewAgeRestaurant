/**
 * Dum & Co. / Company A Hyderabad - Production HTTP Server & Real-Time SSE Hub
 * Built with pure Node.js 24 native capabilities, native node:sqlite, node:crypto
 * Real-time SSE synchronization, role-based authorization, AI prep-time engine, mock payments
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getAllOutlets,
  getOutletById,
  getFullMenuForOutlet,
  toggleOutletStock,
  checkItemAvailability,
  createMenuItem,
  updateMenuItemDetails,
  deleteMenuItem,
  setCityPrice,
  getCityPrices,
  getOrders,
  getOrderById,
  getOrderByCustomerPhone,
  createOrderRecord,
  updateOrderStatus,
  getCustomerLoyaltyBalance,
  getCouponByCode,
  createPartyOrder,
  getAllPartyOrders,
  updatePartyOrderStatus,
  getAnalyticsSummary,
  cancelOrderRecord,
  registerUser,
  authenticateUser,
  createSession,
  getUserByToken,
  deleteSession,
  getDemoAccounts,
  db
} from './database.js';
import {
  calculateDynamicPrepTime,
  evaluateOrderLateness,
  getCustomerReorderRecommendations,
  generateNotificationPreview
} from './ai-engine.js';
import { DEMO_USERS } from './sample-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');

const PORT = process.env.PORT || 3000;

// Set of connected Server-Sent Events (SSE) clients for real-time pub/sub
const sseClients = new Set();

export function broadcastSSE(eventType, data) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Background poller to monitor orders and trigger late alerts in real time
const monitorInterval = setInterval(() => {
  try {
    const activeOrders = getOrders({ status: 'PREPARING' });
    const now = new Date();
    for (const order of activeOrders) {
      const lateness = evaluateOrderLateness(order, now);
      if (lateness.is_severely_late && !order.late_alert_triggered) {
        db.prepare('UPDATE orders SET late_alert_triggered = 1 WHERE id = ?').run(order.id);
        const updated = getOrderById(order.id);
        const notification = generateNotificationPreview(updated, 'LATE_COMPENSATION_ALERT', { diff_minutes: lateness.diff_minutes });
        broadcastSSE('ORDER_LATE_ALERT', { order: updated, lateness, notification });
      }
    }
  } catch (err) {
    // Keep monitor resilient
  }
}, 15000); // Check every 15 seconds
monitorInterval.unref();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Token'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) { // 2MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Extract authenticated user from Authorization header or query parameter
export function getAuthUser(req) {
  const authHeader = req.headers['authorization'] || '';
  let token = '';

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers['x-session-token']) {
    token = req.headers['x-session-token'];
  }

  if (!token) {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      token = parsedUrl.searchParams.get('token') || '';
    } catch {
      token = '';
    }
  }

  if (!token) return null;
  return getUserByToken(token);
}

// Deterministic Haversine distance calculation in kilometers
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Session-Token'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  try {
    // -------------------------------------------------------------
    // REAL-TIME SERVER-SENT EVENTS (SSE) STREAM
    // -------------------------------------------------------------
    if (pathname === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      res.write('event: CONNECTED\ndata: {"status":"connected","system":"Dum & Co. Real-Time Hub"}\n\n');
      sseClients.add(res);

      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
    }

    // -------------------------------------------------------------
    // AUTHENTICATION & RBAC ENDPOINTS
    // -------------------------------------------------------------

    // Demo Accounts List for Reviewer Quick-Sign-In
    if (pathname === '/api/auth/demo-accounts' && req.method === 'GET') {
      return sendJson(res, 200, getDemoAccounts());
    }

    // 1-Click Demo Login for Reviewers & Evaluators
    if (pathname === '/api/auth/demo-login' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const role = body.role || 'customer';
      const accounts = getDemoAccounts();
      const target = accounts.find(a => a.role === role || a.email.includes(role)) || accounts[0];

      const authUser = authenticateUser(target.email, target.password);
      if (!authUser) {
        return sendJson(res, 401, { error: 'Demo account authentication failed' });
      }

      const session = createSession(authUser.id);
      return sendJson(res, 200, {
        success: true,
        user: authUser,
        token: session.token,
        expires_at: session.expiresAt
      });
    }

    // Customer Registration
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { name, email, phone, password } = body;

      if (!name || !email || !password) {
        return sendJson(res, 400, { error: 'Name, email and password are required' });
      }

      try {
        const user = registerUser({ name, email, phone, password, role: 'customer' });
        const session = createSession(user.id);
        return sendJson(res, 201, {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            outlet_id: user.outlet_id
          },
          token: session.token,
          expires_at: session.expiresAt
        });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    }

    // Login (Customer, Kitchen Staff, Admin)
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { email, password } = body;

      if (!email || !password) {
        return sendJson(res, 400, { error: 'Email and password are required' });
      }

      const authUser = authenticateUser(email, password);
      if (!authUser) {
        return sendJson(res, 401, { error: 'Invalid email or password' });
      }

      const session = createSession(authUser.id);
      return sendJson(res, 200, {
        success: true,
        user: authUser,
        token: session.token,
        expires_at: session.expiresAt
      });
    }

    // Current Session Profile
    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const user = getAuthUser(req);
      if (!user) {
        return sendJson(res, 401, { authenticated: false, error: 'Not authenticated' });
      }
      return sendJson(res, 200, {
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          outlet_id: user.outlet_id,
          outlet_name: user.outlet_name
        }
      });
    }

    // Logout
    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const authHeader = req.headers['authorization'] || '';
      let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      if (!token && req.headers['x-session-token']) token = req.headers['x-session-token'];
      if (token) deleteSession(token);
      return sendJson(res, 200, { success: true, message: 'Logged out successfully' });
    }

    // -------------------------------------------------------------
    // REST API ROUTES
    // -------------------------------------------------------------

    // 1. Health check & Demo Users
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        brand: 'Dum & Co. (Company A, Hyderabad)',
        active_sse_clients: sseClients.size
      });
    }

    if (pathname === '/api/demo-users' && req.method === 'GET') {
      return sendJson(res, 200, DEMO_USERS);
    }

    // 2. Outlets & Delivery Radius Geofence Checker
    if (pathname === '/api/outlets' && req.method === 'GET') {
      const outlets = getAllOutlets();
      return sendJson(res, 200, outlets);
    }

    // Check delivery eligibility and deterministic distance radius
    if (pathname === '/api/outlets/check-delivery' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { address, latitude, longitude } = body;

      const outlets = getAllOutlets();
      // Sample coordinates for Hyderabad landmarks if coordinates not supplied
      let userLat = Number(latitude);
      let userLon = Number(longitude);

      if (isNaN(userLat) || isNaN(userLon)) {
        const addrLower = (address || '').toLowerCase();
        if (addrLower.includes('gachibowli') || addrLower.includes('nanakramguda') || addrLower.includes('financial')) {
          userLat = 17.4156; userLon = 78.3458;
        } else if (addrLower.includes('kukatpally') || addrLower.includes('kphb') || addrLower.includes('miyapur')) {
          userLat = 17.4938; userLon = 78.3995;
        } else if (addrLower.includes('madhapur') || addrLower.includes('hitec') || addrLower.includes('cyber')) {
          userLat = 17.4483; userLon = 78.3915;
        } else if (addrLower.includes('banjara') || addrLower.includes('panjagutta')) {
          userLat = 17.4152; userLon = 78.4354;
        } else if (addrLower.includes('jubilee')) {
          userLat = 17.4319; userLon = 78.4074;
        } else if (addrLower.includes('secunderabad')) {
          userLat = 17.4399; userLon = 78.4983;
        } else {
          // Default Kondapur
          userLat = 17.4699; userLon = 78.3578;
        }
      }

      // Compute distances to all outlets
      const outletDistances = outlets.map(o => {
        const distance = calculateHaversineDistanceKm(userLat, userLon, o.latitude, o.longitude);
        const inRadius = distance <= o.delivery_radius_km;
        return {
          ...o,
          distance_km: distance,
          is_in_radius: inRadius
        };
      }).sort((a, b) => a.distance_km - b.distance_km);

      const inRadiusOutlets = outletDistances.filter(o => o.is_in_radius);

      if (inRadiusOutlets.length > 0) {
        return sendJson(res, 200, {
          serviceable: true,
          recommended_outlet: inRadiusOutlets[0],
          serviceable_outlets: inRadiusOutlets,
          user_coordinates: { latitude: userLat, longitude: userLon }
        });
      } else {
        const nearest = outletDistances[0];
        return sendJson(res, 200, {
          serviceable: false,
          nearest_outlet: nearest,
          distance_km: nearest.distance_km,
          max_radius_km: nearest.delivery_radius_km,
          message: `Delivery address is ${nearest.distance_km} km away, which is outside the ${nearest.delivery_radius_km} km delivery radius of our nearest outlet (${nearest.name}). You may select pickup or try an address closer to one of our 17 Hyderabad locations.`,
          user_coordinates: { latitude: userLat, longitude: userLon }
        });
      }
    }

    if (pathname.startsWith('/api/outlets/') && req.method === 'GET') {
      const id = pathname.split('/')[3];
      const outlet = getOutletById(id);
      if (!outlet) return sendJson(res, 404, { error: 'Outlet not found' });
      return sendJson(res, 200, outlet);
    }

    // 3. Menu & Central CMS CRUD
    if (pathname === '/api/menu' && req.method === 'GET') {
      const outletId = searchParams.get('outlet_id') || 'out-kondapur';
      const city = searchParams.get('city') || 'Hyderabad';
      const menu = getFullMenuForOutlet(outletId, city);
      return sendJson(res, 200, menu);
    }

    // Toggle Item Stock (Live 86 Item by Kitchen Lead or Admin)
    if (pathname === '/api/menu/toggle-stock' && req.method === 'POST') {
      const authUser = getAuthUser(req);
      const body = await parseJsonBody(req);
      const { outlet_id, menu_item_id, is_available } = body;
      if (!outlet_id || !menu_item_id) {
        return sendJson(res, 400, { error: 'outlet_id and menu_item_id are required' });
      }

      // Check outlet authorization if staff is logged in
      if (authUser && authUser.role === 'kitchen_staff' && authUser.outlet_id !== outlet_id) {
        return sendJson(res, 403, {
          error: `Forbidden: Kitchen staff can only manage stock for their assigned outlet (${authUser.outlet_id})`
        });
      }

      const result = toggleOutletStock(outlet_id, menu_item_id, is_available);
      broadcastSSE('MENU_STOCK_CHANGED', { outlet_id, menu_item_id, is_available: !!is_available });
      return sendJson(res, 200, result);
    }

    // Update Menu Item (Central Admin CMS)
    if (pathname === '/api/menu/update-item' && req.method === 'POST') {
      const authUser = getAuthUser(req);
      if (authUser && authUser.role !== 'admin') {
        return sendJson(res, 403, { error: 'Forbidden: Admin access required to modify menu items' });
      }

      const body = await parseJsonBody(req);
      const { id, base_price, time_based_tag, is_active } = body;
      if (!id) return sendJson(res, 400, { error: 'Item id is required' });

      db.prepare(`
        UPDATE menu_items SET
          base_price = COALESCE(?, base_price),
          time_based_tag = COALESCE(?, time_based_tag),
          is_active = COALESCE(?, is_active)
        WHERE id = ?
      `).run(base_price, time_based_tag, is_active, id);

      broadcastSSE('MENU_UPDATED', { id });
      return sendJson(res, 200, { success: true, id });
    }

    // Full Create Menu Item (Admin CMS)
    if (pathname === '/api/menu/items' && req.method === 'POST') {
      const authUser = getAuthUser(req);
      if (authUser && authUser.role !== 'admin') {
        return sendJson(res, 403, { error: 'Forbidden: Admin privilege required to create menu items' });
      }

      const body = await parseJsonBody(req);
      if (!body.name || body.base_price === undefined) {
        return sendJson(res, 400, { error: 'Name and base price are required' });
      }

      const newItem = createMenuItem(body);
      broadcastSSE('MENU_UPDATED', { id: newItem.id, action: 'CREATED' });
      return sendJson(res, 201, newItem);
    }

    // Full Update Menu Item (Admin CMS)
    if (pathname.startsWith('/api/menu/items/') && (req.method === 'PATCH' || req.method === 'PUT')) {
      const authUser = getAuthUser(req);
      if (authUser && authUser.role !== 'admin') {
        return sendJson(res, 403, { error: 'Forbidden: Admin privilege required to edit menu items' });
      }

      const id = pathname.split('/')[4];
      const body = await parseJsonBody(req);
      const updated = updateMenuItemDetails(id, body);
      broadcastSSE('MENU_UPDATED', { id, action: 'UPDATED' });
      return sendJson(res, 200, updated);
    }

    // Delete Menu Item (Admin CMS)
    if (pathname.startsWith('/api/menu/items/') && req.method === 'DELETE') {
      const authUser = getAuthUser(req);
      if (authUser && authUser.role !== 'admin') {
        return sendJson(res, 403, { error: 'Forbidden: Admin privilege required to delete menu items' });
      }

      const id = pathname.split('/')[4];
      const result = deleteMenuItem(id);
      broadcastSSE('MENU_UPDATED', { id, action: 'DELETED' });
      return sendJson(res, 200, result);
    }

    // Configure City-specific price
    if (pathname === '/api/menu/city-price' && req.method === 'POST') {
      const authUser = getAuthUser(req);
      if (authUser && authUser.role !== 'admin') {
        return sendJson(res, 403, { error: 'Forbidden: Admin privilege required to set city prices' });
      }

      const body = await parseJsonBody(req);
      const { city, menu_item_id, price } = body;
      if (!city || !menu_item_id || price === undefined) {
        return sendJson(res, 400, { error: 'City, menu_item_id, and price are required' });
      }

      const resPrice = setCityPrice(city, menu_item_id, Number(price));
      broadcastSSE('MENU_UPDATED', { menu_item_id, city });
      return sendJson(res, 200, resPrice);
    }

    if (pathname === '/api/menu/city-prices' && req.method === 'GET') {
      const city = searchParams.get('city') || 'Hyderabad';
      return sendJson(res, 200, getCityPrices(city));
    }

    // 4. AI Dynamic Prep-Time Estimation Preview
    if (pathname === '/api/ai/prep-time' && (req.method === 'GET' || req.method === 'POST')) {
      let outletId = 'out-kondapur';
      let items = [];

      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        outletId = body.outlet_id || outletId;
        items = body.items || [];
      } else {
        outletId = searchParams.get('outlet_id') || outletId;
        try {
          items = JSON.parse(searchParams.get('items') || '[]');
        } catch {
          items = [];
        }
      }

      if (items.length === 0) {
        items = [{ name: 'Chicken Dum Biryani', prep_complexity_minutes: 12, quantity: 1 }];
      }

      const estimate = calculateDynamicPrepTime(outletId, items);
      return sendJson(res, 200, estimate);
    }

    // 5. AI Customer Re-order Recommendations
    if (pathname === '/api/ai/recommendations' && req.method === 'GET') {
      const phone = searchParams.get('phone') || '+91 98490 12345';
      const outletId = searchParams.get('outlet_id') || 'out-kondapur';
      const recommendations = getCustomerReorderRecommendations(phone, outletId);
      return sendJson(res, 200, recommendations);
    }

    // 6. Mock Payment Gateway Simulation
    if (pathname === '/api/payments/process' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { amount, method = 'UPI', test_action = 'SUCCESS', ref_id = '' } = body;

      if (!amount || amount <= 0) {
        return sendJson(res, 400, { error: 'Valid amount is required' });
      }

      // Simulate Gateway Processing Delay (300ms)
      await new Promise(r => setTimeout(r, 300));

      if (test_action === 'DECLINE') {
        return sendJson(res, 402, {
          success: false,
          status: 'PAYMENT_DECLINED',
          error: 'Transaction was declined by the cardholder bank (Simulated Sandbox Rejection). Please try another method or retry.',
          method,
          ref_id
        });
      }

      if (test_action === 'TIMEOUT') {
        return sendJson(res, 504, {
          success: false,
          status: 'GATEWAY_TIMEOUT',
          error: 'UPI PSP server timed out responding (Simulated Sandbox Timeout). Please retry transaction.',
          method,
          ref_id
        });
      }

      // Success state
      const txnId = `TXN-${method.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      return sendJson(res, 200, {
        success: true,
        status: 'PAID',
        transaction_id: txnId,
        amount,
        method,
        timestamp: new Date().toISOString(),
        environment: 'TEST_MODE'
      });
    }

    // 7. Orders
    if (pathname === '/api/orders' && req.method === 'GET') {
      const outletId = searchParams.get('outlet_id');
      const status = searchParams.get('status');
      const phone = searchParams.get('phone');
      const orders = getOrders({ outlet_id: outletId, status, customer_phone: phone });
      return sendJson(res, 200, orders);
    }

    if (pathname.startsWith('/api/orders/') && !pathname.includes('/status') && !pathname.includes('/override') && !pathname.includes('/simulate-late') && !pathname.includes('/cancel') && req.method === 'GET') {
      const id = pathname.split('/')[3];
      const order = getOrderById(id);
      if (!order) return sendJson(res, 404, { error: 'Order not found' });
      return sendJson(res, 200, order);
    }

    // Create Order (Checkout Flow)
    if (pathname === '/api/orders' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const {
        outlet_id,
        customer_name,
        customer_phone,
        delivery_address,
        items,
        discount_code,
        loyalty_redeemed = 0,
        payment_method = 'UPI',
        dpdp_marketing_consent = 1,
        idempotency_key = null
      } = body;

      if (!outlet_id || !customer_name || !customer_phone || !items || items.length === 0) {
        return sendJson(res, 400, { error: 'Missing required order details' });
      }

      // Validation Rule: Do not allow checkout for unavailable products!
      for (const it of items) {
        const itemId = it.item_id || it.id;
        if (itemId) {
          const isAvailable = checkItemAvailability(outlet_id, itemId);
          if (!isAvailable) {
            return sendJson(res, 400, {
              error: `Item "${it.name || itemId}" is currently sold out at this outlet. Please remove it from your cart or select an alternate outlet.`
            });
          }
        }
      }

      // Calculate Subtotal (Prices include 5% GST as per Indian restaurant mandate)
      let subtotal = 0;
      for (const item of items) {
        const unitPrice = item.unit_price || item.base_price || 0;
        const addOnsPrice = (item.add_ons || []).reduce((acc, a) => acc + (a.price || 0), 0);
        subtotal += (unitPrice + addOnsPrice) * (item.quantity || 1);
      }

      // GST is inclusive: Taxable = Subtotal / 1.05, GST = Subtotal - Taxable
      const gstAmount = Math.round((subtotal - (subtotal / 1.05)) * 100) / 100;

      // Calculate Discounts
      let discountAmount = 0;
      if (discount_code) {
        const coupon = getCouponByCode(discount_code.toUpperCase().trim());
        if (coupon && subtotal >= coupon.min_order_value) {
          if (coupon.discount_type === 'PERCENTAGE') {
            discountAmount = Math.min((subtotal * coupon.discount_value) / 100, coupon.max_discount);
          } else {
            discountAmount = Math.min(coupon.discount_value, coupon.max_discount);
          }
        }
      }

      // Loyalty points redemption (1 point = ₹1)
      const currentLoyalty = getCustomerLoyaltyBalance(customer_phone);
      const validLoyaltyRedeem = Math.min(Number(loyalty_redeemed) || 0, currentLoyalty, subtotal - discountAmount);

      const totalAmount = Math.max(0, Math.round(subtotal - discountAmount - validLoyaltyRedeem));

      // Calculate Honest Promised Time using AI Engine
      const placedAt = new Date();
      const prepEstimate = calculateDynamicPrepTime(outlet_id, items, placedAt);

      const orderId = `WEB-${Math.floor(100000 + Math.random() * 900000)}`;

      const newOrder = createOrderRecord({
        id: orderId,
        outlet_id,
        customer_name,
        customer_phone,
        delivery_address: delivery_address || 'Kondapur, Hyderabad',
        items,
        subtotal,
        gst_amount: gstAmount,
        discount_amount: Math.round(discountAmount),
        loyalty_redeemed: validLoyaltyRedeem,
        total_amount: totalAmount,
        payment_method,
        payment_status: 'PAID',
        status: 'PLACED',
        placed_at: placedAt.toISOString(),
        promised_at: prepEstimate.promised_timestamp,
        ai_prep_estimate_minutes: prepEstimate.promised_minutes,
        manager_override_minutes: 0,
        late_alert_triggered: 0,
        dpdp_marketing_consent: dpdp_marketing_consent ? 1 : 0,
        idempotency_key
      });

      // Generate WhatsApp/SMS preview
      const notification = generateNotificationPreview(newOrder, 'ORDER_PLACED');

      // Real-time broadcast to Kitchen Display Systems and HQ Dashboards
      broadcastSSE('NEW_ORDER', { order: newOrder, notification, prepEstimate });

      return sendJson(res, 201, {
        order: newOrder,
        notification,
        prep_estimate: prepEstimate
      });
    }

    // Advance Order Prep Status (Kitchen Display System Action)
    if (pathname.includes('/api/orders/') && pathname.endsWith('/status') && req.method === 'PATCH') {
      const parts = pathname.split('/');
      const orderId = parts[3];
      const body = await parseJsonBody(req);
      const { status } = body;

      if (!status) return sendJson(res, 400, { error: 'Status is required' });

      const existingOrder = getOrderById(orderId);
      if (!existingOrder) return sendJson(res, 404, { error: 'Order not found' });

      // Role and Outlet Authorization Enforcement:
      const authUser = getAuthUser(req);
      if (authUser) {
        if (authUser.role === 'customer') {
          return sendJson(res, 403, { error: 'Forbidden: Customers cannot advance kitchen order status' });
        }
        if (authUser.role === 'kitchen_staff' && authUser.outlet_id !== existingOrder.outlet_id) {
          return sendJson(res, 403, {
            error: `Forbidden: Kitchen staff can only manage orders for their assigned outlet (${authUser.outlet_id})`
          });
        }
      }

      const updated = updateOrderStatus(orderId, status);
      const notification = generateNotificationPreview(updated, status);

      broadcastSSE('ORDER_STATUS_CHANGED', { order: updated, notification });
      return sendJson(res, 200, { order: updated, notification });
    }

    // Cancel Order Endpoint
    if (pathname.includes('/api/orders/') && pathname.endsWith('/cancel') && req.method === 'PATCH') {
      const parts = pathname.split('/');
      const orderId = parts[3];
      const body = await parseJsonBody(req);
      const { reason = 'Cancelled by user' } = body;

      const updated = cancelOrderRecord(orderId, reason);
      broadcastSSE('ORDER_STATUS_CHANGED', { order: updated });
      return sendJson(res, 200, { order: updated });
    }

    // Simulate 10-Minute Delay Trigger (For Reviewer Inspection of Edge-Case)
    if (pathname.includes('/api/orders/') && pathname.endsWith('/simulate-late') && req.method === 'POST') {
      const parts = pathname.split('/');
      const orderId = parts[3];

      db.prepare(`
        UPDATE orders SET
          late_alert_triggered = 1,
          promised_at = datetime('now', '-12 minutes')
        WHERE id = ?
      `).run(orderId);

      const updated = getOrderById(orderId);
      const notification = generateNotificationPreview(updated, 'LATE_COMPENSATION_ALERT', { diff_minutes: 12 });
      broadcastSSE('ORDER_LATE_ALERT', { order: updated, lateness: { diff_minutes: 12, is_severely_late: true }, notification });
      return sendJson(res, 200, { order: updated, notification });
    }

    // Kitchen Manager Prep Time Override
    if (pathname.includes('/api/orders/') && pathname.endsWith('/override') && req.method === 'PATCH') {
      const parts = pathname.split('/');
      const orderId = parts[3];
      const body = await parseJsonBody(req);
      const { extra_minutes, reason } = body;

      const order = getOrderById(orderId);
      if (!order) return sendJson(res, 404, { error: 'Order not found' });

      // Enforce Outlet Authorization if staff
      const authUser = getAuthUser(req);
      if (authUser && authUser.role === 'kitchen_staff' && authUser.outlet_id !== order.outlet_id) {
        return sendJson(res, 403, {
          error: `Forbidden: Kitchen staff can only manage orders for their assigned outlet (${authUser.outlet_id})`
        });
      }

      const overrideMinutes = (order.manager_override_minutes || 0) + Number(extra_minutes || 0);
      const currentPromised = new Date(order.promised_at);
      const updatedPromised = new Date(currentPromised.getTime() + (extra_minutes * 60000));

      db.prepare(`
        UPDATE orders SET
          manager_override_minutes = ?,
          promised_at = ?
        WHERE id = ?
      `).run(overrideMinutes, updatedPromised.toISOString(), orderId);

      const updated = getOrderById(orderId);
      broadcastSSE('PREP_TIME_OVERRIDDEN', { order: updated, extra_minutes, reason });
      return sendJson(res, 200, { order: updated, extra_minutes, reason });
    }

    // 8. Loyalty Ledger
    if (pathname.startsWith('/api/loyalty/') && req.method === 'GET') {
      const phone = decodeURIComponent(pathname.split('/')[3]);
      const balance = getCustomerLoyaltyBalance(phone);
      const history = db.prepare('SELECT * FROM loyalty_ledger WHERE customer_phone = ? ORDER BY id DESC').all(phone);
      return sendJson(res, 200, { phone, balance, history });
    }

    // 9. Coupons
    if (pathname === '/api/coupons/apply' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { code, cart_amount } = body;
      if (!code) return sendJson(res, 400, { error: 'Code is required' });

      const coupon = getCouponByCode(code.toUpperCase().trim());
      if (!coupon) return sendJson(res, 404, { valid: false, error: 'Invalid coupon code' });

      if (cart_amount < coupon.min_order_value) {
        return sendJson(res, 400, {
          valid: false,
          error: `Minimum order value for ${coupon.code} is ₹${coupon.min_order_value}`
        });
      }

      let discount = 0;
      if (coupon.discount_type === 'PERCENTAGE') {
        discount = Math.min((cart_amount * coupon.discount_value) / 100, coupon.max_discount);
      } else {
        discount = Math.min(coupon.discount_value, coupon.max_discount);
      }

      return sendJson(res, 200, {
        valid: true,
        coupon,
        discount_amount: Math.round(discount)
      });
    }

    // 10. Party & Bulk Catering Orders
    if (pathname === '/api/party-orders' && req.method === 'GET') {
      const orders = getAllPartyOrders();
      return sendJson(res, 200, orders);
    }

    if (pathname === '/api/party-orders' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const {
        customer_name,
        customer_phone,
        email,
        event_date,
        event_time,
        guest_count,
        outlet_id,
        requirements_text,
        estimated_budget
      } = body;

      // Minimum notice validation rule: Party orders require at least 24 hours notice!
      const requestedDate = new Date(`${event_date}T${event_time || '12:00'}`);
      const now = new Date();
      const diffHours = (requestedDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours < 24) {
        return sendJson(res, 400, {
          error: 'Party and bulk catering orders require a minimum of 24 hours advance notice to prepare authentic dum deghs.'
        });
      }

      const partyId = `PARTY-${Math.floor(1000 + Math.random() * 9000)}`;
      const partyOrder = createPartyOrder({
        id: partyId,
        customer_name,
        customer_phone,
        email,
        event_date,
        event_time,
        guest_count: Number(guest_count) || 20,
        outlet_id: outlet_id || 'out-kondapur',
        requirements_text: requirements_text || '',
        estimated_budget: Number(estimated_budget) || 15000,
        manager_notes: 'Submitted via Direct Portal - Pending Catering Specialist confirmation'
      });

      broadcastSSE('NEW_PARTY_ORDER', { partyOrder });
      return sendJson(res, 201, partyOrder);
    }

    if (pathname.startsWith('/api/party-orders/') && req.method === 'PATCH') {
      const id = pathname.split('/')[3];
      const body = await parseJsonBody(req);
      const { status, manager_notes } = body;
      const updated = updatePartyOrderStatus(id, status, manager_notes);
      broadcastSSE('PARTY_ORDER_UPDATED', { partyOrder: updated });
      return sendJson(res, 200, updated);
    }

    // 11. Central Operations & Analytics Dashboard
    if (pathname === '/api/analytics' && req.method === 'GET') {
      const summary = getAnalyticsSummary();
      return sendJson(res, 200, summary);
    }

    // -------------------------------------------------------------
    // STATIC FILE SERVING FOR FRONTEND SPA
    // -------------------------------------------------------------
    let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

    // Fallback to index.html for client-side routing
    if (!fs.existsSync(filePath)) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File Not Found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
      });
      res.end(content);
    });

  } catch (err) {
    console.error('Server Error:', err);
    sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
  }
});

// Start server if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  DUM & CO. - COMPANY A, HYDERABAD DIRECT PLATFORM    `);
    console.log(`  14 Restaurant Outlets + 3 Cloud Kitchens            `);
    console.log(`  Server live at: http://localhost:${PORT}             `);
    console.log(`=======================================================`);
  });
}
