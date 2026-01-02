<?php
/**
 * SwiftBus Admin Schedules API
 * Handles schedule management for admin dashboard
 */

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

if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

if (!isAdmin()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Admin access required']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? 'get_schedules';

switch ($action) {
    case 'get_schedules':
        handleGetSchedules();
        break;
    case 'get_schedule_stats':
        handleGetScheduleStats();
        break;
    case 'add_schedule':
    case 'create_schedule':
        handleAddSchedule();
        break;
    case 'update_schedule':
        handleUpdateSchedule();
        break;
    case 'delete_schedule':
        handleDeleteSchedule();
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function handleGetSchedules() {
    try {
        $pdo = getDB();
        
        $search = $_GET['search'] ?? '';
        $status = $_GET['status'] ?? '';
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);
        
        $sql = "SELECT 
                    s.id,
                    s.schedule_id,
                    s.departure_time,
                    s.arrival_time,
                    s.price,
                    s.is_active,
                    s.effective_from,
                    s.effective_until,
                    s.days_of_week,
                    s.created_at,
                    s.updated_at,
                    b.bus_id,
                    b.bus_number,
                    b.bus_type,
                    b.total_seats,
                    b.license_plate,
                    r.route_id,
                    oc.name as origin_city,
                    dc.name as destination_city,
                    r.distance_km,
                    c.name as company_name
                FROM schedules s
                LEFT JOIN buses b ON s.bus_id = b.id
                LEFT JOIN routes r ON s.route_id = r.id
                LEFT JOIN cities oc ON r.origin_city_id = oc.id
                LEFT JOIN cities dc ON r.destination_city_id = dc.id
                LEFT JOIN bus_companies c ON b.company_id = c.id
                WHERE 1=1";
        
        $params = [];
        
        if (!empty($search)) {
            $sql .= " AND (s.schedule_id LIKE ? OR b.bus_number LIKE ? OR oc.name LIKE ? OR dc.name LIKE ?)";
            $searchParam = "%$search%";
            $params = array_merge($params, [$searchParam, $searchParam, $searchParam, $searchParam]);
        }
        
        if (!empty($status)) {
            $sql .= " AND s.is_active = ?";
            $params[] = ($status === 'active') ? 1 : 0;
        }
        
        $sql .= " ORDER BY s.created_at DESC LIMIT $limit OFFSET $offset";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($schedules as &$schedule) {
            $schedule['route_name'] = ($schedule['origin_city'] ?? 'Unknown') . ' → ' . ($schedule['destination_city'] ?? 'Unknown');
            $schedule['bus_name'] = ($schedule['company_name'] ?? 'Unknown') . ' - ' . ($schedule['bus_number'] ?? 'N/A');
            $schedule['status'] = $schedule['is_active'] ? 'active' : 'inactive';
            $schedule['total_seats'] = (int)($schedule['total_seats'] ?? 45);
            $schedule['available_seats'] = $schedule['total_seats']; // Can be calculated from bookings
            $schedule['booked_seats'] = 0;
            
            // Parse days of week
            if (!empty($schedule['days_of_week'])) {
                $days = json_decode($schedule['days_of_week'], true);
                $schedule['days_list'] = is_array($days) ? $days : [];
            } else {
                $schedule['days_list'] = [];
            }
        }
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM schedules s 
                     LEFT JOIN buses b ON s.bus_id = b.id
                     LEFT JOIN routes r ON s.route_id = r.id
                     LEFT JOIN cities oc ON r.origin_city_id = oc.id
                     LEFT JOIN cities dc ON r.destination_city_id = dc.id
                     WHERE 1=1";
        $countParams = [];
        
        if (!empty($search)) {
            $countSql .= " AND (s.schedule_id LIKE ? OR b.bus_number LIKE ? OR oc.name LIKE ? OR dc.name LIKE ?)";
            $countParams = array_merge($countParams, ["%$search%", "%$search%", "%$search%", "%$search%"]);
        }
        if (!empty($status)) {
            $countSql .= " AND s.is_active = ?";
            $countParams[] = ($status === 'active') ? 1 : 0;
        }
        
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($countParams);
        $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        echo json_encode([
            'success' => true,
            'data' => $schedules,
            'count' => count($schedules),
            'pagination' => [
                'total' => (int)$totalCount,
                'limit' => $limit,
                'offset' => $offset
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("handleGetSchedules error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch schedules: ' . $e->getMessage()]);
    }
}

function handleGetScheduleStats() {
    try {
        $pdo = getDB();
        
        $stmt = $pdo->prepare("SELECT 
            COUNT(*) as total_schedules,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_schedules,
            SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_schedules
            FROM schedules");
        $stmt->execute();
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => [
                'total_schedules' => (int)($stats['total_schedules'] ?? 0),
                'active_schedules' => (int)($stats['active_schedules'] ?? 0),
                'inactive_schedules' => (int)($stats['inactive_schedules'] ?? 0)
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch schedule stats: ' . $e->getMessage()]);
    }
}

function handleAddSchedule() {
    try {
        $pdo = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['bus_id']) || empty($input['route_id']) || empty($input['departure_time'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Bus, route and departure time are required']);
            return;
        }
        
        $scheduleId = 'SCH' . date('Y') . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
        
        $stmt = $pdo->prepare("INSERT INTO schedules (schedule_id, bus_id, route_id, departure_time, arrival_time, price, days_of_week, is_active, effective_from, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, NOW())");
        $stmt->execute([
            $scheduleId,
            $input['bus_id'],
            $input['route_id'],
            $input['departure_time'],
            $input['arrival_time'] ?? null,
            $input['price'] ?? 0,
            isset($input['days_of_week']) ? json_encode($input['days_of_week']) : '[]',
            $input['effective_from'] ?? date('Y-m-d')
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Schedule added successfully', 'schedule_id' => $scheduleId]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to add schedule: ' . $e->getMessage()]);
    }
}

function handleUpdateSchedule() {
    try {
        $pdo = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['id']) && empty($input['schedule_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Schedule ID is required']);
            return;
        }
        
        $scheduleId = $input['schedule_id'] ?? $input['id'];
        $updateFields = [];
        $params = [];
        
        $allowedFields = ['departure_time', 'arrival_time', 'price', 'is_active', 'effective_from', 'effective_until'];
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updateFields[] = "$field = ?";
                $params[] = $input[$field];
            }
        }
        
        if (isset($input['days_of_week'])) {
            $updateFields[] = "days_of_week = ?";
            $params[] = json_encode($input['days_of_week']);
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            return;
        }
        
        $updateFields[] = "updated_at = NOW()";
        $params[] = $scheduleId;
        $params[] = $scheduleId;
        
        $sql = "UPDATE schedules SET " . implode(', ', $updateFields) . " WHERE schedule_id = ? OR id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode(['success' => true, 'message' => 'Schedule updated successfully']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update schedule: ' . $e->getMessage()]);
    }
}

function handleDeleteSchedule() {
    try {
        $pdo = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        
        $scheduleId = $input['schedule_id'] ?? $input['id'] ?? $_GET['id'] ?? '';
        
        if (empty($scheduleId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Schedule ID is required']);
            return;
        }
        
        // Deactivate instead of delete
        $stmt = $pdo->prepare("UPDATE schedules SET is_active = 0, updated_at = NOW() WHERE schedule_id = ? OR id = ?");
        $stmt->execute([$scheduleId, $scheduleId]);
        
        echo json_encode(['success' => true, 'message' => 'Schedule deactivated successfully']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete schedule: ' . $e->getMessage()]);
    }
}
?>
