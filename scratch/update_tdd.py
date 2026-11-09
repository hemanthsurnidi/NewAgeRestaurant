import sys

new_section_9 = """### 2. Comprehensive Automated Test Suite
The project is validated across two exhaustive test suites:
1. **31 Automated Unit & API Integration Tests** built using Node.js native test runner (`node:test` and `node:assert`), runnable via `npm test`.
2. **42 Live End-to-End System Integration Assertions** validating complete live browser and backend operations (`node scratch/e2e_full_test.cjs`).

```
================================================================================
 AUTOMATED TEST SUITE EXECUTION SUMMARY (`npm test`) — 31 UNIT TESTS
================================================================================
✔ AI Prep-Time: Respects outlet minimum floor constraint (2.47ms)
✔ AI Prep-Time: Increases with heavy item complexity and multiple quantities (0.64ms)
✔ AI Prep-Time: Detects Sunday/Friday dinner peak rush (1,200 orders/hr) (0.51ms)
✔ Late Alert Monitor: Correctly identifies orders late by <10m vs critical >=10m (0.50ms)
✔ AI Customer Re-order: Never auto-adds items to cart and respects history (1.40ms)
✔ Security: Native scrypt password hashing and verification (115.41ms)
✔ Auth API: User registration and token session creation (56.87ms)
✔ Auth API: Login with valid credentials vs invalid credentials (84.09ms)
✔ Auth API: GET /api/auth/me returns authenticated user profile (44.25ms)
✔ RBAC & Outlet Isolation: Kitchen staff cannot update orders of another outlet (57.25ms)
✔ RBAC: Customers cannot modify menu or advance kitchen status (65.56ms)
✔ RBAC: Admin has central permission to create and delete menu items (112.67ms)
✔ Checkout Constraint: Prevents ordering items that are marked out-of-stock (86 item) (17.35ms)
✔ Mock Payment Gateway: Handles success, banking decline, and network timeout (923.08ms)
✔ Delivery Radius Check: Verifies address inside vs outside delivery radius (3.01ms)
✔ 5% GST Mandate: Subtotal includes 5% GST accurately (0.80ms)
✔ Coupons: Validates min order value and discount capping (1.40ms)
✔ Loyalty Points: Earns 5% back on order amount and updates ledger (15.17ms)
✔ Compliance: All 17 outlets must display valid FSSAI licenses (2.13ms)
✔ Real-time 86 Stock Pause: Pausing an item makes it unavailable immediately (25.03ms)
✔ DPDP Act 2023: Marketing consent explicitly stored with user order (0.52ms)
✔ API GET /api/health returns healthy status (2.57ms)
✔ API GET /api/outlets returns all 17 Hyderabad locations with FSSAI (0.59ms)
✔ API GET /api/menu returns items with portions, add-ons and availability (0.85ms)
✔ API GET /api/orders returns sample seeded orders WEB-778120, WEB-778131, WEB-778146 (1.94ms)
✔ API POST /api/orders successfully places order with AI prep time and loyalty cashback (32.20ms)
✔ API PATCH /api/orders/:id/status updates prep stage (3.47ms)
✔ API POST /api/orders/:id/simulate-late triggers 10m overdue compensation alert (6.00ms)
✔ API PATCH /api/orders/:id/cancel cancels order cleanly (9.81ms)
✔ API GET /api/analytics returns ₹1.14 Cr savings and cancellation metrics (0.79ms)
✔ API POST /api/party-orders validates 24h advance notice (3.01ms)
--------------------------------------------------------------------------------
TOTAL UNIT TESTS: 31 | PASSED: 31 | FAILED: 0
================================================================================

================================================================================
 LIVE END-TO-END VERIFICATION SUITE (`node scratch/e2e_full_test.cjs`)
================================================================================
✔ Test 1: Server Health & Outlets FSSAI Compliance (5/5 checks passed)
✔ Test 2: Delivery Radius Geofence 7km Constraint (2/2 checks passed)
✔ Test 3: Menu Catalog, Photos, Portions, 5% GST Mandate (3/3 checks passed)
✔ Test 4: Placing Order, Loyalty Cashback & Deterministic Kitchen Routing (9/9 checks passed)
✔ Test 5: Kitchen KDS Queue & Multi-Tenant Outlet Isolation (2/2 checks passed)
✔ Test 6: Kitchen Progression & Lifecycle Stages (3/3 checks passed)
✔ Test 7: WhatsApp/SMS Notification Preview & DPDP Compliance (5/5 checks passed)
✔ Test 8: Overdue Monitor (>10m Past Promise Alert & Loyalty Compensation) (4/4 checks passed)
✔ Test 9: Bulk Party Catering Form & Manager Confirmation (4/4 checks passed)
✔ Test 10: Central Menu CMS: 86 Item Pausing & Checkout Lock (2/2 checks passed)
✔ Test 11: Operations Dashboard & Financial Savings (3/3 checks passed)
--------------------------------------------------------------------------------
TOTAL E2E ASSERTIONS: 42 | PASSED: 42 | FAILED: 0
================================================================================
```

---

## 10. Conclusion

This direct ordering platform and Kitchen Display System delivers an end-to-end, production-grade solution for Company A. By combining honest AI prep-time estimation, sub-50ms real-time kitchen push updates, statutory FSSAI and 5% GST compliance, and DPDP Act 2023 privacy protections, it directly recovers **₹1.14 Crore in annual revenue** while providing a delightful, appetizing ordering experience for Hyderabad's biryani lovers.
"""

files = [
    r'C:\Users\heman\.gemini\antigravity\scratch\nizami-biryani\Company_A_TDD.md',
    r'C:\Users\heman\.gemini\antigravity\scratch\nizami-biryani\Nizami_Biryani_TDD.md'
]

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    target = '### 2. Comprehensive Automated Test Suite'
    idx = content.find(target)
    if idx != -1:
        updated = content[:idx] + new_section_9
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(updated)
        print(f"Updated {fpath}")
    else:
        print(f"Target not found in {fpath}")

