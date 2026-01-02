# 🚌 SwiftBus - Ethiopian Bus Booking System

<p align="center">
  <img src="swiftbus.jpg" alt="SwiftBus Logo" width="200">
</p>

<p align="center">
  <strong>A modern, full-stack web application for booking bus tickets across Ethiopia</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#technologies">Technologies</a>
</p>

---

## 📋 About The Project

**SwiftBus** is a comprehensive online bus ticket booking system designed specifically for the Ethiopian transportation market. The platform connects passengers with major bus operators, enabling seamless ticket booking, seat selection, and digital payment processing.

### 🎯 Purpose

The Ethiopian bus transportation industry traditionally relies on physical ticket counters, leading to:
- Long queues at bus stations
- No way to check seat availability in advance
- Cash-only transactions
- Paper tickets that can be lost
- Difficulty comparing prices across operators

**SwiftBus solves these problems** by providing a digital platform where users can:
- Search and compare buses from multiple operators
- Book tickets online 24/7 from anywhere
- Select preferred seats visually
- Pay using multiple digital payment methods
- Receive instant digital tickets with QR codes

---

## ✨ Features

### 👤 User Features

| Feature | Description |
|---------|-------------|
| 🔍 **Smart Search** | Search buses by route, date, and preferences |
| 🪑 **Interactive Seat Selection** | Visual seat map with real-time availability |
| 💳 **Multiple Payment Options** | Telebirr, CBE, Dashen Bank, Credit/Debit Cards |
| 📱 **QR Code Tickets** | Digital tickets with scannable QR codes |
| 📊 **Booking History** | View all past and upcoming trips |
| 👤 **Profile Management** | Update personal information and preferences |
| 🔔 **Notifications** | Booking confirmations and travel reminders |

### 🔧 Admin Features

| Feature | Description |
|---------|-------------|
| 📈 **Dashboard Analytics** | Real-time statistics and insights |
| 👥 **User Management** | View, edit, and manage user accounts |
| 🚌 **Fleet Management** | Add, update, and track buses |
| 🛣️ **Route Management** | Configure routes between cities |
| 📅 **Schedule Management** | Set departure times and frequencies |
| 📋 **Booking Management** | View and manage all bookings |
| ⚙️ **System Settings** | Configure application parameters |

### 🔐 Security Features

- **Password Hashing** - Secure bcrypt encryption
- **SQL Injection Prevention** - Prepared statements for all queries
- **Session Management** - Secure user authentication
- **Input Validation** - 3-layer validation (HTML, JavaScript, PHP)
- **Role-Based Access** - Separate user and admin permissions

---

## 🚌 Supported Bus Companies

| Company | Type | Rating |
|---------|------|--------|
| **Selam Bus** | Premium/Luxury | ⭐ 4.8 |
| **Abay Bus** | Standard | ⭐ 4.5 |
| **Ethio Bus** | Economy | ⭐ 4.2 |
| **Habesha Bus** | Premium | ⭐ 4.4 |

---

## 🗺️ Supported Cities

The system covers **10 major Ethiopian cities**:

| City | Region |
|------|--------|
| Addis Ababa | Capital |
| Bahirdar | Amhara |
| Gonder | Amhara |
| Mekele | Tigray |
| Dessie | Amhara |
| Kombolcha | Amhara |
| Adama | Oromia |
| Hawasa | SNNPR |
| Arbaminch | SNNPR |
| Jimma | Oromia |

---

## 🖥️ Demo Screenshots

### Homepage
- Hero section with search functionality
- Featured bus companies
- Popular routes display

### Booking Process
1. **Search** - Select origin, destination, and date
2. **Select Bus** - Choose from available options
3. **Choose Seats** - Interactive seat map
4. **Passenger Details** - Enter traveler information
5. **Payment** - Select payment method
6. **Confirmation** - Receive digital ticket with QR code

### Admin Dashboard
- Real-time statistics
- Recent bookings
- System alerts
- Quick actions

---

## 🛠️ Technologies Used

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 | Page structure |
| CSS3 | Styling and responsive design |
| JavaScript (ES6+) | Interactivity and API calls |
| Font Awesome | Icons |
| QRCode.js | QR code generation |

### Backend
| Technology | Purpose |
|------------|---------|
| PHP 7.4+ | Server-side logic |
| PDO | Database connectivity |
| JSON | API data format |

### Database
| Technology | Purpose |
|------------|---------|
| MySQL 5.7+ | Data storage |
| 12 Tables | Complete data model |

### Development
| Tool | Purpose |
|------|---------|
| XAMPP | Local development server |
| Git | Version control |
| VS Code / Kiro | Code editor |

---

## 📦 Installation

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache web server (or XAMPP)
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/ezedinmoh/swiftbus.git
cd swiftbus
```

### Step 2: Set Up Database
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Create a new database named `swiftbus_db`
3. Import the SQL file:
   - Click on `swiftbus_db`
   - Go to "Import" tab
   - Choose `swiftbus_database_clean.sql`
   - Click "Go"

### Step 3: Configure Database Connection
Edit `config/database.php`:
```php
$host = 'localhost';
$dbname = 'swiftbus_db';
$username = 'root';
$password = '';  // Your MySQL password
```

### Step 4: Start the Server
If using XAMPP:
1. Start Apache and MySQL from XAMPP Control Panel
2. Place project in `C:\xampp\htdocs\swiftbus`
3. Open browser: `http://localhost/swiftbus`

---

## 👥 Default Accounts

### Admin Accounts
| Email | Password |
|-------|----------|
| ezedinmoh1@gmail.com | password123 |
| hanamariamsebsbew1@gmail.com | password123 |
| mubarekali974@gmail.com | password123 |
| wubetlemma788@gmail.com | password123 |
| mahletbelete4@gmail.com | password123 |

### Test User
Create a new account through the signup page or use the booking flow.

---

## 📁 Project Structure

```
swiftbus/
│
├── 📂 api/                    # Backend API endpoints
│   ├── auth.php               # Authentication (login, signup, logout)
│   ├── dashboard.php          # User dashboard data
│   ├── search.php             # Bus search functionality
│   ├── payment.php            # Payment processing
│   ├── admin_users.php        # Admin user management
│   ├── admin_bookings.php     # Admin booking management
│   ├── admin_buses.php        # Admin bus management
│   ├── admin_routes.php       # Admin route management
│   └── admin_schedules.php    # Admin schedule management
│
├── 📂 config/
│   └── database.php           # Database configuration
│
├── 📂 includes/
│   └── functions.php          # Reusable PHP functions
│
├── 📂 js/
│   ├── api.js                 # JavaScript API helper
│   ├── admin-data-provider.js # Admin data functions
│   └── admin-profile-sync.js  # Profile synchronization
│
├── 📂 uploads/
│   └── avatars/               # User profile pictures
│
├── 📄 index.html              # Homepage
├── 📄 login.html              # User login
├── 📄 signup.html             # User registration
├── 📄 book-ticket.html        # Ticket booking (4 steps)
├── 📄 payment.html            # Payment processing
├── 📄 my-tickets.html         # User's tickets
├── 📄 user-dashboard.html     # User dashboard
├── 📄 user-profile.html       # User profile
├── 📄 admin-dashboard.html    # Admin dashboard
├── 📄 admin-*.html            # Admin management pages
│
└── 📄 swiftbus_database_clean.sql  # Database schema
```

---

## �  How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    FRONTEND     │────▶│    BACKEND      │────▶│    DATABASE     │
│  (HTML/CSS/JS)  │◀────│     (PHP)       │◀────│    (MySQL)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
     Browser              Server                  Data Storage
```

1. **User interacts** with the frontend (clicks, fills forms)
2. **JavaScript sends** request to PHP API
3. **PHP processes** the request and queries database
4. **Database returns** data to PHP
5. **PHP sends** JSON response to JavaScript
6. **JavaScript updates** the page with new data

---

## 🎯 Benefits

### For Passengers
- ✅ Book tickets anytime, anywhere
- ✅ Compare prices across operators
- ✅ Choose preferred seats
- ✅ Multiple payment options
- ✅ Digital tickets (no paper)
- ✅ Booking history and tracking

### For Bus Operators
- ✅ Reach more customers online
- ✅ Reduce manual ticketing work
- ✅ Real-time booking management
- ✅ Analytics and insights
- ✅ Reduced no-shows with digital tickets

### For the Industry
- ✅ Modernized transportation sector
- ✅ Reduced queues at stations
- ✅ Better resource utilization
- ✅ Data-driven decision making

---

## 🚀 Future Enhancements

- [ ] Real payment gateway integration (Telebirr API, Chapa)
- [ ] SMS notifications
- [ ] Mobile application (Android/iOS)
- [ ] Live bus tracking
- [ ] Multi-language support (Amharic, Oromiffa)
- [ ] Email confirmations
- [ ] Loyalty/rewards program
- [ ] Group booking discounts

---

## 👨‍💻 Contributors

| Name | Role |
|------|------|
| Ezedin Mohammed | Developer |
| Hana Mariam Sebsbew | Developer |
| Mubarek Ali | Developer |
| Wubet Lemma | Developer |
| Mahlet Belete | Developer |

---

## 📄 License

This project is developed for educational purposes as part of a university course project.

---

## 🙏 Acknowledgments

- Our instructor for guidance and support
- Ethiopian bus operators for inspiration
- Open source community for tools and libraries

---

<p align="center">
  Made with ❤️ in Ethiopia
</p>

<p align="center">
  <a href="https://github.com/ezedinmoh/swiftbus">⭐ Star this repository if you found it helpful!</a>
</p>
