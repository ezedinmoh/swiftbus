<?php
/**
 * SwiftBus Admin Users API
 * Handles user management for admin dashboard
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

// Handle preflight requests
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

$action = $_GET['action'] ?? $_POST['action'] ?? 'get_users';

switch ($action) {
    case 'get_users':
        handleGetUsers();
        break;
    case 'get_user_stats':
        handleGetUserStats();
        break;
    case 'update_user':
        handleUpdateUser();
        break;
    case 'delete_user':
        handleDeleteUser();
        break;
    case 'get_user_details':
        handleGetUserDetails();
        break;
    case 'suspend_user':
        handleSuspendUser();
        break;
    case 'activate_user':
        handleActivateUser();
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}


/**
 * Get users list from database
 */
function handleGetUsers() {
    try {
        $pdo = getDB();
        
        // Get filter parameters
        $search = $_GET['search'] ?? '';
        $role = $_GET['role'] ?? '';
        $status = $_GET['status'] ?? '';
        $limit = (int)($_GET['limit'] ?? 100);
        $offset = (int)($_GET['offset'] ?? 0);
        
        // Build query - exclude admin users from the list (only show regular users)
        $sql = "SELECT 
                    u.id,
                    u.user_id,
                    u.email,
                    u.first_name,
                    u.last_name,
                    u.full_name,
                    u.phone,
                    u.role,
                    u.is_active,
                    u.is_verified,
                    u.joined_date,
                    u.last_login,
                    u.login_attempts,
                    u.profile_image,
                    u.created_at,
                    u.updated_at,
                    COALESCE(b.booking_count, 0) as total_bookings,
                    COALESCE(b.total_spent, 0) as total_spent
                FROM users u
                LEFT JOIN (
                    SELECT 
                        user_id,
                        COUNT(*) as booking_count,
                        SUM(total_amount) as total_spent
                    FROM bookings 
                    GROUP BY user_id
                ) b ON u.id = b.user_id
                WHERE u.role = 'user'";
        
        $params = [];
        
        // Add search filter
        if (!empty($search)) {
            $sql .= " AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR u.user_id LIKE ?)";
            $searchParam = "%$search%";
            $params = array_merge($params, [$searchParam, $searchParam, $searchParam, $searchParam]);
        }
        
        // Add role filter (if admin wants to see admins too)
        if (!empty($role)) {
            if ($role === 'all') {
                $sql = str_replace("WHERE u.role = 'user'", "WHERE 1=1", $sql);
            } elseif ($role === 'admin') {
                $sql = str_replace("WHERE u.role = 'user'", "WHERE u.role = 'admin'", $sql);
            }
        }
        
        // Add status filter
        if (!empty($status)) {
            if ($status === 'active') {
                $sql .= " AND u.is_active = 1";
            } elseif ($status === 'inactive' || $status === 'suspended') {
                $sql .= " AND u.is_active = 0";
            } elseif ($status === 'verified') {
                $sql .= " AND u.is_verified = 1";
            } elseif ($status === 'unverified') {
                $sql .= " AND u.is_verified = 0";
            }
        }
        
        // Add ordering and pagination (embed directly since they're already cast to int)
        $sql .= " ORDER BY u.created_at DESC LIMIT $limit OFFSET $offset";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Process the data
        foreach ($users as &$user) {
            $user['joined_date'] = $user['joined_date'] ? date('Y-m-d', strtotime($user['joined_date'])) : date('Y-m-d');
            $user['last_login'] = $user['last_login'] ? date('Y-m-d H:i:s', strtotime($user['last_login'])) : 'Never';
            $user['created_at'] = $user['created_at'] ? date('Y-m-d H:i:s', strtotime($user['created_at'])) : date('Y-m-d H:i:s');
            $user['total_spent'] = (float)$user['total_spent'];
            $user['total_bookings'] = (int)$user['total_bookings'];
            $user['status_label'] = $user['is_active'] ? 'Active' : 'Inactive';
            $user['verification_label'] = $user['is_verified'] ? 'Verified' : 'Unverified';
            
            if (!$user['is_active']) {
                $user['status'] = 'suspended';
            } elseif ($user['is_verified']) {
                $user['status'] = 'verified';
            } else {
                $user['status'] = 'active';
            }
        }
        
        // Get total count for pagination
        $countSql = "SELECT COUNT(*) as total FROM users u WHERE u.role = 'user'";
        $countParams = [];
        
        if (!empty($search)) {
            $countSql .= " AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR u.user_id LIKE ?)";
            $searchParam = "%$search%";
            $countParams = array_merge($countParams, [$searchParam, $searchParam, $searchParam, $searchParam]);
        }
        
        if (!empty($status)) {
            if ($status === 'active') {
                $countSql .= " AND u.is_active = 1";
            } elseif ($status === 'inactive' || $status === 'suspended') {
                $countSql .= " AND u.is_active = 0";
            } elseif ($status === 'verified') {
                $countSql .= " AND u.is_verified = 1";
            } elseif ($status === 'unverified') {
                $countSql .= " AND u.is_verified = 0";
            }
        }
        
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($countParams);
        $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        echo json_encode([
            'success' => true,
            'data' => $users,
            'pagination' => [
                'total' => (int)$totalCount,
                'limit' => $limit,
                'offset' => $offset,
                'has_more' => ($offset + $limit) < $totalCount
            ],
            'message' => 'Users retrieved successfully'
        ]);
        
    } catch (Exception $e) {
        error_log("handleGetUsers error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch users: ' . $e->getMessage()]);
    }
}


/**
 * Get user statistics for dashboard cards
 */
function handleGetUserStats() {
    try {
        $pdo = getDB();
        
        $stmt = $pdo->prepare("SELECT 
            COUNT(*) as total_users,
            SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as regular_users,
            SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_users,
            SUM(CASE WHEN is_active = 1 AND role = 'user' THEN 1 ELSE 0 END) as active_users,
            SUM(CASE WHEN is_active = 0 AND role = 'user' THEN 1 ELSE 0 END) as suspended_users,
            SUM(CASE WHEN is_verified = 1 AND role = 'user' THEN 1 ELSE 0 END) as verified_users,
            SUM(CASE WHEN is_verified = 0 AND role = 'user' THEN 1 ELSE 0 END) as unverified_users,
            SUM(CASE WHEN DATE(joined_date) = CURDATE() AND role = 'user' THEN 1 ELSE 0 END) as new_today
            FROM users");
        $stmt->execute();
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => [
                'total_users' => (int)($stats['regular_users'] ?? 0),
                'active_users' => (int)($stats['active_users'] ?? 0),
                'suspended_users' => (int)($stats['suspended_users'] ?? 0),
                'verified_users' => (int)($stats['verified_users'] ?? 0),
                'unverified_users' => (int)($stats['unverified_users'] ?? 0),
                'admin_users' => (int)($stats['admin_users'] ?? 0),
                'new_today' => (int)($stats['new_today'] ?? 0)
            ],
            'message' => 'User statistics retrieved successfully'
        ]);
        
    } catch (Exception $e) {
        error_log("handleGetUserStats error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch user statistics: ' . $e->getMessage()]);
    }
}

/**
 * Suspend a user
 */
function handleSuspendUser() {
    try {
        $pdo = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['user_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User ID is required']);
            return;
        }
        
        $userId = $input['user_id'];
        
        $stmt = $pdo->prepare("UPDATE users SET is_active = 0, updated_at = NOW() WHERE user_id = ? OR id = ?");
        $result = $stmt->execute([$userId, $userId]);
        
        if (!$result || $stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found or already suspended']);
            return;
        }
        
        echo json_encode(['success' => true, 'message' => 'User suspended successfully']);
        
    } catch (Exception $e) {
        error_log("handleSuspendUser error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to suspend user: ' . $e->getMessage()]);
    }
}

/**
 * Activate a user
 */
function handleActivateUser() {
    try {
        $pdo = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['user_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User ID is required']);
            return;
        }
        
        $userId = $input['user_id'];
        
        $stmt = $pdo->prepare("UPDATE users SET is_active = 1, updated_at = NOW() WHERE user_id = ? OR id = ?");
        $result = $stmt->execute([$userId, $userId]);
        
        if (!$result || $stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found or already active']);
            return;
        }
        
        echo json_encode(['success' => true, 'message' => 'User activated successfully']);
        
    } catch (Exception $e) {
        error_log("handleActivateUser error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to activate user: ' . $e->getMessage()]);
    }
}


/**
 * Update user details
 */
function handleUpdateUser() {
    try {
        $pdo = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['user_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User ID is required']);
            return;
        }
        
        $userId = $input['user_id'];
        $updateFields = [];
        $params = [];
        
        if (isset($input['is_active'])) {
            $updateFields[] = "is_active = ?";
            $params[] = (int)$input['is_active'];
        }
        
        if (isset($input['is_verified'])) {
            $updateFields[] = "is_verified = ?";
            $params[] = (int)$input['is_verified'];
        }
        
        if (isset($input['role'])) {
            $updateFields[] = "role = ?";
            $params[] = $input['role'];
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            return;
        }
        
        $updateFields[] = "updated_at = NOW()";
        $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE user_id = ?";
        $params[] = $userId;
        
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute($params);
        
        if (!$result || $stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found']);
            return;
        }
        
        echo json_encode(['success' => true, 'message' => 'User updated successfully']);
        
    } catch (Exception $e) {
        error_log("handleUpdateUser error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update user: ' . $e->getMessage()]);
    }
}

/**
 * Delete a user
 */
function handleDeleteUser() {
    try {
        $pdo = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['user_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User ID is required']);
            return;
        }
        
        $userId = $input['user_id'];
        
        // Check if user has bookings
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM bookings WHERE user_id = (SELECT id FROM users WHERE user_id = ?)");
        $stmt->execute([$userId]);
        $bookingCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        if ($bookingCount > 0) {
            // Don't delete, just deactivate
            $stmt = $pdo->prepare("UPDATE users SET is_active = 0, updated_at = NOW() WHERE user_id = ?");
            $result = $stmt->execute([$userId]);
            $message = 'User deactivated (has existing bookings)';
        } else {
            // Safe to delete
            $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = ? AND role != 'admin'");
            $result = $stmt->execute([$userId]);
            $message = 'User deleted successfully';
        }
        
        if (!$result || $stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found or cannot be deleted']);
            return;
        }
        
        echo json_encode(['success' => true, 'message' => $message]);
        
    } catch (Exception $e) {
        error_log("handleDeleteUser error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete user: ' . $e->getMessage()]);
    }
}

/**
 * Get user details
 */
function handleGetUserDetails() {
    try {
        $pdo = getDB();
        $userId = $_GET['user_id'] ?? '';
        
        if (empty($userId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User ID is required']);
            return;
        }
        
        $sql = "SELECT 
                    u.*,
                    COALESCE(b.booking_count, 0) as total_bookings,
                    COALESCE(b.total_spent, 0) as total_spent,
                    COALESCE(b.last_booking_date, NULL) as last_booking_date
                FROM users u
                LEFT JOIN (
                    SELECT 
                        user_id,
                        COUNT(*) as booking_count,
                        SUM(total_amount) as total_spent,
                        MAX(travel_date) as last_booking_date
                    FROM bookings 
                    WHERE booking_status = 'confirmed'
                    GROUP BY user_id
                ) b ON u.id = b.user_id
                WHERE u.user_id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found']);
            return;
        }
        
        // Get recent bookings
        $stmt = $pdo->prepare("
            SELECT booking_id, from_city, to_city, travel_date, booking_status, total_amount
            FROM bookings 
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 5
        ");
        $stmt->execute([$user['id']]);
        $user['recent_bookings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'data' => $user]);
        
    } catch (Exception $e) {
        error_log("handleGetUserDetails error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to get user details: ' . $e->getMessage()]);
    }
}
?>
