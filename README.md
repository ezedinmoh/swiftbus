# SwiftBus - Ethiopian Bus Booking System

A full-stack web application for booking bus tickets across Ethiopia.

![SwiftBus](swiftbus.jpg)

## Features

- **User Features:**
  - Search and book bus tickets
  - Multiple payment methods (Telebirr, CBE, Dashen Bank, Card)
  - View and manage bookings
  - QR code tickets
  - User profile management

- **Admin Features:**
  - Dashboard with real-time statistics
  - Manage bookings, users, buses, routes, and schedules
  - System notifications and alerts

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** PHP 7.4+
- **Database:** MySQL 5.7+
- **Libraries:** QRCode.js for ticket QR codes

## Supported Bus Companies

- Selam Bus
- Abay Bus
- Ethio Bus
- Habesha Bus

## Supported Cities

Addis Ababa, Kombolcha, Bahirdar, Dessie, Adama, Hawasa, Arbaminch, Gonder, Mekele, Jimma

## Installation

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache/Nginx) or XAMPP

### Setup Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/swiftbus.git
   cd swiftbus
   ```

2. Import the database:
   - Open phpMyAdmin
   - Create a new database named `swiftbus_db`
   - Import `swiftbus_database_clean.sql`

3. Configure database connection:
   - Edit `config/database.php`
   - Update host, username, password, and database name

4. Start your web server and navigate to the project URL

## Default Admin Accounts

| Email | Password |
|-------|----------|
| ezedinmoh1@gmail.com | password123 |
| hanamariamsebsbew1@gmail.com | password123 |
| mubarekali974@gmail.com | password123 |
| wubetlemma788@gmail.com | password123 |
| mahletbelete4@gmail.com | password123 |

## Project Structure

```
swiftbus/
├── api/                 # Backend API endpoints
├── config/              # Database configuration
├── includes/            # PHP helper functions
├── js/                  # JavaScript files
├── uploads/             # User uploads (avatars)
├── index.html           # Homepage
├── login.html           # User login
├── signup.html          # User registration
├── book-ticket.html     # Ticket booking
├── payment.html         # Payment processing
├── my-tickets.html      # User tickets
├── admin-*.html         # Admin pages
└── swiftbus_database_clean.sql  # Database schema
```

## License

This project is for educational purposes.

## Contributors

- Ezedin Mohammed
- Hana Mariam Sebsbew
- Mubarek Ali
- Wubet Lemma
- Mahlet Belete
