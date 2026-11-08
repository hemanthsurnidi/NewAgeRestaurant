/**
 * Automated Tests: Security, DPDP Act 2023 Compliance, and Real-time Stock Management
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { getAllOutlets, toggleOutletStock, getFullMenuForOutlet, getOrderById } from '../database.js';

test('Compliance: All 17 outlets must display valid FSSAI licenses', () => {
  const outlets = getAllOutlets();
  assert.equal(outlets.length, 17, 'Must have 14 outlets and 3 cloud kitchens in Hyderabad');

  for (const outlet of outlets) {
    assert.ok(outlet.fssai_license, `Outlet ${outlet.name} must have an FSSAI license`);
    assert.match(outlet.fssai_license, /^136\d{11}$/, `Outlet ${outlet.name} FSSAI license should match 14-digit format`);
  }
});

test('Real-time 86 Stock Pause: Pausing an item makes it unavailable immediately', () => {
  const outletId = 'out-kondapur';
  const itemId = 'item-mutton-dum-biryani';

  // Pause item (out of stock)
  toggleOutletStock(outletId, itemId, false);

  const menuAfterPause = getFullMenuForOutlet(outletId);
  const pausedItem = menuAfterPause.find(m => m.id === itemId);
  assert.equal(pausedItem.is_available, false, 'Item must be marked unavailable after stock pause');

  // Resume item (back in stock)
  toggleOutletStock(outletId, itemId, true);
  const menuAfterResume = getFullMenuForOutlet(outletId);
  const resumedItem = menuAfterResume.find(m => m.id === itemId);
  assert.equal(resumedItem.is_available, true, 'Item must be available after unpausing');
});

test('DPDP Act 2023: Marketing consent explicitly stored with user order', () => {
  const order = getOrderById('WEB-778120');
  assert.ok(order);
  assert.equal(order.dpdp_marketing_consent, 1, 'Consent flag must be stored in database');
});
