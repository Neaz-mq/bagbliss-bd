<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=180&section=header&text=BagBliss%20BD&fontSize=72&fontColor=fff&animation=twinkling&fontAlignY=32&desc=Bangladesh's%20Most%20Elegant%20Mini%20Crossbody%20Bag%20Store&descAlignY=62&descSize=18" width="100%"/>

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Socket.io](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

<br/>

[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](.)
[![Status](https://img.shields.io/badge/Status-In_Development-yellow?style=flat-square)](.)
[![Launch](https://img.shields.io/badge/Launch_Date-June_01_2026-E91E8C?style=flat-square)](.)
[![Made in](https://img.shields.io/badge/Made_in-Bangladesh_🇧🇩-006A4E?style=flat-square)](.)

<br/>

> **A full-stack e-commerce platform** built with Next.js (App Router) & TypeScript — featuring real-time live chat, Cloudinary media management, SSLCommerz payment gateway, an AI chat assistant, and a mobile-first UI crafted for Bangladesh's fashion market.

<br/>

[🌐 Live Demo](https://bagbliss-bd.vercel.app) · [🐛 Report Bug](https://github.com/Neaz-mq/bagbliss-bd/issues)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Features](#-features)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Deployment](#-deployment)
- [Known Gaps](#-known-gaps)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## 🎯 Overview

**BagBliss BD** is an e-commerce platform purpose-built for the Bangladesh market, offering premium mini crossbody bags. The business model is built on a mobile-first approach, recognizing that a large share of Bangladeshi online shoppers browse on mobile devices.

### Why This Project Stands Out

| Concern | Our Approach |
|--------|-------------|
| **SEO** | Next.js ISR — product and home pages are server-rendered HTML, indexable by Google |
| **Speed** | Redis caching + Cloudinary CDN + Next.js Image optimization |
| **Scalability** | Feature-based architecture, MongoDB Atlas, Upstash Redis |
| **Real-time** | Socket.IO live chat between customers and admin, live admin notifications, order tracking |
| **Payments** | SSLCommerz (VISA, Mastercard, bKash, Nagad, Rocket) + Cash on Delivery |
| **AI** | Groq-powered AI chat assistant (`/api/ai/chat`) |

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.x | Full-stack React framework (App Router) |
| [React](https://react.dev/) | 19.x | UI library |
| [TypeScript](https://typescriptlang.org/) | 5.x | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first CSS framework (CSS-based config, no `tailwind.config.ts`) |
| [Framer Motion](https://framer.com/motion/) | 12.x | Animations |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5.x | Lightweight global state management (cart, wishlist) |
| [TanStack Query](https://tanstack.com/query) | 5.x | Server state, caching, synchronization |
| [React Hook Form](https://react-hook-form.com/) | 7.x | Forms |
| [Zod](https://zod.dev/) | 4.x | Schema validation |
| [Socket.IO Client](https://socket.io/) | 4.x | Real-time bidirectional communication |
| [next-cloudinary](https://next.cloudinary.dev/) | 6.x | Image & video delivery |
| [Lucide React](https://lucide.dev/) | — | Icon set |
| [React Hot Toast](https://react-hot-toast.com/) | — | Notifications |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Node.js](https://nodejs.org/) | 20 LTS | JavaScript runtime |
| [Express.js](https://expressjs.com/) | 4.x | Standalone Socket.IO server (`socket-server/`) |
| [MongoDB Atlas](https://mongodb.com/atlas) | — | Cloud-native NoSQL database |
| [Mongoose](https://mongoosejs.com/) | 9.x | MongoDB ODM |
| [NextAuth.js](https://authjs.dev/) | 5.x (beta) | Authentication (credentials + Google/Facebook OAuth) |
| [Upstash Redis](https://upstash.com/) | — | Serverless Redis for caching & rate limiting |
| [Cloudinary SDK](https://cloudinary.com/) | 2.x | Image & video management |
| [Resend](https://resend.com/) | — | Transactional email delivery |
| [SSLCommerz](https://sslcommerz.com/) | — | Bangladesh payment gateway (custom integration, no official SDK) |
| [Groq SDK](https://groq.com/) | — | AI chat assistant |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | 9.x | Socket auth tokens |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 3.x | Password hashing |

### Infrastructure & Hosting

| Service | Purpose |
|---------|---------|
| [Vercel](https://vercel.com/) | Next.js hosting + Edge CDN |
| A Node host (e.g. Railway) | Standalone Socket.IO server (`socket-server/`) |
| [MongoDB Atlas](https://mongodb.com/atlas) | Database hosting |
| [Cloudinary](https://cloudinary.com/) | Media storage & delivery |
| [Upstash Redis](https://upstash.com/) | Caching layer |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│              Next.js App Router + TypeScript                     │
│         Tailwind CSS + Framer Motion + Zustand                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
          ┌────────────────┴─────────────────┐
          │                                  │
          ▼                                  ▼
┌──────────────────┐               ┌──────────────────────┐
│   Vercel Edge     │               │  socket-server/       │
│  Next.js API      │               │  Express.js            │
│  Routes + SSR      │               │  Socket.IO server      │
└────────┬──────────┘               └────────┬──────────────┘
         │                                  │
    ┌────┴──────────────────────────────────┴────┐
    │                                             │
    ▼                                             ▼
┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐
│ MongoDB  │  │  Upstash │  │Cloudinary │  │  SSLCommerz  │
│  Atlas   │  │  Redis   │  │  CDN      │  │   Payment    │
└──────────┘  └──────────┘  └───────────┘  └──────────────┘
```

### Rendering Strategy

| Route | Strategy |
|-------|---------|
| `/` Home | Server-rendered |
| `/shop` | Server-rendered, client filters |
| `/product/[slug]` | Server-rendered detail page |
| `/cart`, `/checkout` | Client-rendered (user-specific data) |
| `/account/*` | Client-rendered + auth guard (middleware) |
| `/admin/*` | Client-rendered + role guard (middleware, `role === 'admin'`) |

---

## ✨ Features

### 🛍️ Shopping Experience
- Hero section, featured products, category strip on the home page
- Shop page with product grid and filtering
- Product detail page with image gallery
- Flash sale page with time-limited pricing
- New arrivals page
- Wishlist with persistent storage (Zustand)
- Cart drawer + dedicated cart page

### 🔐 Authentication
- Email & password login with bcrypt hashing
- Google OAuth (incl. Google One Tap component)
- Facebook OAuth
- Role-based access (`user` / `admin`) enforced in `middleware.ts`
- Session handling via NextAuth.js v5

> Note: The README previously advertised phone OTP verification and a separate forgot-password/reset-password flow — these are **not present** in the current codebase. Only `/api/auth/register` and the NextAuth catch-all (`/api/auth/[...nextauth]`) exist.

### 🛒 Cart & Checkout
- Persistent cart via Zustand (`cartStore.ts`)
- Multi-field checkout form (React Hook Form + Zod)
- **SSLCommerz** payment initiation, success/fail/cancel/IPN handlers
- Cash on Delivery option
- Order success page and order tracking hook (`useOrderTracking`)

### 💬 Live Chat & Notifications
- Floating chat launcher widget (`ChatLauncher.tsx`) on the storefront
- Real-time messaging via a **standalone Socket.IO server** (`socket-server/`), authenticated with signed JWTs
- Admin real-time notifications (`useAdminSocket`, `AdminNotifications.tsx`)
- Visitor tracking (`VisitorTracker.tsx`, `useVisitorTracker`)

### 🤖 AI Assistant
- `/api/ai/chat` — Groq-powered chat endpoint (not documented in the original README)

### 📸 Media Management
- Cloudinary image upload via `next-cloudinary` and a signed admin upload route (`/api/admin/upload`)

### 👨‍💼 Admin Panel
- Dashboard with stats (`/api/admin/stats`)
- Product CRUD (`/api/admin/products`)
- Category management (`/api/admin/categories`)
- Order management with status updates (`/api/admin/orders`)
- Customer management (`/api/admin/customers`)
- Flash sale management (`/api/admin/flash-sale`)
- Store settings, incl. social links and a test-email utility (`/api/admin/test-email`)

### ⚡ Performance & Ops
- Redis-backed rate limiting (`@upstash/ratelimit`) on sensitive routes
- Health check endpoint (`/api/health`)
- Keep-alive utility for the Socket.IO host (`keepAlive.ts`)

---

## 📁 Folder Structure

This reflects the actual repository layout (verified against the source tree — differs from earlier drafts of this README):

```
bagbliss-bd/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # login, register
│   │   ├── (shop)/                # shop, product, cart, checkout,
│   │   │                          # wishlist, flash-sale, new-arrivals, order-success, payment
│   │   ├── (account)/account/     # profile, orders, addresses, settings
│   │   ├── (admin)/admin/         # dashboard, products, orders, customers,
│   │   │                          # categories, flash-sale, settings
│   │   └── api/                   # API route handlers (see API Reference)
│   │
│   ├── components/
│   │   ├── ui/                    # ChatLauncher, base UI pieces
│   │   ├── layout/                # Navbar, Footer, Topbar, ClientLayout
│   │   ├── home/                  # HeroSection, FeaturedProducts, CategoryStrip,
│   │   │                          # CustomerReview, HelpSection, FeatureStrip
│   │   ├── product/                # ProductCard, ProductGallery, ProductSkeleton
│   │   ├── cart/                   # CartDrawer
│   │   ├── auth/                   # GoogleOneTap
│   │   ├── admin/                  # AdminShell, AdminSidebar, AdminTopbar,
│   │   │                           # AdminNotifications, QuickActions
│   │   └── VisitorTracker.tsx
│   │
│   ├── features/
│   │   ├── orders/
│   │   └── products/
│   │
│   ├── lib/                        # External service configs
│   │   ├── mongodb.ts / mongoClient.ts
│   │   ├── redis.ts
│   │   ├── rate-limit.ts
│   │   ├── auth.ts
│   │   ├── email.ts
│   │   ├── sslcommerz.ts
│   │   ├── socket.ts
│   │   └── keepAlive.ts
│   │
│   ├── models/                     # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   └── Order.ts
│   │
│   ├── hooks/                      # useSocket, useAdminSocket, useOrderTracking,
│   │                                # useVisitorTracker, useHydrated
│   ├── store/                      # cartStore.ts, wishlistStore.ts
│   ├── types/                      # index.ts, next-auth.d.ts, css.d.ts
│   ├── constants/                  # index.ts, shopCategories.ts
│   └── utils/                      # category.ts, pricing.ts
│
├── socket-server/                  # Standalone Express + Socket.IO server
│   ├── index.js
│   └── package.json
│
├── scripts/
│   └── seed-products.ts            # `npm run seed`
│
├── public/                         # Static assets
├── middleware.ts                   # Auth + admin route guard
├── next.config.ts
├── postcss.config.mjs              # Tailwind v4 (no tailwind.config.ts)
└── tsconfig.json
```

> ⚠️ There is **no `.env.example` file** committed to the repository — you must create `.env.local` manually using the variable list below.
> ⚠️ There is **no `Review` model or product-review feature** in the codebase yet, despite being implied elsewhere; the product page currently shows "Customer reviews coming soon."

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 20.0.0
npm >= 10.0.0
git >= 2.40.0
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Neaz-mq/bagbliss-bd.git
cd bagbliss-bd

# 2. Install dependencies
npm install

# 3. Create your environment file (no .env.example exists yet — see below)
touch .env.local

# 4. Fill in your environment variables (see Environment Variables section)

# 5. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running the Socket.IO server locally (optional, needed for live chat)

```bash
cd socket-server
npm install
cp .env.example .env   # if present, otherwise create manually — see below
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Build for production
npm run start        # Start production server
npm run lint          # Run ESLint
npm run lint:fix       # Run ESLint with --fix
npm run type-check    # Run TypeScript compiler check
npm run format         # Run Prettier formatter
npm run format:check   # Check formatting without writing
npm run seed           # Seed products into MongoDB
npm run seed:reset      # Reset then seed products
npm run seed:append      # Append seeded products
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory. This list was compiled directly from `process.env.*` references in the codebase — it is more complete than what earlier README drafts listed:

```env
# ─── App ───────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ─── Database ──────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/bagbliss

# ─── Authentication (NextAuth.js) ──────────────────
NEXTAUTH_URL=http://localhost:3000
# NextAuth v5 reads AUTH_SECRET (or NEXTAUTH_SECRET) automatically — set one:
AUTH_SECRET=your_super_secret_32_char_string
ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com

# ─── OAuth Providers ───────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id   # used by the Google One Tap component
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# ─── Cloudinary ────────────────────────────────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── Upstash Redis ─────────────────────────────────
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# ─── SSLCommerz Payment ────────────────────────────
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false

# ─── Email (Resend) ────────────────────────────────
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=noreply@bagbliss.com.bd

# ─── AI Chat (Groq) ─────────────────────────────────
GROQ_API_KEY=your_groq_api_key

# ─── Socket.IO (client-facing, Next.js side) ────────
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
SOCKET_SERVER_URL=http://localhost:4000
SOCKET_JWT_SECRET=shared_secret_with_socket_server
SOCKET_EMIT_SECRET=shared_secret_with_socket_server
```

### `socket-server/.env` (separate process)

```env
PORT=4000
CLIENT_URL=http://localhost:3000
EMIT_SECRET=shared_secret_with_socket_server
SOCKET_JWT_SECRET=shared_secret_with_socket_server
```

> ⚠️ **Never commit `.env.local` or `socket-server/.env` to version control.** They are already covered by `.gitignore`.

---

## 📡 API Reference

All API routes follow a consistent response format:

```typescript
// Success
{ success: true, data: T, message?: string }

// Error
{ success: false, error: string, statusCode: number }
```

This table lists the routes that actually exist in `src/app/api/` — it replaces the earlier README's route table, which listed several endpoints (e.g. `/api/auth/logout`, `/api/auth/forgot-password`, `/api/orders/my-orders`, `/api/payment/init`) that are **not implemented**.

### Auth

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| * | `/api/auth/[...nextauth]` | NextAuth handler (login, logout, OAuth callback, session) | Public |

### Account

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| POST | `/api/account/update` | Update profile fields | Private |
| POST | `/api/account/upload-avatar` | Upload profile avatar | Private |

### Products

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| GET | `/api/products` | Get all products (query-param filtering) | Public |
| POST | `/api/products` | Create product | Admin |
| GET/PATCH/DELETE | `/api/products/[id]` | Get / update / delete a product | Mixed |
| GET | `/api/products/slug/[slug]` | Get single product by slug | Public |

### Orders

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| GET/POST | `/api/orders` | List / place orders | Private |

### Wishlist

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| GET/POST/DELETE | `/api/wishlist` | Manage wishlist | Private |

### Payment (SSLCommerz)

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| POST | `/api/payment/initiate` | Initiate SSLCommerz session | Private |
| POST | `/api/payment/ipn` | IPN webhook callback | Public |
| POST | `/api/payment/success` | Payment success handler | Public |
| POST | `/api/payment/fail` | Payment failure handler | Public |
| POST | `/api/payment/cancel` | Payment cancel handler | Public |

### AI

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| POST | `/api/ai/chat` | Groq-powered chat assistant | Public |

### Realtime

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| GET | `/api/socket-token` | Issue a signed JWT for the Socket.IO server | Private |

### Misc

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| GET | `/api/health` | Health check | Public |

### Admin

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| GET | `/api/admin/stats` | Dashboard statistics | Admin |
| GET/POST | `/api/admin/products` | List / create products | Admin |
| GET/PATCH/DELETE | `/api/admin/products/[id]` | Get / update / delete a product | Admin |
| GET/POST | `/api/admin/categories` | List / create categories | Admin |
| GET/POST | `/api/admin/orders` | List / manage orders | Admin |
| GET/PATCH | `/api/admin/orders/[id]` | Get / update an order (status) | Admin |
| GET | `/api/admin/customers` | List customers | Admin |
| GET/PATCH | `/api/admin/customers/[id]` | Get / update a customer | Admin |
| GET/POST | `/api/admin/flash-sale` | List / create flash sales | Admin |
| GET/PATCH/DELETE | `/api/admin/flash-sale/[id]` | Get / update / delete a flash sale | Admin |
| GET/PATCH | `/api/admin/settings` | Store settings (social links, etc.) | Admin |
| POST | `/api/admin/upload` | Signed Cloudinary upload | Admin |
| POST | `/api/admin/test-email` | Send a test transactional email | Admin |

---

## 🔐 Security

| Layer | Implementation |
|-------|---------------|
| **Authentication** | NextAuth.js v5 sessions (credentials + Google/Facebook OAuth) |
| **Password Hashing** | bcryptjs |
| **Input Validation** | Zod schema validation on forms and several API routes |
| **Rate Limiting** | `@upstash/ratelimit` on sensitive routes |
| **Route Protection** | `middleware.ts` — redirects unauthenticated users away from `/admin/*` and non-admins away from admin routes |
| **File Uploads** | Cloudinary signed uploads via admin-only upload route |
| **Environment Secrets** | Kept out of the codebase, loaded from `.env.local` / host env vars |
| **Socket Auth** | Signed JWTs (`SOCKET_JWT_SECRET`) issued by `/api/socket-token` and verified by `socket-server/` |
| **MongoDB** | Queries via Mongoose (parameterized) |
| **HTTPS** | Enforced by the hosting platform in production |

> Note: the earlier README claimed Helmet.js, CSRF protection, and a fixed "5 attempts per 15 minutes" login rate limit. These specific mechanisms were **not found** in the current codebase and should be verified/added before relying on them in production.

---

## 🚢 Deployment

### Frontend (Vercel)

```bash
# Connect the GitHub repo to Vercel — it auto-deploys on every push to main
```

### Socket.IO server

The `socket-server/` folder is a **separate Node/Express process** — it is not deployed by Vercel. Deploy it to any Node host (Railway, Render, Fly.io, a VPS, etc.) and point `NEXT_PUBLIC_SOCKET_URL` / `SOCKET_SERVER_URL` at it.

```bash
cd socket-server
npm install
npm run start
```

### Deployment Checklist

- [ ] All environment variables set on both the Next.js host and the socket server host
- [ ] MongoDB Atlas IP whitelist updated
- [ ] SSLCommerz store credentials set to live mode (`SSLCOMMERZ_IS_LIVE=true`)
- [ ] Cloudinary upload preset set to signed
- [ ] Google/Facebook OAuth redirect URIs updated to the production domain
- [ ] `SOCKET_JWT_SECRET` / `SOCKET_EMIT_SECRET` match between the Next.js app and `socket-server/`
- [ ] Custom domain DNS configured

---

## ⚠️ Known Gaps

Verified by cloning the repository and running `npm install`, `tsc --noEmit`, `next build`, and `eslint` directly against the source (see conversation history for the full report). The app **builds and type-checks cleanly**, but the following gaps exist relative to what earlier documentation implied:

- No `.env.example` committed
- No product review system yet (`Review` model doesn't exist; UI shows "Customer reviews coming soon")
- Dark mode toggle exists in the UI but is marked "coming soon" / not functional
- No phone OTP verification, and no separate forgot-password / reset-password API routes
- `npm audit` currently reports dependency vulnerabilities (run `npm audit` for the current count and `npm audit fix` where safe)
- GitHub Issues are currently restricted on the repository, so bugs can't be filed there yet

---

## 🗓 Roadmap

> The phase checkboxes below are kept as a historical/planning record. In practice, MongoDB, auth, the product system, cart, payments, live chat, and the admin panel are already implemented in the codebase — this list has not been updated to reflect that.

### Phase 1 — Foundation
- [x] Next.js + TypeScript project setup
- [x] GitHub repository with branch strategy
- [x] MongoDB Atlas connection
- [x] NextAuth.js with Google + Facebook OAuth
- [x] Design system (Tailwind v4 tokens)

### Phase 2 — Product System
- [x] Product model + CRUD API
- [x] Cloudinary image upload
- [x] Shop page with filter
- [x] Product detail page with gallery

### Phase 3 — Shopping
- [x] Cart (Zustand + persisted)
- [x] Wishlist feature
- [ ] Product reviews with photo upload

### Phase 4 — Payments
- [x] SSLCommerz integration
- [x] Cash on Delivery
- [x] Order email confirmation

### Phase 5 — Live Features
- [x] Socket.IO live chat
- [x] Real-time order tracking

### Phase 6 — Admin
- [x] Admin dashboard with stats
- [x] Product & order management

### Phase 7 — Launch
- [ ] Dependency vulnerability cleanup (`npm audit`)
- [ ] `.env.example` added
- [ ] Product review system
- [ ] Performance audit
- [ ] Production deployment

### 🚀 Target Launch — June 1, 2026

---

## 👨‍💻 Author

<div align="center">

**Md. Neaz Morshed**

*Full Stack Web Developer — MERN Stack Specialist*

[![GitHub](https://img.shields.io/badge/GitHub-Neaz--mq-181717?style=for-the-badge&logo=github)](https://github.com/Neaz-mq)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/neaz-morshed/)

*Building BagBliss BD — where fashion meets technology in Bangladesh* 🇧🇩

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

*© 2026 BagBliss BD. All rights reserved.*

</div>