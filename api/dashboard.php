<?php
/**
 * SwiftBus Dashboard API
 * 
 * Handles dashboard statistics and metrics for both admin and user dashboards
 */

// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once '../includes/functions.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'get_admin_stats':
        handleGetAdminStats();
        break;
    case 'get_user_stats':
        handleGetUserStats();
        break;
    case 'get_notifications':
        handleGetNotifications();
        break;
    case 'get_recent_activities':
        handleGetRecentActivities();
        break;
    case 'get_upcoming_trips':
        handleGetUpcomingTrips();
        break;
    case 'get_system_alerts':
        handleGetSystemAlerts();
        break;
    default:
        handleError('Invalid action', 400);
}

/**
 * Get admin dashboard statistics
 * Returns REAL data from database - no sample/random data
 */
function handleGetAdminStats() {
    if (!isLoggedIn()) {
        handleError('Authentication required', 401);
    }
    
    if (!isAdmin()) {
        handleError('Admin access required', 403);
    }
    
    try {
        $db = getDB();
        
        // Get current date ranges
        $today = date('Y-m-d');
        $weekStart = date('Y-m-d', strtotime('monday this week'));
        $monthStart = date('Y-m-01');
        $yearStart = date('Y-01-01');
        
        // ============================================
        // BOOKING STATISTICS (from bookings table)
        // ============================================
        $bookingStats = [];
        
        // Total bookings count (all time)
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM bookings");
        $stmt->execute();
        $totalBookingsResult = $stmt->fetch();
        $bookingStats['total'] = (int)$totalBookingsResult['total'];
        
        // Today's bookings
        $stmt = $db->prepare("SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM bookings WHERE DATE(created_at) = ?");
        $stmt->execute([$today]);
        $todayBookings = $stmt->fetch();
        $bookingStats['today'] = [
            'count' => (int)$todayBookings['count'],
            'revenue' => (float)$todayBookings['revenue']
        ];
        
        // This week's bookings
        $stmt = $db->prepare("SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM bookings WHERE DATE(created_at) >= ?");
        $stmt->execute([$weekStart]);
        $weekBookings = $stmt->fetch();
        $bookingStats['week'] = [
            'count' => (int)$weekBookings['count'],
            'revenue' => (float)$weekBookings['revenue']
        ];
        
        // This month's bookings
        $stmt = $db->prepare("SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM bookings WHERE DATE(created_at) >= ?");
        $stmt->execute([$monthStart]);
        $monthBookings = $stmt->fetch();
        $bookingStats['month'] = [
            'count' => (int)$monthBookings['count'],
            'revenue' => (float)$monthBookings['revenue']
        ];
        
        // This year's bookings
        $stmt = $db->prepare("SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM bookings WHERE DATE(created_at) >= ?");
        $stmt->execute([$yearStart]);
        $yearBookings = $stmt->fetch();
        $bookingStats['year'] = [
            'count' => (int)$yearBookings['count'],
            'revenue' => (float)$yearBookings['revenue']
        ];
        
        // Booking status breakdown
        $stmt = $db->prepare("SELECT 
                             SUM(CASE WHEN booking_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                             SUM(CASE WHEN booking_status = 'pending' THEN 1 ELSE 0 END) as pending,
                             SUM(CASE WHEN booking_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                             SUM(CASE WHEN booking_status = 'completed' THEN 1 ELSE 0 END) as completed
                             FROM bookings");
        $stmt->execute();
        $bookingStatusBreakdown = $stmt->fetch();
        $bookingStats['confirmed'] = (int)$bookingStatusBreakdown['confirmed'];
        $bookingStats['pending'] = (int)$bookingStatusBreakdown['pending'];
        $bookingStats['cancelled'] = (int)$bookingStatusBreakdown['cancelled'];
        $bookingStats['completed'] = (int)$bookingStatusBreakdown['completed'];
        
        // ============================================
        // REVENUE STATISTICS (from payments table - completed payments only)
        // ============================================
        $revenueStats = [];
        
        // Total revenue (all time - completed payments only)
        $stmt = $db->prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed'");
        $stmt->execute();
        $totalRevenueResult = $stmt->fetch();
        $revenueStats['total'] = (float)$totalRevenueResult['total'];
        
        // Today's revenue
        $stmt = $db->prepare("SELECT COALESCE(SUM(amount), 0) as revenue FROM payments WHERE payment_status = 'completed' AND DATE(payment_date) = ?");
        $stmt->execute([$today]);
        $todayRevenue = $stmt->fetch();
        $revenueStats['today'] = (float)$todayRevenue['revenue'];
        
        // This week's revenue
        $stmt = $db->prepare("SELECT COALESCE(SUM(amount), 0) as revenue FROM payments WHERE payment_status = 'completed' AND DATE(payment_date) >= ?");
        $stmt->execute([$weekStart]);
        $weekRevenue = $stmt->fetch();
        $revenueStats['week'] = (float)$weekRevenue['revenue'];
        
        // This month's revenue
        $stmt = $db->prepare("SELECT COALESCE(SUM(amount), 0) as revenue FROM payments WHERE payment_status = 'completed' AND DATE(payment_date) >= ?");
        $stmt->execute([$monthStart]);
        $monthRevenue = $stmt->fetch();
        $revenueStats['month'] = (float)$monthRevenue['revenue'];
        
        // This year's revenue
        $stmt = $db->prepare("SELECT COALESCE(SUM(amount), 0) as revenue FROM payments WHERE payment_status = 'completed' AND DATE(payment_date) >= ?");
        $stmt->execute([$yearStart]);
        $yearRevenue = $stmt->fetch();
        $revenueStats['year'] = (float)$yearRevenue['revenue'];
        
        // ============================================
        // BUS STATISTICS (from buses table)
        // ============================================
        $stmt = $db->prepare("SELECT 
                             COUNT(*) as total,
                             SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                             SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
                             SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
                             FROM buses");
        $stmt->execute();
        $busStats = $stmt->fetch();
        
        // ============================================
        // ROUTE STATISTICS (from routes table)
        // ============================================
        $stmt = $db->prepare("SELECT 
                             COUNT(*) as total,
                             SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
                             FROM routes");
        $stmt->execute();
        $routeStats = $stmt->fetch();
        
        // Popular Routes (top 5 by booking count)
        $stmt = $db->prepare("SELECT 
                             b.from_city as origin_city, 
                             b.to_city as destination_city,
                             COUNT(b.id) as booking_count 
                             FROM bookings b 
                             GROUP BY b.from_city, b.to_city 
                             ORDER BY booking_count DESC 
                             LIMIT 5");
        $stmt->execute();
        $popularRoutes = $stmt->fetchAll();
        
        // ============================================
        // USER STATISTICS (from users table - EXCLUDING ADMINS)
        // ============================================
        $stmt = $db->prepare("SELECT 
                             COUNT(*) as total,
                             SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
                             SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as regular_users,
                             SUM(CASE WHEN is_active = 1 AND role = 'user' THEN 1 ELSE 0 END) as active_users,
                             SUM(CASE WHEN DATE(joined_date) = ? AND role = 'user' THEN 1 ELSE 0 END) as new_today
                             FROM users");
        $stmt->execute([$today]);
        $userStats = $stmt->fetch();
        
        // ============================================
        // UPCOMING TRIPS STATISTICS (from schedules table)
        // ============================================
        $nextWeek = date('Y-m-d', strtotime('+7 days'));
        
        // Today's active schedules
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM schedules WHERE effective_from <= ? AND (effective_until IS NULL OR effective_until >= ?) AND is_active = 1");
        $stmt->execute([$today, $today]);
        $todayTrips = $stmt->fetch();
        
        // Next 7 days schedules
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM schedules WHERE effective_from <= ? AND (effective_until IS NULL OR effective_until >= ?) AND is_active = 1");
        $stmt->execute([$nextWeek, $today]);
        $upcomingTrips = $stmt->fetch();
        
        // ============================================
        // BUILD RESPONSE DATA
        // ============================================
        $dashboardData = [
            'bookings' => $bookingStats,
            'revenue' => $revenueStats,
            'buses' => [
                'total' => (int)($busStats['total'] ?? 0),
                'active' => (int)($busStats['active'] ?? 0),
                'maintenance' => (int)($busStats['maintenance'] ?? 0),
                'inactive' => (int)($busStats['inactive'] ?? 0)
            ],
            'routes' => [
                'total' => (int)($routeStats['total'] ?? 0),
                'active' => (int)($routeStats['active'] ?? 0),
                'popular' => $popularRoutes
            ],
            'users' => [
                // Total users EXCLUDING admins (only regular users)
                'total' => (int)($userStats['regular_users'] ?? 0),
                'active' => (int)($userStats['active_users'] ?? 0),
                'admins' => (int)($userStats['admins'] ?? 0),
                'regular_users' => (int)($userStats['regular_users'] ?? 0),
                'new_today' => (int)($userStats['new_today'] ?? 0)
            ],
            'upcoming_trips' => [
                'count' => (int)($upcomingTrips['count'] ?? 0),
                'today' => (int)($todayTrips['count'] ?? 0),
                'next_7_days' => (int)($upcomingTrips['count'] ?? 0)
            ],
            'generated_at' => date('Y-m-d H:i:s')
        ];
        
        handleSuccess($dashboardData, 'Admin dashboard statistics retrieved successfully');
        
    } catch (Exception $e) {
        error_log("Admin dashboard stats error: " . $e->getMessage());
        handleError('Failed to retrieve dashboard statistics: ' . $e->getMessage(), 500);
    }
}

/**
 * Get user dashboard statistics
 */
function handleGetUserStats() {
    if (!isLoggedIn()) {
        handleError('Authentication required', 401);
    }
    
    try {
        $db = getDB();
        $userId = getCurrentUserId();
        
        // User's booking statistics
        $stmt = $db->prepare("SELECT 
                             COUNT(*) as total_bookings,
                             SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
                             SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
                             SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
                             COALESCE(SUM(total_amount), 0) as total_spent
                             FROM bookings WHERE user_id = ?");
        $stmt->execute([$userId]);
        $userBookings = $stmt->fetch();
        
        // Upcoming trips
        $today = date('Y-m-d');
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND travel_date >= ? AND status IN ('confirmed', 'pending')");
        $stmt->execute([$userId, $today]);
        $upcomingTrips = $stmt->fetch();
        
        // Recent bookings (last 30 days)
        $lastMonth = date('Y-m-d', strtotime('-30 days'));
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND DATE(created_at) >= ?");
        $stmt->execute([$userId, $lastMonth]);
        $recentBookings = $stmt->fetch();
        
        // Favorite routes
        $stmt = $db->prepare("SELECT r.route_name, r.origin_city, r.destination_city, COUNT(b.id) as trip_count 
                             FROM routes r 
                             JOIN bookings b ON r.id = b.route_id 
                             WHERE b.user_id = ? 
                             GROUP BY r.id 
                             ORDER BY trip_count DESC 
                             LIMIT 3");
        $stmt->execute([$userId]);
        $favoriteRoutes = $stmt->fetchAll();
        
        $userDashboardData = [
            'bookings' => [
                'total' => (int)$userBookings['total_bookings'],
                'confirmed' => (int)$userBookings['confirmed_bookings'],
                'pending' => (int)$userBookings['pending_bookings'],
                'cancelled' => (int)$userBookings['cancelled_bookings'],
                'total_spent' => (float)$userBookings['total_spent']
            ],
            'upcoming_trips' => (int)$upcomingTrips['count'],
            'recent_activity' => (int)$recentBookings['count'],
            'favorite_routes' => $favoriteRoutes,
            'generated_at' => date('Y-m-d H:i:s')
        ];
        
        handleSuccess($userDashboardData, 'User dashboard statistics retrieved successfully');
        
    } catch (Exception $e) {
        error_log("User dashboard stats error: " . $e->getMessage());
        handleError('Failed to retrieve user dashboard statistics', 500);
    }
}

/**
 * Get notifications for dashboard
 */
function handleGetNotifications() {
    if (!isLoggedIn()) {
        handleError('Authentication required', 401);
    }
    
    try {
        $db = getDB();
        $userId = getCurrentUserId();
        $isAdminUser = isAdmin();
        
        $notifications = [];
        
        if ($isAdminUser) {
            // Admin notifications
            
            // Low bus availability
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM buses WHERE status = 'maintenance'");
            $stmt->execute();
            $maintenanceBuses = $stmt->fetch();
            
            if ($maintenanceBuses['count'] > 5) {
                $notifications[] = [
                    'id' => 'maintenance_alert',
                    'type' => 'warning',
                    'title' => 'High Maintenance Alert',
                    'message' => $maintenanceBuses['count'] . ' buses are currently under maintenance',
                    'icon' => 'fas fa-wrench',
                    'created_at' => date('Y-m-d H:i:s')
                ];
            }
            
            // Overbooking alerts
            $stmt = $db->prepare("SELECT s.id, r.route_name, s.date, s.departure_time, 
                                 (s.total_seats - s.available_seats) as booked_seats, s.total_seats
                                 FROM schedules s 
                                 JOIN routes r ON s.route_id = r.id 
                                 WHERE s.available_seats < 5 AND s.date >= CURDATE() 
                                 ORDER BY s.date, s.departure_time 
                                 LIMIT 5");
            $stmt->execute();
            $nearFullTrips = $stmt->fetchAll();
            
            foreach ($nearFullTrips as $trip) {
                $notifications[] = [
                    'id' => 'overbooking_' . $trip['id'],
                    'type' => 'info',
                    'title' => 'Near Full Capacity',
                    'message' => $trip['route_name'] . ' on ' . $trip['date'] . ' - Only ' . $trip['available_seats'] . ' seats left',
                    'icon' => 'fas fa-users',
                    'created_at' => date('Y-m-d H:i:s')
                ];
            }
            
            // Recent cancellations
            $yesterday = date('Y-m-d', strtotime('-1 day'));
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'cancelled' AND DATE(updated_at) >= ?");
            $stmt->execute([$yesterday]);
            $recentCancellations = $stmt->fetch();
            
            if ($recentCancellations['count'] > 10) {
                $notifications[] = [
                    'id' => 'cancellation_spike',
                    'type' => 'error',
                    'title' => 'High Cancellation Rate',
                    'message' => $recentCancellations['count'] . ' bookings cancelled in the last 24 hours',
                    'icon' => 'fas fa-times-circle',
                    'created_at' => date('Y-m-d H:i:s')
                ];
            }
            
        } else {
            // User notifications
            
            // Upcoming trips
            $tomorrow = date('Y-m-d', strtotime('+1 day'));
            $stmt = $db->prepare("SELECT b.id, r.route_name, b.travel_date, s.departure_time 
                                 FROM bookings b 
                                 JOIN routes r ON b.route_id = r.id 
                                 JOIN schedules s ON b.schedule_id = s.id 
                                 WHERE b.user_id = ? AND b.travel_date = ? AND b.status = 'confirmed'");
            $stmt->execute([$userId, $tomorrow]);
            $tomorrowTrips = $stmt->fetchAll();
            
            foreach ($tomorrowTrips as $trip) {
                $notifications[] = [
                    'id' => 'upcoming_trip_' . $trip['id'],
                    'type' => 'info',
                    'title' => 'Trip Tomorrow',
                    'message' => $trip['route_name'] . ' at ' . $trip['departure_time'],
                    'icon' => 'fas fa-calendar-check',
                    'created_at' => date('Y-m-d H:i:s')
                ];
            }
            
            // Booking confirmations (last 7 days)
            $lastWeek = date('Y-m-d', strtotime('-7 days'));
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM bookings WHERE user_id = ? AND status = 'confirmed' AND DATE(updated_at) >= ?");
            $stmt->execute([$userId, $lastWeek]);
            $recentConfirmations = $stmt->fetch();
            
            if ($recentConfirmations['count'] > 0) {
                $notifications[] = [
                    'id' => 'recent_confirmations',
                    'type' => 'success',
                    'title' => 'Bookings Confirmed',
                    'message' => $recentConfirmations['count'] . ' booking(s) confirmed this week',
                    'icon' => 'fas fa-check-circle',
                    'created_at' => date('Y-m-d H:i:s')
                ];
            }
        }
        
        // Add system-wide notifications
        $notifications[] = [
            'id' => 'system_update',
            'type' => 'info',
            'title' => 'System Update',
            'message' => 'SwiftBus system is running smoothly. All services operational.',
            'icon' => 'fas fa-info-circle',
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        handleSuccess($notifications, 'Notifications retrieved successfully');
        
    } catch (Exception $e) {
        error_log("Notifications error: " . $e->getMessage());
        handleError('Failed to retrieve notifications', 500);
    }
}

/**
 * Get recent activities
 */
function handleGetRecentActivities() {
    if (!isLoggedIn()) {
        handleError('Authentication required', 401);
    }
    
    try {
        $db = getDB();
        $isAdminUser = isAdmin();
        
        $activities = [];
        
        if ($isAdminUser) {
            // Admin activities - system-wide bookings
            // Note: bookings table uses from_city and to_city, not route_id
            try {
                $stmt = $db->prepare("SELECT 'booking' as type, b.id, b.booking_id, u.full_name as user_name, 
                                     b.from_city, b.to_city, b.booking_status as status, b.created_at 
                                     FROM bookings b 
                                     LEFT JOIN users u ON b.user_id = u.id 
                                     ORDER BY b.created_at DESC 
                                     LIMIT 10");
                $stmt->execute();
                $recentBookings = $stmt->fetchAll();
                
                foreach ($recentBookings as $booking) {
                    $routeName = ucfirst($booking['from_city']) . ' → ' . ucfirst($booking['to_city']);
                    $userName = $booking['user_name'] ?: 'Unknown User';
                    $activities[] = [
                        'id' => 'booking_' . $booking['id'],
                        'type' => 'booking',
                        'title' => 'Booking: ' . $booking['booking_id'],
                        'description' => $userName . ' booked ' . $routeName,
                        'status' => $booking['status'],
                        'timestamp' => $booking['created_at'],
                        'icon' => 'fas fa-ticket-alt'
                    ];
                }
            } catch (Exception $e) {
                error_log("Error fetching recent bookings: " . $e->getMessage());
            }
            
            // Also add recent user registrations
            try {
                $stmt = $db->prepare("SELECT id, full_name, email, created_at, joined_date 
                                     FROM users 
                                     WHERE role = 'user' 
                                     ORDER BY created_at DESC 
                                     LIMIT 5");
                $stmt->execute();
                $recentUsers = $stmt->fetchAll();
                
                foreach ($recentUsers as $user) {
                    $activities[] = [
                        'id' => 'user_' . $user['id'],
                        'type' => 'user',
                        'title' => 'New User Registration',
                        'description' => $user['full_name'] . ' joined SwiftBus',
                        'status' => 'success',
                        'timestamp' => $user['created_at'] ?: $user['joined_date'],
                        'icon' => 'fas fa-user-plus'
                    ];
                }
            } catch (Exception $e) {
                error_log("Error fetching recent users: " . $e->getMessage());
            }
            
            // Sort all activities by timestamp
            usort($activities, function($a, $b) {
                return strtotime($b['timestamp']) - strtotime($a['timestamp']);
            });
            
            // Limit to 10 most recent
            $activities = array_slice($activities, 0, 10);
            
        } else {
            // User activities - personal only
            $userId = getCurrentUserId();
            $stmt = $db->prepare("SELECT b.id, b.booking_id, b.from_city, b.to_city, 
                                 b.booking_status as status, b.created_at, b.updated_at 
                                 FROM bookings b 
                                 WHERE b.user_id = ? 
                                 ORDER BY b.updated_at DESC 
                                 LIMIT 10");
            $stmt->execute([$userId]);
            $userBookings = $stmt->fetchAll();
            
            foreach ($userBookings as $booking) {
                $routeName = $booking['from_city'] . ' → ' . $booking['to_city'];
                $activities[] = [
                    'id' => 'user_booking_' . $booking['id'],
                    'type' => 'booking',
                    'title' => 'Your Booking',
                    'description' => 'Booking for ' . $routeName . ' - ' . ucfirst($booking['status']),
                    'status' => $booking['status'],
                    'timestamp' => $booking['updated_at'],
                    'icon' => 'fas fa-ticket-alt'
                ];
            }
        }
        
        // If no activities found, add a default message
        if (empty($activities)) {
            $activities[] = [
                'id' => 'no_activity',
                'type' => 'info',
                'title' => 'No Recent Activity',
                'description' => 'No recent activities to display',
                'status' => 'info',
                'timestamp' => date('Y-m-d H:i:s'),
                'icon' => 'fas fa-info-circle'
            ];
        }
        
        handleSuccess($activities, 'Recent activities retrieved successfully');
        
    } catch (Exception $e) {
        error_log("Recent activities error: " . $e->getMessage());
        handleError('Failed to retrieve recent activities: ' . $e->getMessage(), 500);
    }
}

/**
 * Get upcoming trips
 */
function handleGetUpcomingTrips() {
    if (!isLoggedIn()) {
        handleError('Authentication required', 401);
    }
    
    try {
        $db = getDB();
        $isAdminUser = isAdmin();
        $today = date('Y-m-d');
        
        if ($isAdminUser) {
            // Admin view - all upcoming trips
            $stmt = $db->prepare("SELECT s.id, r.route_name, r.origin_city, r.destination_city, 
                                 s.date, s.departure_time, s.arrival_time, 
                                 (s.total_seats - s.available_seats) as booked_seats, s.total_seats,
                                 b.bus_number, bc.company_name
                                 FROM schedules s 
                                 JOIN routes r ON s.route_id = r.id 
                                 JOIN buses b ON s.bus_id = b.id 
                                 JOIN bus_companies bc ON b.company_id = bc.id 
                                 WHERE s.date >= ? AND s.status = 'active' 
                                 ORDER BY s.date, s.departure_time 
                                 LIMIT 20");
            $stmt->execute([$today]);
        } else {
            // User view - personal upcoming trips
            $userId = getCurrentUserId();
            $stmt = $db->prepare("SELECT bk.id as booking_id, r.route_name, r.origin_city, r.destination_city, 
                                 bk.travel_date, s.departure_time, s.arrival_time, 
                                 bk.selected_seats, bk.total_amount, bk.status,
                                 b.bus_number, bc.company_name
                                 FROM bookings bk 
                                 JOIN routes r ON bk.route_id = r.id 
                                 JOIN schedules s ON bk.schedule_id = s.id 
                                 JOIN buses b ON s.bus_id = b.id 
                                 JOIN bus_companies bc ON b.company_id = bc.id 
                                 WHERE bk.user_id = ? AND bk.travel_date >= ? AND bk.status IN ('confirmed', 'pending') 
                                 ORDER BY bk.travel_date, s.departure_time 
                                 LIMIT 10");
            $stmt->execute([$userId, $today]);
        }
        
        $upcomingTrips = $stmt->fetchAll();
        
        handleSuccess($upcomingTrips, 'Upcoming trips retrieved successfully');
        
    } catch (Exception $e) {
        error_log("Upcoming trips error: " . $e->getMessage());
        handleError('Failed to retrieve upcoming trips', 500);
    }
}

/**
 * Get system alerts
 */
function handleGetSystemAlerts() {
    if (!isLoggedIn()) {
        handleError('Authentication required', 401);
    }
    
    if (!isAdmin()) {
        handleError('Admin access required', 403);
    }
    
    try {
        $db = getDB();
        $today = date('Y-m-d');
        $alerts = [];
        
        // 1. Check buses status
        try {
            $stmt = $db->prepare("SELECT 
                                 COUNT(*) as total_buses,
                                 SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_buses,
                                 SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_buses,
                                 SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_buses
                                 FROM buses");
            $stmt->execute();
            $busStatus = $stmt->fetch();
            
            $totalBuses = (int)($busStatus['total_buses'] ?? 0);
            $maintenanceBuses = (int)($busStatus['maintenance_buses'] ?? 0);
            $activeBuses = (int)($busStatus['active_buses'] ?? 0);
            
            if ($maintenanceBuses > 0) {
                $maintenancePercentage = $totalBuses > 0 ? ($maintenanceBuses / $totalBuses) * 100 : 0;
                $level = $maintenancePercentage > 30 ? 'error' : 'warning';
                $alerts[] = [
                    'id' => 'maintenance_buses',
                    'level' => $level,
                    'title' => 'Buses Under Maintenance',
                    'message' => $maintenanceBuses . ' bus(es) (' . round($maintenancePercentage, 1) . '% of fleet) under maintenance',
                    'created_at' => date('Y-m-d H:i:s')
                ];
            }
            
            // Add bus fleet status
            if ($totalBuses > 0) {
                $alerts[] = [
                    'id' => 'bus_fleet_status',
                    'level' => 'info',
                    'title' => 'Bus Fleet Status',
                    'message' => "Total: {$totalBuses} buses | Active: {$activeBuses} | Maintenance: {$maintenanceBuses}",
                    'created_at' => date('Y-m-d H:i:s')
                ];
            }
        } catch (Exception $e) {
            error_log("Bus status check error: " . $e->getMessage());
        }
        
        // 2. Check booking statistics
        try {
            $stmt = $db->prepare("SELECT 
                                 COUNT(*) as total_bookings,
                                 SUM(CASE WHEN booking_status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
                                 SUM(CASE WHEN booking_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
                                 SUM(CASE WHEN booking_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
                                 SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_bookings
                                 FROM bookings");
            $stmt->execute();
            $bookingStats = $stmt->fetch();
            
            $pendingBookings = (int)($bookingStats['pending_bookings'] ?? 0);
            $todayBookings = (int)($bookingStats['today_bookings'] ?? 0);
            $totalBookings = (int)($bookingStats['total_bookings'] ?? 0);
            
            if ($pendingBookings > 0) {
                $alerts[] = [
                    'id' => 'pending_bookings',
                    'level' => $pendingBookings > 10 ? 'warning' : 'info',
                    'title' => 'Pending Bookings',
                    'message' => $pendingBookings . ' booking(s) awaiting confirmation',
                    'created_at' => date('Y-m-d H:i:s')
                ];
            }
            
            // Today's booking activity
            $alerts[] = [
                'id' => 'today_bookings',
                'level' => 'info',
                'title' => "Today's Bookings",
                'message' => $todayBookings . ' new booking(s) today | Total: ' . $totalBookings,
                'created_at' => date('Y-m-d H:i:s')
            ];
        } catch (Exception $e) {
            error_log("Booking stats check error: " . $e->getMessage());
        }
        
        // 3. Check user statistics
        try {
            $stmt = $db->prepare("SELECT 
                                 COUNT(*) as total_users,
                                 SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as regular_users,
                                 SUM(CASE WHEN DATE(created_at) = CURDATE() AND role = 'user' THEN 1 ELSE 0 END) as new_today
                                 FROM users");
            $stmt->execute();
            $userStats = $stmt->fetch();
            
            $newUsersToday = (int)($userStats['new_today'] ?? 0);
            $totalUsers = (int)($userStats['regular_users'] ?? 0);
            
            if ($newUsersToday > 0) {
                $alerts[] = [
                    'id' => 'new_users',
                    'level' => 'success',
                    'title' => 'New User Registrations',
                    'message' => $newUsersToday . ' new user(s) registered today',
                    'created_at' => date('Y-m-d H:i:s')
                ];
            }
            
            $alerts[] = [
                'id' => 'user_stats',
                'level' => 'info',
                'title' => 'User Statistics',
                'message' => 'Total registered users: ' . $totalUsers,
                'created_at' => date('Y-m-d H:i:s')
            ];
        } catch (Exception $e) {
            error_log("User stats check error: " . $e->getMessage());
        }
        
        // 4. Check routes and schedules
        try {
            $stmt = $db->prepare("SELECT COUNT(*) as total_routes, 
                                 SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_routes 
                                 FROM routes");
            $stmt->execute();
            $routeStats = $stmt->fetch();
            
            $totalRoutes = (int)($routeStats['total_routes'] ?? 0);
            $activeRoutes = (int)($routeStats['active_routes'] ?? 0);
            
            $alerts[] = [
                'id' => 'route_stats',
                'level' => 'info',
                'title' => 'Route Statistics',
                'message' => "Total routes: {$totalRoutes} | Active: {$activeRoutes}",
                'created_at' => date('Y-m-d H:i:s')
            ];
        } catch (Exception $e) {
            error_log("Route stats check error: " . $e->getMessage());
        }
        
        // 5. System health - always show if no critical alerts
        $hasCriticalAlerts = false;
        foreach ($alerts as $alert) {
            if ($alert['level'] === 'error') {
                $hasCriticalAlerts = true;
                break;
            }
        }
        
        if (!$hasCriticalAlerts) {
            array_unshift($alerts, [
                'id' => 'system_healthy',
                'level' => 'success',
                'title' => 'System Status: Operational',
                'message' => 'All systems running smoothly. No critical issues detected.',
                'created_at' => date('Y-m-d H:i:s')
            ]);
        }
        
        handleSuccess($alerts, 'System alerts retrieved successfully');
        
    } catch (Exception $e) {
        error_log("System alerts error: " . $e->getMessage());
        handleError('Failed to retrieve system alerts: ' . $e->getMessage(), 500);
    }
}
?>