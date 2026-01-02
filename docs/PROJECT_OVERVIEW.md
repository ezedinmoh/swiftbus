# SwiftBus Project Overview - Complete Guide for Presentation

## 🎯 What is SwiftBus?

SwiftBus is a **full-stack web application** for booking bus tickets in Ethiopia. It allows users to search for buses, book tickets, make payments, and manage their bookings. Administrators can manage the entire system including buses, routes, schedules, and users.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│  (Chrome, Firefox, Safari - displays HTML, CSS, JavaScript)     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP Requests (GET, POST)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Client-Side)                     │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  HTML Files  │  │  CSS Styles  │  │  JavaScript  │          │
│  │  (Structure) │  │  (Design)    │  │  (Behavior)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  Examples: index.html, login.html, book-ticket.html             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ AJAX/Fetch API Calls
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Server-Side)                      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    PHP API Files                          │  │
│  │  api/auth.php - Login, Signup, Session Management         │  │
│  │  api/dashboard.php - User dashboard data                  │  │
│  │  api/search.php - Search buses                            │  │
│  │  api/payment.php - Process payments                       │  │
│  │  api/admin_*.php - Admin operations                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Helper Files                                 │  │
│  │  config/database.php - Database connection                │  │
│  │  includes/functions.php - Reusable functions              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ SQL Queries
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (MySQL)                           │
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │   users     │ │  bookings   │ │   buses     │               │
│  ├─────────────┤ ├─────────────┤ ├─────────────┤               │
│  │ id          │ │ id          │ │ id          │               │
│  │ email       │ │ user_id     │ │ bus_number  │               │
│  │ password    │ │ from_city   │ │ company_id  │               │
│  │ full_name   │ │ to_city     │ │ total_seats │               │
│  │ role        │ │ travel_date │ │ bus_type    │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                 │
│  Also: routes, schedules, cities, bus_companies, payments,     │
│        notifications, user_sessions                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 How Frontend, Backend, and Database Work Together

### Example: User Login Flow

```
Step 1: User opens login.html in browser
        ↓
Step 2: User enters email and password, clicks "Login"
        ↓
Step 3: JavaScript (in login.html) sends data to api/auth.php
        Code: fetch('api/auth.php', { method: 'POST', body: {email, password} })
        ↓
Step 4: PHP (auth.php) receives the request
        - Validates the data
        - Queries database: SELECT * FROM users WHERE email = ?
        ↓
Step 5: Database returns user data (or empty if not found)
        ↓
Step 6: PHP checks password, creates session, returns JSON response
        Response: { "success": true, "user": { "name": "John", "role": "user" } }
        ↓
Step 7: JavaScript receives response
        - If success: redirect to user-dashboard.html
        - If failed: show error message
```

### Example: Booking a Ticket Flow

```
1. User searches for buses (search.html → api/search.php → database)
2. User selects a bus and seats (book-ticket.html)
3. User fills passenger details
4. User selects payment method
5. System creates booking (api/payment.php → database INSERT)
6. User sees confirmation with QR code
7. Booking appears in my-tickets.html
```

---

## 📁 Project File Structure

```
swiftbus/
│
├── 📄 FRONTEND FILES (What users see)
│   ├── index.html              # Homepage
│   ├── login.html              # Login page
│   ├── signup.html             # Registration page
│   ├── search.html             # Search for buses
│   ├── routes.html             # View all routes
│   ├── book-ticket.html        # Book a ticket (4 steps)
│   ├── payment.html            # Payment processing
│   ├── my-tickets.html         # View booked tickets
│   ├── user-dashboard.html     # User dashboard
│   ├── user-profile.html       # User profile settings
│   ├── admin-dashboard.html    # Admin main page
│   ├── admin-bookings-all.html # Manage bookings
│   ├── admin-users-list.html   # Manage users
│   ├── admin-buses-list.html   # Manage buses
│   ├── admin-routes-list.html  # Manage routes
│   └── admin-schedules-list.html # Manage schedules
│
├── 📂 api/ (BACKEND - Server logic)
│   ├── auth.php                # Login, signup, logout
│   ├── dashboard.php           # Dashboard data
│   ├── search.php              # Search buses
│   ├── payment.php             # Payment processing
│   ├── admin_users.php         # Admin user management
│   ├── admin_bookings.php      # Admin booking management
│   ├── admin_buses.php         # Admin bus management
│   ├── admin_routes.php        # Admin route management
│   └── admin_schedules.php     # Admin schedule management
│
├── 📂 config/
│   └── database.php            # Database connection settings
│
├── 📂 includes/
│   └── functions.php           # Reusable PHP functions
│
├── 📂 js/
│   ├── api.js                  # JavaScript API helper
│   └── admin-*.js              # Admin JavaScript files
│
├── 📂 uploads/
│   └── avatars/                # User profile pictures
│
└── 📄 swiftbus_database_clean.sql  # Database structure
```

---

## 🔑 Key Concepts to Understand

### 1. Frontend (Client-Side)
- **HTML**: Structure of the page (buttons, forms, text)
- **CSS**: Styling (colors, fonts, layout)
- **JavaScript**: Interactivity (form validation, API calls, dynamic content)

### 2. Backend (Server-Side)
- **PHP**: Server programming language
- **Processes requests** from frontend
- **Communicates with database**
- **Returns JSON responses**

### 3. Database (Data Storage)
- **MySQL**: Relational database
- **Tables**: Store different types of data
- **SQL**: Language to query data (SELECT, INSERT, UPDATE, DELETE)

### 4. API (Application Programming Interface)
- **Bridge** between frontend and backend
- Frontend sends **requests**
- Backend sends **responses** (usually JSON format)

---

## 🎓 Presentation Tips

1. **Start with the big picture** - Show the architecture diagram
2. **Demo the user flow** - Login → Search → Book → Payment → View Ticket
3. **Explain one complete flow** - Pick login or booking
4. **Show code examples** - One from each layer (HTML, PHP, SQL)
5. **Highlight key features** - QR codes, multiple payment methods, admin panel

---

## 📊 Technologies Used

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | HTML5 | Page structure |
| Frontend | CSS3 | Styling and layout |
| Frontend | JavaScript | Interactivity |
| Backend | PHP 7.4+ | Server logic |
| Database | MySQL 5.7+ | Data storage |
| Library | QRCode.js | Generate QR codes |
| Server | Apache (XAMPP) | Web server |

