# VAYRIVO — Haute Parfumerie & Botanical Alchemy
**Your Scent. Your Signature.**

A luxury Indian e-commerce platform and administrative control center for Haute Parfumerie, built with React, TypeScript, Tailwind CSS, Express, and high-performance persistent relational architecture (with turnkey Supabase / PostgreSQL migration support).

---

## 1. Brand Identity & Design System
- **Forest Green**: `#092117`
- **Dark Night Green**: `#050d09`
- **Luxury Gold**: `#D8B56D`
- **Gold Highlight**: `#F1D99B`
- **Warm Ivory**: `#F5F0E5`
- **Typography**: Cormorant Garamond (Serif Headings), Cinzel (Brand Seal), Montserrat (Modern Luxury Body)
- **Concentration**: Extrait de Parfum (28% to 32% pure oil concentration, 14+ hours longevity)

---

## 2. Customer Storefront Features (12 Key Sections)
1. **Home**: Full-viewport luxury hero flacon presentation, fragrance pillars, olfactory notes library filter, bestseller showcase, brand story, newsletter subscription with instant discount.
2. **Shop All (Catalogue)**: Search by fragrance name or notes (fig, saffron, oud, sandalwood, rose, vanilla), filter by Olfactory Family (Woody & Smoky, Haute Floral, Amber & Oriental, Fresh & Aromatic), in-stock toggle, and price sorting.
3. **Product Details**: Multi-angle flacon gallery, dynamic size variant selector (50ml / 100ml) with live stock counters and price updates, interactive **Fragrance Pyramid (Head, Heart, and Base notes)**, real-time **Indian PIN Code Serviceability & COD delivery checker**, and complimentary gift packaging toggle.
4. **Shopping Bag**: Real-time quantity adjustments, free shipping progress bar (Free Insured Shipping unlocked above ₹2,500), privilege coupon code applicator (`VAYRIVO10`, `ROYAL15`, `FIRSTSCENT`), and order notes.
5. **Checkout**: 6-digit Indian PIN code validation, city/state auto-fill, Cash on Delivery (COD) and Online Payment selection (Razorpay 256-bit SSL).
6. **Order Confirmation**: Order reference (`VAY-2026-XXXX`), courier tracking estimate, downloadable / printable official **GST Tax Invoice** with HSN `33030010`.
7. **Client Account**: Customer authentication, order history with tracking numbers and itemized receipts, multiple saved delivery address management, and private wishlist.
8. **Our Philosophy / About**: History of Indian imperial botanicals (Mysore sandalwood, Kashmiri saffron, Kannauj rose) paired with French Grasse 56-day maceration traditions.
9. **VIP Concierge / Contact**: Boutique coordinates, concierge telephone, direct WhatsApp chat link, and consultation booking form.
10. **Client Care & FAQ**: Delivery timelines across Indian states, perfume storage rituals, COD terms, returns & transit insurance.
11. **Regulatory Policies**: Privacy Policy (Information Technology Act 2000), Terms of Sale, Shipping Policy, and Cancellation/Refund Policy compliant with Indian Cosmetic Rules 2020.
12. **Live Olfactory Search Modal & Wishlist**: Real-time keyword & note matching overlay accessible with Esc key.

---

## 3. Separate Admin Control Center (`/admin`)
Access at `/admin` with Role-Based Access Control (RBAC):
- **Roles**:
  - **Owner / Super Admin**: Full control over products, orders, refunds, inventory, coupons, settings, and logs.
  - **Store Manager**: Can create/edit products, manage orders, and adjust inventory.
  - **Order Staff**: Can view orders, update courier tracking numbers, and view customer shipping details.
- **Pre-Configured Demo Accounts (with 1-Click Role Switcher in UI)**:
  - Owner: **Sandeep Kumar** (`admin@vayrivo.com` / `sandeep@vayrivo.com`) | Password: `Vayrivo@2026`
  - Store Manager: **Ashkand Yadav** (`manager@vayrivo.com` / `ashkand@vayrivo.com`) | Password: `Manager@2026`
  - Store Manager: **Surya Kumar** (`surya@vayrivo.com`) | Password: `Manager@2026`
  - Order Staff: **Rohan Kapoor** (`staff@vayrivo.com`) | Password: `Staff@2026`
  - Patron: **Devika Sen** (`customer@example.com`) | Password: `Customer@2026`
- **Dashboard**: Real-time sales volume (₹), today's revenue, order status counts, low-stock alerts, and recent commissions.
- **Product Management**: Add, edit, and delete products, manage bottle sizes (50ml, 100ml), SKUs, prices, sale prices, stock quantities, fragrance notes, and images. Changes reflect immediately on the storefront.
- **Order Management**: Search orders, filter by status (`Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`), update courier and AWB tracking numbers, issue refunds with automatic stock restoration, and generate printable GST invoices.
- **Inventory & Movement Trail**: Variant-level stock tracking with low-stock warnings, manual adjustments, and audit trail for every stock movement.
- **Patron Directory**: Customer account directory, order counts, lifetime spend in INR, and one-click export to CSV.
- **Promotional Privileges (Coupons)**: Create percentage or fixed INR coupons, minimum order limits, benefit caps, and usage limits.
- **Store Configuration**: Edit top announcement banner, shipping thresholds, COD fees, GST rate (18%), and boutique details.
- **Audit Logs**: Immutable log of administrative actions.

---

## 4. Technical Architecture & Database

### Development / Local Environment
- **Runtime**: Node.js v22 (using native `node:sqlite` DatabaseSync)
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Express full-stack server mounted with Vite middleware in `server.ts`
- **Persistence**: Relational SQLite database (`vayrivo_ecommerce.sqlite`) storing orders, frozen historical order items, inventory movements, users, and audit logs.

### Production Supabase / PostgreSQL Deployment
A complete PostgreSQL migration script with Row Level Security (RLS) is provided in `supabase_schema.sql`.

---

## 5. Indian E-Commerce Compliance & Standards
- **Currency**: Indian National Rupees (INR ₹).
- **GSTIN**: `27AABCU9603R1ZM` (Standard Perfumery GST rate: 18% inclusive).
- **HSN Code**: `33030010` (Perfumes and Toilet Waters).
- **Cosmetics Standards**: Compliant with Indian Cosmetic Rules 2020 & IFRA 51st Amendment.
- **Consumer Protection**: In accordance with the Consumer Protection (E-Commerce) Rules, 2020.
- **PIN Code Verification**: Validates 6-digit Indian PIN codes across major zones (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, etc.).

---

## 6. Estimated Monthly Operating Costs in India (INR)

| Component | Provider / Tier | Estimated Monthly Cost (₹) |
| :--- | :--- | :--- |
| **Frontend & Backend Hosting** | Cloud Run / Vercel / Railway (Free / Hobby Tier) | ₹0 – ₹800 |
| **Database** | Supabase PostgreSQL (Free Tier: 500MB DB, 50k monthly active users) | ₹0 |
| **Payment Gateway** | Razorpay (Standard 2% transaction fee on successful payments, no setup fee) | Pay-as-you-transact (~2%) |
| **Transactional Email** | Resend / Brevo (Free Tier: 300 emails/day) | ₹0 |
| **SMS / WhatsApp Alerts** | Fast2SMS / Gupshup (Optional for Indian OTP/AWB alerts) | ₹300 – ₹600 (based on usage) |
| **Domain (.in / .com)** | Registry registrar (₹800/year amortized) | ~₹70 / month |
| **Total Baseline Fixed Cost** | — | **~₹0 – ₹1,500 / month** |

---

## 7. Launch Checklist & Third-Party Integrations
1. **Razorpay Live Activation**: Sign up at [razorpay.com](https://razorpay.com), submit KYC (GSTIN, PAN, Bank Account), and paste `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`.
2. **Transactional Email**: Integrate Resend or Brevo API in `server.ts` to email automatic order invoices and AWB tracking links.
3. **Logistics Courier API**: Integrate Shiprocket, Blue Dart, or Delhivery API for automated label generation and pickup scheduling.
4. **Production Domain & SSL**: Connect `vayrivo.com` and enforce HTTPS.
