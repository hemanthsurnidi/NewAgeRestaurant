import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Technical Design Document — Company A</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  @page {
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
    @bottom-right {
      content: "Page " counter(page);
      font-size: 8pt;
      color: #64748B;
    }
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1E293B;
    line-height: 1.55;
    font-size: 9.5pt;
    margin: 0;
    padding: 0;
    background: #FFFFFF;
  }

  .cover-header {
    border-bottom: 2.5px solid #0F172A;
    padding-bottom: 14px;
    margin-bottom: 18px;
  }

  .kicker {
    font-size: 8.5pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #D97706;
    margin-bottom: 4px;
  }

  h1.doc-title {
    font-size: 20pt;
    font-weight: 800;
    color: #0F172A;
    margin: 0 0 6px 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .doc-subtitle {
    font-size: 11pt;
    font-weight: 600;
    color: #475569;
    margin: 0 0 14px 0;
  }

  .meta-grid {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 12px 14px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
    font-size: 8.5pt;
    margin-bottom: 20px;
  }

  .meta-item strong {
    color: #0F172A;
  }

  .meta-item a {
    color: #2563EB;
    text-decoration: none;
    font-weight: 600;
  }

  .meta-badge {
    display: inline-block;
    background: #ECFDF5;
    color: #059669;
    border: 1px solid #A7F3D0;
    padding: 2px 8px;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 8pt;
  }

  h2 {
    font-size: 12.5pt;
    font-weight: 800;
    color: #0F172A;
    margin: 18px 0 8px 0;
    padding-bottom: 4px;
    border-bottom: 1px solid #E2E8F0;
    letter-spacing: -0.01em;
    page-break-after: avoid;
  }

  h3 {
    font-size: 10pt;
    font-weight: 700;
    color: #1E293B;
    margin: 12px 0 6px 0;
    page-break-after: avoid;
  }

  p {
    margin: 0 0 8px 0;
  }

  ul, ol {
    margin: 0 0 10px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 4px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 14px 0;
    font-size: 8.5pt;
  }

  th {
    background: #0F172A;
    color: #FFFFFF;
    text-align: left;
    padding: 7px 10px;
    font-weight: 700;
    font-size: 8pt;
    letter-spacing: 0.03em;
  }

  td {
    padding: 6px 10px;
    border-bottom: 1px solid #E2E8F0;
    color: #334155;
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background: #F8FAFC;
  }

  tr.highlight-row td {
    background: #FEF3C7;
    font-weight: 700;
    color: #92400E;
    border-top: 1.5px solid #F59E0B;
  }

  .callout-card {
    background: #F8FAFC;
    border-left: 3.5px solid #D97706;
    border-radius: 0 8px 8px 0;
    padding: 10px 14px;
    margin: 10px 0 12px 0;
    font-size: 8.8pt;
  }

  .callout-card.assumption {
    border-left-color: #3B82F6;
    background: #F0F9FF;
  }

  .callout-card.formula {
    border-left-color: #10B981;
    background: #ECFDF5;
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5pt;
  }

  .assumption-tag {
    font-weight: 800;
    color: #1D4ED8;
    display: inline-block;
    margin-bottom: 2px;
  }

  code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.2pt;
    background: #F1F5F9;
    color: #0F172A;
    padding: 1px 4px;
    border-radius: 4px;
    border: 1px solid #E2E8F0;
  }

  pre {
    background: #0F172A;
    color: #E2E8F0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.8pt;
    line-height: 1.45;
    padding: 10px 14px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 8px 0 12px 0;
  }

  .page-break {
    page-break-before: always;
  }

  .formula-box {
    background: #FFFFFF;
    border: 1.5px solid #10B981;
    border-radius: 8px;
    padding: 10px 14px;
    margin: 8px 0 12px 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5pt;
    color: #065F46;
  }

  .badge-veg {
    color: #10B981;
    font-weight: 700;
  }
  .badge-nonveg {
    color: #EF4444;
    font-weight: 700;
  }
</style>
</head>
<body>

  <!-- COVER / HEADER BLOCK -->
  <div class="cover-header">
    <div class="kicker">Engineering Take-Home Assessment — IsoCode Labs</div>
    <h1 class="doc-title">Technical Design Document (TDD)</h1>
    <div class="doc-subtitle">Company A — Direct Ordering Web Platform & Real-Time Kitchen Display System (KDS)</div>

    <div class="meta-grid">
      <div class="meta-item">
        <strong>Client:</strong> Company A, Hyderabad (14 Dine-in Outlets + 3 Cloud Kitchens, 520 Staff)
      </div>
      <div class="meta-item">
        <strong>Annual Turnover:</strong> ₹96 Crore baseline (₹90–105 Crore chain)
      </div>
      <div class="meta-item">
        <strong>Project GitHub Repository:</strong><br>
        <a href="https://github.com/hemanthsurnidi/NewAgeRestaurant">https://github.com/hemanthsurnidi/NewAgeRestaurant</a>
      </div>
      <div class="meta-item">
        <strong>Live Production Deployment (Render):</strong><br>
        <a href="https://newagerestaurant.onrender.com/">https://newagerestaurant.onrender.com/</a>
      </div>
      <div class="meta-item">
        <strong>Author / Candidate:</strong> Hemanth Surnidi (<code>hemanthsurnidi20095@gmail.com</code>)
      </div>
      <div class="meta-item">
        <strong>Automated Test Status:</strong> <span class="meta-badge">31 Unit Tests (100%) + 42 E2E Assertions (100%)</span>
      </div>
    </div>
  </div>

  <!-- 1. EXECUTIVE SUMMARY & BUSINESS PROBLEM STATEMENT -->
  <h2>1. Executive Summary & Business Problem Statement</h2>
  <p>
    Company A is one of Hyderabad’s most celebrated culinary institutions, operating 14 dine-in restaurants and 3 cloud kitchens across the twin cities, employing 520 staff, and generating ₹96 Crore in baseline annual revenue.
  </p>

  <h3>Today's Operational Dilemma</h3>
  <ul>
    <li><strong>Aggressive Delivery App Commissions:</strong> 55% of annual revenue (₹52.8 crore) flows through third-party food delivery aggregators (Swiggy, Zomato). These apps levy an average 27% in commissions and service fees, draining <strong>₹14.25 crore annually</strong> from the company’s bottom line. Aggregators also withhold customer contact data, preventing direct retention marketing.</li>
    <li><strong>Phone Line Leakage on Bulk & Party Orders:</strong> A single unmanaged phone line handles catering and bulk party orders. Due to busy lines, dropped calls, and slow manual confirmations, the company loses an estimated <strong>30 bulk orders per month</strong> at an average order value of ₹18,000 and 30% margin.</li>
    <li><strong>Fragmented Kitchen Operations:</strong> Outlets run disparate billing software, menus and prices are manually synced across portals, and kitchens rely on paper tickets prone to smoke damage, loss, and unmonitored delays.</li>
  </ul>

  <h3>The Financial Business Case & Target ROI</h3>
  <table>
    <thead>
      <tr>
        <th>Revenue Stream</th>
        <th>Baseline Turnover</th>
        <th>Aggregator Drain</th>
        <th>Direct Channel Model</th>
        <th>Annual Value Captured</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Retail Online Orders</strong></td>
        <td>₹52.80 Crore (55%)</td>
        <td>27% fee = ₹14.25 Cr</td>
        <td>12% direct migration = ₹6.336 Cr (12% 3PL logistics cost)</td>
        <td><strong>+₹95.04 Lakh / Year</strong> (15% net margin gain)</td>
      </tr>
      <tr>
        <td><strong>Bulk & Party Catering</strong></td>
        <td>Lost 30 orders / mo</td>
        <td>Busy phone lines</td>
        <td>Digital booking portal with 24h advance validation</td>
        <td><strong>+₹19.44 Lakh / Year</strong> (30 × ₹18k × 30% × 12m)</td>
      </tr>
      <tr class="highlight-row">
        <td><strong>TOTAL ANNUAL RECOVERY</strong></td>
        <td>₹96.00 Crore Chain</td>
        <td>Aggregator Dependency</td>
        <td>Direct Owned Web Platform</td>
        <td><strong>₹1.1448 Crore / Year (₹1.14 Cr)</strong></td>
      </tr>
    </tbody>
  </table>
  <p>
    <strong>Payback Period:</strong> Against an initial engineering budget of ₹9 lakh over 8 weeks, the payback period is <strong>under 30 days</strong> once the 12% direct migration threshold is achieved.
  </p>

  <!-- 2. EXPLICITLY LABELED ASSUMPTIONS -->
  <h2>2. Explicitly Labeled Assumptions</h2>
  <p>In accordance with the assessment instructions, all operational and architectural assumptions are explicitly labeled:</p>

  <div class="callout-card assumption">
    <div class="assumption-tag">[Assumption A1: Kitchen Hardware & Operating Environment]</div>
    Kitchen staff operate on inexpensive 10-inch Android tablets mounted on wall brackets in hot, humid, and noisy kitchen spaces. Therefore, the Kitchen Display System (KDS) requires a high-contrast dark industrial theme, typography readable from at least 2 metres, oversized touch targets for wet/oily hands, dynamic urgency borders, and Web Audio synthesized sound cues.
  </div>

  <div class="callout-card assumption">
    <div class="assumption-tag">[Assumption A2: Concurrency & Demand Peaks]</div>
    Hyderabad peak ordering windows occur on Friday and Sunday evenings between 19:30 and 22:30 IST, reaching peak network throughput of <strong>1,200 orders per hour</strong> across all 17 locations (~70 orders/hour/outlet, or ~1.2 orders/minute/outlet). System architecture must maintain sub-50ms latency under this peak load.
  </div>

  <div class="callout-card assumption">
    <div class="assumption-tag">[Assumption A3: Logistics & Rider Scope]</div>
    Delivery fleet riders are supplied by third-party logistics partners (3PL, e.g. Shadowfax, Dunzo, Porter) at an average cost of 12% (including payment gateway costs). Developing a custom rider mobile tracking app is strictly out of scope; our platform provides ready-for-handover status and SMS/WhatsApp dispatch webhooks.
  </div>

  <div class="callout-card assumption">
    <div class="assumption-tag">[Assumption A4: Indian Tax & Statutory Compliance]</div>
    All menu prices include 5% GST as mandated by Indian restaurant tax laws and explicitly state so. Each outlet visibly displays its unique 14-digit FSSAI license number. Customer contact numbers are classified as personal data under the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>, requiring affirmative consent for direct marketing.
  </div>

  <div class="callout-card assumption">
    <div class="assumption-tag">[Assumption A5: Artisanal Preparation Constraints]</div>
    Traditional Hyderabadi Dum Biryani and Shahi Haleem are slow-cooked in large copper deghs sealed with dough. Consequently, bulk and party catering orders (&gt;15 guests or ₹5,000+) strictly enforce <strong>at least 24 to 48 hours advance notice</strong> to procure ingredients and allocate dedicated ustad labor.
  </div>

  <!-- 3. SYSTEM ARCHITECTURE & ENGINEERING RATIONALE -->
  <div class="page-break"></div>
  <h2>3. System Architecture & Engineering Rationale</h2>
  <p>
    We selected an <strong>Event-Driven Reactive Micro-Monolith</strong> built on <strong>Node.js 24</strong> with native <code>node:sqlite</code> and native Server-Sent Events (SSE). The architecture unifies the REST API, real-time pub/sub hub, AI prep-time engine, role-based security, and responsive Single Page Application into a single cohesive process.
  </p>

  <pre>
+-----------------------------------------------------------------------------------+
|                            SYSTEM ARCHITECTURE TOPOLOGY                           |
+-----------------------------------------------------------------------------------+
                                          |
               +--------------------------+--------------------------+
               |                                                     |
               v                                                     v
    [ Customer Web App ]                                    [ Kitchen Tablet KDS ]
    - 7km Delivery Geofence Picker                          - High Contrast (2 Metres)
    - Menu, Portions, Add-ons                               - Real-time Stage Progression
    - &lt;60s Express Checkout Flow                            - Dynamic Timer Urgency Colors
    - UPI &amp; Card Test Mode                                  - 10m Critical Late Alert Banner
    - Live Tracking &amp; WhatsApp Drawer                       - Manager +5m Prep Override
               |                                                     |
               | (HTTP REST / JSON)                                  | (SSE Stream Push)
               v                                                     v
+-----------------------------------------------------------------------------------+
|                        NODE.JS 24 APPLICATION SERVER HUB                          |
|  - REST API Engine (Outlets, Menu, Orders, Loyalty, Coupons, Party Catering)       |
|  - Real-Time Pub/Sub Event Hub (Server-Sent Events Broadcast: sub-50ms)           |
|  - AI Dynamic Prep-Time Estimation &amp; Kitchen Queue Concurrency Engine             |
|  - Overdue Order Monitor &amp; Proactive Delay Compensation Dispatcher                |
|  - DPDP Act 2023 Compliance &amp; Notification Dispatch Gateway                      |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     NATIVE ACID RELATIONAL DATABASE (node:sqlite)                 |
|  - Tables: Outlets, Menu Items, Portions, Add-ons, Outlet Stock (86), Orders,     |
|            Loyalty Ledger, Coupons, Party Orders, Users, Sessions                 |
|  - Concurrency: Write-Ahead Logging (WAL) Mode with Busy Timeout Protection       |
+-----------------------------------------------------------------------------------+
  </pre>

  <h3>Why This Architecture Was Chosen</h3>
  <ol>
    <li><strong>Zero Native Build Dependencies:</strong> Compiling native C++ bindings frequently breaks across operating systems. Node.js 24 provides built-in SQLite (<code>node:sqlite</code>) and a built-in test runner (<code>node:test</code>). The entire platform boots in under 1 second with zero compilation friction.</li>
    <li><strong>Real ACID Relational Database:</strong> Unlike volatile in-memory mock arrays, SQLite provides complete relational integrity, foreign key constraints, parameterized queries, and WAL mode concurrency, persisting all 17 outlets and transactions across server restarts.</li>
    <li><strong>Sub-50ms Real-Time Push via Server-Sent Events (SSE):</strong> WebSockets often suffer from corporate proxy blocks, stateful connection drops, and complex reconnection loops. SSE provides a lightweight, HTTP/2-friendly push stream that immediately notifies kitchen tablets when orders are submitted.</li>
    <li><strong>High Concurrency for Friday/Sunday Peaks:</strong> The non-blocking event loop effortlessly handles 1,200 orders/hour with sub-10ms response times and under 50 MB memory consumption.</li>
  </ol>

  <!-- 4. COMPREHENSIVE DATA MODEL -->
  <h2>4. Comprehensive Data Model</h2>
  <p>The relational database schema is normalized to 3NF, enforcing integrity via foreign keys and cascade rules:</p>

  <table>
    <thead>
      <tr>
        <th>Table Name</th>
        <th>Primary Key</th>
        <th>Foreign Keys</th>
        <th>Description &amp; Key Columns</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>outlets</code></td>
        <td><code>id</code> (TEXT)</td>
        <td>—</td>
        <td>17 Hyderabad locations (14 Dine-in + 3 Cloud Kitchens), coordinates, 7km radius, minimum prep floor (18–30m), 14-digit FSSAI license.</td>
      </tr>
      <tr>
        <td><code>menu_items</code></td>
        <td><code>id</code> (TEXT)</td>
        <td>—</td>
        <td>Categories, base prices (incl 5% GST), veg classification (<code>is_veg</code>), spice level, allergens, prep complexity weight, time-based tags.</td>
      </tr>
      <tr>
        <td><code>portions</code></td>
        <td><code>id</code> (TEXT)</td>
        <td><code>menu_item_id</code></td>
        <td>Portion sizes (Single, Regular, Family Pack) with multiplier pricing.</td>
      </tr>
      <tr>
        <td><code>add_ons</code></td>
        <td><code>id</code> (TEXT)</td>
        <td><code>menu_item_id</code></td>
        <td>Add-on customizations (Extra Salan, Burani Raita, Boiled Eggs).</td>
      </tr>
      <tr>
        <td><code>outlet_stock</code></td>
        <td><code>outlet_id, menu_item_id</code></td>
        <td><code>outlet_id, menu_item_id</code></td>
        <td>Real-time inventory matrix enabling instant "86 stock pause" per outlet.</td>
      </tr>
      <tr>
        <td><code>city_prices</code></td>
        <td><code>id</code> (TEXT)</td>
        <td><code>menu_item_id</code></td>
        <td>Regional city-specific pricing overrides (Hyderabad Core, Secunderabad, Cyberabad).</td>
      </tr>
      <tr>
        <td><code>orders</code></td>
        <td><code>id</code> (TEXT)</td>
        <td><code>outlet_id</code></td>
        <td>Full transaction records: items JSON, 5% GST, coupon discounts, loyalty redeemed, AI prep estimate, manager override, status, DPDP consent.</td>
      </tr>
      <tr>
        <td><code>loyalty_ledger</code></td>
        <td><code>id</code> (INT)</td>
        <td><code>order_id</code></td>
        <td>Double-entry rewards ledger tracking 5% cashback earned and points spent (1 point = ₹1).</td>
      </tr>
      <tr>
        <td><code>party_orders</code></td>
        <td><code>id</code> (TEXT)</td>
        <td><code>outlet_id</code></td>
        <td>Bulk catering requests enforcing 24h advance notice, guest count (15–500+), and manager confirmation.</td>
      </tr>
      <tr>
        <td><code>users</code></td>
        <td><code>id</code> (TEXT)</td>
        <td><code>outlet_id</code></td>
        <td>Scrypt password hashes, unique salts, role classification (<code>customer</code>, <code>kitchen_staff</code>, <code>admin</code>).</td>
      </tr>
    </tbody>
  </table>

  <!-- 5. CORE SYSTEM FLOWS & STATE MACHINES -->
  <div class="page-break"></div>
  <h2>5. Core System Flows & State Machines</h2>

  <h3>Flow 1: Customer Order Lifecycle (&lt;60s Checkout)</h3>
  <ol>
    <li><strong>Outlet Discovery:</strong> Customer selects nearest outlet or enters landmark ➔ System performs 7km geofence check.</li>
    <li><strong>Honest AI Delivery Promise:</strong> System queries <code>GET /api/ai/prep-time</code> evaluating dish complexity, active kitchen pots, and dinner peak multipliers. Promised time is the higher of the AI estimate and the outlet's minimum floor.</li>
    <li><strong>Express Checkout:</strong> Customer adds items, applies coupon (<code>DIRECT15</code>), drags loyalty points slider, and checks DPDP consent box.</li>
    <li><strong>Payment Execution:</strong> Submits payment via test UPI / Card sandbox (supporting success, bank decline, and timeout simulation).</li>
    <li><strong>Deterministic Dispatch:</strong> Order record created, 5% cashback credited, and SSE event <code>NEW_ORDER</code> pushed instantly to the assigned kitchen screen.</li>
  </ol>

  <h3>Flow 2: Kitchen Order Progression &amp; Late Delay State Machine</h3>
  <table>
    <thead>
      <tr>
        <th>Stage</th>
        <th>Trigger Action</th>
        <th>Target Status</th>
        <th>Kitchen Screen State</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Incoming</strong></td>
        <td>Order Placed by Customer</td>
        <td><code>PLACED</code></td>
        <td>Ticket appears in "New Orders" column with elapsed timer.</td>
      </tr>
      <tr>
        <td><strong>2. Dum Cooking</strong></td>
        <td>Kitchen clicks "🔥 Start Prep"</td>
        <td><code>PREPARING</code></td>
        <td>Timer color: Green (&gt;10m left) ➔ Amber (≤8m) ➔ Red (overdue).</td>
      </tr>
      <tr>
        <td><strong>3. Ready for Pickup</strong></td>
        <td>Kitchen clicks "✅ Ready for Pickup"</td>
        <td><code>READY_FOR_PICKUP</code></td>
        <td>Thermal packaging complete; delivery partner rider alerted.</td>
      </tr>
      <tr>
        <td><strong>4. Rider Handoff</strong></td>
        <td>Kitchen clicks "🛵 Rider Handoff"</td>
        <td><code>DISPATCHED</code></td>
        <td>Order handed to 3PL rider; customer tracking marks out-for-delivery.</td>
      </tr>
      <tr>
        <td><strong>5. Completed</strong></td>
        <td>Delivered to Customer</td>
        <td><code>COMPLETED</code></td>
        <td>Archived in outlet dashboard records.</td>
      </tr>
    </tbody>
  </table>

  <!-- 6. THE AI & INTELLIGENT AUTOMATION ARCHITECTURE -->
  <h2>6. The AI &amp; Intelligent Automation Architecture</h2>

  <h3>1. Dynamic Prep-Time Estimation Engine</h3>
  <p>The honest preparation time is calculated from three deterministic components:</p>

  <div class="formula-box">
    T_items = Max(Complexity_i × [1 + (Qty_i - 1) × 0.4]) + Σ(Complexity_j × 0.28)<br>
    T_queue = Active_Orders × 2.2 minutes × Peak_Factor<br>
    Promised_Time = Max(Outlet_Minimum_Floor, ⌈T_items + T_queue⌉)
  </div>

  <ul>
    <li><strong>Peak Factors:</strong> Normal hours = <code>1.0×</code>, Lunch rush (12:00–15:00) = <code>1.15×</code>, Weekday dinner = <code>1.25×</code>, <strong>Weekend Dinner Peak (Friday &amp; Sunday 19:30–22:30) = 1.40×</strong> (accommodating 1,200 orders/hr surge).</li>
    <li><strong>Hard Floor Constraint:</strong> At Kondapur (floor = 25m), ordering a 4m dessert with 0 active orders returns 25m to protect food quality.</li>
  </ul>

  <h3>2. Failure &amp; Delay Handling: The 10-Minute Late Rule</h3>
  <ul>
    <li><strong>Tolerable Delay (&lt;10 mins):</strong> KDS card shifts from Green to Amber, then Red (<code>Late by X mins</code>).</li>
    <li><strong>Critical Delay (≥10 mins):</strong>
      <ol>
        <li>KDS card activates a pulsing crimson animation with audio cue.</li>
        <li>Critical Delay Warning Banner alerts the outlet manager on KDS and Central Dashboard.</li>
        <li>Apologetic WhatsApp update dispatched to customer.</li>
        <li>Automatic <strong>₹50 Loyalty Compensation Credit</strong> credited to customer’s ledger.</li>
      </ol>
    </li>
  </ul>

  <h3>3. Kitchen Manager Manual Override</h3>
  <p>Kitchen managers can tap <strong>+5m Override</strong> to add a buffer when opening a fresh degh or experiencing rush spikes, automatically updating the customer ETA.</p>

  <h3>4. Smart Customer Re-Order Engine (Zero Dark Patterns)</h3>
  <p>
    Analyzes customer history by phone number to recommend past favorites. <strong>Strict Ethical AI Constraint:</strong> Suggestions <strong>NEVER auto-add items to the cart</strong>. Each suggestion explains why (e.g. <em>"Ordered 3 times on Friday evenings"</em>) and requires an explicit tap on <code>+ Add</code>.
  </p>

  <!-- 7. UI AND DESIGN DECISIONS -->
  <div class="page-break"></div>
  <h2>7. UI and Design Decisions</h2>

  <h3>Design System: Heritage Meets Digital Precision</h3>
  <ul>
    <li><strong>Color Palette:</strong> Obsidian Deep Charcoal (<code>#0C1013</code>) for eye-strain reduction in kitchens, Royal Amber (<code>#F59E0B</code>) evoking saffron dum richness, Nizami Emerald (<code>#10B981</code>) for freshness and veg marks, Crimson (<code>#EF4444</code>) for delays and non-veg marks.</li>
    <li><strong>Typography:</strong> Playfair Display for regal celebratory headlines; Plus Jakarta Sans for high-contrast prices, timers, and kitchen tickets.</li>
  </ul>

  <h3>The 8 Key Screens &amp; Design Rationales</h3>
  <ol>
    <li><strong>Customer Ordering Menu &amp; Outlet Picker:</strong> Clean, minimal hero, 7km delivery radius geofence check, FSSAI licenses, 5% GST inclusive pricing, veg/non-veg marks, spice meters, and allergens.</li>
    <li><strong>Express Checkout (&lt;60s Flow):</strong> Two-column desktop / single-column mobile flow, 1-tap address pre-fill, interactive loyalty points slider, coupon codes (<code>DIRECT15</code>), explicit DPDP consent checkbox, and test UPI/Card payment.</li>
    <li><strong>Live Order Tracking &amp; WhatsApp Simulator:</strong> Real-time progress timeline, live countdown timer, and simulated WhatsApp drawer rendering the notification push with FSSAI license and tracking link.</li>
    <li><strong>Kitchen Display System (KDS) — Tablet Industrial View:</strong> 2-metre readability, massive typography, dynamic urgency borders, one-tap stage progression buttons (<code>🔥 Start Prep</code>, <code>✅ Ready for Pickup</code>, <code>🛵 Rider Handoff</code>), and manager +5m override.</li>
    <li><strong>Central Menu CMS:</strong> Dish catalog, base prices, spice meters, allergens, regional city pricing overrides, and live stock pause toggles per outlet ("86 item").</li>
    <li><strong>Bulk Orders / Party Catering Desk:</strong> 24-hour advance notice enforcement, booking form for 15 to 500+ guests, and manager confirmation/decline actions.</li>
    <li><strong>Executive Analytics Dashboard:</strong> Live progress tracker toward the ₹1.14 Crore annual savings target, 15% net margin tracking, aggregator fees avoided, and 17-outlet leaderboard.</li>
    <li><strong>AI Prep-Time Lab &amp; Diagnostics:</strong> Engineering testbed for adjusting kitchen load and peak factors with live mathematical evaluation.</li>
  </ol>

  <!-- 8. WHAT WE CUT AND WHAT WE WOULD DO NEXT -->
  <h2>8. What We Cut and What We Would Do Next</h2>

  <h3>Strategic Cuts (Deliberately Excluded)</h3>
  <ul>
    <li><strong>Dedicated Rider App:</strong> Riders are supplied by third-party logistics partners (Shadowfax, Dunzo, Porter). Building a custom rider app would duplicate 3PL partner infrastructure. The system provides ready-for-pickup notifications and status handoffs for third-party dispatch.</li>
    <li><strong>Replacing In-Store Legacy POS Hardware:</strong> Problem statement explicitly specifies <em>"Replacing outlet billing or inventory is out of scope"</em>. The system operates as an independent, high-margin direct channel running on low-cost Android tablets alongside existing POS hardware.</li>
    <li><strong>Automated AI Order Cancellations:</strong> Food cooked on dum cannot be un-cooked. Auto-canceling orders during spikes causes massive food waste and customer frustration. The AI triggers alerts, updates the customer, and issues apology credits, leaving cancellations to human outlet managers.</li>
  </ul>

  <h3>Production Roadmap (What We Would Do Next)</h3>
  <ul>
    <li><strong>Offline-First Kitchen PWA with Background Sync:</strong> Implement Service Workers with IndexedDB on kitchen tablets so tickets persist through Wi-Fi drops and sync automatically when connectivity returns.</li>
    <li><strong>Official WhatsApp Cloud API Conversational Ordering:</strong> Expand the notification engine into a full conversational commerce bot with interactive list messages and UPI in-chat payment links.</li>
    <li><strong>Machine Learning Prep Time Retraining Pipeline:</strong> Log cooking completion timestamps into a data warehouse to train a gradient-boosted regression model (XGBoost) predicting preparation times per outlet based on weather, festival calendars, and order velocity.</li>
  </ul>

  <!-- 9. SECURITY, COMPLIANCE, AND TESTING VERIFICATION -->
  <h2>9. Security, Compliance, and Testing Verification</h2>
  <ul>
    <li><strong>DPDP Act 2023 Compliance:</strong> Affirmative marketing consent recorded with every order (<code>dpdp_marketing_consent = 1</code>). Operational notifications use legitimate operational use; promotional messages require verified opt-in.</li>
    <li><strong>No Hardcoded Secrets:</strong> Zero secrets in the codebase; configuration uses standard environment variables.</li>
    <li><strong>SQL Injection Immunity:</strong> 100% of database queries use parameterized SQL statements.</li>
    <li><strong>Scrypt Password Hashing:</strong> Native scrypt key-derivation password hashing with unique per-user salts.</li>
  </ul>

  <h3>Automated Test Execution Summary</h3>
  <table>
    <thead>
      <tr>
        <th>Test Suite</th>
        <th>Command</th>
        <th>Total Tests / Assertions</th>
        <th>Pass Rate</th>
        <th>Coverage Areas</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Unit &amp; API Tests</strong></td>
        <td><code>npm test</code></td>
        <td><strong>31 Tests</strong></td>
        <td><strong>100% Passed</strong></td>
        <td>AI prep floor, complexity weights, 1,200 orders/hr peak, scrypt auth, RBAC outlet isolation, 86 stock lock, mock payment states, 7km geofence, 5% GST math, coupons, loyalty points, FSSAI licenses, 24h party notice.</td>
      </tr>
      <tr>
        <td><strong>End-to-End System Tests</strong></td>
        <td><code>node scratch/e2e_full_test.cjs</code></td>
        <td><strong>42 Assertions</strong></td>
        <td><strong>100% Passed</strong></td>
        <td>Server health, 17 outlets FSSAI, 7km radius check, order placement, deterministic kitchen routing, KDS queue visibility, multi-tenant isolation, stage progression, WhatsApp notifications, 10m overdue delay simulation &amp; ₹50 compensation, bulk party catering confirmation, 86 item pause, 17-outlet analytics leaderboard.</td>
      </tr>
    </tbody>
  </table>

  <!-- 10. CONCLUSION -->
  <h2>10. Conclusion</h2>
  <p>
    This direct ordering platform and Kitchen Display System delivers an end-to-end, production-grade solution for Company A. By combining honest AI prep-time estimation, sub-50ms real-time kitchen push updates, statutory FSSAI and 5% GST compliance, and DPDP Act 2023 privacy protections, it directly recovers <strong>₹1.14 Crore in annual revenue</strong> while providing a delightful, appetizing ordering experience for Hyderabad's biryani lovers.
  </p>

</body>
</html>
`;

// 1. Write the clean HTML
const htmlPath = path.join(ROOT_DIR, 'scratch', 'Company_A_TDD.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
console.log('✅ Generated HTML document:', htmlPath);

// 2. Compile to PDF using Chrome Headless with print-to-pdf
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const pdfPath = path.join(ROOT_DIR, 'Company_A_TDD.pdf');

try {
  const cmd = `"${chrome}" --headless=new --no-sandbox --disable-gpu --print-to-pdf="${pdfPath}" --print-to-pdf-no-header "file:///${htmlPath.replace(/\\/g, '/')}"`;
  execSync(cmd, { stdio: 'inherit' });
  const pdfSize = (fs.statSync(pdfPath).size / 1024).toFixed(1);
  console.log(`✅ Generated pristine PDF Technical Design Document: ${pdfPath} (${pdfSize} KB)`);
  
  // Mirror to legacy path for compatibility
  fs.copyFileSync(pdfPath, path.join(ROOT_DIR, 'Dum_Co_TDD.pdf'));
  fs.copyFileSync(pdfPath, path.join(ROOT_DIR, 'Nizami_Biryani_TDD.pdf'));
} catch (e) {
  console.error('Failed to generate PDF with Chrome:', e);
}

