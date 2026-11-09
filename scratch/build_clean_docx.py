import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCX_PATH = os.path.join(BASE_DIR, "Company_A_TDD.docx")

def build_docx():
    doc = docx.Document()

    # 1 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Title
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(2)
    run_title = p_title.add_run("Technical Design Document (TDD)")
    run_title.font.name = 'Arial'
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42)

    # Subtitle
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(12)
    run_sub = p_sub.add_run("Company A — Direct Ordering Platform & Real-Time Kitchen Display System (KDS)")
    run_sub.font.name = 'Arial'
    run_sub.font.size = Pt(12)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(217, 119, 6)

    # Metadata Table
    table = doc.add_table(rows=6, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    meta_items = [
        ("Client:", "Company A, Hyderabad (14 Dine-in Outlets + 3 Cloud Kitchens, 520 Staff)"),
        ("Annual Turnover:", "₹96 Crore baseline (₹90–105 Crore chain)"),
        ("GitHub Repository:", "https://github.com/hemanthsurnidi/NewAgeRestaurant"),
        ("Live Production Deployment (Render):", "https://newagerestaurant.onrender.com/"),
        ("Author / Candidate:", "Hemanth Surnidi (hemanthsurnidi20095@gmail.com)"),
        ("Automated Test Status:", "31 Unit Tests (100% Passed) + 42 E2E Assertions (100% Passed)")
    ]

    for i, (k, v) in enumerate(meta_items):
        cell_k = table.cell(i, 0)
        cell_v = table.cell(i, 1)
        cell_k.width = Inches(2.2)
        cell_v.width = Inches(4.6)
        
        pk = cell_k.paragraphs[0]
        pk.paragraph_format.space_after = Pt(2)
        rk = pk.add_run(k)
        rk.font.name = 'Arial'
        rk.font.size = Pt(9.5)
        rk.font.bold = True
        rk.font.color.rgb = RGBColor(15, 23, 42)

        pv = cell_v.paragraphs[0]
        pv.paragraph_format.space_after = Pt(2)
        rv = pv.add_run(v)
        rv.font.name = 'Arial'
        rv.font.size = Pt(9.5)
        if "http" in v:
            rv.font.color.rgb = RGBColor(37, 99, 235)
            rv.font.underline = True
        else:
            rv.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    def add_h1(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(4)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.font.name = 'Arial'
        r.font.size = Pt(13)
        r.font.bold = True
        r.font.color.rgb = RGBColor(15, 23, 42)
        return h

    def add_h2(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(3)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.font.name = 'Arial'
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = RGBColor(30, 41, 59)
        return h

    def add_p(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            rb = p.add_run(bold_prefix)
            rb.font.name = 'Arial'
            rb.font.size = Pt(9.5)
            rb.font.bold = True
            rb.font.color.rgb = RGBColor(15, 23, 42)
        r = p.add_run(text)
        r.font.name = 'Arial'
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(51, 65, 85)
        return p

    # 1. Executive Summary
    add_h1("1. Executive Summary & Business Problem Statement")
    add_p("Company A is one of Hyderabad’s most celebrated culinary institutions, operating 14 dine-in restaurants and 3 cloud kitchens across the twin cities, employing 520 staff, and generating ₹96 Crore in baseline annual revenue.")
    add_h2("Today's Operational Dilemma")
    add_p(" 55% of annual sales (₹52.8 crore) flow through delivery aggregators (Swiggy, Zomato) charging 27% in commission (₹14.25 crore annual drain) while locking the brand out of customer data.", "• Aggressive Delivery App Commissions: ")
    add_p(" A single unmanaged phone line loses an estimated 30 bulk and party orders monthly at ₹18,000 average order value and 30% margin.", "• Phone Line Leakage on Bulk Orders: ")
    add_p(" Outlets operate disparate billing systems, menus and prices are manually synced across apps, and kitchens run on paper tickets prone to loss and smoke damage.", "• Fragmented Operations: ")

    add_h2("The Financial Business Case & Target ROI")
    add_p("• Retail Direct Order Savings: Migrating 12% of app orders to direct channels saves 15% net margin (27% app commission - 12% direct 3PL cost) on ₹6.336 crore = +₹95.04 Lakh/year.")
    add_p("• Bulk & Party Catering Recovery: Capturing the lost 30 party orders/month through a 24-hour advance booking desk = +₹19.44 Lakh/year (30 × ₹18,000 × 30% × 12 months).")
    add_p("• Total Annual Value Captured: ₹1.1448 Crore per year (₹1.14 Crore).")
    add_p("• Payback Period: Under 30 days against an engineering budget of ₹9 lakh over 8 weeks.")

    # 2. Assumptions
    add_h1("2. Explicitly Labeled Assumptions")
    assumptions = [
        ("[Assumption A1: Kitchen Hardware Constraints]", " Kitchen staff operate on inexpensive 10-inch Android tablets mounted on wall brackets in hot, humid, and noisy spaces. The KDS requires an industrial high-contrast dark theme, 2-metre typography, oversized buttons, and dual visual and Web Audio sound cues."),
        ("[Assumption A2: Concurrency & Demand Peaks]", " Peak ordering reaches 1,200 orders/hour across outlets on Friday and Sunday dinner hours (19:30–22:30 IST), representing ~70 orders/hour/outlet (~1.2 orders/min/outlet). Sub-50ms response times must be maintained."),
        ("[Assumption A3: Logistics Fleet Boundary]", " Delivery fleet riders are sourced from third-party logistics partners (3PL e.g. Shadowfax, Dunzo, Porter) at an average cost of 12%. Building an own fleet rider tracking app is strictly out of scope."),
        ("[Assumption A4: Statutory Tax & Data Privacy Compliance]", " Consumer prices include 5% GST as mandated by Indian restaurant tax laws. Each outlet visibly displays its 14-digit FSSAI license number. Customer contact numbers are protected personal data under the DPDP Act 2023, requiring affirmative consent for marketing communications."),
        ("[Assumption A5: Artisanal Preparation Constraints]", " Authentic Hyderabadi Dum Biryani and Shahi Haleem are slow-cooked in large copper deghs sealed with dough. Consequently, party catering orders (>15 guests or ₹5,000+) strictly enforce at least 24 to 48 hours advance notice.")
    ]
    for tag, desc in assumptions:
        add_p(desc, tag)

    # 3. System Architecture
    add_h1("3. System Architecture & Engineering Rationale")
    add_p("We selected an Event-Driven Reactive Micro-Monolith built on Node.js 24 with native node:sqlite and native Server-Sent Events (SSE).")
    add_p("• Zero Native Build Dependencies: Built-in SQLite (node:sqlite) and test runner (node:test) eliminate native C++ compilation failures across Windows, macOS, and Linux.")
    add_p("• Real ACID Relational Database: Full SQLite schema with foreign key cascades, WAL mode concurrency, and parameterized queries ensuring 100% SQL injection immunity.")
    add_p("• Sub-50ms Push via Server-Sent Events (SSE): Push updates across kitchen screens and customer order tracking screens without page refreshing or fragile third-party SaaS websockets.")
    add_p("• Cryptographic Security & RBAC: Scrypt password hashing with unique salts, signed session tokens, and strict role guards ensuring kitchen staff only access their assigned outlet.")
    add_p("• High Peak Concurrency: Non-blocking event-driven I/O easily serves 1,200 orders/hour with sub-10ms response times and under 50 MB memory consumption.")

    # 4. Data Model
    add_h1("4. Comprehensive Data Model")
    add_p("The relational schema is normalized to 3NF and includes:")
    add_p("• outlets: 17 Hyderabad locations (14 Dine-in flagships + 3 Cloud Kitchens), coordinates, 7km delivery radius, minimum prep floor (18–30m), 14-digit FSSAI license.")
    add_p("• menu_items: Categories, base prices (incl 5% GST), veg classification (is_veg), spice level, allergens, prep complexity weight, time-based tags.")
    add_p("• portions & add_ons: Portion sizes (Single, Regular, Family Pack) and add-on options (Extra Salan, Burani Raita, Boiled Eggs).")
    add_p("• outlet_stock: Real-time inventory matrix enabling instant '86 stock pause' per outlet.")
    add_p("• city_prices: Regional pricing overrides (Hyderabad Core, Secunderabad, Cyberabad).")
    add_p("• orders: Full transaction records, items JSON, 5% GST, coupon discounts, loyalty redeemed, AI prep estimate, manager override, status, DPDP consent.")
    add_p("• loyalty_ledger: Double-entry rewards system crediting 5% cashback on every direct order (1 point = ₹1).")
    add_p("• party_orders: Bulk catering requests enforcing 24h advance notice, guest count (15–500+), and manager confirmation.")
    add_p("• users & sessions: Scrypt password hashes, unique salts, role classification (customer, kitchen_staff, admin).")

    # 5. Core Flows
    add_h1("5. Core System Flows & State Machines")
    add_p("• Customer Ordering (<60s Checkout): Geofenced outlet selector (7km check) ➔ Menu browsing ➔ Portion customization ➔ Coupon applied (DIRECT15) ➔ Loyalty points redeemed ➔ DPDP consent ➔ Test payment (UPI/Card sandbox with decline simulation) ➔ Real-time tracking and simulated WhatsApp dispatch.")
    add_p("• Kitchen KDS Order Progression: Order arrives with real-time SSE push ➔ Ticket renders in 'New Orders' ➔ Elapsed timer starts ➔ Dynamic urgency colors (Green >10m left, Amber <=8m, Red overdue) ➔ One-tap status progression (Start Cooking ➔ Ready for Pickup ➔ Handover to 3PL Rider).")
    add_p("• Real-Time 86 Stock Management: Kitchen lead pauses item in Central CMS ➔ outlet_stock updated ➔ SSE broadcast dispatches ➔ Item immediately marked 'SOLD OUT AT THIS OUTLET' on customer devices without page refresh.")
    add_p("• Party Catering Confirmation: Customer books party ➔ 24h advance validation ➔ Status PENDING_REVIEW ➔ Catering Manager clicks 'Manager Confirm' ➔ Status updates to CONFIRMED, Chef Ustad assigned.")

    # 6. AI Architecture
    add_h1("6. The AI & Intelligent Automation Architecture")
    add_p("Dynamic Prep-Time Formula: Promised Time = Max(Outlet Minimum Floor, ⌈T_items + T_queue × Peak_Factor⌉)")
    add_p("• T_items = Max(Complexity_i × [1 + (Qty_i - 1) × 0.4]) + Σ(Complexity_j × 0.28)")
    add_p("• T_queue = Active Orders × 2.2 minutes × Peak_Factor")
    add_p("• Peak Factors: Normal = 1.0x, Lunch rush = 1.15x, Weekday dinner = 1.25x, Weekend Dinner Peak (Friday & Sunday 19:30–22:30) = 1.40x.")
    add_p("• 10-Minute Late Rule: An order running 10+ minutes past its promise activates a pulsing crimson warning banner on KDS, alerts the outlet manager, updates the customer via WhatsApp, and automatically credits ₹50 loyalty compensation into the customer's ledger.")
    add_p("• Manager Manual Override: Managers can tap +5m Bump on KDS to add cooking buffer during spikes.")
    add_p("• Customer Re-Orders: Suggests dishes based on history. Suggestions NEVER auto-add items to cart.")

    # 7. UI Decisions
    add_h1("7. UI and Design Decisions")
    add_p("• Design Palette: Obsidian Deep Charcoal (#0C1013) reduces kitchen eye strain; Royal Amber (#F59E0B) evokes saffron biryani richness; Nizami Emerald (#10B981) marks freshness and veg items; Crimson (#EF4444) marks delays.")
    add_p("• 8 Core Screens: 1. Customer Menu & Outlet Picker, 2. Express Checkout (<60s), 3. Live Order Tracking & WhatsApp Drawer, 4. 2-Metre Industrial KDS Tablet View, 5. Central Menu CMS (86 Stock Pause), 6. Bulk Orders / Party Catering Desk, 7. Executive Analytics Dashboard (₹1.14 Cr Goal), 8. AI Prep-Time Lab & Diagnostics.")

    # 8. Scope Boundaries
    add_h1("8. What We Cut and What We Would Do Next")
    add_p("• Strategic Cuts: Dedicated rider app (riders supplied by 3PL partner), replacing legacy in-store POS hardware (out of scope), automated AI cancellations (avoids food waste).")
    add_p("• Production Roadmap: Offline-first Kitchen PWA with Background Sync, official WhatsApp Cloud API conversational ordering, machine learning regression retraining pipeline (XGBoost).")

    # 9. Security & Testing
    add_h1("9. Security, Compliance, and Testing Verification")
    add_p("• DPDP Act 2023: Affirmative marketing consent recorded with every order (dpdp_marketing_consent = 1).")
    add_p("• Unit & API Test Suite: 31 tests passing (100% pass rate in ~1.3s via npm test).")
    add_p("• Live End-to-End System Suite: 42 integration assertions passing (100% pass rate via node scratch/e2e_full_test.cjs).")

    # 10. Conclusion
    add_h1("10. Conclusion")
    add_p("This direct ordering platform and Kitchen Display System delivers an end-to-end, production-grade solution for Company A. By combining honest AI prep-time estimation, sub-50ms real-time kitchen push updates, statutory FSSAI and 5% GST compliance, and DPDP Act 2023 privacy protections, it directly recovers ₹1.14 Crore in annual revenue while providing a delightful ordering experience for Hyderabad's biryani lovers.")

    doc.save(DOCX_PATH)
    import shutil
    shutil.copyfile(DOCX_PATH, os.path.join(BASE_DIR, "Dum_Co_TDD.docx"))
    shutil.copyfile(DOCX_PATH, os.path.join(BASE_DIR, "Nizami_Biryani_TDD.docx"))
    print(f"✅ Generated clean Word (.docx): {DOCX_PATH}")

if __name__ == "__main__":
    build_docx()
