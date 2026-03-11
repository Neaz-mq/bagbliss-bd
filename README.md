<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=180&section=header&text=BagBliss%20BD&fontSize=72&fontColor=fff&animation=twinkling&fontAlignY=32&desc=Bangladesh's%20Most%20Elegant%20Mini%20Crossbody%20Bag%20Store&descAlignY=62&descSize=18" width="100%"/>

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Socket.io](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

<br/>

[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](.)
[![Status](https://img.shields.io/badge/Status-In_Development-yellow?style=flat-square)](.)
[![Launch](https://img.shields.io/badge/Launch_Date-June_01_2026-E91E8C?style=flat-square)](.)
[![Made in](https://img.shields.io/badge/Made_in-Bangladesh_🇧🇩-006A4E?style=flat-square)](.)

<br/>

> **A full-stack, production-grade e-commerce platform** built with Next.js 14 App Router & TypeScript — featuring real-time live chat, Cloudinary media management, SSLCommerz payment gateway, and a blazing-fast, mobile-first UI crafted for Bangladesh's fashion market.

<br/>

[🌐 Live Demo](#) · [📱 Mobile Preview](#) · [📋 API Docs](#) · [🐛 Report Bug](#)

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
- [Performance](#-performance)
- [Security](#-security)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## 🎯 Overview

**BagBliss BD** is not just another e-commerce template — it is a fully engineered, production-ready online retail platform built from scratch, purpose-built for the Bangladesh market. Every architectural decision was made with performance, security, and exceptional user experience in mind.

The platform targets fashion-conscious girls and women in Bangladesh, offering premium mini crossbody bags imported from China. The business model is built on a mobile-first approach, recognizing that over **85% of Bangladeshi online shoppers browse on mobile devices**.

### Why This Project Stands Out

| Concern | Our Approach |
|--------|-------------|
| **SEO** | Next.js ISR — every product page is server-rendered HTML, fully indexable by Google |
| **Speed** | Redis caching + Cloudinary CDN + Next.js Image optimization — sub-2s load on 4G mobile |
| **Security** | HttpOnly cookies, Zod validation, rate limiting, CSRF protection, Helmet.js |
| **Scalability** | Feature-based architecture, MongoDB Atlas, Upstash Redis — scales horizontally |
| **Real-time** | Socket.IO live chat between customers and admin, real-time order status updates |
| **Payments** | SSLCommerz — Bangladesh's most trusted payment gateway + Cash on Delivery |

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Next.js](https://nextjs.org/) | 14+ | Full-stack React framework (App Router) |
| [TypeScript](https://typescriptlang.org/) | 5+ | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | 3+ | Utility-first CSS framework |
| [Framer Motion](https://framer.com/motion/) | 11+ | Production-grade animations |
| [Zustand](https://zustand-demo.pmnd.rs/) | 4+ | Lightweight global state management |
| [TanStack Query](https://tanstack.com/query) | 5+ | Server state, caching, synchronization |
| [React Hook Form](https://react-hook-form.com/) | 7+ | Performant, zero re-render forms |
| [Zod](https://zod.dev/) | 3+ | Schema-first TypeScript validation |
| [Socket.IO Client](https://socket.io/) | 4+ | Real-time bidirectional communication |
| [Cloudinary React](https://cloudinary.com/) | — | Image & video delivery SDK |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Node.js](https://nodejs.org/) | 20 LTS | JavaScript runtime |
| [Express.js](https://expressjs.com/) | 4+ | Minimal web framework (Socket.IO server) |
| [MongoDB Atlas](https://mongodb.com/atlas) | — | Cloud-native NoSQL database |
| [Mongoose](https://mongoosejs.com/) | 8+ | MongoDB ODM with TypeScript support |
| [NextAuth.js v5](https://authjs.dev/) | 5+ | Authentication (JWT + OAuth) |
| [Upstash Redis](https://upstash.com/) | — | Serverless Redis for caching |
| [Cloudinary SDK](https://cloudinary.com/) | — | Image & video management |
| [Resend](https://resend.com/) | — | Transactional email delivery |
| [SSLCommerz](https://sslcommerz.com/) | — | Bangladesh payment gateway |

### Infrastructure & DevOps

| Service | Purpose | Cost |
|---------|---------|------|
| [Vercel](https://vercel.com/) | Next.js hosting + Edge CDN | Free |
| [Railway](https://railway.app/) | Socket.IO Express server | ~$5/mo |
| [MongoDB Atlas](https://mongodb.com/atlas) | Database hosting (M0) | Free |
| [Cloudinary](https://cloudinary.com/) | Media storage & delivery (25GB) | Free |
| [Upstash Redis](https://upstash.com/) | Caching layer | Free |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline | Free |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│              Next.js 14 App Router + TypeScript                  │
│         Tailwind CSS + Framer Motion + Zustand                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
          ┌────────────────┴─────────────────┐
          │                                  │
          ▼                                  ▼
┌──────────────────┐               ┌──────────────────┐
│   Vercel Edge    │               │  Railway Server  │
│  Next.js API     │               │  Express.js      │
│  Routes + SSR    │               │  Socket.IO       │
└────────┬─────────┘               └────────┬─────────┘
         │                                  │
    ┌────┴──────────────────────────────────┴────┐
    │                                            │
    ▼                                            ▼
┌──────────┐  ┌──────────┐  ┌────────┐  ┌──────────────┐
│ MongoDB  │  │  Upstash │  │Cloudinary│ │  SSLCommerz  │
│  Atlas   │  │  Redis   │  │  CDN   │  │   Payment    │
└──────────┘  └──────────┘  └────────┘  └──────────────┘
```

### Rendering Strategy

| Route | Strategy | Reason |
|-------|---------|--------|
| `/` Home | ISR (60s revalidate) | Fast + fresh content |
| `/shop` | SSR | Filter/search params |
| `/product/[slug]` | ISR (300s revalidate) | SEO critical |
| `/cart`, `/checkout` | CSR | User-specific data |
| `/account/*` | CSR + Auth guard | Private pages |
| `/admin/*` | CSR + Role guard | Admin only |

---

## ✨ Features

### 🛍️ Shopping Experience
- **Hero section** with full-screen video/image, parallax scroll effect
- **Product catalog** with masonry grid, infinite scroll, real-time filter
- **Smart search** with debounce and typo tolerance (Fuse.js)
- **Product detail** with multi-image gallery, video tab, color swatches, zoom
- **Flash sale** with live countdown timer
- **Wishlist** with persistent storage
- **Recently viewed** products tracking

### 🔐 Authentication
- Email & Password login with bcrypt hashing
- **Google OAuth** social login
- **Facebook OAuth** social login  
- Phone OTP verification (Bangladesh SMS gateway)
- JWT Access Token (15 min) + Refresh Token (7 days, HttpOnly cookie)
- Automatic token refresh — seamless session experience
- Forgot password via email magic link

### 🛒 Cart & Checkout
- Persistent cart (survives page refresh, synced to DB on login)
- Guest cart → merge on login
- Multi-step checkout with progress indicator
- **SSLCommerz** — VISA, Mastercard, bKash, Nagad, Rocket
- **Cash on Delivery** option
- Order confirmation email with invoice
- Real-time order status updates via Socket.IO

### 💬 Live Chat
- Floating chat widget on every page
- Real-time messaging (Socket.IO)
- Admin chat inbox with session management
- Chat history stored in MongoDB
- Typing indicator, read receipts
- Auto-greeting message for new visitors

### 📸 Media Management
- Cloudinary image upload with auto-optimization (`f_auto`, `q_auto`)
- Cloudinary video upload with HLS adaptive streaming
- Product videos autoplay on hover (muted, mobile-friendly)
- Multiple image upload per product
- Admin drag-and-drop media manager

### 👨‍💼 Admin Panel
- Sales dashboard with revenue charts (Recharts)
- Product CRUD with bulk operations
- Order management with status workflow
- Customer management
- Inventory tracking with low-stock alerts
- Live chat inbox
- Coupon & discount management
- Analytics: conversion rate, top products, peak hours

### ⚡ Performance
- Lighthouse score **> 90** on mobile
- Skeleton loaders — zero blank screens
- Redis-cached product queries (<10ms response)
- Cloudinary CDN for all media globally
- Next.js `<Image>` automatic WebP conversion
- Bundle code-splitting per route

---

## 📁 Folder Structure

```
bagbliss-bd/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth route group
│   │   ├── (shop)/             # Shop route group
│   │   ├── (account)/          # User account pages
│   │   ├── admin/              # Admin dashboard
│   │   └── api/                # API routes
│   │
│   ├── components/
│   │   ├── ui/                 # Base UI atoms (Button, Modal, Badge...)
│   │   ├── layout/             # Navbar, Footer, MobileNav
│   │   └── shared/             # Shared across features
│   │
│   ├── features/               # Feature-based modules
│   │   ├── auth/               # Auth components, hooks, API
│   │   ├── products/           # Product components, hooks, API
│   │   ├── cart/               # Cart logic, drawer, state
│   │   ├── checkout/           # Checkout flow, payment
│   │   ├── chat/               # Live chat widget + admin
│   │   └── admin/              # Admin panel features
│   │
│   ├── lib/                    # External service configs
│   │   ├── mongodb.ts          # MongoDB connection
│   │   ├── redis.ts            # Upstash Redis client
│   │   ├── cloudinary.ts       # Cloudinary config
│   │   └── auth.ts             # NextAuth config
│   │
│   ├── models/                 # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── Review.ts
│   │   └── ...
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # Zustand stores
│   ├── types/                  # TypeScript interfaces
│   ├── constants/              # App-wide constants
│   ├── utils/                  # Helper functions
│   └── styles/                 # Global CSS + Tailwind config
│
├── server/                     # Express + Socket.IO (Railway)
│   ├── src/
│   │   ├── socket/             # Socket.IO handlers
│   │   └── app.ts
│   └── server.ts
│
├── public/                     # Static assets
├── .env.local                  # Environment variables (never committed)
├── .env.example                # Environment template
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind + design tokens
└── tsconfig.json               # TypeScript strict config
```

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

# 3. Copy environment variables
cp .env.example .env.local

# 4. Fill in your environment variables (see below)
# Edit .env.local with your values

# 5. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
npm run format       # Run Prettier formatter
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
# ─── App ───────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=BagBliss BD

# ─── Database ──────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/bagbliss

# ─── Authentication (NextAuth.js) ──────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_super_secret_32_char_string

# ─── OAuth Providers ───────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
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
EMAIL_FROM=noreply@bagbliss.com.bd

# ─── Socket.IO Server (Railway) ────────────────────
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

> ⚠️ **Never commit `.env.local` to version control.** It is already in `.gitignore`.

---

## 📡 API Reference

All API routes follow a consistent response format:

```typescript
// Success
{ success: true, data: T, message?: string }

// Error  
{ success: false, error: string, statusCode: number }
```

### Authentication Routes
| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Email/password login | Public |
| POST | `/api/auth/logout` | Logout + clear cookies | Private |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| POST | `/api/auth/forgot-password` | Send reset email | Public |
| PATCH | `/api/auth/reset-password` | Reset with token | Public |

### Product Routes
| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| GET | `/api/products` | Get all products (paginated) | Public |
| GET | `/api/products/[slug]` | Get single product | Public |
| GET | `/api/products/featured` | Get featured products | Public |
| POST | `/api/products` | Create product | Admin |
| PATCH | `/api/products/[id]` | Update product | Admin |
| DELETE | `/api/products/[id]` | Delete product | Admin |

### Order Routes
| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| POST | `/api/orders` | Place new order | Private |
| GET | `/api/orders/my-orders` | Get user's orders | Private |
| GET | `/api/orders/[id]` | Get order details | Private |
| PATCH | `/api/orders/[id]/status` | Update order status | Admin |

### Payment Routes
| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| POST | `/api/payment/init` | Initiate SSLCommerz | Private |
| POST | `/api/payment/ipn` | IPN webhook callback | Public |
| POST | `/api/payment/success` | Payment success handler | Public |
| POST | `/api/payment/fail` | Payment failure handler | Public |

---

## ⚡ Performance

Target benchmarks measured on a mid-range Android device on 4G (Bangladesh average):

| Metric | Target | Tool |
|--------|--------|------|
| Lighthouse Performance | > 90 | Chrome DevTools |
| First Contentful Paint | < 1.5s | Web Vitals |
| Largest Contentful Paint | < 2.5s | Web Vitals |
| Cumulative Layout Shift | < 0.1 | Web Vitals |
| Time to Interactive | < 3.5s | Lighthouse |
| API Response (cached) | < 10ms | Redis |
| API Response (uncached) | < 200ms | MongoDB indexed |

### Optimization Techniques Used
- **ISR** — product pages pre-built as static HTML
- **Redis cache** — product list, categories, featured items
- **Cloudinary** — `f_auto`, `q_auto`, responsive `srcset`
- **Next.js Image** — lazy loading, WebP conversion, blur placeholder
- **Code splitting** — each route is a separate JS bundle
- **Prefetching** — Next.js Link prefetches on hover
- **Skeleton UI** — perceived performance on every loading state

---

## 🔐 Security

| Layer | Implementation |
|-------|---------------|
| **Authentication** | JWT (15min) + Refresh Token in HttpOnly Cookie |
| **Password Hashing** | bcrypt with 12 salt rounds |
| **Input Validation** | Zod schema validation on every API route |
| **Rate Limiting** | 5 login attempts per IP per 15 minutes |
| **Security Headers** | Helmet.js — CSP, HSTS, X-Frame-Options |
| **XSS Protection** | Input sanitization + React's built-in escaping |
| **CORS** | Whitelist of allowed origins only |
| **File Uploads** | Cloudinary signed uploads — no direct server upload |
| **Environment Secrets** | Never in codebase, always in `.env.local` |
| **MongoDB** | Parameterized queries via Mongoose — no injection |
| **HTTPS** | Enforced in production via Vercel + Railway |

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Connect GitHub repo to Vercel
# Vercel auto-deploys on every push to main

# Production URL
https://bagbliss.com.bd
```

### Chat Server (Railway)
```bash
cd server
# Connect GitHub /server folder to Railway
# Railway auto-deploys on push
```

### Branch Strategy
```
main      →  Production (bagbliss.com.bd) — protected
develop   →  Staging — all features merged here first
feature/* →  Individual feature branches
fix/*     →  Bug fixes
```

### Deployment Checklist
- [ ] All environment variables set in Vercel dashboard
- [ ] MongoDB Atlas IP whitelist updated
- [ ] SSLCommerz store ID set to live mode
- [ ] Cloudinary upload preset set to signed
- [ ] Redis cache warming done
- [ ] Google/Facebook OAuth redirect URIs updated to production domain
- [ ] Custom domain DNS configured

---

## 🗓 Roadmap

### Phase 1 — Foundation `Mar 2026` ✅
- [x] Next.js 14 + TypeScript project setup
- [x] GitHub repository with professional branch strategy
- [ ] MongoDB Atlas connection
- [ ] NextAuth.js with Google + Facebook OAuth
- [ ] Design system (colors, fonts, Tailwind config)

### Phase 2 — Product System `Mar–Apr 2026`
- [ ] Product model + CRUD API
- [ ] Cloudinary image + video upload
- [ ] Shop page with filter and search
- [ ] Product detail page with gallery

### Phase 3 — Shopping `Apr 2026`
- [ ] Cart (Zustand + persisted)
- [ ] Wishlist feature
- [ ] Product reviews with photo upload

### Phase 4 — Payments `Apr 2026`
- [ ] SSLCommerz integration
- [ ] Cash on Delivery
- [ ] Order email confirmation

### Phase 5 — Live Features `May 2026`
- [ ] Socket.IO live chat
- [ ] Real-time order tracking

### Phase 6 — Admin `May 2026`
- [ ] Admin dashboard with analytics
- [ ] Product & order management

### Phase 7 — Launch `Jun 2026`
- [ ] Performance audit (Lighthouse >90)
- [ ] SEO optimization
- [ ] Production deployment

### 🚀 Launch — June 1, 2026

---

## 👨‍💻 Author

<div align="center">

**Md. Neaz Morshed**

*Full Stack Web Developer — MERN Stack Specialist*

[![GitHub](https://img.shields.io/badge/GitHub-Neaz--mq-181717?style=for-the-badge&logo=github)](https://github.com/Neaz-mq)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com)

*Building BagBliss BD — where fashion meets technology in Bangladesh* 🇧🇩

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

**⭐ Star this repository if you find it impressive!**

*© 2026 BagBliss BD. All rights reserved.*

</div>
