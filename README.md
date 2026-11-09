# Company A (NewAgeRestaurant) | Hyderabad Direct Platform
### Direct Ordering Web Application & Real-Time Kitchen Display System (KDS)
**Client**: Company A, Hyderabad — 14 Outlets + 3 Cloud Kitchens | 520 Staff | ₹96 Crore Revenue  
**Brand Identity**: **Company A** (Authentic Hyderabadi Biryani & Royal Delicacies)  
**Author**: Senior Full-Stack Engineering Candidate  
**GitHub Repository**: [https://github.com/hemanthsurnidi/NewAgeRestaurant](https://github.com/hemanthsurnidi/NewAgeRestaurant)  
**Live Demo Server**: [http://localhost:5000](http://localhost:5000)  

[![Test Suite](https://img.shields.io/badge/tests-31%20passed%20(100%25)-success)](tests/)
[![E2E Suite](https://img.shields.io/badge/e2e%20assertions-42%20passed%20(100%25)-success)](scratch/e2e_full_test.cjs)
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D22.5.0-brightgreen)](package.json)
[![Render Deploy](https://img.shields.io/badge/deploy-render-blue)](render.yaml)
[![Database](https://img.shields.io/badge/database-native%20node%3Asqlite-blue)](database.js)
[![Security](https://img.shields.io/badge/security-scrypt%20%7C%20RBAC%20%7C%20sessions-red)](database.js)
[![Real-Time](https://img.shields.io/badge/real--time-Server--Sent%20Events%20(SSE)-orange)](server.js)
[![Compliance](https://img.shields.io/badge/compliance-DPDP%202023%20%7C%20FSSAI%20%7C%205%25%20GST-purple)](tests/auth-security.test.js)

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
git clone https://github.com/hemanthsurnidi/NewAgeRestaurant.git
cd NewAgeRestaurant
npm install
npm test    # Runs 31 automated unit & integration tests (~1.2s)
npm start   # Starts server at http://localhost:5000
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 🎯 8 Key Screens & Workflows

1. **🍲 Customer Direct Ordering App**:
   - Geofenced Hyderabad outlet selector across 14 dine-in outlets and 3 cloud kitchens with deterministic delivery radius calculation.
   - Authentic menu photography, veg/non-veg marks, spice meters (Mild, Medium, Fiery, Nawabi Dum), allergen alerts, portions (Single, Regular, Family Pack), and add-ons (Extra Salan, Burani Raita, Boiled Eggs).
   - Transparent pricing: **All prices include 5% GST and explicitly say so**.
   - Out-of-Stock handling: Instantly greys out with "SOLD OUT AT THIS OUTLET" when kitchen pauses stock ("86 item").

2. **✨ AI Smart Re-Order Suggestions**:
   - Analyzes customer order history by phone number (e.g. Rahul Verma).
   - **Zero Dark Patterns Rule**: Suggestions **never auto-add items to the cart**. Each suggestion shows an honest rationale and requires an explicit tap on `+ Add`.

3. **⚡ Express Checkout & Payment Simulator (< 60 Seconds Flow)**:
   - One-tap pre-filled addresses (Kondapur / Gachibowli / Kukatpally).
   - Coupon codes (`DIRECT15` for 15% off, `NIZAM100` for ₹100 off, `FAMILYPACK` for ₹150 off).
   - **Interactive Royalty Points Slider**: Redeem loyalty balance with 1-click (1 point = ₹1), plus earn 5% cashback on this order!
   - **DPDP Act 2023 Consent Checkbox**: Verified opt-in for marketing & transactional updates.
   - Payment Sandbox Simulator: Instant UPI QR code (GPay/PhonePe/Paytm) & Card test mode with **Simulate Success**, **Simulate Bank Decline**, and **Simulate Gateway Timeout** with retry flow!

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
   - **Role & Outlet Isolation**: Staff can only manage tickets for their assigned outlet!

6. **📋 Central Menu CMS & Real-Time Stock ("86 Item")**:
   - Central overview of items, prices, spice levels, allergens, and time-based tags ("All Day", "Lunch Special", "Dinner & Midnight Biryani").
   - Full CRUD: "＋ Create New Dish", "✏️ Edit Dish", "🗑️ Delete Dish".
   - Regional City Pricing: Configure city-specific prices (Hyderabad Core, Secunderabad, Cyberabad).
   - 1-Click live stock pause/resume per outlet: instantly pushes SSE event greying out the dish on customer devices in sub-50ms!

7. **📊 ₹1.14 Crore Financial Savings Dashboard**:
   - Live tracking toward Company A's annual target.
   - Net margin saved (15%) and aggregator commission avoided (27%).
   - Outlet leaderboard comparing all 17 Hyderabad locations.
   - Customer retention metric: **38.2% repeat rate** (beating the 35% Month 6 client target).

8. **👤 Customer Account & Order History Portal**:
   - Customer profile details and real-time loyalty ledger.
   - Full history of all past orders with status badges, itemized receipt breakdown, and live tracking links.
   - 1-Click "🔄 Re-Order" button to re-populate previous feasts.

---

## 🔐 Reviewer Demo Accounts & Role Switching

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@dumco.in` | `Customer@123` | Rahul Verma, 340 loyalty points, past orders |
| **Kitchen Staff (Kondapur)** | `kondapur@dumco.in` | `Kitchen@123` | Chef Mohammed Qasim, Kondapur Flagship |
| **Kitchen Staff (Gachibowli)** | `gachibowli@dumco.in` | `Kitchen@123` | Chef Syed Arshad, Gachibowli Cloud Kitchen |
| **Kitchen Staff (Kukatpally)** | `kukatpally@dumco.in` | `Kitchen@123` | Chef Nageshwar Rao, Kukatpally KPHB |
| **Admin** | `admin@dumco.in` | `Admin@123` | Zafar Khan, Central Menu CMS & Analytics |

*Reviewers can also use the **1-Click Demo Login** buttons inside the Sign In modal to switch roles instantly.*

---

## 🤖 The AI & Intelligent Automation Engine

### Dynamic Prep-Time Formula
$$\text{Item Prep} = \max(\text{Item Complexity}) + 0.28 \times \sum \text{Secondary Items}$$
$$\text{Queue Wait} = \text{Active Orders} \times 2.2\text{ mins} \times \text{Peak Multiplier}$$
$$\mathbf{Honest\ Promised\ Time = \max(\lceil \text{Item Prep} + \text{Queue Wait} \rceil,\ \text{Outlet Minimum Prep Floor})}$$

### Safety Rules & Failure Recovery
* **Promised Time Floor**: Promised time is always the higher of the AI calculation and the outlet's minimum floor (e.g. 25 mins at Kondapur).
* **10-Minute Delay Trigger**: An order running 10+ minutes late automatically triggers a critical KDS alert banner, notifies the outlet manager, and dispatches a **₹50 loyalty credit** apology message to the customer.
* **Manager Prep Override**: Kitchen managers can manually bump preparation time by +5m or +10m with reasons stored in the audit log.
