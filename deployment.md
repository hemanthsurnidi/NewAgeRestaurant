# Deployment & Evaluation Guide

**Project**: Dum & Co. — Direct Ordering Platform & Real-Time Kitchen Display System (KDS)  
**Client**: Company A, Hyderabad (14 Dine-in Outlets + 3 Cloud Kitchens, 520 Staff, ₹96 Crore Revenue)  
**Brand Identity**: **Dum & Co.** (Royal Hyderabad Wood-Fire Biryani & Curries)  
**Author**: Senior Full-Stack Development Team for Company A  
**GitHub Repository**: [https://github.com/hemanthsurnidi/nizami-biryani-direct](https://github.com/hemanthsurnidi/nizami-biryani-direct)  

---

## 1. Quick Local Setup (Under 60 Seconds)

The application is built with **Node.js 24** using native capabilities (`node:sqlite`, `node:crypto`, `node:test`, and native Server-Sent Events). It has **zero heavy native build dependencies**, meaning it boots instantly across Windows, macOS, and Linux without native C++ compilation failures.

### Prerequisites
- Node.js `v20.0.0` or higher (Node.js `v24.x` recommended)
- Git

### Step-by-Step Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/hemanthsurnidi/nizami-biryani-direct.git
   cd nizami-biryani-direct
   ```

2. **Verify / Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Automated Test Suite**:
   ```bash
   npm test
   ```
   *Executes 31 comprehensive unit and integration tests covering scrypt password hashing, session tokens, RBAC outlet isolation, unavailable item checkout prevention, mock payment gateway failure/retry flow, delivery radius calculation, AI dynamic prep-time algorithm, 5% GST inclusive math, coupon capping, 24-hour party notice validator, and DPDP consent.*

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
- **Vercel / Netlify**: Deployable as a full-stack Node.js server with persistent volume for SQLite `data/nizami.db` (or remote Turso / PlanetScale database adapter).

---

## 3. Environment Variables

Copy `.env.example` to `.env` if custom configuration is desired (never commit secrets to version control):

| Variable Name | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | Optional | `3000` | Port for the HTTP and SSE server |
| `NODE_ENV` | Optional | `development` | Runtime environment (`development` / `production`) |
| `DATABASE_PATH` | Optional | `./data/nizami.db` | Path to persistent SQLite database file |
| `SESSION_SECRET` | Optional | `dum_co_secure_scrypt_salt_token_2026_hyderabad_key` | Secret salt for session token verification |
| `GEMINI_API_KEY` | Optional | *None* | Optional Google Gemini API key for natural language chef notes. If omitted, the local deterministic AI workload heuristic runs with 100% offline accuracy. |

---

## 4. Reviewer Demo Logins & Credentials

All demo accounts are seeded into the relational database with secure **scrypt password hashes and unique salts**. 

For maximum reviewer convenience, reviewers can authenticate either via:
1. **The Navigation Bar "Sign In" Button**: Offers both manual email/password login and a **1-Click Demo Login** panel that signs in instantly.
2. **The Floating "Reviewer Portal"**: Accessible via the discrete gear button on the right edge.
3. **Standard Form Login**: Use the exact credentials below:

| Persona | Email | Password | Role | Assigned Outlet / Access |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | `customer@dumco.in` | `Customer@123` | `customer` | Full customer ordering, 340 loyalty points, past orders history |
| **Kitchen Staff (Kondapur)** | `kondapur@dumco.in` | `Kitchen@123` | `kitchen_staff` | Kondapur Flagship Kitchen Display (`out-kondapur`) |
| **Kitchen Staff (Gachibowli)** | `gachibowli@dumco.in` | `Kitchen@123` | `kitchen_staff` | Gachibowli Cloud Kitchen (`out-gachibowli-ck`) |
| **Kitchen Staff (Kukatpally)** | `kukatpally@dumco.in` | `Kitchen@123` | `kitchen_staff` | Kukatpally KPHB Kitchen Display (`out-kukatpally`) |
| **Central Admin** | `admin@dumco.in` | `Admin@123` | `admin` | Full Central Menu CMS, city prices, and financial dashboard |

---

## 5. Reviewer Guided Walkthrough & Key Workflows

### 1. Customer Ordering & Geofence Verification
- Open `http://localhost:3000`.
- Notice the **Dum & Co.** branding, FSSAI licensing badge, and 5% GST inclusive pricing notice.
- Click the **Delivering From** outlet pill in the navbar.
- Try the interactive **Verify Delivery Radius** box:
  - Type `Kondapur` or `Gachibowli` ➔ shows **Delivery Available (within radius)**.
  - Type `Shamshabad Airport` ➔ shows **Outside Delivery Radius** with nearest outlet suggestion and pickup option.
- Browse the menu, select portions (e.g., Family Pack), and choose add-ons (Extra Salan, Burani Raita).
- Notice out-of-stock items ("86 items") are clearly marked and cannot be checked out.

### 2. Express Checkout & Payment Simulator (< 60 Seconds)
- Add items to the cart and click **Proceed to Checkout**.
- Apply coupon `DIRECT15` (15% off) or `NIZAM100` (₹100 off).
- Slide the **Royalty Points Slider** to redeem points (1 point = ₹1 discount).
- Click **Pay Online (Sandbox UPI / Card)**:
  - Click **🟢 Authorize Payment (Simulate Success)** ➔ completes order and routes to live tracking.
  - Or click **🔴 Simulate Bank Decline** ➔ demonstrates banking decline rejection banner and **🔄 Retry Payment** button.
  - Or click **🟠 Simulate PSP Timeout** ➔ demonstrates gateway timeout handling.

### 3. Kitchen Display System (KDS) & Real-Time Sync
- Sign in as **Chef Mohammed Qasim** (`kondapur@dumco.in`).
- Experience the 2-metre high-contrast industrial tablet interface.
- Observe incoming orders appearing in real time via Server-Sent Events (SSE).
- Hear the pleasant Web Audio synthesizer chime on new order arrival.
- Advance orders: **Start Cooking** ➔ **Mark Ready for Pickup** ➔ **Rider Handover**.
- Click **+5m Bump** to test manager prep-time override.
- Verify outlet data isolation: staff cannot update tickets from other outlets.

### 4. Overdue Order & Auto-Compensation
- Inspect seeded order `#WEB-778146` (Kukatpally).
- Observe the red overdue timer.
- Click **⚡ Test 10m Late Trigger**:
  - The KDS triggers a pulsing crimson critical banner.
  - The customer live tracking screen immediately displays the **₹50 Royalty Credit Apology** notification.

### 5. Central Menu CMS (Admin)
- Sign in as **Zafar Khan** (`admin@dumco.in`).
- Open **Central Menu CMS**:
  - Click **＋ Create New Dish** to add a new Hyderabadi specialty.
  - Click **✏️ Edit** on any dish to update spice level, allergens, or base price.
  - Click **🗑️ Delete** to remove an item.
  - Click **Live Stock Status (86 Item)** to pause an item for a specific outlet ➔ verify it instantly greys out on the customer menu!
  - Click **🏙️ City Prices** to configure regional pricing overrides (Hyderabad Core vs Secunderabad vs Cyberabad).

### 6. Executive Financial Economics Dashboard
- Open the **Financial Dashboard** view.
- Review Company A's progress toward the **₹1.14 Crore annual savings target**:
  - Commission savings (15% net margin saved on direct delivery vs 27% aggregator fee).
  - Outlets leaderboard across all 14 dine-in outlets and 3 cloud kitchens.
  - Customer repeat rate (38.2% vs 35% target).

### 7. Party & Bulk Catering Desk
- Open the **Party Catering** view.
- Fill out the party catering builder.
- Attempt to book an event with under 24 hours notice ➔ backend rejects with **24-hour advance notice requirement**.
- Book for 3 days in advance ➔ request is accepted and routed to the Catering Specialist desk.
