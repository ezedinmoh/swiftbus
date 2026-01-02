<?php
/**
 * SwiftBus Admin Bookings API
 * Handles booking management for admin dashboard
 * Uses same structure as dashboard.php which works correctly
 */

// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../includes/functions.php';

// Check if user is authenticated and is admin
if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Authentication required'
    ]);
    exit;
}

if (!isAdmin()) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Admin access required'
    ]);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'get_bookings':
        handleGetBookings();
        break;
    case 'get_booking_stats':
        handleGetBookingStats();
        break;
    case 'update_booking':
        handleUpdateBooking();
        break;
    case 'cancel_booking':
        handleCancelBooking();
        break;
    case 'get_booking_details':
        handleGetBookingDetails();
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

/**
 * Get bookings list from database
 */
function handleGetBookings() {
    try {
        $pdo = getDB();
        
        // Get filter parameters
        $search = $_GET['search'] ?? '';
        $booking_status = $_GET['booking_status'] ?? '';
        $payment_status = $_GET['payment_status'] ?? '';
        $travel_date = $_GET['travel_date'] ?? '';
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);
        
        // Build query
        $sql = "SELECT 
                    b.id,
                    b.booking_id,
                    b.user_id,
                    u.full_name as user_name,
                    u.email as user_email,
                    u.phone as user_phone,
                    b.bus_company,
                    b.bus_type,
                    b.from_city as route_origin,
                    b.to_city as route_destination,
                    b.travel_date,
                    b.departure_time,
                    b.passenger_count,
                    b.selected_seats as seat_numbers,
                    b.total_amount,
                    b.booking_status,
                    b.payment_status,
                    b.booking_date,
                    b.created_at,
                    b.updated_at
                FROM bookings b
                LEFT JOIN users u ON b.user_id = u.id
                WHERE 1=1";
        
        $params = [];
        
        // Add search filter
        if (!empty($search)) {
            $sql .= " AND (b.booking_id LIKE ? OR u.full_name LIKE ? OR u.phone LIKE ? OR u.email LIKE ?)";
            $searchParam = "%$search%";
            $params = array_merge($params, [$searchParam, $searchParam, $searchParam, $searchParam]);
        }
        
        // Add booking status filter
        if (!empty($booking_status)) {
            $sql .= " AND b.booking_status = ?";
            $params[] = $booking_status;
        }
        
        // Add payment status filter
        if (!empty($payment_status)) {
            $sql .= " AND b.payment_status = ?";
            $params[] = $payment_status;
        }
        
        // Add travel date filter
        if (!empty($travel_date)) {
            $sql .= " AND b.travel_date = ?";
            $params[] = $travel_date;
        }
        
        // Add ordering and pagination (embed directly since they're already cast to int)
        $sql .= " ORDER BY b.created_at DESC LIMIT $limit OFFSET $offset";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Process the data
        foreach ($bookings as &$booking) {
            // Parse selected seats if it's JSON
            if (!empty($booking['seat_numbers'])) {
                $seats = json_decode($booking['seat_numbers'], true);
                if (is_array($seats)) {
                    $booking['seat_numbers'] = implode(', ', $seats);
                }
            }
            
            // Format dates
            $booking['travel_date'] = $booking['travel_date'] ? date('Y-m-d', strtotime($booking['travel_date'])) : '';
            $booking['booking_date'] = $booking['booking_date'] ? date('Y-m-d', strtotime($booking['booking_date'])) : '';
            
            // Create bus name from company and type
            $booking['bus_name'] = ($booking['bus_company'] ?? 'Unknown') . ' - ' . ($booking['bus_type'] ?? 'Standard');
        }
        
        // Get total count for pagination
        $countSql = "SELECT COUNT(*) as total FROM bookings b LEFT JOIN users u ON b.user_id = u.id WHERE 1=1";
        $countParams = [];
        
        if (!empty($search)) {
            $countSql .= " AND (b.booking_id LIKE ? OR u.full_name LIKE ? OR u.phone LIKE ? OR u.email LIKE ?)";
            $searchParam = "%$search%";
            $countParams = array_merge($countParams, [$searchParam, $searchParam, $searchParam, $searchParam]);
        }
        
        if (!empty($booking_status)) {
            $countSql .= " AND b.booking_status = ?";
            $countParams[] = $booking_status;
        }
        
        if (!empty($payment_status)) {
            $countSql .= " AND b.payment_status = ?";
            $countParams[] = $payment_status;
        }
        
        if (!empty($travel_date)) {
            $countSql .= " AND b.travel_date = ?";
            $countParams[] = $travel_date;
        }
        
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($countParams);
        $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        echo json_encode([
            'success' => true,
            'data' => $bookings,
            'pagination' => [
                'total' => (int)$totalCount,
                'limit' => $limit,
                'offset' => $offset,
                'has_more' => ($offset + $limit) < $totalCount
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("handleGetBookings error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch bookings: ' . $e->getMessage()]);
    }
}

/**
 * Get booking statistics for dashboard cards
 */
function handleGetBookingStats() {
    try {
        $pdo = getDB();
        
        $stmt = $pdo->prepare("SELECT 
            COUNT(*) as total_bookings,
            SUM(CASE WHEN booking_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
            SUM(CASE WHEN booking_status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
            SUM(CASE WHEN booking_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
            SUM(CASE WHEN booking_status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
            SUM(CASE WHEN payment_status = 'paid' OR payment_status = 'completed' THEN 1 ELSE 0 END) as paid_bookings,
            SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as payment_pending,
            COALESCE(SUM(CASE WHEN payment_status = 'paid' OR payment_status = 'completed' THEN total_amount ELSE 0 END), 0) as total_revenue
            FROM bookings");
        $stmt->execute();
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => [
                'total_bookings' => (int)($stats['total_bookings'] ?? 0),
                'confirmed_bookings' => (int)($stats['confirmed_bookings'] ?? 0),
                'pending_bookings' => (int)($stats['pending_bookings'] ?? 0),
                'cancelled_bookings' => (int)($stats['cancelled_bookings'] ?? 0),
                'completed_bookings' => (int)($stats['completed_bookings'] ?? 0),
                'paid_bookings' => (int)($stats['paid_bookings'] ?? 0),
                'payment_pending' => (int)($stats['payment_pending'] ?? 0),
                'total_revenue' => (float)($stats['total_revenue'] ?? 0)
            ],
            'message' => 'Booking statistics retrieved successfully'
        ]);
        
    } catch (Exception $e) {
        error_log("handleGetBookingStats error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch booking statistics: ' . $e->getMessage()]);
    }
}

/**
 * Update booking status
 */
function handleUpdateBooking() {
    try {
        $pdo = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['booking_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Booking ID is required']);
            return;
        }
        
        $booking_id = $input['booking_id'];
        $booking_status = $input['booking_status'] ?? null;
        $payment_status = $input['payment_status'] ?? null;
        $notes = $input['notes'] ?? '';
        
        // Build update query
        $updateFields = [];
        $params = [];
        
        if ($booking_status !== null) {
            $updateFields[] = "booking_status = ?";
            $params[] = $booking_status;
        }
        
        if ($payment_status !== null) {
            $updateFields[] = "payment_status = ?";
            $params[] = $payment_status;
        }
        
        if (!empty($notes)) {
            $updateFields[] = "special_requirements = ?";
            $params[] = $notes;
        }
        
        $updateFields[] = "updated_at = NOW()";
        
        if (count($updateFields) <= 1) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            return;
        }
        
        $sql = "UPDATE bookings SET " . implode(', ', $updateFields) . " WHERE booking_id = ?";
        $params[] = $booking_id;
        
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute($params);
        
        if (!$result || $stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Booking not found']);
            return;
        }
        
        echo json_encode(['success' => true, 'message' => 'Booking updated successfully']);
        
    } catch (Exception $e) {
        error_log("handleUpdateBooking error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update booking: ' . $e->getMessage()]);
    }
}

/**
 * Cancel a booking
 */
function handleCancelBooking() {
    try {
        $pdo = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['booking_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Booking ID is required']);
            return;
        }
        
        $booking_id = $input['booking_id'];
        $reason = $input['reason'] ?? 'Cancelled by admin';
        
        $sql = "UPDATE bookings SET 
                booking_status = 'cancelled',
                cancellation_reason = ?,
                cancellation_date = NOW(),
                updated_at = NOW()
                WHERE booking_id = ?";
        
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([$reason, $booking_id]);
        
        if (!$result || $stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Booking not found']);
            return;
        }
        
        echo json_encode(['success' => true, 'message' => 'Booking cancelled successfully']);
        
    } catch (Exception $e) {
        error_log("handleCancelBooking error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to cancel booking: ' . $e->getMessage()]);
    }
}

/**
 * Get booking details
 */
function handleGetBookingDetails() {
    try {
        $pdo = getDB();
        $booking_id = $_GET['booking_id'] ?? '';
        
        if (empty($booking_id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Booking ID is required']);
            return;
        }
        
        $sql = "SELECT 
                    b.*,
                    u.full_name as user_name,
                    u.email as user_email,
                    u.phone as user_phone
                FROM bookings b
                LEFT JOIN users u ON b.user_id = u.id
                WHERE b.booking_id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$booking_id]);
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$booking) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Booking not found']);
            return;
        }
        
        // Parse passenger details if it's JSON
        if (!empty($booking['passenger_details'])) {
            $booking['passenger_details'] = json_decode($booking['passenger_details'], true);
        }
        
        // Parse selected seats if it's JSON
        if (!empty($booking['selected_seats'])) {
            $booking['selected_seats'] = json_decode($booking['selected_seats'], true);
        }
        
        echo json_encode(['success' => true, 'data' => $booking]);
        
    } catch (Exception $e) {
        error_log("handleGetBookingDetails error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to get booking details: ' . $e->getMessage()]);
    }
}
?>