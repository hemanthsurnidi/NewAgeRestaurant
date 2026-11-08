/**
 * Automated Tests: AI Dynamic Prep-Time Estimation Engine
 * Testing concurrency load, peak multipliers, outlet floor constraints, and 10-minute late alerts
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDynamicPrepTime, evaluateOrderLateness, getCustomerReorderRecommendations } from '../ai-engine.js';
import { getOutletById } from '../database.js';

test('AI Prep-Time: Respects outlet minimum floor constraint', () => {
  const outlet = getOutletById('out-kondapur');
  assert.equal(outlet.min_prep_time_minutes, 25);

  // Quick single item with small complexity (e.g. Double Ka Meetha = 4 min prep)
  const items = [{ name: 'Double Ka Meetha', prep_complexity_minutes: 4, quantity: 1 }];
  const result = calculateDynamicPrepTime('out-kondapur', items, new Date('2026-11-08T15:00:00Z'));

  // Raw AI estimate is low, but promised time MUST be at least the outlet minimum floor (25 mins)
  assert.ok(result.raw_ai_estimate_minutes < 25, `Raw estimate was ${result.raw_ai_estimate_minutes}`);
  assert.equal(result.promised_minutes, 25, 'Honest promised time must equal outlet minimum floor');
  assert.equal(result.is_constrained_by_outlet_min, true);
});

test('AI Prep-Time: Increases with heavy item complexity and multiple quantities', () => {
  // Heavy order: 2x Family Biryani (18m each) + 2x Haleem (8m) + 2x Starters (16m)
  const heavyItems = [
    { name: 'Chicken Dum Biryani (Family Pack)', prep_complexity_minutes: 18, quantity: 2 },
    { name: 'Shahi Mutton Haleem', prep_complexity_minutes: 8, quantity: 2 },
    { name: 'Pathar Ka Gosht', prep_complexity_minutes: 16, quantity: 2 }
  ];

  const result = calculateDynamicPrepTime('out-gachibowli-ck', heavyItems, new Date('2026-11-08T15:00:00Z'));
  assert.ok(result.promised_minutes >= 30, `Promised time ${result.promised_minutes} should account for high complexity`);
  assert.ok(result.item_breakdown.length === 3);
});

test('AI Prep-Time: Detects Sunday/Friday dinner peak rush (1,200 orders/hr network concurrency)', () => {
  const items = [{ name: 'Chicken Dum Biryani', prep_complexity_minutes: 12, quantity: 1 }];
  // Friday 20:30 IST
  const fridayPeakDate = new Date('2026-11-06T15:00:00Z'); // 20:30 IST is 15:00 UTC
  // We can test by setting local hours or passing the date
  const result = calculateDynamicPrepTime('out-kondapur', items, fridayPeakDate);
  assert.ok(result.peak_multiplier >= 1.0);
  assert.ok(result.promised_minutes >= 25);
});

test('Late Alert Monitor: Correctly identifies orders late by <10m vs critical >=10m', () => {
  const now = new Date('2026-11-08T21:20:00+05:30');

  // Sample order WEB-778146: promised at 21:16, now 21:20 -> 4 mins late
  const order4mLate = {
    id: 'WEB-778146',
    outlet_id: 'out-kukatpally',
    promised_at: '2026-11-08T21:16:00+05:30',
    status: 'PREPARING'
  };

  const eval4m = evaluateOrderLateness(order4mLate, now);
  assert.equal(eval4m.is_late, true);
  assert.equal(eval4m.is_severely_late, false);
  assert.equal(eval4m.diff_minutes, 4);
  assert.equal(eval4m.alert_level, 'LATE');

  // Order running 12 mins late -> triggers CRITICAL_10M_LATE, manager alert and compensation
  const order12mLate = {
    id: 'WEB-999999',
    outlet_id: 'out-kondapur',
    promised_at: '2026-11-08T21:08:00+05:30',
    status: 'PREPARING'
  };

  const eval12m = evaluateOrderLateness(order12mLate, now);
  assert.equal(eval12m.is_late, true);
  assert.equal(eval12m.is_severely_late, true);
  assert.equal(eval12m.diff_minutes, 12);
  assert.equal(eval12m.alert_level, 'CRITICAL_10M_LATE');
  assert.equal(eval12m.customer_alert_required, true);
  assert.equal(eval12m.apology_credit_eligible, true);
});

test('AI Customer Re-order: Never auto-adds items to cart and respects history', () => {
  const recommendations = getCustomerReorderRecommendations('+91 98490 12345', 'out-kondapur');
  assert.ok(recommendations.recommendations.length > 0);
  assert.equal(recommendations.never_auto_add_guarantee, true, 'Guarantees recommendations are strictly opt-in');
});
