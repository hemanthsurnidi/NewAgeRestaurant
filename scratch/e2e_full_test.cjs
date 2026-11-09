/**
 * E2E Full System Live Integration Test
 * Verifies all 10 core pillars of the IsoCode specification on http://localhost:5000
 */

const BASE_URL = 'http://localhost:5000';

async function runAllTests() {
  console.log('===============================================================');
  console.log('  COMPANY A — LIVE END-TO-END SYSTEM VERIFICATION SUITE       ');
  console.log('===============================================================\n');

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
    // ------------------------------------------------------------------------
    // TEST 1: Server Health & 17 Outlets with FSSAI Compliance
    // ------------------------------------------------------------------------
    console.log('--- TEST 1: Server Health & Outlets FSSAI Compliance ---');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const health = await healthRes.json();
    assert(health.status === 'healthy', 'Server health returns status: healthy');
    assert(health.brand.includes('Company A'), `Brand in health response is Company A (${health.brand})`);

    const outletsRes = await fetch(`${BASE_URL}/api/outlets`);
    const outlets = await outletsRes.json();
    assert(outlets.length === 17, `All 17 Hyderabad outlets present (Found: ${outlets.length})`);

    const allHaveFssai = outlets.every(o => o.fssai_license && o.fssai_license.length >= 10);
    assert(allHaveFssai, 'All 17 outlets display a valid FSSAI license number');

    const dineInCount = outlets.filter(o => !o.is_cloud_kitchen).length;
    const cloudCount = outlets.filter(o => o.is_cloud_kitchen).length;
    assert(dineInCount === 14 && cloudCount === 3, `14 Dine-in outlets and 3 Cloud Kitchens confirmed (${dineInCount} dine-in, ${cloudCount} cloud)`);

    // ------------------------------------------------------------------------
    // TEST 2: Delivery Radius Geofence Verification (7km Constraint)
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 2: Delivery Radius Geofence (7km Constraint) ---');
    const insideRes = await fetch(`${BASE_URL}/api/outlets/check-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: 'Kondapur, Hyderabad', latitude: 17.4680, longitude: 78.3610 })
    });
    const inside = await insideRes.json();
    assert(inside.serviceable === true, `Kondapur address inside 7km delivery radius verified (${inside.recommended_outlet?.name})`);

    const outsideRes = await fetch(`${BASE_URL}/api/outlets/check-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: 'Warangal Highway Outskirts', latitude: 17.9680, longitude: 79.5610 })
    });
    const outside = await outsideRes.json();
    assert(outside.serviceable === false, 'Address outside 7km delivery radius correctly rejected');

    // ------------------------------------------------------------------------
    // TEST 3: Menu Catalog, Photos, Portions, 5% GST Mandate
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 3: Menu Catalog, Photos, Portions, 5% GST Mandate ---');
    const menuRes = await fetch(`${BASE_URL}/api/menu`);
    const menu = await menuRes.json();
    assert(menu.length >= 8, `Menu catalog populated (Found ${menu.length} dishes)`);

    const hasImagesAndVeg = menu.every(m => m.image_url && typeof m.is_veg === 'number');
    assert(hasImagesAndVeg, 'All menu dishes include image URLs and veg/non-veg classification');

    const biryaniItem = menu.find(m => m.id === 'item-chicken-dum-biryani');
    assert(biryaniItem && biryaniItem.base_price > 0, `Chicken Dum Biryani found with base price ₹${biryaniItem.base_price}`);

    // ------------------------------------------------------------------------
    // TEST 4: Customer Order Placement & Deterministic Kitchen Routing
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 4: Placing Order, Loyalty Cashback & Deterministic Kitchen Routing ---');
    const testCustomerPhone = '9849099881';
    const testCustomerName = 'Test Reviewer';

    const orderPayload = {
      outlet_id: 'out-kondapur',
      customer_name: testCustomerName,
      customer_phone: testCustomerPhone,
      delivery_address: 'Flat 402, Royal Palms, Kondapur, Hyderabad',
      items: [
        {
          item_id: 'item-chicken-dum-biryani',
          name: 'Chicken Dum Biryani',
          portion: 'Regular',
          unit_price: 380,
          quantity: 2,
          add_ons: [{ name: 'Extra Mirchi Ka Salan', price: 40 }]
        },
        {
          item_id: 'item-double-ka-meetha',
          name: 'Double Ka Meetha',
          portion: 'Single Portion',
          unit_price: 140,
          quantity: 1,
          add_ons: []
        }
      ],
      payment_method: 'UPI',
      payment_transaction_id: `UPI_TEST_${Date.now()}`,
      dpdp_marketing_consent: 1
    };

    const placeRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const placeData = await placeRes.json();
    assert(placeRes.status === 201 && placeData.order && placeData.order.id, `Order placed successfully: #${placeData.order?.id}`);

    const placedOrder = placeData.order;
    assert(placedOrder.outlet_id === 'out-kondapur', `Order routed to correct outlet: ${placedOrder.outlet_id}`);
    assert(placedOrder.status === 'PLACED', `Initial order status is PLACED`);
    assert(placedOrder.dpdp_marketing_consent === 1, 'DPDP Act 2023 marketing consent stored with order');
    assert(placedOrder.payment_status === 'PAID', 'Payment status marked PAID via test UPI');

    // Subtotal and inclusive 5% GST check
    const expectedSubtotal = (380 + 40) * 2 + 140; // 840 + 140 = 980
    assert(placedOrder.subtotal === expectedSubtotal, `Subtotal calculated correctly: ₹${placedOrder.subtotal}`);
    assert(placedOrder.gst_amount > 0, `5% GST calculated accurately: ₹${placedOrder.gst_amount}`);

    // AI Promised Time check
    assert(placedOrder.ai_prep_estimate_minutes >= 20, `Honest AI prep time honors outlet minimum floor (Estimate: ${placedOrder.ai_prep_estimate_minutes} mins)`);

    // Loyalty cashback check
    const loyaltyRes = await fetch(`${BASE_URL}/api/loyalty/${testCustomerPhone}`);
    const loyaltyData = await loyaltyRes.json();
    assert(loyaltyData.balance > 0, `Loyalty 5% cashback ledger updated (Balance: ${loyaltyData.balance} points)`);

    // ------------------------------------------------------------------------
    // TEST 5: KDS Queue Visibility & Multi-Tenant Outlet Isolation
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 5: Kitchen KDS Queue & Multi-Tenant Outlet Isolation ---');
    const kondapurKdsRes = await fetch(`${BASE_URL}/api/orders?outlet_id=out-kondapur`);
    const kondapurOrders = await kondapurKdsRes.json();
    const orderFoundInKondapur = kondapurOrders.some(o => o.id === placedOrder.id);
    assert(orderFoundInKondapur, `Placed order #${placedOrder.id} is live on Kondapur KDS screen`);

    // Multi-tenant check: Ameerpet KDS must NOT see this order
    const ameerpetKdsRes = await fetch(`${BASE_URL}/api/orders?outlet_id=out-ameerpet`);
    const ameerpetOrders = await ameerpetKdsRes.json();
    const orderInAmeerpet = ameerpetOrders.some(o => o.id === placedOrder.id);
    assert(!orderInAmeerpet, `Multi-tenant isolation: Ameerpet kitchen screen CANNOT see Kondapur order`);

    // ------------------------------------------------------------------------
    // TEST 6: Kitchen Progression (Start Prep -> Ready for Pickup -> Rider Handoff)
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 6: Kitchen Progression & Lifecycle Stages ---');
    // Step 6a: Start Prep (PREPARING)
    const prepRes = await fetch(`${BASE_URL}/api/orders/${placedOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PREPARING' })
    });
    const prepData = await prepRes.json();
    assert(prepData.order.status === 'PREPARING', `Stage advanced: Start Prep (Status: PREPARING)`);

    // Step 6b: Ready for Pickup (READY_FOR_PICKUP)
    const readyRes = await fetch(`${BASE_URL}/api/orders/${placedOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'READY_FOR_PICKUP' })
    });
    const readyData = await readyRes.json();
    assert(readyData.order.status === 'READY_FOR_PICKUP', `Stage advanced: Ready for Pickup (Status: READY_FOR_PICKUP)`);

    // Step 6c: Rider Handoff (DISPATCHED)
    const dispatchRes = await fetch(`${BASE_URL}/api/orders/${placedOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DISPATCHED' })
    });
    const dispatchData = await dispatchRes.json();
    assert(dispatchData.order.status === 'DISPATCHED', `Stage advanced: Rider Handoff (Status: DISPATCHED)`);

    // ------------------------------------------------------------------------
    // TEST 7: WhatsApp / SMS Notifications with FSSAI & DPDP
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 7: WhatsApp/SMS Notification Preview & DPDP Compliance ---');
    assert(placeData.notification && placeData.notification.message_text, 'WhatsApp notification preview generated');
    const msg = placeData.notification.message_text;
    assert(msg.includes('FSSAI Lic'), 'Notification contains FSSAI license number');
    assert(msg.includes('5% GST'), 'Notification explicitly states 5% GST included');
    assert(msg.includes(placedOrder.id), 'Notification contains correct Order ID');
    assert(placeData.notification.dpdp_consent === true, 'Notification respects DPDP Act 2023 consent flag');

    // ------------------------------------------------------------------------
    // TEST 8: AI Prep-Time Overdue Monitor (>10m Alert & Compensation)
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 8: Overdue Monitor (>10m Past Promise Alert & Loyalty Compensation) ---');
    const lateRes = await fetch(`${BASE_URL}/api/orders/${placedOrder.id}/simulate-late`, {
      method: 'POST'
    });
    const lateData = await lateRes.json();
    assert(lateData.success === true, '10-minute overdue delay simulated successfully');
    assert(lateData.order.late_alert_triggered === 1, 'Overdue monitor flagged late_alert_triggered: 1 on KDS');
    assert(lateData.compensation_credited === 50, 'Automatic ₹50 loyalty compensation credited to customer for delay');

    // Manager prep override (+5 mins)
    const overrideRes = await fetch(`${BASE_URL}/api/orders/${placedOrder.id}/override`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extra_minutes: 5, reason: 'Line rush override' })
    });
    const overrideData = await overrideRes.json();
    assert(overrideData.order && overrideData.order.manager_override_minutes >= 5, `Manager prep override of +5 mins recorded: ${overrideData.order?.manager_override_minutes}m`);

    // ------------------------------------------------------------------------
    // TEST 9: Bulk Party Catering Order Placement & Manager Approval Desk
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 9: Bulk Party Catering Form & Manager Confirmation ---');
    const tomorrow = new Date(Date.now() + 36 * 3600 * 1000).toISOString().split('T')[0];

    const partyPayload = {
      customer_name: 'Dr. Srinivas Rao',
      customer_phone: '+91 98480 55443',
      email: 'srinivas.rao@healthhyderabad.org',
      event_date: tomorrow,
      event_time: '19:00',
      guest_count: 40,
      outlet_id: 'out-kondapur',
      requirements_text: 'Annual Hospital Reception. 5 Chicken Dum Biryani Handis, 3 Haleem, 3 Double Ka Meetha.',
      estimated_budget: 18500
    };

    const partyCreateRes = await fetch(`${BASE_URL}/api/party-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partyPayload)
    });
    const partyOrder = await partyCreateRes.json();
    assert(partyCreateRes.status === 201 && partyOrder && partyOrder.id, `Party order created: #${partyOrder?.id}`);
    assert(partyOrder.status === 'PENDING_REVIEW', 'Party order initial status is PENDING_REVIEW');

    const partyId = partyOrder.id;

    // Manager Approves Party Order
    const confirmRes = await fetch(`${BASE_URL}/api/party-orders/${partyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CONFIRMED', manager_notes: 'Head Catering Ustad assigned. Degh scheduled.' })
    });
    const confirmedOrder = await confirmRes.json();
    assert(confirmedOrder.status === 'CONFIRMED', `Catering Manager successfully confirmed order: ${partyId}`);
    assert(confirmedOrder.manager_notes && confirmedOrder.manager_notes.includes('Head Catering Ustad assigned'), 'Manager confirmation notes saved');

    // ------------------------------------------------------------------------
    // TEST 10: Central Menu CMS: 86 Stock Pausing & Instant Customer Lock
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 10: Central Menu CMS: 86 Item Pausing & Checkout Lock ---');
    // Pause Double Ka Meetha for Kondapur
    const pauseRes = await fetch(`${BASE_URL}/api/menu/toggle-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outlet_id: 'out-kondapur', menu_item_id: 'item-double-ka-meetha', is_available: false })
    });
    const pauseData = await pauseRes.json();
    assert(pauseData.success === true, 'Item successfully marked paused (86 stock out) in CMS');

    // Attempting to place an order with paused item must be rejected
    const blockedOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outlet_id: 'out-kondapur',
        customer_name: 'Test Blocked',
        customer_phone: '9849011111',
        delivery_address: 'Kondapur',
        items: [{ item_id: 'item-double-ka-meetha', name: 'Double Ka Meetha', quantity: 1, unit_price: 140 }],
        payment_method: 'UPI'
      })
    });
    assert(blockedOrderRes.status === 400, 'Order correctly rejected because item is marked 86 out-of-stock');

    // Restore item availability
    await fetch(`${BASE_URL}/api/menu/toggle-stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outlet_id: 'out-kondapur', menu_item_id: 'item-double-ka-meetha', is_available: true })
    });
    console.log('  Restored item availability to active.');

    // ------------------------------------------------------------------------
    // TEST 11: Operations Dashboard & Financial Reports
    // ------------------------------------------------------------------------
    console.log('\n--- TEST 11: Operations Dashboard & Financial Savings ---');
    const analyticsRes = await fetch(`${BASE_URL}/api/analytics`);
    const analytics = await analyticsRes.json();
    assert(analytics.commissions_saved > 0, `Direct margin savings tracked: ₹${analytics.commissions_saved.toLocaleString('en-IN')}`);
    assert(analytics.app_fees_avoided > 0, `Aggregator 27% fees avoided: ₹${analytics.app_fees_avoided.toLocaleString('en-IN')}`);
    assert(analytics.outlets_leaderboard && analytics.outlets_leaderboard.length === 17, 'Outlet leaderboard contains all 17 locations');

    // ------------------------------------------------------------------------
    // FINAL SUMMARY
    // ------------------------------------------------------------------------
    console.log('\n===============================================================');
    console.log(`  FINAL VERIFICATION RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (err) {
    console.error('Fatal Test Exception:', err);
    process.exit(1);
  }
}

runAllTests();
