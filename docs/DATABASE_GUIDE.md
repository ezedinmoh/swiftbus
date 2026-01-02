# Database Documentation - MySQL Tables

## 📌 What is a Database?

A **database** is where all the application data is stored permanently. Think of it as a collection of organized spreadsheets (tables) that store information like users, bookings, buses, etc.

**MySQL** is the database management system we use. It uses **SQL** (Structured Query Language) to interact with data.

---

## 🗄️ Database Overview

**Database Name:** `swiftbus_db`

**Total Tables:** 12

```
swiftbus_db/
├── users              # User accounts
├── user_sessions      # Login sessions
├── bookings           # Ticket bookings
├── payments           # Payment records
├── buses              # Bus fleet
├── bus_companies      # Bus operators
├── routes             # Travel routes
├── schedules          # Bus schedules
├── cities             # Ethiopian cities
├── bus_seats          # Seat reservations
├── notifications      # User notifications
├── activity_logs      # System activity
└── system_settings    # App configuration
```

---

## 📊 Table Relationships (Entity Relationship)

```
┌─────────────────┐       ┌─────────────────┐
│  bus_companies  │       │     cities      │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ company_id      │       │ city_code       │
│ name            │       │ name            │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │ 1:N                     │ 1:N
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│     buses       │       │     routes      │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ company_id (FK) │───────│ origin_city_id  │
│ bus_number      │       │ dest_city_id    │
│ bus_type        │       │ base_price      │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │ 1:N                     │ 1:N
         ▼                         ▼
┌─────────────────────────────────────────────┐
│                 schedules                    │
│─────────────────────────────────────────────│
│ id (PK)                                      │
│ bus_id (FK) ─────────────────────────────────│
│ route_id (FK) ───────────────────────────────│
│ departure_time                               │
│ price                                        │
└─────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐
│     users       │       │    bookings     │
│─────────────────│       │─────────────────│
│ id (PK)         │──1:N──│ user_id (FK)    │
│ email           │       │ booking_id      │
│ password_hash   │       │ from_city       │
│ full_name       │       │ to_city         │
│ role            │       │ travel_date     │
└─────────────────┘       │ total_amount    │
                          └────────┬────────┘
                                   │
                                   │ 1:1
                                   ▼
                          ┌─────────────────┐
                          │    payments     │
                          │─────────────────│
                          │ booking_id (FK) │
                          │ amount          │
                          │ payment_method  │
                          │ payment_status  │
                          └─────────────────┘

PK = Primary Key (unique identifier)
FK = Foreign Key (reference to another table)
1:N = One-to-Many relationship
```

---

## 📋 Detailed Table Descriptions

### 1. users (User Accounts)
**Purpose:** Store all user account information

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| user_id | VARCHAR(20) | Unique user ID (e.g., U202501010001) |
| email | VARCHAR(255) | User email (unique) |
| password_hash | VARCHAR(255) | Encrypted password |
| first_name | VARCHAR(100) | User's first name |
| last_name | VARCHAR(100) | User's last name |
| full_name | VARCHAR(200) | Combined full name |
| phone | VARCHAR(20) | Phone number |
| role | ENUM | 'user' or 'admin' |
| is_verified | TINYINT | Email verified (0/1) |
| is_active | TINYINT | Account active (0/1) |
| profile_image | VARCHAR(255) | Profile picture path |
| joined_date | DATE | Registration date |
| last_login | TIMESTAMP | Last login time |

**SQL to create:**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_verified TINYINT DEFAULT 0,
    is_active TINYINT DEFAULT 1,
    profile_image VARCHAR(255),
    joined_date DATE NOT NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2. bookings (Ticket Bookings)
**Purpose:** Store all ticket booking records

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| booking_id | VARCHAR(20) | Unique booking ID (e.g., BK202501020001) |
| user_id | INT | Reference to users table |
| from_city | VARCHAR(100) | Departure city |
| to_city | VARCHAR(100) | Destination city |
| travel_date | DATE | Date of travel |
| departure_time | VARCHAR(10) | Departure time |
| bus_company | VARCHAR(100) | Bus company name |
| bus_type | VARCHAR(100) | Type of bus |
| passenger_count | INT | Number of passengers |
| selected_seats | JSON | Array of seat numbers |
| passenger_details | JSON | Passenger information |
| total_amount | DECIMAL(10,2) | Total price |
| booking_status | ENUM | pending/confirmed/cancelled/completed |
| payment_status | ENUM | pending/paid/refunded/failed |
| booking_date | TIMESTAMP | When booking was made |

**Example Data:**
```sql
INSERT INTO bookings VALUES (
    1,
    'BK202501020001',
    5,  -- user_id
    'Addis Ababa',
    'Bahirdar',
    '2025-01-15',
    '06:00',
    'Selam Bus',
    'luxury',
    2,
    '["A1", "A2"]',
    '{"fullName": "John Doe", "phone": "0911234567"}',
    900.00,
    'confirmed',
    'paid',
    NOW()
);
```

---

### 3. payments (Payment Records)
**Purpose:** Store payment transaction details

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| payment_id | VARCHAR(20) | Unique payment ID |
| booking_id | VARCHAR(20) | Reference to booking |
| amount | DECIMAL(10,2) | Payment amount |
| payment_method | ENUM | telebirr/cbe/dashen/card |
| payment_status | ENUM | pending/completed/failed/refunded |
| transaction_reference | VARCHAR(100) | External transaction ID |
| payment_date | TIMESTAMP | When payment was made |

---

### 4. buses (Bus Fleet)
**Purpose:** Store information about each bus

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| bus_id | VARCHAR(20) | Unique bus ID |
| company_id | INT | Reference to bus_companies |
| bus_number | VARCHAR(50) | Bus registration number |
| bus_type | ENUM | economy/standard/standard-ac/premium-ac/luxury |
| total_seats | INT | Number of seats |
| amenities | JSON | List of amenities |
| status | ENUM | active/maintenance/inactive |
| license_plate | VARCHAR(20) | Vehicle plate number |

**Bus Types:**
- **Economy** - Basic, cheapest option
- **Standard** - Regular comfort
- **Standard-AC** - With air conditioning
- **Premium-AC** - Better seats + AC
- **Luxury** - Best comfort, WiFi, toilet

---

### 5. bus_companies (Bus Operators)
**Purpose:** Store bus company information

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| company_id | VARCHAR(20) | Unique company ID |
| name | VARCHAR(100) | Company name |
| description | TEXT | Company description |
| rating | DECIMAL(3,2) | Average rating (0-5) |
| contact_phone | VARCHAR(20) | Contact number |
| contact_email | VARCHAR(255) | Contact email |

**Our 4 Companies:**
1. Selam Bus - Premium service
2. Abay Bus - Northern routes specialist
3. Ethio Bus - Budget-friendly
4. Habesha Bus - Cultural experience

---

### 6. routes (Travel Routes)
**Purpose:** Define routes between cities

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| route_id | VARCHAR(20) | Unique route ID |
| origin_city_id | INT | Reference to cities (from) |
| destination_city_id | INT | Reference to cities (to) |
| distance_km | INT | Distance in kilometers |
| estimated_duration_hours | DECIMAL(4,2) | Travel time |
| base_price | DECIMAL(10,2) | Base ticket price |
| is_active | TINYINT | Route available (0/1) |

---

### 7. schedules (Bus Schedules)
**Purpose:** Define when buses operate on routes

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| schedule_id | VARCHAR(20) | Unique schedule ID |
| bus_id | INT | Reference to buses |
| route_id | INT | Reference to routes |
| departure_time | TIME | Departure time |
| arrival_time | TIME | Arrival time |
| days_of_week | JSON | Operating days |
| price | DECIMAL(10,2) | Ticket price |
| is_active | TINYINT | Schedule active (0/1) |

---

### 8. cities (Ethiopian Cities)
**Purpose:** Store city information

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| city_code | VARCHAR(50) | Unique city code |
| name | VARCHAR(100) | City name |
| region | VARCHAR(100) | Ethiopian region |
| latitude | DECIMAL(10,8) | GPS latitude |
| longitude | DECIMAL(11,8) | GPS longitude |

**Our 10 Cities:**
1. Addis Ababa (Capital)
2. Bahirdar
3. Gonder
4. Mekele
5. Dessie
6. Kombolcha
7. Adama
8. Hawasa
9. Arbaminch
10. Jimma

---

### 9. notifications (User Notifications)
**Purpose:** Store notifications for users

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| notification_id | VARCHAR(20) | Unique notification ID |
| user_id | INT | Reference to users |
| type | ENUM | booking/payment/system/promotion |
| title | VARCHAR(255) | Notification title |
| message | TEXT | Notification content |
| is_read | TINYINT | Read status (0/1) |
| created_at | TIMESTAMP | When created |

---

### 10. user_sessions (Login Sessions)
**Purpose:** Track user login sessions

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| session_id | VARCHAR(128) | PHP session ID |
| user_id | INT | Reference to users |
| ip_address | VARCHAR(45) | User's IP address |
| user_agent | TEXT | Browser information |
| is_active | TINYINT | Session active (0/1) |
| last_activity | TIMESTAMP | Last activity time |
| expires_at | TIMESTAMP | Session expiry |

---

### 11. activity_logs (System Logs)
**Purpose:** Track all system activities

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| user_id | INT | Who performed action |
| action | VARCHAR(100) | Action type |
| entity_type | VARCHAR(50) | What was affected |
| entity_id | VARCHAR(50) | ID of affected item |
| description | TEXT | Action description |
| ip_address | VARCHAR(45) | User's IP |
| created_at | TIMESTAMP | When it happened |

---

### 12. system_settings (Configuration)
**Purpose:** Store application settings

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Auto-increment primary key |
| setting_key | VARCHAR(100) | Setting name |
| setting_value | TEXT | Setting value |
| setting_type | ENUM | string/number/boolean/json |
| description | TEXT | What it does |

**Example Settings:**
- `site_name` = "SwiftBus"
- `service_fee` = "25"
- `max_seats_per_booking` = "6"
- `booking_advance_days` = "30"

---

## 🔍 Common SQL Queries

### SELECT (Read Data)
```sql
-- Get all users
SELECT * FROM users;

-- Get specific user by email
SELECT * FROM users WHERE email = 'john@example.com';

-- Get bookings for a user
SELECT * FROM bookings WHERE user_id = 5;

-- Get bookings with user info (JOIN)
SELECT b.*, u.full_name, u.email
FROM bookings b
JOIN users u ON b.user_id = u.id
WHERE b.booking_status = 'confirmed';

-- Count total bookings
SELECT COUNT(*) as total FROM bookings;

-- Get revenue by company
SELECT bus_company, SUM(total_amount) as revenue
FROM bookings
WHERE payment_status = 'paid'
GROUP BY bus_company;
```

### INSERT (Create Data)
```sql
-- Add new user
INSERT INTO users (user_id, email, password_hash, first_name, last_name, full_name, joined_date)
VALUES ('U202501030001', 'new@email.com', '$2y$10$...', 'John', 'Doe', 'John Doe', '2025-01-03');

-- Add new booking
INSERT INTO bookings (booking_id, user_id, from_city, to_city, travel_date, total_amount)
VALUES ('BK202501030001', 5, 'Addis Ababa', 'Bahirdar', '2025-01-15', 450.00);
```

### UPDATE (Modify Data)
```sql
-- Update user profile
UPDATE users SET phone = '0911234567' WHERE id = 5;

-- Update booking status
UPDATE bookings SET booking_status = 'completed' WHERE booking_id = 'BK202501030001';

-- Deactivate user
UPDATE users SET is_active = 0 WHERE id = 10;
```

### DELETE (Remove Data)
```sql
-- Delete a booking
DELETE FROM bookings WHERE booking_id = 'BK202501030001';

-- Delete old notifications
DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

## 🔗 Table Relationships Explained

### One-to-Many (1:N)
One record in table A relates to many records in table B.

**Example:** One user can have many bookings
```sql
-- users (1) → bookings (N)
SELECT u.full_name, COUNT(b.id) as booking_count
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id
GROUP BY u.id;
```

### Many-to-One (N:1)
Many records in table A relate to one record in table B.

**Example:** Many buses belong to one company
```sql
-- buses (N) → bus_companies (1)
SELECT b.bus_number, bc.name as company
FROM buses b
JOIN bus_companies bc ON b.company_id = bc.id;
```

---

## 📊 Database Statistics

| Table | Approximate Records |
|-------|---------------------|
| users | 5 admins + users |
| bus_companies | 4 |
| cities | 10 |
| buses | 12 |
| routes | 56 |
| schedules | 50 |
| bookings | Dynamic |
| payments | Dynamic |

---

## 🔐 Database Security

### 1. Password Storage
Passwords are **never stored in plain text**. They are hashed:
```php
$hash = password_hash('mypassword', PASSWORD_DEFAULT);
// Result: $2y$10$WU/cPjW.xQThC8sc2rNL/uY4geNTLJP6diTrHP.X/yrBkwRm5MLla
```

### 2. SQL Injection Prevention
Using prepared statements:
```php
// SAFE
$stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
```

### 3. Foreign Keys
Ensure data integrity - can't delete a company if buses reference it.

---

## 📁 Database File

The database structure is in: `swiftbus_database_clean.sql`

**To import:**
1. Open phpMyAdmin
2. Create database `swiftbus_db`
3. Select the database
4. Click "Import"
5. Choose `swiftbus_database_clean.sql`
6. Click "Go"

