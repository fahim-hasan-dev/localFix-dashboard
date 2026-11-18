# HomeFix Admin Control Center 🛠️🏛️

Enterprise-grade operations, compliance clearance, and dispute arbitration center for **HomeFix (LocalHomeFix)** — Texas's premier home service and licensed tradesman network.

---

## 🌟 Key Functional Pillars

1. **Executive Dashboard & Real-Time Pulse**
   - Live metrics: Total Homeowners vs. Active Verified Contractors breakdown.
   - Financial breakdown: Job escrow volume vs. monthly platform SaaS subscriptions.
   - Quick action queues: Pending Checkr background clearances, open homeowner disputes, high-value transaction holds.

2. **Pro Compliance & Clearance Pipeline**
   - Deep integration with **Checkr** background clearance verification link & tokens.
   - Verification of **Texas Department of Licensing & Regulation (TDLR)** state master licenses.
   - **$1,000,000 General Liability Certificate of Insurance (COI)** audit trail.
   - Three-way action triggers: `Approve Verified Pro`, `Reject Application`, or `Request Updated Documentation`.

3. **User Management & Governance**
   - Tabular directory with role filtering (Homeowner vs. Contractor), status filters (Active, Pending Review, Suspended).
   - Instant Ban / Suspend modal with mandatory audit reason logging.
   - One-click account reactivation with restored privileges.

4. **Disputes & Arbitration Center (Fiverr-Grade Support Model)**
   - Side-by-side claim presentation: Homeowner complaint vs. Contractor rebuttal.
   - Photographic job evidence and milestone punch-lists.
   - Official arbitration verdicts:
     - Full Refund to Homeowner (from Escrow)
     - 50/50 Split Settlement
     - Release Funds to Pro
     - Dismiss Claim

5. **Transactions & Escrow Ledger**
   - Escrow security holds, direct job payouts ($0 commission for direct contracts), and platform pro subscriptions ($19.99/mo).
   - Texas Sales Tax reporting & invoice download.

6. **Content Management System (CMS) & Dynamic Policies**
   - Dynamic live editor for **Terms & Conditions**.
   - Dynamic editor for **Privacy Policy** (compliant with Texas Data Privacy and Security Act - TDPSA).
   - Live policy editor for the **$2,500 HomeFix Job Escrow & Satisfaction Guarantee**.
   - Interactive FAQ CRUD Manager: add, edit, reorder, filter by audience (Homeowner / Pro / General), and toggle publish status.

7. **Site Branding & Dynamic Marketing Setup**
   - Dynamic Logo URL and Favicon asset controls.
   - Official physical headquarters address, support phone, and support email management.
   - Social media profiles (Facebook, Instagram, X/Twitter, LinkedIn).
   - Homepage Hero Carousel & Promotional Banner manager: image preview, headlines, CTA button text, destination link, and active rotation toggles.

---

## 🏗️ Architecture & Technology Stack

- **Framework**: React 18 + Vite 5 + TypeScript
- **State Management**: Redux Toolkit (RTK) with modular domain slices:
  - `authSlice.ts`, `usersSlice.ts`, `prosSlice.ts`, `disputesSlice.ts`, `transactionsSlice.ts`, `cmsSlice.ts`, `settingsSlice.ts`
- **Routing**: `react-router-dom` v6 with role-guarded `PrivateRoute` and unified `AppLayout`
- **Styling**: Tailwind CSS v3 with CSS variables & bespoke design tokens
- **Icons**: `lucide-react`

```
src/
├── components/
│   ├── layout/       # Sidebar, Topbar, PageHeader, AppLayout
│   └── ui/           # Button, Input, Modal, Badge, Card, Select
├── constants/        # Centralized ROUTES
├── lib/              # mockData.ts (seed data), utils.ts
├── pages/
│   ├── auth/         # LoginPage
│   ├── dashboard/    # DashboardPage, AnalyticsPage
│   ├── users/        # UsersPage
│   ├── pros/         # ProsReviewPage
│   ├── disputes/     # DisputesPage
│   ├── transactions/ # TransactionsPage
│   ├── content/      # CmsPage
│   └── settings/     # SiteBrandingPage
├── router/           # index.tsx, PrivateRoute.tsx
├── store/            # Redux store, rootReducer, hooks, slices/
├── styles/           # index.css
└── types/            # common.types.ts, api.types.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm or pnpm

### Installation
```bash
npm install
```

### Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Production Build
```bash
npm run build
```
Verify the production bundle in `dist/`.
