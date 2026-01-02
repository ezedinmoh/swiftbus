# 📝 Quick Reference Cheat Sheet

## 🔑 Key Terms to Know

| Term | Definition | Example |
|------|------------|---------|
| **Frontend** | What users see in browser | HTML, CSS, JavaScript |
| **Backend** | Server-side code | PHP files in api/ folder |
| **Database** | Data storage | MySQL tables |
| **API** | Interface between frontend & backend | api/auth.php |
| **AJAX** | Send data without page reload | fetch() in JavaScript |
| **JSON** | Data format for API responses | {"success": true} |
| **Session** | Store user login state | $_SESSION in PHP |
| **Hash** | Encrypted password | $2y$10$... |
| **SQL** | Database query language | SELECT * FROM users |
| **CRUD** | Create, Read, Update, Delete | Basic database operations |

---

## 📁 File Quick Reference

### Frontend Files (What users see)
| File | Purpose |
|------|---------|
| index.html | Homepage with search |
| login.html | User login |
| signup.html | User registration |
| book-ticket.html | 4-step booking wizard |
| payment.html | Payment processing |
| my-tickets.html | View booked tickets |
| user-dashboard.html | User control panel |
| admin-dashboard.html | Admin control panel |

### Backend Files (Server logic)
| File | Purpose |
|------|---------|
| api/auth.php | Login, signup, logout |
| api/dashboard.php | User dashboard data |
| api/search.php | Search buses |
| api/payment.php | Process payments |
| api/admin_*.php | Admin operations |
| config/database.php | Database connection |
| includes/functions.php | Helper functions |

### Database Tables
| Table | Stores |
|-------|--------|
| users | User accounts |
| bookings | Ticket bookings |
| payments | Payment records |
| buses | Bus information |
| bus_companies | Company info |
| routes | Travel routes |
| schedules | Bus schedules |
| cities | Ethiopian cities |

---

## 🔄 How Data Flows

```
User Action → JavaScript → PHP API → MySQL → PHP API → JavaScript → Update Page
```

**Example: Login**
1. User enters email/password
2. JavaScript sends to api/auth.php
3. PHP queries database
4. Database returns user data
5. PHP creates session, returns JSON
6. JavaScript redirects to dashboard

---

## 💻 Code Snippets to Remember

### JavaScript - API Call
```javascript
const response = await fetch('api/auth.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', email, password })
});
const data = await response.json();
```

### PHP - Database Query
```php
$stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
```

### PHP - JSON Response
```php
echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'data' => $userData
]);
```

### SQL - Common Queries
```sql
-- Select
SELECT * FROM bookings WHERE user_id = 5;

-- Insert
INSERT INTO users (email, password_hash) VALUES ('a@b.com', '$hash');

-- Update
UPDATE bookings SET status = 'confirmed' WHERE id = 1;

-- Delete
DELETE FROM bookings WHERE id = 1;
```

---

## 🔐 Security Points

1. **Passwords** → Hashed with password_hash()
2. **SQL Queries** → Use prepared statements (?)
3. **Sessions** → Check $_SESSION['user_id']
4. **Input** → Validate all user input

---

## 📊 Numbers to Remember

- **4** Bus Companies (Selam, Abay, Ethio, Habesha)
- **10** Cities
- **12** Database Tables
- **4** Payment Methods
- **5** Admin Users
- **4** Steps in Booking Process

---

## 🎯 If Asked...

**"How does login work?"**
→ JavaScript sends credentials to PHP → PHP checks database → Creates session → Returns success/fail

**"How are passwords secured?"**
→ We use password_hash() which creates a bcrypt hash. Never store plain text.

**"What prevents SQL injection?"**
→ Prepared statements with placeholders (?). User input never goes directly in SQL.

**"How do frontend and backend communicate?"**
→ Through API calls using fetch(). Frontend sends JSON, backend returns JSON.

**"What is a session?"**
→ Server-side storage that remembers logged-in users across pages.

---

## 🚀 Demo Checklist

Before presenting:
- [ ] XAMPP running (Apache + MySQL)
- [ ] Database imported
- [ ] Test login works
- [ ] Test booking flow works
- [ ] Admin login works

Demo order:
1. [ ] Show homepage
2. [ ] Register new user
3. [ ] Login
4. [ ] Search buses
5. [ ] Book ticket (all 4 steps)
6. [ ] View ticket with QR
7. [ ] Show admin panel

---

## 📞 Emergency Answers

**If demo crashes:**
"Let me show you screenshots of how this works..."

**If you don't know an answer:**
"That's a great question. We focused on [X feature] for this version, but [Y] would be a good future enhancement."

**If asked about something not implemented:**
"We designed the system to be extensible. That feature could be added by [brief explanation]."

