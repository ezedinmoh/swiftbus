# SwiftBus - Ethiopian Bus Booking System

A comprehensive bus booking system built with HTML, CSS, JavaScript frontend and PHP backend with MySQL database.

## Features

### User Features
- **User Registration & Authentication** - Secure signup/login with role-based access
- **Bus Search & Booking** - Search buses by route, date, and passenger count
- **Seat Selection** - Interactive seat map with real-time availability
- **Multiple Payment Methods** - Telebirr, CBE, Dashen Bank, Credit/Debit Cards
- **Booking Management** - View, modify, and cancel bookings
- **QR Code Tickets** - Digital tickets with QR codes for verification
- **User Dashboard** - Personal dashboard with booking history and statistics

### Admin Features
- **Admin Dashboard** - Comprehensive overview with statistics and analytics
- **Bus Management** - Add, edit, and manage bus fleet
- **Route Management** - Create and manage bus routes between cities
- **Schedule Management** - Set up bus schedules and timetables
- **Booking Management** - View and manage all bookings
- **Revenue Reports** - Financial reports and analytics
- **User Management** - Manage user accounts and permissions

### Technical Features
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **RESTful API** - Clean PHP API architecture
- **Database Integration** - MySQL database with proper relationships
- **Security** - Password hashing, SQL injection prevention, XSS protection
- **Real-time Updates** - Dynamic content updates without page refresh
- **Error Handling** - Comprehensive error handling and user feedback

## Technology Stack

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Flexbox and Grid
- **JavaScript (ES6+)** - Interactive functionality and API integration
- **Font Awesome** - Icons and visual elements
- **Google Fonts** - Typography (Poppins font family)

### Backend
- **PHP 7.4+** - Server-side logic and API endpoints
- **MySQL 5.7+** - Database management
- **PDO** - Database abstraction layer
- **JSON** - Data exchange format

## Installation & Setup

### Prerequisites
- **Web Server** - Apache or Nginx
- **PHP 7.4 or higher** with extensions:
  - PDO
  - PDO_MySQL
  - JSON
  - Session
- **MySQL 5.7 or higher**
- **Modern Web Browser** - Chrome, Firefox, Safari, Edge

### Step 1: Download and Extract
1. Download the SwiftBus project files
2. Extract to your web server directory (e.g., `htdocs`, `www`, `public_html`)

### Step 2: Database Configuration
1. Open `config/database.php`
2. Update database connection settings:
```php
private $host = 'localhost';        // Your database host
private $db_name = 'swiftbus_db';   // Database name
private $username = 'root';         // Database username
private $password = '';             // Database password
```

### Step 3: Initialize Database
1. Open your web browser
2. Navigate to `http://your-domain/init.php`
3. Follow the initialization process
4. The script will:
   - Create the database and tables
   - Insert sample data (cities, companies, routes, buses, schedules)
   - Create default admin and test user accounts

### Step 4: Access the Application
- **Main Application**: `http://your-domain/index.html`
- **Admin Panel**: Login with admin credentials and access admin dashboard

## Default Accounts

### Admin Account
- **Email**: `admin@swiftbus.et`
- **Password**: `admin123`
- **Role**: Administrator

### Test User Account
- **Email**: `user@test.com`
- **Password**: `password123`
- **Role**: Regular User

### Predefined Admin Emails
The following emails are automatically assigned admin role:
- `ezedinmoh1@gmail.com`
- `hanamariamsebsbew1@gmail.com`
- `mubarekali974@gmail.com`
- `wubetlemma788@gmail.com`
- `mahletbelete4@gmail.com`

## File Structure

```
swiftbus/
├── config/
│   └── database.php          # Database configuration
├── includes/
│   └── functions.php         # Common PHP functions
├── api/
│   ├── auth.php             # Authentication API
│   ├── search.php           # Search and routes API
│   ├── booking.php          # Booking management API
│   ├── payment.php          # Payment processing API
│   └── admin.php            # Admin operations API
├── js/
│   └── api.js               # Frontend API integration
├── HTML Files/
│   ├── index.html           # Homepage
│   ├── login.html           # User login
│   ├── signup.html          # User registration
│   ├── search.html          # Bus search
│   ├── book-ticket.html     # Ticket booking
│   ├── payment.html         # Payment processing
│   ├── my-tickets.html      # User tickets
│   ├── user-dashboard.html  # User dashboard
│   └── admin-*.html         # Admin pages
├── init.php                 # Database initialization
└── README.md               # This file
```

## API Endpoints

### Authentication (`/api/auth.php`)
- `POST ?action=register` - User registration
- `POST ?action=login` - User login
- `POST ?action=logout` - User logout
- `GET ?action=check_session` - Check session status

### Search (`/api/search.php`)
- `GET ?action=search_buses` - Search available buses
- `GET ?action=get_cities` - Get all cities
- `GET ?action=get_routes` - Get all routes
- `GET ?action=get_available_seats` - Get available seats
- `GET ?action=get_popular_routes` - Get popular routes

### Booking (`/api/booking.php`)
- `POST ?action=create_booking` - Create new booking
- `GET ?action=get_user_bookings` - Get user's bookings
- `GET ?action=get_booking_details` - Get booking details
- `POST ?action=cancel_booking` - Cancel booking
- `GET ?action=get_booking_stats` - Get booking statistics

### Payment (`/api/payment.php`)
- `POST ?action=process_payment` - Process payment
- `GET ?action=verify_payment` - Verify payment status
- `GET ?action=get_payment_methods` - Get available payment methods
- `GET ?action=get_payment_status` - Get payment status

### Admin (`/api/admin.php`)
- `GET ?action=get_dashboard_stats` - Get admin dashboard stats
- `GET ?action=get_all_bookings` - Get all bookings (admin)
- `GET ?action=get_buses` - Get all buses
- `POST ?action=create_bus` - Create new bus
- `GET ?action=get_schedules` - Get all schedules
- `POST ?action=create_schedule` - Create new schedule

## Database Schema

### Main Tables
- **users** - User accounts and authentication
- **bus_companies** - Bus operating companies
- **cities** - Ethiopian cities and locations
- **routes** - Bus routes between cities
- **buses** - Bus fleet information
- **schedules** - Bus schedules and timetables
- **bookings** - Ticket bookings and reservations
- **payments** - Payment transactions and records
- **reviews** - User reviews and ratings
- **admin_logs** - Admin activity logging

## Configuration

### Payment Methods
The system supports multiple payment methods:
- **Telebirr** - Ethiopian mobile money service
- **CBE** - Commercial Bank of Ethiopia
- **Dashen Bank** - Dashen Bank payment gateway
- **Credit/Debit Cards** - International card payments

*Note: Payment processing is simulated for demo purposes. Integrate with actual payment gateways for production use.*

### Customization
- **Cities**: Add/modify cities in the database `cities` table
- **Bus Companies**: Manage companies through admin panel or database
- **Routes**: Create routes through admin panel
- **Pricing**: Set prices per route and bus type
- **Amenities**: Configure bus amenities in JSON format

## Security Features

- **Password Hashing** - Secure password storage using PHP's password_hash()
- **SQL Injection Prevention** - Prepared statements with PDO
- **XSS Protection** - Input sanitization and output escaping
- **Session Management** - Secure session handling
- **Role-based Access Control** - Admin and user role separation
- **Input Validation** - Server-side and client-side validation

## Browser Support

- **Chrome** 60+
- **Firefox** 55+
- **Safari** 12+
- **Edge** 79+
- **Mobile Browsers** - iOS Safari, Chrome Mobile

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check database credentials in `config/database.php`
   - Ensure MySQL server is running
   - Verify database exists and user has permissions

2. **API Errors**
   - Check PHP error logs
   - Ensure all required PHP extensions are installed
   - Verify file permissions

3. **Session Issues**
   - Check PHP session configuration
   - Ensure session directory is writable
   - Clear browser cookies and cache

4. **Payment Processing**
   - Payment methods are simulated for demo
   - Integrate with actual payment gateways for production

### Debug Mode
Enable PHP error reporting for debugging:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For support and questions:
- **Email**: support@swiftbus.et
- **Documentation**: Check this README and code comments
- **Issues**: Report bugs and feature requests

## Changelog

### Version 1.0.0
- Initial release
- Complete booking system functionality
- Admin panel with full management features
- Multiple payment method support
- Responsive design for all devices
- Comprehensive API documentation

---

**SwiftBus** - Connecting Ethiopia, One Journey at a Time 🚌