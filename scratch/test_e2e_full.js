/**
 * Complete End-to-End Test Suite for Company A Hyderabad Direct Platform
 * Tests all flows requested by reviewer in-process via dispatchRequest:
 * 1. Outlet verification & 14-digit FSSAI compliance
 * 2. Order placement & AI prep-time calculation
 * 3. Order routing to specific restaurant kitchen & isolation
 * 4. Kitchen visibility & stage transitions (PLACED -> PREPARING -> READY_FOR_PICKUP -> DISPATCHED)
 * 5. Customer tracking & real-time notification messages
 * 6. Edge cases: 10-minute lateness alert & compensation coupon
 * 7. Bulk / Party order submission, Admin review desk, approval & KDS sync
 * 8. Cancellation workflow
 * 9. Analytics & profit recovery ledger
 */

import { EventEmitter } from 'node:events';
import { server } from '../server.js';

function dispatchRequest({ method = 'GET', url = '/', body = null, headers = {} }) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.headers = { host: 'localhost:5000', 'content-type': 'application/json', ...headers };

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
          json: () => {
            try {
              return JSON.parse(resData);
            } catch (e) {
              return resData;
            }
          }
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

async function runTests() {
  console.log('================================================================');
  console.log('  COMPANY A HYDERABAD - COMPLETE E2E VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Outlets & FSSAI Verification
    console.log('--- 1. Outlets & 14-Digit FSSAI Compliance ---');
    const outletsRes = await dispatchRequest({ method: 'GET', url: '/api/outlets' });
    assert(outletsRes.statusCode === 200, 'GET /api/outlets returned HTTP 200');
    const outlets = outletsRes.json();
    assert(Array.isArray(outlets) && outlets.length === 17, `Returned exactly 17 Hyderabad outlets (got ${outlets.length})`);
    
    const dineInCount = outlets.filter(o => o.is_cloud_kitchen === 0).length;
    const cloudCount = outlets.filter(o => o.is_cloud_kitchen === 1).length;
    assert(dineInCount === 14 && cloudCount === 3, `14 Dine-in (${dineInCount}) + 3 Cloud Kitchens (${cloudCount})`);

    const allHaveFssai = outlets.every(o => o.fssai_license && /^\d{14}$/.test(o.fssai_license));
    assert(allHaveFssai, 'Every outlet displays a valid 14-digit FSSAI license');

    // 2. Menu Query
    console.log('\n--- 2. Menu Catalog & 5% GST Pricing ---');
    const menuRes = await dispatchRequest({ method: 'GET', url: '/api/menu?outlet_id=out-kondapur' });
    const menu = menuRes.json();
    assert(Array.isArray(menu) && menu.length >= 10, `Menu returned ${menu.length} items`);
    const biryaniItem = menu.find(m => m.id === 'item-chicken-dum-biryani');
    assert(biryaniItem && biryaniItem.base_price > 0, `Chicken Biryani found with base price ₹${biryaniItem?.base_price} (incl 5% GST)`);

    // 3. Order Placement & AI Prep-Time Routing
    console.log('\n--- 3. Order Placement & Kitchen Routing ---');
    const testPhone = '+91 98490 88888';
    const orderPayload = {
      outlet_id: 'out-kondapur',
      customer_name: 'Vikram Reddy',
      customer_phone: testPhone,
      delivery_address: 'Flat 402, Royal Palms, Kondapur, Hyderabad - 500084',
      items: [
        {
          item_id: biryaniItem.id,
          name: biryaniItem.name,
          portion: 'Regular Handi (1-2 Persons)',
          unit_price: biryaniItem.base_price,
          quantity: 2,
          add_ons: [{ name: 'Extra Mirchi Ka Salan', price: 35 }]
        },
        {
          item_id: 'item-double-ka-meetha',
          name: 'Double Ka Meetha (Pure Ghee)',
          portion: 'Single Portion',
          unit_price: 180,
          quantity: 1,
          add_ons: []
        }
      ],
      payment_method: 'UPI',
      dpdp_marketing_consent: 1
    };

    const placeRes = await dispatchRequest({
      method: 'POST',
      url: '/api/orders',
      body: orderPayload
    });
    assert(placeRes.statusCode === 201, `POST /api/orders returned HTTP 201`);
    const placedData = placeRes.json();
    const placedOrder = placedData.order;
    assert(placedOrder && placedOrder.id, `Order placed successfully with ID: ${placedOrder?.id}`);
    assert(placedOrder.outlet_id === 'out-kondapur', `Order correctly routed to target outlet: ${placedOrder.outlet_id}`);
    assert(placedOrder.ai_prep_estimate_minutes >= 20, `AI prep time calculated: ${placedOrder.ai_prep_estimate_minutes} minutes`);
    assert(placedOrder.status === 'PLACED', `Initial status is PLACED (got ${placedOrder.status})`);
    assert(placedOrder.dpdp_marketing_consent === 1, 'DPDP Act 2023 marketing consent recorded');

    // 4. Restaurant KDS Visibility & Isolation
    console.log('\n--- 4. Restaurant KDS Visibility & Outlet Isolation ---');
    // Kondapur KDS query
    const kondapurKdsRes = await dispatchRequest({ method: 'GET', url: '/api/orders?outlet_id=out-kondapur' });
    const kondapurOrders = kondapurKdsRes.json();
    const foundInKondapur = kondapurOrders.find(o => o.id === placedOrder.id);
    assert(Boolean(foundInKondapur), `Order #${placedOrder.id} is visible in Kondapur Kitchen KDS`);

    // Ameerpet KDS query (should NOT see Kondapur order)
    const ameerpetKdsRes = await dispatchRequest({ method: 'GET', url: '/api/orders?outlet_id=out-ameerpet' });
    const ameerpetOrders = ameerpetKdsRes.json();
    const foundInAmeerpet = ameerpetOrders.find(o => o.id === placedOrder.id);
    assert(!foundInAmeerpet, `Order #${placedOrder.id} is isolated and NOT visible in Ameerpet Kitchen KDS`);

    // 5. Kitchen Stage Advancements & Real-time Messages
    console.log('\n--- 5. Kitchen Stage Advancements & Customer Notifications ---');
    // Stage 1: Mark PREPARING
    const prepRes = await dispatchRequest({
      method: 'PATCH',
      url: `/api/orders/${placedOrder.id}/status`,
      body: { status: 'PREPARING' }
    });
    assert(prepRes.statusCode === 200, 'Kitchen status PREPARING returned HTTP 200');
    const prepData = prepRes.json();
    assert(prepData.order.status === 'PREPARING', `Kitchen bumped order #${placedOrder.id} to PREPARING`);

    // Stage 2: Mark READY_FOR_PICKUP
    const readyRes = await dispatchRequest({
      method: 'PATCH',
      url: `/api/orders/${placedOrder.id}/status`,
      body: { status: 'READY_FOR_PICKUP' }
    });
    assert(readyRes.statusCode === 200, 'Kitchen status READY_FOR_PICKUP returned HTTP 200');
    const readyData = readyRes.json();
    assert(readyData.order.status === 'READY_FOR_PICKUP', `Kitchen bumped order #${placedOrder.id} to READY_FOR_PICKUP`);
    assert(readyData.notification && readyData.notification.message_text.includes(placedOrder.id), `Customer notification generated: "${readyData.notification?.message_text.substring(0, 60)}..."`);
    assert(readyData.notification && readyData.notification.message_text.includes('Ready'), `Notification confirms ready status`);

    // Stage 3: Mark OUT_FOR_DELIVERY
    const dispatchRes = await dispatchRequest({
      method: 'PATCH',
      url: `/api/orders/${placedOrder.id}/status`,
      body: { status: 'OUT_FOR_DELIVERY' }
    });
    const dispatchData = dispatchRes.json();
    assert(dispatchRes.statusCode === 200 && dispatchData.order.status === 'OUT_FOR_DELIVERY', `Order #${placedOrder.id} out for delivery with rider`);

    // 6. Edge Case: 10-Minute Lateness Alert & Apology Trigger
    console.log('\n--- 6. Edge Case: 10-Minute Lateness Alert Simulation ---');
    const lateRes = await dispatchRequest({
      method: 'POST',
      url: `/api/orders/${placedOrder.id}/simulate-late`
    });
    assert(lateRes.statusCode === 200, 'Late delay simulation returned HTTP 200');
    const lateData = lateRes.json();
    assert(lateData.success === true, 'Late delay simulation succeeded');
    assert(lateData.compensation_credited === 50, 'Apology compensation ₹50 loyalty credited to customer');
    assert(lateData.notification && lateData.notification.message_text.includes('Loyalty Credit'), `Customer apology message generated: "${lateData.notification?.message_text.substring(0, 60)}..."`);

    // 7. Bulk / Party Orders Workflow (Customer Request -> Admin Review -> Approval)
    console.log('\n--- 7. Bulk / Party Catering Workflow ---');
    const partyPayload = {
      customer_name: 'Ayesha Khan',
      customer_phone: '+91 98490 77777',
      customer_email: 'ayesha.khan@gmail.com',
      event_date: '2026-11-20',
      event_time: '19:30',
      guest_count: 50,
      delivery_address: 'Villa 18, Palm Meadows, Gachibowli, Hyderabad',
      outlet_id: 'out-gachibowli-ck',
      requirements_text: '5 Handis Chicken Dum Biryani, 3 Handis Mutton Dum Biryani, Double Ka Meetha for 50 guests',
      estimated_budget: 18500
    };

    const partyCreateRes = await dispatchRequest({
      method: 'POST',
      url: '/api/party-orders',
      body: partyPayload
    });
    assert(partyCreateRes.statusCode === 201, 'POST /api/party-orders returned HTTP 201');
    const partyOrder = partyCreateRes.json();
    assert(partyOrder && partyOrder.id, `Party bulk order created with ID: ${partyOrder.id}`);
    assert(partyOrder.status === 'PENDING_REVIEW', `Initial status is PENDING_REVIEW`);

    // Admin verifies party order in approvals desk
    const partyListRes = await dispatchRequest({ method: 'GET', url: '/api/party-orders' });
    const partyList = partyListRes.json();
    const foundParty = partyList.find(p => p.id === partyOrder.id);
    assert(Boolean(foundParty), `Admin approvals desk received Party Order #${partyOrder.id}`);

    // Admin Confirms Party Order
    const confirmRes = await dispatchRequest({
      method: 'PATCH',
      url: `/api/party-orders/${partyOrder.id}/status`,
      body: { status: 'CONFIRMED', manager_notes: 'Approved by Central Catering Head. Copper handis reserved.' }
    });
    assert(confirmRes.statusCode === 200, 'Admin confirm returned HTTP 200');
    const confirmedData = confirmRes.json();
    assert(confirmedData.status === 'CONFIRMED', `Admin successfully confirmed Party Order #${partyOrder.id}`);
    assert(confirmedData.manager_notes.includes('Central Catering Head'), `Manager confirmation notes saved`);

    // 8. Order Cancellation Workflow
    console.log('\n--- 8. Order Cancellation Workflow ---');
    const cancelRes = await dispatchRequest({
      method: 'PATCH',
      url: `/api/orders/${placedOrder.id}/cancel`,
      body: { reason: 'Customer requested cancellation before rider arrival' }
    });
    assert(cancelRes.statusCode === 200, 'Cancel order returned HTTP 200');
    const cancelData = cancelRes.json();
    assert(cancelData.order.status === 'CANCELLED', `Order #${placedOrder.id} cancelled cleanly`);
    assert(cancelData.order.cancellation_reason.includes('Customer requested'), `Cancellation reason recorded: "${cancelData.order.cancellation_reason}"`);

    // 9. Central Analytics & Executive Dashboard
    console.log('\n--- 9. Central Analytics & Unit Economics ---');
    const analyticsRes = await dispatchRequest({ method: 'GET', url: '/api/analytics' });
    assert(analyticsRes.statusCode === 200, 'GET /api/analytics returned HTTP 200');
    const analytics = analyticsRes.json();
    assert(analytics && analytics.projected_annual_savings === '₹1.14 Crore', `Projected annual savings verified: ${analytics.projected_annual_savings}`);
    assert(analytics.commissions_saved > 0, `Commission saved vs 30% aggregators tracked: ₹${analytics.commissions_saved}`);
    assert(analytics.outlets.length === 17, `All 17 outlets reporting telemetry`);

    console.log('\n================================================================');
    console.log(`  E2E TEST RUN COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) process.exit(1);
    else process.exit(0);

  } catch (err) {
    console.error('Test execution exception:', err);
    process.exit(1);
  }
}

runTests();
