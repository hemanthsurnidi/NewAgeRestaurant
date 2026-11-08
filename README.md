# Nawabi Zaika | Nizami Biryani Direct Platform
### Direct Ordering Web Application & Real-Time Kitchen Display System (KDS)
**Client**: Company A, Hyderabad — 14 Outlets + 3 Cloud Kitchens | 520 Staff | ₹96 Crore Revenue  
**Author**: Hemanth Surnidi (`hemanthsurnidi20095@gmail.com`)  
**Assessment**: Isocode Workspace Software Engineering Intern Take-Home Task  

[![Test Suite](https://img.shields.io/badge/tests-19%20passed%20(100%25)-success)](tests/)
[![Node.js](https://img.shields.io/badge/node.js-v24.x-brightgreen)](package.json)
[![Database](https://img.shields.io/badge/database-native%20node%3Asqlite-blue)](database.js)
[![Real-Time](https://img.shields.io/badge/real--time-Server--Sent%20Events%20(SSE)-orange)](server.js)
[![Compliance](https://img.shields.io/badge/compliance-DPDP%202023%20%7C%20FSSAI%20%7C%205%25%20GST-purple)](tests/security-dpdp.test.js)

---

## 🌟 Executive Overview & Business Problem

Company A loses **27% in commissions and fees (₹14.25 crore/year)** to food delivery aggregators (Swiggy, Zomato) on 55% of its sales. Furthermore, the aggregators control the customer relationship. Simultaneously, an unmanaged phone line loses **30 bulk and party orders monthly** (₹18,000 average order value at 30% margin).

### Financial Value Capture: ₹1.14 Crore Annual Savings
* **Retail Direct Order Savings**: Migrating 12% of aggregator volume to direct orders saves 15% net margin (27% app fee - 12% 3PL logistics cost) on ₹6.336 crore = **+₹95.04 Lakh/year**.
* **Party & Bulk Order Recovery**: Capturing the lost 30 party orders/month through a 24-hour advance booking desk = **+₹19.44 Lakh/year**.
* **Total Annual Value Captured**: **₹1.1448 Crore / Year** (₹1.14 Cr).
* **Payback Period**: Under 30 days against a project budget of ₹9 lakh over 8 weeks.

---

## ⚡ Quick Start (Under 60 Seconds)

### 1. Clone & Run
```bash
git clone https://github.com/hemanthsurnidi/nizami-biryani-direct.git
cd nizami-biryani-direct
npm install
npm test    # Runs 19 automated unit & integration tests (~370ms)
npm start   # Starts server at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 8 Key Screens & Workflows

1. **🍲 Customer Direct Ordering App**:
   - Geofenced Hyderabad outlet selector across 14 dine-in outlets and 3 cloud kitchens.
   - Authentic menu photography, veg/non-veg marks, spice meters, allergen alerts, portions (Single, Regular, Family Pack), and add-ons (Extra Salan, Burani Raita, Boiled Eggs).
   - Transparent pricing: **All prices include 5% GST and explicitly say so**.
   - Out-of-Stock handling: Instantly greys out with "SOLD OUT AT THIS OUTLET" when kitchen pauses stock ("86 item").

2. **✨ AI Smart Re-Order Suggestions**:
   - Analyzes customer order history by phone number (e.g. Rahul Verma).
   - **Zero Dark Patterns Rule**: Suggestions **never auto-add items to the cart**. Each suggestion shows an honest rationale and requires an explicit tap on `+ Add`.

3. **⚡ Express Checkout & Payment (< 60 Seconds Flow)**:
   - One-tap pre-filled addresses (Kondapur / Gachibowli).
   - Coupon codes (`DIRECT15` for 15% off, `NIZAM100` for ₹100 off).
   - **Interactive Royalty Points Slider**: Redeem loyalty balance with 1-click (1 point = ₹1), plus earn 5% cashback on this order!
   - **DPDP Act 2023 Consent Checkbox**: Verified opt-in for marketing & transactional updates.
   - Payment Simulator: Instant UPI QR code (GPay/PhonePe/Paytm) & Card test mode.

4. **📍 Live Order Tracking & WhatsApp Simulator**:
   - Step-by-step progress: Accepted ➔ Dum Cooking ➔ Packed ➔ Dispatched ➔ Delivered.
   - Real-time countdown timer.
   - **Interactive WhatsApp Notification Drawer**: Displays the authentic WhatsApp message pushed to the customer's mobile device with FSSAI license and tracking link.
   - **10-Minute Late Apology Compensation**: Automatically alerts the customer and credits ₹50 loyalty points if the kitchen encounters delays!

5. **🍳 Kitchen Display System (KDS) — 2-Metre Tablet Industrial View**:
   - High-contrast dark industrial theme readable from 2 metres in hot, noisy kitchens.
   - **Web Audio API Synthesizer**: Plays pleasant two-tone chime (880Hz ➔ 1320Hz) upon new order arrival without external mp3 dependencies.
   - Dynamic Urgency Color Coding: Green (> 10m left) ➔ Amber (< 10m left) ➔ Red (Overdue) ➔ Pulsing Crimson (Critical 10m+ late).
   - One-tap stage buttons: "Start Cooking" ➔ "Ready for Pickup" ➔ "Handover to Rider".
   - **Manager Prep Override**: One-tap +5m bump to handle cooking spikes.

6. **📋 Central Menu CMS & Real-Time Stock ("86 Item")**:
   - Central overview of items, prices, spice levels, allergens, and time-based tags ("All Day", "Dinner & Specials", "Midnight Biryani").
   - 1-Click live stock pause/resume per outlet: instantly pushes SSE event greying out the dish on customer devices in sub-50ms!

7. **📊 ₹1.14 Crore Financial Savings Dashboard**:
   - Live tracking toward Company A's annual target.
   - Net margin saved (15%) and aggregator commission avoided (27%).
   - Outlet leaderboard comparing all 17 Hyderabad locations.
   - Customer retention metric: **38.2% repeat rate** (beating the 35% Month 6 client target).

8. **🎉 Royal Party & Bulk Catering Desk**:
   - Captures the lost 30 phone orders/month (₹19.44 lakh/year).
   - **Enforces 24-48 Hours Advance Notice Rule** using both frontend date constraints and backend API validation.
   - Catering specialist confirmation and approval desk.

---

## 🤖 The AI & Intelligent Automation Engine

### Dynamic Prep-Time Formula
$$\text{Item Prep} = \max(\text{Item Complexity}) + 0.28 \times \sum \text{Secondary Items}$$
$$\text{Queue Wait} = \text{Active Orders} \times 2.2\text{ mins} \times \text{Peak Multiplier}$$
$$\mathbf{Honest\ Promised\ Time = \max(\lceil \text{Item Prep} + \text{Queue Wait} \rceil,\ \text{Outlet Minimum Prep Floor})}$$

### Edge Cases & Failure Recovery
* **Promised Time Floor**: Promised time is always the higher of the AI calculation and the outlet's minimum floor (e.g. 25 mins at Kondapur).
* **10-Minute Delay Trigger**: An order running 10+ minutes late automatically triggers a critical KDS alert banner, notifies the outlet manager, and dispatches a **₹50 loyalty credit** apology message to the customer.
* **Manager Override**: Outlet ustads can adjust the estimate (+5m / +10m) with one tap to reflect physical degh status.

---

## 📋 Pre-Seeded Sample Data from Client Brief

| Order ID | Outlet | Items | Total (₹) | Payment | Placed | Promised | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **WEB-778120** | Kondapur Flagship | Chicken dum biryani family pack x1, Double ka meetha x2 | 1,180 | UPI | 20:14 | 20:59 | Preparing |
| **WEB-778131** | Gachibowli Cloud Kitchen | Veg biryani x2, Mirchi ka salan x1 | 640 | Card | 20:21 | 21:01 | Ready for pickup |
| **WEB-778146** | Kukatpally KPHB | Mutton haleem x3 | 1,050 | UPI | 20:26 | 21:16 | Late by 4 minutes |

---

## 🧪 Automated Test Suite (100% Pass Rate)

Execute via `npm test`:
* **AI Engine**: Load queuing, peak dinner multipliers (1.40x), floor enforcement, 10-minute late alert triggers.
* **Pricing & GST**: 5% GST inclusive math ($Subtotal - Subtotal/1.05$), coupon validation & capping, loyalty points 5% cashback.
* **Compliance & Security**: FSSAI license validation across all 17 outlets, real-time 86 stock pause, and DPDP Act 2023 marketing consent verification.
* **REST APIs**: Health, outlets, menu, orders, status transitions, ₹1.14 Cr analytics, and 24h party notice validation.

---

## 📁 Repository Structure

```
nizami-biryani-direct/
├── package.json              # Project manifest (ES Modules, zero native build bloat)
├── server.js                 # HTTP & Real-time SSE Pub/Sub Hub
├── database.js               # ACID Relational SQLite DB (Node 24 native node:sqlite)
├── ai-engine.js              # Dynamic AI Prep-Time Engine & Recommendation Logic
├── sample-data.js            # 17 Outlets, Full Menu, Seed Orders from Client Brief
├── public/                   # Frontend SPA & Assets
│   ├── index.html            # Main SPA container & navigation
│   ├── css/
│   │   ├── style.css         # Royal Nizami Design System (Obsidian, Saffron, Emerald)
│   │   └── kds.css           # 2-Metre High-Contrast Tablet KDS Stylesheet
│   └── js/
│       └── app.js            # Reactive client, SSE listener, Web Audio synthesizer
├── tests/                    # 19 Automated Unit & Integration Tests
│   ├── ai-prep-time.test.js
│   ├── pricing-gst.test.js
│   ├── security-dpdp.test.js
│   └── server-api.test.js
├── deployment.md             # Reviewer guide, deployment, demo logins & checklist
├── Nizami_Biryani_TDD.md     # Technical Design Document (Markdown)
├── Nizami_Biryani_TDD.pdf    # Technical Design Document (Publication-grade PDF)
├── Nizami_Biryani_TDD.docx   # Technical Design Document (Microsoft Word format)
├── generate-docs.py          # Python compiler for PDF/Word TDD and submission.zip
└── submission.zip            # Submission ZIP containing TDD (PDF/Word) & deployment.md
```

---
*Built with culinary passion and engineering precision for Company A, Hyderabad.*

