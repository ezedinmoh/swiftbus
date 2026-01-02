# Frontend Documentation - HTML/CSS/JavaScript Files

## 📌 What is Frontend?

The **frontend** is everything the user sees and interacts with in their browser. It includes:
- **HTML** - The structure (buttons, forms, text, images)
- **CSS** - The styling (colors, fonts, spacing, layout)
- **JavaScript** - The behavior (what happens when you click, form validation, API calls)

---

## 📄 Frontend Files Explained

### 1. index.html (Homepage)
**Purpose:** The main landing page users see first

**What it contains:**
- Hero section with search form
- Featured bus companies
- Popular routes
- How it works section
- Navigation bar

**Key Features:**
```html
<!-- Search Form -->
<form id="searchForm">
    <select id="fromCity">...</select>    <!-- Departure city -->
    <select id="toCity">...</select>       <!-- Destination city -->
    <input type="date" id="travelDate">    <!-- Travel date -->
    <button type="submit">Search Buses</button>
</form>
```

**JavaScript Functions:**
- `searchBuses()` - Sends search request to backend
- `checkUserLogin()` - Checks if user is logged in
- `updateNavigation()` - Shows/hides login buttons based on auth state

---

### 2. login.html (Login Page)
**Purpose:** Allow users to sign in to their account

**How it works:**
1. User enters email and password
2. JavaScript validates the form
3. Sends data to `api/auth.php` with action "login"
4. If successful, redirects to dashboard
5. If failed, shows error message

**Key Code:**
```javascript
// When login form is submitted
async function handleLogin(email, password) {
    const response = await fetch('api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'login',
            email: email,
            password: password
        })
    });
    
    const data = await response.json();
    
    if (data.success) {
        // Save user info and redirect
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'user-dashboard.html';
    } else {
        // Show error
        alert(data.message);
    }
}
```

---

### 3. signup.html (Registration Page)
**Purpose:** Allow new users to create an account

**Form Fields:**
- First Name
- Last Name
- Email
- Phone Number
- Password
- Confirm Password

**Validation:**
- Email format check
- Password minimum 8 characters
- Password match confirmation
- Phone number format

---

### 4. book-ticket.html (Booking Page) ⭐ MOST COMPLEX
**Purpose:** Multi-step ticket booking process

**4 Steps:**
1. **Trip Details** - Select bus company, type, route, date, time
2. **Seat Selection** - Interactive seat map to choose seats
3. **Passenger Details** - Enter passenger information
4. **Payment** - Select payment method and confirm

**Key Features:**

```javascript
// Seat Selection
function selectSeat(seatNumber) {
    if (selectedSeats.includes(seatNumber)) {
        // Deselect seat
        selectedSeats = selectedSeats.filter(s => s !== seatNumber);
    } else {
        // Select seat
        selectedSeats.push(seatNumber);
    }
    updateSeatDisplay();
    calculateTotal();
}

// Price Calculation
function calculateTotal() {
    const seatPrice = selectedSeats.length * pricePerSeat;
    const serviceFee = 25;  // Fixed fee
    const tax = seatPrice * 0.10;  // 10% tax
    const total = seatPrice + serviceFee + tax;
    return total;
}
```

**Seat Types:**
- Regular seats (blue)
- Women-only seats (pink)
- Occupied seats (gray - cannot select)

---

### 5. payment.html (Payment Page)
**Purpose:** Process payment for booking

**Payment Methods:**
- Telebirr (Mobile Money)
- Commercial Bank of Ethiopia (CBE)
- Dashen Bank
- Credit/Debit Card

**Flow:**
1. Shows booking summary
2. User confirms payment method
3. Simulates payment processing
4. Creates booking in database
5. Shows success with QR code

---

### 6. my-tickets.html (User Tickets)
**Purpose:** Display all user's booked tickets

**Features:**
- Filter by status (All, Upcoming, Completed, Cancelled)
- Search tickets
- View ticket details
- Download ticket
- QR code for each ticket

**Ticket Card Shows:**
- Booking ID
- Route (From → To)
- Date and Time
- Bus Company
- Seat Numbers
- Status (Confirmed, Completed, Cancelled)

---

### 7. user-dashboard.html (User Dashboard)
**Purpose:** User's main control panel after login

**Sections:**
- Welcome message with user name
- Quick stats (Total Bookings, Upcoming Trips)
- Recent bookings list
- Quick action buttons

---

### 8. user-profile.html (Profile Settings)
**Purpose:** Manage user account settings

**Features:**
- View/Edit personal information
- Change password
- Upload profile picture
- View account statistics

---

## 🔧 Admin Pages

### admin-dashboard.html
**Purpose:** Admin main control panel

**Shows:**
- Total Users count
- Total Bookings count
- Total Revenue
- Active Buses count
- Recent activities
- System alerts

---

### admin-users-list.html
**Purpose:** Manage all users

**Features:**
- View all users in table
- Search users
- Filter by role (User/Admin)
- Edit user details
- Activate/Deactivate users

---

### admin-bookings-all.html
**Purpose:** Manage all bookings

**Features:**
- View all bookings
- Filter by status
- Search by booking ID
- View booking details
- Update booking status

---

### admin-buses-list.html & admin-buses-add.html
**Purpose:** Manage bus fleet

**Information:**
- Bus number
- Company
- Type (Economy, Standard, Premium, Luxury)
- Total seats
- Status (Active, Maintenance, Inactive)

---

### admin-routes-list.html
**Purpose:** Manage bus routes

**Route Information:**
- Origin city
- Destination city
- Distance (km)
- Duration (hours)
- Base price

---

### admin-schedules-list.html
**Purpose:** Manage bus schedules

**Schedule Information:**
- Bus assignment
- Route
- Departure time
- Arrival time
- Days of operation
- Price

---

## 🎨 CSS Styling

All pages use **embedded CSS** (inside `<style>` tags) with:

**CSS Variables (Custom Properties):**
```css
:root {
    --primary: #1a73e8;      /* Main blue color */
    --secondary: #34a853;    /* Green for success */
    --danger: #dc3545;       /* Red for errors */
    --warning: #ffc107;      /* Yellow for warnings */
    --dark: #1e1e2d;         /* Dark background */
    --light: #f8f9fa;        /* Light background */
}
```

**Responsive Design:**
```css
/* Mobile devices */
@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
    .nav-links {
        display: none;  /* Hide on mobile */
    }
}
```

---

## 📱 JavaScript API Helper (js/api.js)

This file contains the `swiftBusAPI` object that handles all communication with the backend:

```javascript
const swiftBusAPI = {
    // Base URL for API
    baseURL: 'api/',
    
    // Login user
    async login(email, password) {
        return await this.request('auth.php', {
            action: 'login',
            email,
            password
        });
    },
    
    // Get user bookings
    async getUserBookings() {
        return await this.request('dashboard.php', {
            action: 'getUserBookings'
        });
    },
    
    // Search buses
    async searchBuses(from, to, date) {
        return await this.request('search.php', {
            action: 'search',
            from_city: from,
            to_city: to,
            travel_date: date
        });
    },
    
    // Generic request method
    async request(endpoint, data) {
        const response = await fetch(this.baseURL + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    }
};
```

---

## 🔑 Key JavaScript Concepts Used

### 1. Fetch API (AJAX)
```javascript
// Send data to server without page reload
fetch('api/auth.php', {
    method: 'POST',
    body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => console.log(data));
```

### 2. Async/Await
```javascript
// Modern way to handle asynchronous operations
async function loadData() {
    const response = await fetch('api/data.php');
    const data = await response.json();
    return data;
}
```

### 3. LocalStorage
```javascript
// Store data in browser
localStorage.setItem('user', JSON.stringify(userData));

// Retrieve data
const user = JSON.parse(localStorage.getItem('user'));
```

### 4. DOM Manipulation
```javascript
// Change page content dynamically
document.getElementById('userName').textContent = user.name;
document.querySelector('.tickets-container').innerHTML = ticketHTML;
```

### 5. Event Listeners
```javascript
// React to user actions
document.getElementById('loginBtn').addEventListener('click', handleLogin);
form.addEventListener('submit', handleSubmit);
```

---

## 📊 Summary Table

| File | Purpose | Key Features |
|------|---------|--------------|
| index.html | Homepage | Search form, featured routes |
| login.html | User login | Form validation, API call |
| signup.html | Registration | Form validation, password check |
| book-ticket.html | Book tickets | 4-step wizard, seat selection |
| payment.html | Payment | Multiple payment methods |
| my-tickets.html | View tickets | QR codes, filters |
| user-dashboard.html | User panel | Stats, recent bookings |
| admin-dashboard.html | Admin panel | System overview |
| admin-*.html | Admin pages | CRUD operations |

