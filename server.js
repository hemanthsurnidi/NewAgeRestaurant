/**
 * Nizami Biryani / Nawabi Zaika - Production HTTP Server & Real-Time SSE Hub
 * Built with pure Node.js 24 native capabilities
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
  getOrders,
  getOrderById,
  createOrderRecord,
  updateOrderStatus,
  getCustomerLoyaltyBalance,
  getCouponByCode,
  createPartyOrder,
  getAllPartyOrders,
  updatePartyOrderStatus,
  getAnalyticsSummary,
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
setInterval(() => {
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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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

export const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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
      res.write('event: CONNECTED\ndata: {"status":"connected"}\n\n');
      sseClients.add(res);

      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
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
        active_sse_clients: sseClients.size
      });
    }

    if (pathname === '/api/demo-users' && req.method === 'GET') {
      return sendJson(res, 200, DEMO_USERS);
    }

    // 2. Outlets
    if (pathname === '/api/outlets' && req.method === 'GET') {
      const outlets = getAllOutlets();
      return sendJson(res, 200, outlets);
    }

    if (pathname.startsWith('/api/outlets/') && req.method === 'GET') {
      const id = pathname.split('/')[3];
      const outlet = getOutletById(id);
      if (!outlet) return sendJson(res, 404, { error: 'Outlet not found' });
      return sendJson(res, 200, outlet);
    }

    // 3. Menu
    if (pathname === '/api/menu' && req.method === 'GET') {
      const outletId = searchParams.get('outlet_id') || 'out-kondapur';
      const menu = getFullMenuForOutlet(outletId);
      return sendJson(res, 200, menu);
    }

    // Toggle Item Stock (Live 86 Item by Kitchen Lead)
    if (pathname === '/api/menu/toggle-stock' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { outlet_id, menu_item_id, is_available } = body;
      if (!outlet_id || !menu_item_id) {
        return sendJson(res, 400, { error: 'outlet_id and menu_item_id are required' });
      }

      const result = toggleOutletStock(outlet_id, menu_item_id, is_available);
      broadcastSSE('MENU_STOCK_CHANGED', { outlet_id, menu_item_id, is_available });
      return sendJson(res, 200, result);
    }

    // Update Menu Item (Central Admin CMS)
    if (pathname === '/api/menu/update-item' && req.method === 'POST') {
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

    // 6. Orders
    if (pathname === '/api/orders' && req.method === 'GET') {
      const outletId = searchParams.get('outlet_id');
      const status = searchParams.get('status');
      const phone = searchParams.get('phone');
      const orders = getOrders({ outlet_id: outletId, status, customer_phone: phone });
      return sendJson(res, 200, orders);
    }

    if (pathname.startsWith('/api/orders/') && !pathname.includes('/status') && !pathname.includes('/override') && req.method === 'GET') {
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
        dpdp_marketing_consent = 1
      } = body;

      if (!outlet_id || !customer_name || !customer_phone || !items || items.length === 0) {
        return sendJson(res, 400, { error: 'Missing required order details' });
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
        dpdp_marketing_consent: dpdp_marketing_consent ? 1 : 0
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

      const updated = updateOrderStatus(orderId, status);
      const notification = generateNotificationPreview(updated, status);

      broadcastSSE('ORDER_STATUS_CHANGED', { order: updated, notification });
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

    // 7. Loyalty Ledger
    if (pathname.startsWith('/api/loyalty/') && req.method === 'GET') {
      const phone = decodeURIComponent(pathname.split('/')[3]);
      const balance = getCustomerLoyaltyBalance(phone);
      const history = db.prepare('SELECT * FROM loyalty_ledger WHERE customer_phone = ? ORDER BY id DESC').all(phone);
      return sendJson(res, 200, { phone, balance, history });
    }

    // 8. Coupons
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

    // 9. Party & Bulk Catering Orders
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

    // 10. Central Operations & Analytics Dashboard
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
    console.log(`  NAWABI ZAIKA / NIZAMI BIRYANI DIRECT PLATFORM        `);
    console.log(`  Company A, Hyderabad - 14 Outlets & 3 Cloud Kitchens `);
    console.log(`  Server live at: http://localhost:${PORT}             `);
    console.log(`=======================================================`);
  });
}
