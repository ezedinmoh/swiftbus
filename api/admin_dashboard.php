<?php
/**
 * Admin Dashboard API - Fetches REAL data from database
 * 
 * This API returns actual statistics from the database tables:
 * - bookings: for booking counts and statistics
 * - payments: for revenue calculations
 * - buses: for bus statistics
 * - routes: for route statistics
 * - users: for user statistics (excluding admins)
 * - activity_logs: for recent activities
 * - notifications: for system notifications
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../includes/config.php';
require_once '../includes/functions.php';

// Check if user is authenticated and is admin
if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

$user = getCurrentUser();
if (!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Admin access required']);
    exit;
}

$action = $_GET['action'] ?? 'dashboard_stats';

try {
    switch ($action) {
        case 'dashboard_stats':
        case 'get_admin_stats':
            getDashboardStats();
            break;
        case 'recent_activities':
        case 'get_recent_activities':
            getRecentActivities();
            break;
        case 'get_system_alerts':
            getSystemAlerts();
            break;
        case 'revenue_stats':
            getRevenueStats();
            break;
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

/**
 * Get Dashboard Statistics - REAL DATA FROM DATABASE
 */
function getDashboardStats() {
    try {
        $pdo = getDB();
        $today = date('Y-m-d');
        $weekStart = date('Y-m-d', strtotime('-7 days'));
        $monthStart = date('Y-m-01');
        $yearStart = date('Y-01-01');
        
        // =====================================================
        // 1. BOOKING STATISTICS (from bookings table)
        // =====================================================
        
        // Total bookings count
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM bookings");
        $totalBookings = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Bookings by status
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'confirmed'");
        $confirmedBookings = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'pending'");
        $pendingBookings = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'cancelled'");
        $cancelledBookings = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'completed'");
        $completedBookings = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // Today's bookings
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) = ?");
        $stmt->execute([$today]);
        $todayBookings = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // This week's bookings
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) >= ?");
        $stmt->execute([$weekStart]);
        $weekBookings = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // This month's bookings
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) >= ?");
        $stmt->execute([$monthStart]);
        $monthBookings = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // This year's bookings
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) >= ?");
        $stmt->execute([$yearStart]);
        $yearBookings = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

        // =====================================================
        // 2. REVENUE STATISTICS (from payments table)
        // =====================================================
        
        // Total revenue (all completed payments)
        $stmt = $pdo->query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed'");
        $totalRevenue = (float)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Today's revenue
        $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed' AND DATE(payment_date) = ?");
        $stmt->execute([$today]);
        $todayRevenue = (float)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // This week's revenue
        $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed' AND DATE(payment_date) >= ?");
        $stmt->execute([$weekStart]);
        $weekRevenue = (float)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // This month's revenue
        $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed' AND DATE(payment_date) >= ?");
        $stmt->execute([$monthStart]);
        $monthRevenue = (float)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // This year's revenue
        $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed' AND DATE(payment_date) >= ?");
        $stmt->execute([$yearStart]);
        $yearRevenue = (float)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Pending payments
        $stmt = $pdo->query("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'pending'");
        $pendingPayments = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // =====================================================
        // 3. BUS STATISTICS (from buses table)
        // =====================================================
        
        // Total buses
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM buses");
        $totalBuses = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Active buses
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM buses WHERE status = 'active'");
        $activeBuses = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // Maintenance buses
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM buses WHERE status = 'maintenance'");
        $maintenanceBuses = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // Inactive buses
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM buses WHERE status = 'inactive'");
        $inactiveBuses = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

        // =====================================================
        // 4. ROUTE STATISTICS (from routes table)
        // =====================================================
        
        // Total routes
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM routes");
        $totalRoutes = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Active routes
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM routes WHERE is_active = 1");
        $activeRoutes = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // Popular routes (based on booking count)
        $stmt = $pdo->query("
            SELECT 
                from_city,
                to_city,
                COUNT(*) as booking_count,
                COALESCE(SUM(total_amount), 0) as total_revenue
            FROM bookings
            GROUP BY from_city, to_city
            ORDER BY booking_count DESC
            LIMIT 5
        ");
        $popularRoutes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // =====================================================
        // 5. USER STATISTICS (from users table - EXCLUDING ADMINS)
        // =====================================================
        
        // Total users (excluding admins)
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM users WHERE role = 'user'");
        $totalUsers = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Active users (excluding admins)
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'user' AND is_active = 1");
        $activeUsers = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // Verified users (excluding admins)
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'user' AND is_verified = 1");
        $verifiedUsers = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // New users today (excluding admins)
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user' AND DATE(created_at) = ?");
        $stmt->execute([$today]);
        $newUsersToday = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // New users this week (excluding admins)
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user' AND DATE(created_at) >= ?");
        $stmt->execute([$weekStart]);
        $newUsersWeek = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // New users this month (excluding admins)
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user' AND DATE(created_at) >= ?");
        $stmt->execute([$monthStart]);
        $newUsersMonth = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // Admin count (separate)
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        $adminCount = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

        // =====================================================
        // 6. SCHEDULE STATISTICS (from schedules table)
        // =====================================================
        
        // Total schedules
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM schedules");
        $totalSchedules = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Active schedules
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM schedules WHERE is_active = 1");
        $activeSchedules = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // =====================================================
        // 7. UPCOMING TRIPS (from bookings table)
        // =====================================================
        
        // Upcoming trips (travel_date >= today)
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM bookings WHERE travel_date >= ? AND booking_status NOT IN ('cancelled')");
        $stmt->execute([$today]);
        $upcomingTrips = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // Today's trips
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM bookings WHERE travel_date = ? AND booking_status NOT IN ('cancelled')");
        $stmt->execute([$today]);
        $todayTrips = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // Next 7 days trips
        $next7Days = date('Y-m-d', strtotime('+7 days'));
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM bookings WHERE travel_date BETWEEN ? AND ? AND booking_status NOT IN ('cancelled')");
        $stmt->execute([$today, $next7Days]);
        $next7DaysTrips = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // Build response data
        $dashboardData = [
            'bookings' => [
                'total' => $totalBookings,
                'confirmed' => $confirmedBookings,
                'pending' => $pendingBookings,
                'cancelled' => $cancelledBookings,
                'completed' => $completedBookings,
                'today' => ['count' => $todayBookings],
                'week' => ['count' => $weekBookings],
                'month' => ['count' => $monthBookings],
                'year' => ['count' => $yearBookings]
            ],
            'revenue' => [
                'total' => $totalRevenue,
                'today' => $todayRevenue,
                'week' => $weekRevenue,
                'month' => $monthRevenue,
                'year' => $yearRevenue,
                'pending_count' => (int)$pendingPayments['count'],
                'pending_amount' => (float)$pendingPayments['total']
            ],
            'buses' => [
                'total' => $totalBuses,
                'active' => $activeBuses,
                'maintenance' => $maintenanceBuses,
                'inactive' => $inactiveBuses
            ],
            'routes' => [
                'total' => $totalRoutes,
                'active' => $activeRoutes,
                'popular' => $popularRoutes
            ],
            'users' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'verified' => $verifiedUsers,
                'new_today' => $newUsersToday,
                'new_week' => $newUsersWeek,
                'new_month' => $newUsersMonth,
                'admin_count' => $adminCount
            ],
            'schedules' => [
                'total' => $totalSchedules,
                'active' => $activeSchedules
            ],
            'upcoming_trips' => [
                'total' => $upcomingTrips,
                'today' => $todayTrips,
                'next_7_days' => $next7DaysTrips
            ],
            'generated_at' => date('Y-m-d H:i:s'),
            'data_source' => 'database'
        ];
        
        echo json_encode([
            'success' => true,
            'message' => 'Dashboard statistics retrieved from database',
            'data' => $dashboardData
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to fetch dashboard stats: ' . $e->getMessage());
    }
}

/**
 * Get System Alerts - REAL notifications from database
 */
function getSystemAlerts() {
    try {
        $pdo = getDB();
        $alerts = [];
        
        // Check for pending bookings
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'pending'");
        $pendingBookings = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        if ($pendingBookings > 0) {
            $alerts[] = [
                'id' => 'pending_bookings',
                'level' => 'warning',
                'title' => 'Pending Bookings',
                'message' => "There are {$pendingBookings} pending booking(s) awaiting confirmation.",
                'count' => $pendingBookings,
                'created_at' => date('Y-m-d H:i:s'),
                'action_url' => 'admin-bookings-all.html?status=pending'
            ];
        }
        
        // Check for pending payments
        $stmt = $pdo->query("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'pending'");
        $pendingPayments = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ((int)$pendingPayments['count'] > 0) {
            $alerts[] = [
                'id' => 'pending_payments',
                'level' => 'warning',
                'title' => 'Pending Payments',
                'message' => "There are {$pendingPayments['count']} pending payment(s) totaling ETB " . number_format($pendingPayments['total'], 2),
                'count' => (int)$pendingPayments['count'],
                'amount' => (float)$pendingPayments['total'],
                'created_at' => date('Y-m-d H:i:s')
            ];
        }
        
        // Check for buses in maintenance
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM buses WHERE status = 'maintenance'");
        $maintenanceBuses = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        if ($maintenanceBuses > 0) {
            $alerts[] = [
                'id' => 'maintenance_buses',
                'level' => 'info',
                'title' => 'Buses in Maintenance',
                'message' => "{$maintenanceBuses} bus(es) are currently under maintenance.",
                'count' => $maintenanceBuses,
                'created_at' => date('Y-m-d H:i:s'),
                'action_url' => 'admin-buses-list.html?status=maintenance'
            ];
        }
        
        // Check for unverified users
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'user' AND is_verified = 0");
        $unverifiedUsers = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        if ($unverifiedUsers > 0) {
            $alerts[] = [
                'id' => 'unverified_users',
                'level' => 'info',
                'title' => 'Unverified Users',
                'message' => "{$unverifiedUsers} user(s) have not verified their email.",
                'count' => $unverifiedUsers,
                'created_at' => date('Y-m-d H:i:s'),
                'action_url' => 'admin-users-list.html?status=unverified'
            ];
        }
        
        // Check for today's trips
        $today = date('Y-m-d');
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM bookings WHERE travel_date = ? AND booking_status = 'confirmed'");
        $stmt->execute([$today]);
        $todayTrips = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        if ($todayTrips > 0) {
            $alerts[] = [
                'id' => 'today_trips',
                'level' => 'success',
                'title' => "Today's Trips",
                'message' => "{$todayTrips} confirmed trip(s) scheduled for today.",
                'count' => $todayTrips,
                'created_at' => date('Y-m-d H:i:s')
            ];
        }
        
        // Get recent notifications from notifications table
        $stmt = $pdo->query("
            SELECT n.*, u.full_name as user_name
            FROM notifications n
            LEFT JOIN users u ON n.user_id = u.id
            WHERE n.type IN ('booking', 'payment', 'system')
            ORDER BY n.created_at DESC
            LIMIT 5
        ");
        $recentNotifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($recentNotifications as $notification) {
            $alerts[] = [
                'id' => 'notification_' . $notification['id'],
                'level' => $notification['type'] === 'system' ? 'info' : 'success',
                'title' => $notification['title'],
                'message' => $notification['message'],
                'user' => $notification['user_name'],
                'created_at' => $notification['created_at'],
                'is_read' => (bool)$notification['is_read']
            ];
        }
        
        // If no alerts, show system operational message
        if (empty($alerts)) {
            $alerts[] = [
                'id' => 'system_operational',
                'level' => 'success',
                'title' => 'System Operational',
                'message' => 'All systems are running normally. No pending issues.',
                'created_at' => date('Y-m-d H:i:s')
            ];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $alerts
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to fetch system alerts: ' . $e->getMessage());
    }
}

/**
 * Get Recent Activities - REAL activities from database
 */
function getRecentActivities() {
    try {
        $pdo = getDB();
        $activities = [];
        
        // Get recent bookings
        $stmt = $pdo->query("
            SELECT 
                b.booking_id,
                b.from_city,
                b.to_city,
                b.total_amount,
                b.booking_status,
                b.created_at,
                u.full_name as user_name,
                u.email as user_email
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            ORDER BY b.created_at DESC
            LIMIT 5
        ");
        $recentBookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($recentBookings as $booking) {
            $activities[] = [
                'id' => 'booking_' . $booking['booking_id'],
                'type' => 'booking',
                'icon' => 'fas fa-ticket-alt',
                'title' => 'New Booking',
                'description' => "Booking #{$booking['booking_id']} - {$booking['from_city']} → {$booking['to_city']}",
                'user' => $booking['user_name'] ?? 'Guest',
                'amount' => (float)$booking['total_amount'],
                'status' => $booking['booking_status'],
                'timestamp' => $booking['created_at'],
                'time' => getTimeAgo($booking['created_at'])
            ];
        }
        
        // Get recent payments
        $stmt = $pdo->query("
            SELECT 
                p.payment_id,
                p.booking_id,
                p.amount,
                p.payment_method,
                p.payment_status,
                p.payment_date,
                p.passenger_name,
                p.passenger_email,
                p.created_at
            FROM payments p
            ORDER BY p.created_at DESC
            LIMIT 5
        ");
        $recentPayments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($recentPayments as $payment) {
            $statusIcon = $payment['payment_status'] === 'completed' ? 'success' : 
                         ($payment['payment_status'] === 'pending' ? 'warning' : 'danger');
            $activities[] = [
                'id' => 'payment_' . $payment['payment_id'],
                'type' => 'payment',
                'icon' => 'fas fa-money-bill-wave',
                'title' => 'Payment ' . ucfirst($payment['payment_status']),
                'description' => "ETB " . number_format($payment['amount'], 2) . " via " . ucfirst($payment['payment_method']),
                'user' => $payment['passenger_name'] ?? 'Customer',
                'amount' => (float)$payment['amount'],
                'status' => $payment['payment_status'],
                'timestamp' => $payment['created_at'],
                'time' => getTimeAgo($payment['created_at'])
            ];
        }
        
        // Get recent user registrations
        $stmt = $pdo->query("
            SELECT 
                user_id,
                full_name,
                email,
                created_at
            FROM users
            WHERE role = 'user'
            ORDER BY created_at DESC
            LIMIT 3
        ");
        $recentUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($recentUsers as $user) {
            $activities[] = [
                'id' => 'user_' . $user['user_id'],
                'type' => 'user',
                'icon' => 'fas fa-user-plus',
                'title' => 'New User Registration',
                'description' => "{$user['full_name']} joined SwiftBus",
                'user' => $user['full_name'],
                'email' => $user['email'],
                'timestamp' => $user['created_at'],
                'time' => getTimeAgo($user['created_at'])
            ];
        }
        
        // Get activity logs if available
        $stmt = $pdo->query("
            SELECT 
                al.id,
                al.action,
                al.entity_type,
                al.entity_id,
                al.description,
                al.created_at,
                u.full_name as user_name
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT 5
        ");
        $activityLogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($activityLogs as $log) {
            $activities[] = [
                'id' => 'activity_' . $log['id'],
                'type' => 'activity',
                'icon' => 'fas fa-history',
                'title' => ucfirst(str_replace('_', ' ', $log['action'])),
                'description' => $log['description'] ?? "{$log['entity_type']} #{$log['entity_id']}",
                'user' => $log['user_name'] ?? 'System',
                'timestamp' => $log['created_at'],
                'time' => getTimeAgo($log['created_at'])
            ];
        }
        
        // Sort all activities by timestamp (most recent first)
        usort($activities, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });
        
        // Limit to 10 most recent activities
        $activities = array_slice($activities, 0, 10);
        
        // If no activities found
        if (empty($activities)) {
            $activities[] = [
                'id' => 'no_activity',
                'type' => 'system',
                'icon' => 'fas fa-info-circle',
                'title' => 'No Recent Activity',
                'description' => 'No recent activities found in the database.',
                'timestamp' => date('Y-m-d H:i:s'),
                'time' => 'Just now'
            ];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $activities
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to fetch recent activities: ' . $e->getMessage());
    }
}

/**
 * Get Revenue Statistics for charts
 */
function getRevenueStats() {
    try {
        $pdo = getDB();
        
        // Get revenue for last 7 days from payments table
        $stmt = $pdo->query("
            SELECT 
                DATE(payment_date) as date,
                COALESCE(SUM(amount), 0) as revenue,
                COUNT(*) as transaction_count
            FROM payments 
            WHERE payment_status = 'completed'
            AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(payment_date)
            ORDER BY date ASC
        ");
        $dailyRevenue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Fill in missing dates with 0 revenue
        $revenueData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $revenue = 0;
            $transactions = 0;
            
            foreach ($dailyRevenue as $day) {
                if ($day['date'] === $date) {
                    $revenue = (float)$day['revenue'];
                    $transactions = (int)$day['transaction_count'];
                    break;
                }
            }
            
            $revenueData[] = [
                'date' => $date,
                'revenue' => $revenue,
                'transactions' => $transactions,
                'formatted_date' => date('M j', strtotime($date)),
                'day_name' => date('D', strtotime($date))
            ];
        }
        
        // Get revenue by payment method
        $stmt = $pdo->query("
            SELECT 
                payment_method,
                COUNT(*) as count,
                COALESCE(SUM(amount), 0) as total
            FROM payments 
            WHERE payment_status = 'completed'
            GROUP BY payment_method
            ORDER BY total DESC
        ");
        $revenueByMethod = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get monthly revenue for current year
        $stmt = $pdo->query("
            SELECT 
                MONTH(payment_date) as month,
                MONTHNAME(payment_date) as month_name,
                COALESCE(SUM(amount), 0) as revenue,
                COUNT(*) as transaction_count
            FROM payments 
            WHERE payment_status = 'completed'
            AND YEAR(payment_date) = YEAR(CURDATE())
            GROUP BY MONTH(payment_date), MONTHNAME(payment_date)
            ORDER BY month ASC
        ");
        $monthlyRevenue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => [
                'daily' => $revenueData,
                'by_method' => $revenueByMethod,
                'monthly' => $monthlyRevenue
            ]
        ]);
        
    } catch (Exception $e) {
        throw new Exception('Failed to fetch revenue stats: ' . $e->getMessage());
    }
}

/**
 * Helper function to get time ago string
 */
function getTimeAgo($datetime) {
    $time = time() - strtotime($datetime);
    
    if ($time < 60) return 'Just now';
    if ($time < 3600) return floor($time/60) . ' min ago';
    if ($time < 86400) return floor($time/3600) . ' hour' . (floor($time/3600) > 1 ? 's' : '') . ' ago';
    if ($time < 604800) return floor($time/86400) . ' day' . (floor($time/86400) > 1 ? 's' : '') . ' ago';
    if ($time < 2592000) return floor($time/604800) . ' week' . (floor($time/604800) > 1 ? 's' : '') . ' ago';
    if ($time < 31536000) return floor($time/2592000) . ' month' . (floor($time/2592000) > 1 ? 's' : '') . ' ago';
    return floor($time/31536000) . ' year' . (floor($time/31536000) > 1 ? 's' : '') . ' ago';
}
?>
