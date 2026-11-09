# Deployment & Evaluation Guide — Company A

**Project**: Company A (NewAgeRestaurant) — Direct Kitchen Ordering Web Platform & Real-Time Kitchen Display System (KDS)  
**Client**: Company A, Hyderabad (14 Dine-in Outlets + 3 Cloud Kitchens, 520 Staff, ₹96 Crore Revenue)  
**Brand Identity**: **Company A** (Authentic Hyderabadi Biryani & Royal Delicacies)  
**Author**: Senior Full-Stack Engineering Candidate  
**GitHub Repository**: [https://github.com/hemanthsurnidi/NewAgeRestaurant](https://github.com/hemanthsurnidi/NewAgeRestaurant)  
**Live Evaluation Server**: [http://localhost:5000](http://localhost:5000)  
**Direct Download Package**: [Download submission.zip](http://localhost:5000/download/submission.zip)  

---

## 1. Quick Local Setup (Under 60 Seconds)

The platform is engineered on **Node.js 24** using pure native components (`node:sqlite`, `node:crypto`, `node:test`, and native Server-Sent Events). It has **zero heavy C++ native compilation dependencies**, ensuring instant cross-platform execution on Windows, macOS, and Linux.

### Prerequisites
- Node.js `v20.0.0` or higher (`v24.x` recommended)
- Standard Web Browser (Chrome, Edge, Firefox, Safari)

### Step-by-Step Instructions

1. **Clone or Navigate to Directory**:
   ```bash
   git clone https://github.com/hemanthsurnidi/NewAgeRestaurant.git
   cd NewAgeRestaurant
   ```

2. **Verify Dependencies**:
   ```bash
   npm install
   ```

3. **Run Automated Test Suite (31 Unit Tests)**:
   ```bash
   npm test
   ```
   *Verifies scrypt password hashing, session tokens, RBAC outlet isolation, 86 item out-of-stock locking, mock payment gateway failure/retry flow, 7km geofence delivery radius, AI dynamic prep-time algorithm, 5% GST inclusive calculations, coupon validation, 24-hour party notice validator, and DPDP Act 2023 consent.*

4. **Run End-to-End System Integration Suite (42 Assertions)**:
   ```bash
   node scratch/e2e_full_test.cjs
   ```
   *Tests live order placement, deterministic kitchen routing, real-time KDS progression, WhatsApp messages, 10m overdue delay simulation & ₹50 compensation, bulk party catering confirmation, and financial analytics.*

5. **Start the Live Server**:
   ```bash
   npm start
   ```
   *The server initializes the SQLite schema, seeds all 17 Hyderabad locations with valid FSSAI licenses, and listens on port 5000.*

6. **Open in Browser**:
   ```
   http://localhost:5000
   ```

---

## 2. Direct Package Download

- **Browser One-Click Download**: [http://localhost:5000/download/submission.zip](http://localhost:5000/download/submission.zip)
- **Local File Path**: `nizami-biryani/submission.zip`

---

## 3. Reviewer Demo Logins & Credentials

All demo accounts are secured via native **scrypt key-derivation password hashing with unique per-user salts**.

For convenience, reviewers can authenticate using either:
1. **The Navigation Bar "Sign In" Button**: Features standard login as well as a **1-Click Demo Login** panel for instant access.
2. **Top Role Switcher**: The top strip contains a direct role switcher allowing instant persona jumping (`Customer Ordering`, `Kitchen Display (KDS)`, `Central Menu Admin`, `Outlet Dashboard`, `Party Orders`, `AI Prep-Time Estimate`).
3. **Standard Manual Login**: Use any of the credentials below:

| Persona | Email | Password | Role | Assigned Outlet / Access |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | `customer@companya.in` | `Customer@123` | `customer` | Full customer ordering, 340 loyalty points, past orders history |
| **Kitchen Staff (Kondapur)** | `kondapur@companya.in` | `Kitchen@123` | `kitchen_staff` | Kondapur Flagship Kitchen Display (`out-kondapur`) |
| **Kitchen Staff (Gachibowli)** | `gachibowli@companya.in` | `Kitchen@123` | `kitchen_staff` | Gachibowli Cloud Kitchen (`out-gachibowli-ck`) |
| **Kitchen Staff (Kukatpally)** | `kukatpally@companya.in` | `Kitchen@123` | `kitchen_staff` | Kukatpally KPHB Kitchen Display (`out-kukatpally`) |
| **Central Admin** | `admin@companya.in` | `Admin@123` | `admin` | Full Central Menu CMS, 86 item stock pausing, bulk approvals, and analytics |

*(Note: Legacy `@dumco.in` email aliases are also preserved for backward compatibility).*

---

## 4. Environment Variables

Create or modify `.env` if custom configuration is desired (defaults are pre-configured):

| Variable Name | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | Optional | `5000` | HTTP and Server-Sent Events server port |
| `NODE_ENV` | Optional | `production` | Runtime mode (`development` / `production`) |
| `DATABASE_PATH` | Optional | `./data/nizami.db` | Path to persistent SQLite database file |
| `SESSION_SECRET` | Optional | `companya_secure_scrypt_salt_token_2026_hyderabad_key` | Secret salt for session token verification |

---

## 5. Reviewer Guided Walkthrough & Key Workflows

### 1. Customer Ordering & 7km Delivery Geofence
- Open [http://localhost:5000](http://localhost:5000).
- Select **Role: Customer Ordering** from the top switcher.
- Notice the **Company A** branding, FSSAI license numbers (`13622014000298`), and clear 5% GST inclusive pricing notice.
- Click the **Delivering From** outlet pill in the navbar:
  - Enter `Kondapur` or `Gachibowli` ➔ shows **Within Delivery Radius (7 km)**.
  - Enter `Shamshabad Airport` ➔ shows **Outside Delivery Radius** with nearest outlet suggestion.
- Browse the 10 authentic Hyderabadi dishes with portion sizes (Single, Double, Family Pack) and add-ons.

### 2. Express Checkout & Payment Simulator (< 60 Seconds)
- Add dishes to your cart and click **Proceed to Checkout**.
- Apply coupon `DIRECT15` (15% off) or `DIRECT50` (₹50 off).
- Drag the **Loyalty Points Slider** to redeem points (1 point = ₹1 direct discount).
- Note the explicit **5% GST breakdown** and **DPDP Act 2023 consent checkbox**.
- Select payment method and test payment:
  - Click **🟢 Authorize Payment** ➔ instant order confirmation.
  - Or click **🔴 Simulate Bank Decline** ➔ displays decline banner with **🔄 Retry Payment** option.

### 3. Kitchen Display System (KDS) & Multi-Tenant Routing
- Switch to **Role: Kitchen Display (KDS)**.
- Choose your kitchen from the dropdown: select **Kondapur Flagship** (or view **All 17 Kitchens**).
- Experience the 2-metre readable industrial dark interface designed for commercial kitchen Android tablets.
- Real-time order stages:
  1. Click **🔥 Start Prep** ➔ advances to `Cooking` / `PREPARING`.
  2. Click **✅ Ready for Pickup** ➔ advances to `Ready` / `READY_FOR_PICKUP`.
  3. Click **🛵 Rider Handoff** ➔ advances to `Dispatched` / `DISPATCHED`.
- Multi-tenant isolation: switch to another kitchen (e.g. Ameerpet) to verify that tickets are isolated per outlet.

### 4. Overdue Order Monitor & Automatic ₹50 Compensation
- On the KDS, locate an order with an overdue timer.
- Click **⚡ Test 10m Delay**:
  - The KDS displays a pulsing critical delay warning banner alerting the outlet manager.
  - Customer live tracking view automatically awards a **₹50 Loyalty Compensation Credit** to the customer's ledger.
  - Manager can click **+5m Override** to add a prep time buffer during rush hours.

### 5. Central Menu CMS (Dish Management & 86 Item Pausing)
- Switch to **Role: Central Menu Admin**.
- Notice the staff portal header (`Menu CMS`, `Bulk Orders`, `Outlet Dashboard`, `AI Prep-Time`).
- Click **＋ Add Dish** to add a new dish, or edit spice level and allergens.
- Click **🏷️ City Pricing** to configure regional pricing overrides (Hyderabad Core vs Secunderabad vs Cyberabad).
- Toggle **Live Stock Status (86 Item)** to pause an item ➔ verify it instantly greys out on the customer menu and rejects checkout!

### 6. Party & Bulk Catering Approval Desk
- In Central Admin, click **Bulk Orders** (or switch to **Role: Party Orders**).
- Review customer catering requests (>15 guests, 24h advance notice).
- Click **✓ Manager Confirm**:
  - Assigns Catering Head Ustad and schedules degh preparation.
  - Order status updates to `CONFIRMED`.
- Or click **✕ Decline** with reason notes.

### 7. Executive Financial Economics Dashboard
- Switch to **Role: Outlet Dashboard**.
- Review progress toward Company A's **₹1.14 Crore annual savings target**:
  - 15% net margin saved on direct delivery vs 27% aggregator fee.
  - Complete 17-outlet leaderboard ranking orders, revenue, cancellations, and prep times.
  - 38.2% repeat customer rate (exceeding the 35% goal).

### 8. AI Prep-Time Estimate Lab
- Switch to **Role: AI Prep-Time Estimate**.
- Test live predicted prep times based on active kitchen load, dish complexity, and Friday/Sunday dinner peaks (1,200 orders/hr).
- Verifies that honest promised time is always the higher of the AI prediction and the outlet's minimum floor.

---

## 6. Cloud Deployment Architecture

The application is structured for instant containerized deployment:

### Docker
```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Build & Run
```bash
docker build -t companya-platform .
docker run -p 5000:5000 companya-platform
```

### Production Hosting Platforms
- **Render / Railway / Fly.io**: Connect git repository, set build command `npm install` and start command `node server.js`. Configure `PORT=5000`.
- **AWS ECS / DigitalOcean App Platform**: Deploy the Docker container directly with persistent volume mapping for `./data/nizami.db`.
