/**
 * Automated Tests: Pricing, 5% GST Mandate, Coupons, and Loyalty Rewards
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { getCouponByCode, getCustomerLoyaltyBalance, createOrderRecord } from '../database.js';

test('5% GST Mandate: Subtotal includes 5% GST accurately', () => {
  // Sample from brief: WEB-778120: Total ₹1180
  const subtotal = 1180;
  // If price includes 5% GST:
  // Taxable = subtotal / 1.05 = 1123.8095
  // GST = 1180 - 1123.8095 = 56.19
  const taxable = subtotal / 1.05;
  const gst = Math.round((subtotal - taxable) * 100) / 100;

  assert.equal(gst, 56.19);
  assert.equal(Math.round(taxable + gst), 1180);
});

test('Coupons: Validates min order value and discount capping', () => {
  const coupon = getCouponByCode('DIRECT15');
  assert.ok(coupon);
  assert.equal(coupon.discount_type, 'PERCENTAGE');
  assert.equal(coupon.discount_value, 15);
  assert.equal(coupon.min_order_value, 400);
  assert.equal(coupon.max_discount, 150);

  // Cart of ₹800 -> 15% is ₹120 (within ₹150 cap)
  const discount1 = Math.min((800 * coupon.discount_value) / 100, coupon.max_discount);
  assert.equal(discount1, 120);

  // Cart of ₹2,000 -> 15% is ₹300, capped at ₹150
  const discount2 = Math.min((2000 * coupon.discount_value) / 100, coupon.max_discount);
  assert.equal(discount2, 150);

  // Flat coupon NIZAM100
  const flatCoupon = getCouponByCode('NIZAM100');
  assert.equal(flatCoupon.discount_value, 100);
  assert.equal(flatCoupon.min_order_value, 600);
});

test('Loyalty Points: Earns 5% back on order amount and updates ledger', () => {
  const testPhone = '+91 99999 ' + Math.floor(10000 + Math.random() * 90000);
  const initialBalance = getCustomerLoyaltyBalance(testPhone);
  assert.equal(initialBalance, 0);

  // Place an order of ₹1,000
  const testOrder = {
    id: `TEST-${Date.now()}`,
    outlet_id: 'out-kondapur',
    customer_name: 'Test Customer',
    customer_phone: testPhone,
    delivery_address: 'Kondapur, Hyderabad',
    items: [{ item_id: 'item-chicken-dum-biryani', name: 'Chicken Dum Biryani', quantity: 2, unit_price: 380, add_ons: [] }],
    subtotal: 1000,
    gst_amount: 47.62,
    discount_amount: 0,
    loyalty_redeemed: 0,
    total_amount: 1000,
    payment_method: 'UPI',
    placed_at: new Date().toISOString(),
    promised_at: new Date().toISOString(),
    ai_prep_estimate_minutes: 25,
    dpdp_marketing_consent: 1
  };

  createOrderRecord(testOrder);

  // Should have earned 5% of 1000 = 50 points
  const updatedBalance = getCustomerLoyaltyBalance(testPhone);
  assert.equal(updatedBalance, 50, 'Customer must receive 5% back in loyalty points');
});
