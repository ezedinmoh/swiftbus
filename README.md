# 🚌 SwiftBus — Ethiopian Bus Booking System

<p align="center">
  <img src="public/swiftbus.jpg" alt="SwiftBus" width="100%">
</p>

<p align="center">
  <strong>A modern, full-stack bus ticket booking platform built for Ethiopia</strong>
</p>

<p align="center">
  <a href="https://swiftbus-ezedinmoh.vercel.app">🌐 Live Demo</a> •
  <a href="#features">✨ Features</a> •
  <a href="#tech-stack">🛠️ Tech Stack</a> •
  <a href="#getting-started">🚀 Getting Started</a> •
  <a href="#project-structure">📁 Structure</a>
</p>

---

## 📋 About

**SwiftBus** is a full-stack web application that modernises bus travel in Ethiopia. Passengers can search routes, compare operators, select seats, and pay digitally — all without visiting a ticket counter.

The platform was rebuilt from a PHP/MySQL stack into a **Next.js 16 + Prisma 7 + SQLite** application with a fully typed TypeScript codebase, server components, and a REST API layer.

---

## ✨ Features

### 👤 Passenger
| Feature | Description |
|---------|-------------|
| 🔍 **Smart Search** | Filter by route, date, company, time of day; sort by price, departure, or duration |
| 🪑 **Seat Selection** | Interactive seat map with real-time availability |
| 💳 **Payment Flow** | Telebirr, CBE, Dashen Bank, card — booking confirmed on payment |
| 🎫 **Digital Tickets** | QR-code tickets viewable in the dashboard |
| 📊 **Booking History** | All past and upcoming trips in one place |
| 👤 **Profile Management** | Update name, phone, password, and avatar |
| 🔔 **Notifications** | Booking confirmations and system alerts |

### 🔧 Admin
| Feature | Description |
|---------|-------------|
| 📈 **Dashboard** | Live stats — revenue, bookings, users, buses |
| 👥 **User Management** | View, activate/deactivate, and inspect users |
| 🚌 **Fleet Management** | Add buses, update status (active / maintenance / inactive) |
| 🛣️ **Route Management** | Configure city-to-city routes with distance and pricing |
| 📅 **Schedule Management** | Set departure times, days of operation, and pricing |
| 📋 **Booking Management** | View all bookings, update status, cancel |
| 👤 **Admin Profile** | Edit profile info, change password, upload avatar |

### 🔐 Security
- JWT authentication via HTTP-only cookies
- bcrypt password hashing
- Role-based access control (user / admin)
- OTP email verification on signup and password reset
- Input validation on all API routes

---

## 🚌 Bus Companies

| Company | Type | Rating |
|---------|------|--------|
| **Selam Bus** | Luxury | ⭐ 4.8 |
| **Sky Bus** | Premium AC | ⭐ 4.6 |
| **Abay Bus** | Standard AC | ⭐ 4.5 |
| **Habesha Bus** | Standard | ⭐ 4.4 |
| **Zemen Bus** | Standard | ⭐ 4.3 |
| **Ethio Bus** | Economy | ⭐ 4.2 |

---

## �️ Covered Cities

10 major Ethiopian cities with a fully connected route mesh (110 routes, 440 schedules):

Addis Ababa · Bahir Dar · Gondar · Mekele · Hawassa · Dire Dawa · Jimma · Adama · Dessie · Kombolcha · Arba Minch

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | SQLite via Prisma 7 + `@prisma/adapter-better-sqlite3` |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Styling** | CSS Modules + global CSS |
| **Icons** | Font Awesome 6 |
| **Deployment** | Vercel |

---

## � Getting Started

### Prerequisites
- Node.js 20+
- pnpm (or npm)

### 1. Clone
```bash
git clone https://github.com/ezedinmoh/swiftbus.git
cd swiftbus
```

### 2. Install dependencies
```bash
pnpm install
# or
npm install
```

### 3. Configure environment
```bash
# .env is already set up for local SQLite — no changes needed for dev
# To customise, edit .env:
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
```

### 4. Set up the database
```bash
# Push schema to SQLite
npx prisma db push

# Seed with cities, companies, routes, schedules, and an admin user
npx tsx prisma/seed.ts
```

### 5. Run the dev server
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## � Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | ezedinmoh1@gmail.com | Admin@123 |

Create a regular user account through the signup page.

---

## 📁 Project Structure

```
swiftbus/
├── prisma/
│   ├── schema.prisma          # Database schema (SQLite)
│   ├── seed.ts                # Seed script (cities, routes, schedules)
│   └── load-env.ts            # Env loader for Prisma CLI
├── prisma.config.ts           # Prisma 7 config
├── public/
│   ├── swiftbus.jpg           # Project image
│   └── uploads/avatars/       # User avatar uploads
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage
│   │   ├── search/            # Search results + filters
│   │   ├── book/              # Booking flow
│   │   ├── payment/           # Payment page
│   │   ├── dashboard/         # User dashboard (tickets, profile)
│   │   ├── admin/             # Admin panel (dashboard, CRUD pages)
│   │   ├── login/ signup/     # Auth pages
│   │   ├── routes/ about/     # Static info pages
│   │   └── api/               # REST API routes
│   │       ├── auth/          # login, register, verify-email, reset-password
│   │       ├── search/        # Bus search + city list
│   │       ├── booking/       # Create booking, cancel
│   │       ├── payment/       # Process payment
│   │       ├── seats/         # Seat availability
│   │       ├── contact/       # Contact form → activity_logs
│   │       ├── user/          # User profile, tickets, stats
│   │       └── admin/         # Admin CRUD APIs
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── context/
│   │   └── AuthContext.tsx    # Global auth state
│   └── lib/
│       ├── prisma.ts          # Prisma client singleton
│       ├── auth.ts            # JWT sign/verify, bcrypt helpers
│       ├── session.ts         # Server-side session helper
│       └── otpStore.ts        # In-memory OTP store
└── .env                       # Environment variables
```

---

## � How It Works

```
Browser  →  Next.js Server Component / API Route  →  Prisma  →  SQLite
                        ↑
              JWT cookie (HTTP-only)
```

1. User submits a search → API queries Prisma for matching schedules
2. User selects seats → seat availability checked against all existing bookings
3. User pays → booking status updated to `confirmed`, payment record created
4. Admin logs in → server component fetches live stats directly via Prisma

---

## 🚀 Future Enhancements

- [ ] Real payment gateway (Chapa / Telebirr API)
- [ ] Email delivery for OTP codes (Resend / SendGrid)
- [ ] Live seat availability in search results
- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] Multi-language support (Amharic, Oromiffa)
- [ ] Live bus tracking

---


## 📄 License

Developed for educational purposes as a university course project.

---

<p align="center">Made with ❤️ in Ethiopia 🇪🇹</p>
