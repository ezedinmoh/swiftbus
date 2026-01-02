# Backend Documentation - PHP API Files

## 📌 What is Backend?

The **backend** is the server-side code that:
- Receives requests from the frontend
- Processes business logic
- Communicates with the database
- Returns responses (usually JSON)

Users **never see** backend code - it runs on the server.

---

## 🔄 How Backend Works

```
Frontend (JavaScript)          Backend (PHP)              Database (MySQL)
        │                           │                           │
        │  1. Send Request          │                           │
        │  (POST /api/auth.php)     │                           │
        │ ─────────────────────────>│                           │
        │                           │  2. Query Database        │
        │                           │  (SELECT * FROM users)    │
        │                           │ ─────────────────────────>│
        │                           │                           │
        │                           │  3. Return Data           │
        │                           │<─────────────────────────│
        │                           │                           │
        │  4. Send Response         │                           │
        │  (JSON: {success: true})  │                           │
        │<─────────────────────────│                           │
        │                           │                           │
```

---

## 📂 Backend Files Structure

```
api/
├── auth.php              # Authentication (login, signup, logout)
├── dashboard.php         # User dashboard data
├── search.php            # Search buses
├── payment.php           # Payment processing
├── admin.php             # General admin operations
├── admin_auth.php        # Admin authentication
├── admin_users.php       # User management
├── admin_bookings.php    # Booking management
├── admin_buses.php       # Bus management
├── admin_routes.php      # Route management
├── admin_schedules.php   # Schedule management
├── admin_dashboard.php   # Admin dashboard data
└── admin_profile.php     # Admin profile management

config/
└── database.php          # Database connection

includes/
└── functions.php         # Reusable helper functions
```

---

## 📄 Detailed File Explanations

### 1. config/database.php
**Purpose:** Establish connection to MySQL database

```php
<?php
// Database configuration
$host = 'localhost';        // Database server
$dbname = 'swiftbus_db';    // Database name
$username = 'root';         // Database username
$password = '';             // Database password

// Create connection using PDO
try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );
    // Set error mode to exceptions
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>
```

**Key Concepts:**
- **PDO** (PHP Data Objects) - Secure way to connect to database
- **charset=utf8mb4** - Support for all characters including emojis
- **ERRMODE_EXCEPTION** - Throw errors as exceptions for better handling

---

### 2. includes/functions.php
**Purpose:** Contains reusable functions used across all API files

**Key Functions:**

```php
<?php
// Get database connection
function getDB() {
    // Returns PDO database connection
}

// Send JSON response
function jsonResponse($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Validate email format
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Hash password securely
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Verify password
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Generate unique ID
function generateId($prefix) {
    return $prefix . date('Ymd') . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    // Example: BK202501020001
}

// Check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Check if user is admin
function isAdmin() {
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}
?>
```

---

### 3. api/auth.php ⭐ MOST IMPORTANT
**Purpose:** Handle all authentication operations

**Actions:**
- `login` - User login
- `signup` - User registration
- `logout` - User logout
- `checkSession` - Verify if user is logged in
- `changePassword` - Update password

**Login Example:**
```php
<?php
session_start();
header('Content-Type: application/json');
require_once '../includes/functions.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin($input);
        break;
    case 'signup':
        handleSignup($input);
        break;
    case 'logout':
        handleLogout();
        break;
    case 'checkSession':
        handleCheckSession();
        break;
}

function handleLogin($input) {
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    
    // Validate input
    if (empty($email) || empty($password)) {
        jsonResponse(false, 'Email and password are required');
    }
    
    // Get database connection
    $db = getDB();
    
    // Find user by email
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Check if user exists
    if (!$user) {
        jsonResponse(false, 'Invalid email or password');
    }
    
    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        jsonResponse(false, 'Invalid email or password');
    }
    
    // Create session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'];
    
    // Update last login
    $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);
    
    // Return success with user data
    jsonResponse(true, 'Login successful', [
        'user_id' => $user['user_id'],
        'email' => $user['email'],
        'full_name' => $user['full_name'],
        'role' => $user['role']
    ]);
}
?>
```

---

### 4. api/dashboard.php
**Purpose:** Provide data for user dashboard

**Actions:**
- `getUserBookings` - Get user's bookings
- `getDashboardStats` - Get statistics
- `getNotifications` - Get user notifications

```php
<?php
function handleGetUserBookings() {
    $db = getDB();
    $userId = $_SESSION['user_id'];
    
    // Get all bookings for this user
    $stmt = $db->prepare("
        SELECT 
            booking_id,
            from_city,
            to_city,
            travel_date,
            departure_time,
            bus_company,
            bus_type,
            selected_seats,
            total_amount,
            booking_status,
            payment_status,
            created_at
        FROM bookings 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ");
    $stmt->execute([$userId]);
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    jsonResponse(true, 'Bookings retrieved', $bookings);
}
?>
```

---

### 5. api/search.php
**Purpose:** Search for available buses

```php
<?php
function handleSearch($input) {
    $fromCity = $input['from_city'];
    $toCity = $input['to_city'];
    $travelDate = $input['travel_date'];
    
    $db = getDB();
    
    // Find schedules for this route
    $stmt = $db->prepare("
        SELECT 
            s.schedule_id,
            s.departure_time,
            s.arrival_time,
            s.price,
            b.bus_number,
            b.bus_type,
            b.total_seats,
            bc.name as company_name,
            r.distance_km,
            r.estimated_duration_hours
        FROM schedules s
        JOIN buses b ON s.bus_id = b.id
        JOIN bus_companies bc ON b.company_id = bc.id
        JOIN routes r ON s.route_id = r.id
        JOIN cities c1 ON r.origin_city_id = c1.id
        JOIN cities c2 ON r.destination_city_id = c2.id
        WHERE c1.city_code = ? 
        AND c2.city_code = ?
        AND s.is_active = 1
    ");
    $stmt->execute([$fromCity, $toCity]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    jsonResponse(true, 'Search results', $results);
}
?>
```

---

### 6. api/payment.php
**Purpose:** Process payments and create bookings

```php
<?php
function handleCreateBooking($input) {
    $db = getDB();
    
    // Generate booking ID
    $bookingId = generateId('BK');
    
    // Start transaction (all or nothing)
    $db->beginTransaction();
    
    try {
        // Insert booking
        $stmt = $db->prepare("
            INSERT INTO bookings (
                booking_id, user_id, from_city, to_city,
                travel_date, departure_time, bus_company,
                bus_type, selected_seats, passenger_details,
                total_amount, booking_status, payment_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid')
        ");
        $stmt->execute([
            $bookingId,
            $_SESSION['user_id'],
            $input['from_city'],
            $input['to_city'],
            $input['travel_date'],
            $input['departure_time'],
            $input['bus_company'],
            $input['bus_type'],
            json_encode($input['selected_seats']),
            json_encode($input['passenger_details']),
            $input['total_amount']
        ]);
        
        // Insert payment record
        $paymentId = generateId('PAY');
        $stmt = $db->prepare("
            INSERT INTO payments (
                payment_id, booking_id, amount,
                payment_method, payment_status
            ) VALUES (?, ?, ?, ?, 'completed')
        ");
        $stmt->execute([
            $paymentId,
            $bookingId,
            $input['total_amount'],
            $input['payment_method']
        ]);
        
        // Commit transaction
        $db->commit();
        
        jsonResponse(true, 'Booking created', ['booking_id' => $bookingId]);
        
    } catch (Exception $e) {
        // Rollback on error
        $db->rollBack();
        jsonResponse(false, 'Booking failed: ' . $e->getMessage());
    }
}
?>
```

---

### 7. api/admin_users.php
**Purpose:** Admin user management

**Actions:**
- `getUsers` - List all users with pagination
- `getUser` - Get single user details
- `updateUser` - Update user information
- `toggleUserStatus` - Activate/deactivate user

```php
<?php
function handleGetUsers($input) {
    // Check admin permission
    if (!isAdmin()) {
        jsonResponse(false, 'Unauthorized');
    }
    
    $db = getDB();
    $page = $input['page'] ?? 1;
    $limit = 10;
    $offset = ($page - 1) * $limit;
    
    // Get users (excluding admins)
    $stmt = $db->prepare("
        SELECT 
            user_id, email, full_name, phone,
            is_active, is_verified, joined_date, last_login
        FROM users 
        WHERE role = 'user'
        ORDER BY joined_date DESC
        LIMIT $limit OFFSET $offset
    ");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count
    $stmt = $db->query("SELECT COUNT(*) FROM users WHERE role = 'user'");
    $total = $stmt->fetchColumn();
    
    jsonResponse(true, 'Users retrieved', [
        'users' => $users,
        'total' => $total,
        'pages' => ceil($total / $limit)
    ]);
}
?>
```

---

### 8. api/admin_bookings.php
**Purpose:** Admin booking management

**Actions:**
- `getBookings` - List all bookings
- `getBooking` - Get booking details
- `updateBookingStatus` - Change booking status
- `cancelBooking` - Cancel a booking

---

### 9. api/admin_buses.php
**Purpose:** Admin bus management

**Actions:**
- `getBuses` - List all buses
- `addBus` - Add new bus
- `updateBus` - Update bus details
- `deleteBus` - Remove bus

---

### 10. api/admin_routes.php
**Purpose:** Admin route management

**Actions:**
- `getRoutes` - List all routes
- `addRoute` - Add new route
- `updateRoute` - Update route
- `deleteRoute` - Remove route

---

### 11. api/admin_schedules.php
**Purpose:** Admin schedule management

**Actions:**
- `getSchedules` - List all schedules
- `addSchedule` - Add new schedule
- `updateSchedule` - Update schedule
- `deleteSchedule` - Remove schedule

---

## 🔐 Security Features

### 1. Password Hashing
```php
// Never store plain passwords!
$hash = password_hash($password, PASSWORD_DEFAULT);

// Verify password
if (password_verify($inputPassword, $storedHash)) {
    // Password correct
}
```

### 2. Prepared Statements (Prevent SQL Injection)
```php
// WRONG - Vulnerable to SQL injection
$sql = "SELECT * FROM users WHERE email = '$email'";

// CORRECT - Safe with prepared statements
$stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
```

### 3. Session Management
```php
session_start();

// Store user info in session
$_SESSION['user_id'] = $user['id'];

// Check if logged in
if (!isset($_SESSION['user_id'])) {
    jsonResponse(false, 'Not authenticated');
}
```

### 4. Input Validation
```php
// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, 'Invalid email format');
}

// Sanitize input
$name = htmlspecialchars($input['name'], ENT_QUOTES, 'UTF-8');
```

---

## 📊 API Response Format

All API endpoints return JSON in this format:

```json
{
    "success": true,
    "message": "Operation successful",
    "data": {
        // Response data here
    }
}
```

**Error Response:**
```json
{
    "success": false,
    "message": "Error description",
    "data": null
}
```

---

## 🔑 Key PHP Concepts Used

### 1. Sessions
```php
session_start();  // Start session
$_SESSION['key'] = 'value';  // Store data
unset($_SESSION['key']);  // Remove data
session_destroy();  // End session
```

### 2. JSON Handling
```php
// Decode JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Encode PHP array to JSON
echo json_encode(['success' => true]);
```

### 3. PDO Database Operations
```php
// SELECT
$stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// INSERT
$stmt = $db->prepare("INSERT INTO users (name, email) VALUES (?, ?)");
$stmt->execute([$name, $email]);

// UPDATE
$stmt = $db->prepare("UPDATE users SET name = ? WHERE id = ?");
$stmt->execute([$name, $id]);

// DELETE
$stmt = $db->prepare("DELETE FROM users WHERE id = ?");
$stmt->execute([$id]);
```

### 4. Error Handling
```php
try {
    // Code that might fail
    $db->beginTransaction();
    // ... operations
    $db->commit();
} catch (Exception $e) {
    $db->rollBack();
    jsonResponse(false, 'Error: ' . $e->getMessage());
}
```

---

## 📋 Summary Table

| File | Purpose | Key Actions |
|------|---------|-------------|
| auth.php | Authentication | login, signup, logout |
| dashboard.php | User data | getUserBookings, getStats |
| search.php | Search buses | search |
| payment.php | Payments | createBooking, processPayment |
| admin_users.php | User management | getUsers, updateUser |
| admin_bookings.php | Booking management | getBookings, cancelBooking |
| admin_buses.php | Bus management | getBuses, addBus |
| admin_routes.php | Route management | getRoutes, addRoute |
| admin_schedules.php | Schedule management | getSchedules, addSchedule |

