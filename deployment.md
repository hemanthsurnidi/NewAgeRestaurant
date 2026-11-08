# Deployment & Evaluation Guide

**Project**: Nawabi Zaika / Nizami Biryani — Direct Ordering Platform & Real-Time Kitchen Display System (KDS)  
**Client**: Company A, Hyderabad (14 Dine-in Outlets + 3 Cloud Kitchens, 520 Staff)  
**Candidate**: Hemanth Surnidi (`hemanthsurnidi20095@gmail.com`)  
**GitHub Repository**: [https://github.com/hemanthsurnidi/nizami-biryani-direct](https://github.com/hemanthsurnidi/nizami-biryani-direct)  

---

## 1. Quick Local Setup (Under 60 Seconds)

The project is built with **Node.js 24** using native capabilities (`node:sqlite`, `node:test`, and native Server-Sent Events). It has **zero heavy native build dependencies**, meaning it starts instantly on Windows, macOS, or Linux without compilation failures.

### Prerequisites
- Node.js `v20.0.0` or higher (Node.js `v24.x` recommended)
- Git

### Step-by-Step Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/hemanthsurnidi/nizami-biryani-direct.git
   cd nizami-biryani-direct
   ```

2. **Verify / Install**:
   ```bash
   npm install
   ```
   *(Note: The core application runs with zero external npm runtime dependencies out-of-the-box using Node.js built-ins).*

3. **Run the Automated Test Suite**:
   ```bash
   npm test
   ```
   *Executes 19 comprehensive unit and integration tests covering the AI dynamic prep-time algorithm, 5% GST inclusive math, coupon capping, 24-hour party notice validator, real-time 86 stock pausing, and DPDP consent.*

4. **Start the Application**:
   ```bash
   npm start
   ```
   *Or for live file watch during development:*
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 2. Cloud Deployment & Hosting Architecture

The application is structured for instant containerized or serverless hosting:

### Deployment Platforms
- **Render / Railway / Fly.io**: Connect GitHub repository, set `Build Command` to `npm install` and `Start Command` to `npm start`. Set port to `3000` (or allow dynamic `$PORT`).
- **Docker**:
  ```dockerfile
  FROM node:24-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm install --production
  COPY . .
  EXPOSE 3000
  CMD ["node", "server.js"]
  ```
- **Vercel / Netlify**: Deployable as a Node.js full-stack app or container with persistent volume for SQLite `data/nizami.db` (or remote Turso / PlanetScale database adapter).

---

## 3. Environment Variables

Create a `.env` file in the project root if needed (never commit secrets to version control):

| Variable Name | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | Optional | `3000` | Port for the HTTP and SSE server |
| `NODE_ENV` | Optional | `development` | Runtime environment (`development` / `production`) |
| `DATABASE_PATH` | Optional | `./data/nizami.db` | Path to persistent SQLite database file |
| `GEMINI_API_KEY` | Optional | *None* | Optional Google Gemini API key for natural language chef notes. If omitted, the local deterministic AI heuristic engine runs with 100% offline accuracy. |

---

## 4. Reviewer Demo Logins & Persona Switching

For rapid interview evaluation, a **Quick Role Switcher** is pinned directly at the top right of the navigation bar. You can switch personas with a single click without logging out:

### 1. Customer Persona (Mobile Ordering Experience)
- **Role**: Registered Hyderabad Customer
- **Demo User**: Rahul Verma
- **Phone**: `+91 98490 12345`
- **Default Delivery Address**: Flat 402, Aditya Sunshine, Kondapur, Hyderabad - 500084
- **Royalty Points Balance**: 340 Points (₹340 instant discount slider)
- **What to test**:
  - Browse Dum Biryanis, Shahi Haleem, Kebabs, and Curries
  - See AI Smart Re-Order Suggestions (personalized based on Rahul's history, never auto-added)
  - Select portions (Family Pack / Regular / Single) and add-ons (Extra Salan, Raita, Boiled Eggs)
  - Add items to cart and click **Proceed to Checkout** (< 60s checkout)
  - Apply coupon `DIRECT15` (15% off) or `NIZAM100` (₹100 off)
  - Slide royalty points to redeem discount
  - Verify 5% GST inclusive pricing notice
  - Check the DPDP Act 2023 consent checkbox
  - Place order using UPI QR or Card test mode
  - View live tracking and the simulated WhatsApp order notification!

### 2. Kitchen Lead — Kondapur Flagship
- **Role**: Outlet Head Ustad / Kitchen Manager
- **Demo User**: Chef Mohammed Qasim
- **Outlet**: Kondapur Flagship (`out-kondapur`, FSSAI: `13622014000491`)
- **What to test**:
  - High-contrast industrial KDS tablet view readable from 2 metres
  - Toggle audio chime ON/OFF (Web Audio API synthesizer)
  - View seeded order `#WEB-778120` (Chicken dum biryani family pack x1, Double ka meetha x2, ₹1180, UPI, Preparing)
  - Advance status: **Start Cooking** ➔ **Mark Ready for Pickup** ➔ **Rider Handover**
  - Click **+5m Bump** to test manager prep-time override

### 3. Kitchen Lead — Gachibowli Cloud Kitchen
- **Role**: Cloud Kitchen Lead
- **Demo User**: Chef Syed Arshad
- **Outlet**: Gachibowli Cloud Kitchen (`out-gachibowli-ck`, FSSAI: `13622014000812`)
- **What to test**:
  - View seeded order `#WEB-778131` (Veg biryani x2, Mirchi ka salan x1, ₹640, Card, Ready for pickup)
  - Inspect rapid cloud kitchen throughput metrics

### 4. Kitchen Lead — Kukatpally KPHB (Late Order & Alert Scenario)
- **Role**: Kitchen Lead
- **Demo User**: Chef Nageshwar Rao
- **Outlet**: Kukatpally KPHB (`out-kukatpally`, FSSAI: `13622014000355`)
- **What to test**:
  - View seeded order `#WEB-778146` (Mutton haleem x3, ₹1050, UPI, Late by 4 minutes)
  - Observe dynamic red color coding for overdue order
  - When an order exceeds promised time by 10+ minutes, see the **Critical Late Alert Banner** and automated ₹50 delay apology credit!

### 5. Central Menu CMS & Operations HQ
- **Role**: Central Menu Admin / VP Operations
- **Demo User**: Zafar Khan (Banjara Hills HQ)
- **What to test**:
  - Central overview of all dishes, prices, spice meters, and allergens
  - Click the **Live Stock Status** toggle to pause an item ("86 item") for any outlet (e.g. pause Mutton Haleem at Gachibowli)
  - Switch back to Customer view and observe that the paused dish immediately displays as "SOLD OUT AT THIS OUTLET" with disabled cart button!

### 6. Executive Financial Dashboard
- **Role**: Founder-CEO & Finance Team
- **What to test**:
  - Real-time calculation of **₹1.14 Crore annual savings target**
  - Live commission savings breakdown (15% net margin saved on direct delivery vs 27% app commission)
  - Outlet performance leaderboard across all 14 dine-in outlets and 3 cloud kitchens
  - Customer retention tracking (38.2% repeat rate vs 35% Month 6 client target)

### 7. Party & Bulk Catering Desk
- **Role**: Catering Specialist
- **What to test**:
  - View existing party order `#PARTY-9901` (Dr. Farooq Azam, 45 guests, ₹28,500)
  - Test the booking form: select today's date and observe the **24-hour minimum notice validation error**
  - Select a future date (>= 24h) and submit a bulk request to see it appear on the Catering Desk.

### 8. AI Dynamic Prep-Time Lab
- **Role**: Engineering & Diagnostics Reviewer
- **What to test**:
  - Interactive simulator: adjust active kitchen pots (0 to 25) and peak hour multipliers (1.0x to 1.40x weekend rush)
  - Watch the formula calculate in real-time:
    $$\text{Honest Promised Time} = \max(\text{Base Prep} + \text{Queue Delay} \times \text{PeakFactor}, \text{Outlet Floor})$$
  - Verify that the promised time is never lower than the outlet's minimum floor.

---

## 5. Summary of Pre-Seeded Sample Data from Client Brief

| Order ID | Outlet | Items | Total (₹) | Payment | Placed | Promised | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **WEB-778120** | Kondapur Flagship | Chicken dum biryani family pack x1, Double ka meetha x2 | 1,180 | UPI | 20:14 | 20:59 | Preparing |
| **WEB-778131** | Gachibowli Cloud Kitchen | Veg biryani x2, Mirchi ka salan x1 | 640 | Card | 20:21 | 21:01 | Ready for pickup |
| **WEB-778146** | Kukatpally KPHB | Mutton haleem x3 | 1,050 | UPI | 20:26 | 21:16 | Late by 4 minutes |

---
*Developed with rigorous attention to detail for the Isocode Workspace Software Engineering assessment.*

