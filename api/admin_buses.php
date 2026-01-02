<?php
/**
 * SwiftBus Admin Buses API
 * Handles bus management for admin dashboard
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

$action = $_GET['action'] ?? $_POST['action'] ?? 'get_buses';

switch ($action) {
    case 'get_buses':
        handleGetBuses();
        break;
    case 'get_bus_stats':
        handleGetBusStats();
        break;
    case 'add_bus':
        handleAddBus();
        break;
    case 'update_bus':
        handleUpdateBus();
        break;
    case 'delete_bus':
        handleDeleteBus();
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function handleGetBuses() {
    try {
        $pdo = getDB();
        
        $search = $_GET['search'] ?? '';
        $status = $_GET['status'] ?? '';
        $bus_type = $_GET['bus_type'] ?? '';
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);
        
        $sql = "SELECT 
                    b.id,
                    b.bus_id,
                    b.bus_number,
                    b.bus_type,
                    b.total_seats,
                    b.status,
                    b.license_plate,
                    b.model,
                    b.year_manufactured,
                    b.last_maintenance_date,
                    b.next_maintenance_date,
                    b.amenities,
                    b.created_at,
                    b.updated_at,
                    c.name as company_name,
                    c.company_id
                FROM buses b
                LEFT JOIN bus_companies c ON b.company_id = c.id
                WHERE 1=1";
        
        $params = [];
        
        if (!empty($search)) {
            $sql .= " AND (b.bus_id LIKE ? OR b.bus_number LIKE ? OR b.license_plate LIKE ? OR c.name LIKE ?)";
            $searchParam = "%$search%";
            $params = array_merge($params, [$searchParam, $searchParam, $searchParam, $searchParam]);
        }
        
        if (!empty($status)) {
            $sql .= " AND b.status = ?";
            $params[] = $status;
        }
        
        if (!empty($bus_type)) {
            $sql .= " AND b.bus_type = ?";
            $params[] = $bus_type;
        }
        
        $sql .= " ORDER BY b.created_at DESC LIMIT $limit OFFSET $offset";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $buses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($buses as &$bus) {
            $bus['bus_name'] = ($bus['company_name'] ?? 'Unknown') . ' - ' . ucfirst(str_replace('-', ' ', $bus['bus_type']));
            
            // Parse amenities
            if (!empty($bus['amenities'])) {
                $amenities = json_decode($bus['amenities'], true);
                $bus['amenities_list'] = is_array($amenities) ? $amenities : [];
                $bus['amenities_display'] = is_array($amenities) ? implode(', ', $amenities) : $bus['amenities'];
            } else {
                $bus['amenities_list'] = [];
                $bus['amenities_display'] = 'None';
            }
            
            // Format dates
            $bus['last_maintenance'] = $bus['last_maintenance_date'] ? date('Y-m-d', strtotime($bus['last_maintenance_date'])) : 'N/A';
            $bus['next_maintenance'] = $bus['next_maintenance_date'] ? date('Y-m-d', strtotime($bus['next_maintenance_date'])) : 'N/A';
        }
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM buses b LEFT JOIN bus_companies c ON b.company_id = c.id WHERE 1=1";
        $countParams = [];
        
        if (!empty($search)) {
            $countSql .= " AND (b.bus_id LIKE ? OR b.bus_number LIKE ? OR b.license_plate LIKE ? OR c.name LIKE ?)";
            $countParams = array_merge($countParams, ["%$search%", "%$search%", "%$search%", "%$search%"]);
        }
        if (!empty($status)) {
            $countSql .= " AND b.status = ?";
            $countParams[] = $status;
        }
        if (!empty($bus_type)) {
            $countSql .= " AND b.bus_type = ?";
            $countParams[] = $bus_type;
        }
        
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($countParams);
        $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        echo json_encode([
            'success' => true,
            'data' => $buses,
            'pagination' => [
                'total' => (int)$totalCount,
                'limit' => $limit,
                'offset' => $offset
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("handleGetBuses error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch buses: ' . $e->getMessage()]);
    }
}

function handleGetBusStats() {
    try {
        $pdo = getDB();
        
        $stmt = $pdo->prepare("SELECT 
            COUNT(*) as total_buses,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_buses,
            SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_buses,
            SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_buses
            FROM buses");
        $stmt->execute();
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => [
                'total_buses' => (int)($stats['total_buses'] ?? 0),
                'active_buses' => (int)($stats['active_buses'] ?? 0),
                'maintenance_buses' => (int)($stats['maintenance_buses'] ?? 0),
                'inactive_buses' => (int)($stats['inactive_buses'] ?? 0)
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch bus stats: ' . $e->getMessage()]);
    }
}

function handleAddBus() {
    try {
        $pdo = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['bus_number']) || empty($input['bus_type']) || empty($input['total_seats'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Bus number, type and seats are required']);
            return;
        }
        
        $busId = 'BUS' . date('Y') . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
        
        $stmt = $pdo->prepare("INSERT INTO buses (bus_id, company_id, bus_number, bus_type, total_seats, status, license_plate, model, amenities, created_at) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, NOW())");
        $stmt->execute([
            $busId,
            $input['company_id'] ?? 1,
            $input['bus_number'],
            $input['bus_type'],
            $input['total_seats'],
            $input['license_plate'] ?? '',
            $input['model'] ?? '',
            isset($input['amenities']) ? json_encode($input['amenities']) : null
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Bus added successfully', 'bus_id' => $busId]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to add bus: ' . $e->getMessage()]);
    }
}

function handleUpdateBus() {
    try {
        $pdo = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['id']) && empty($input['bus_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Bus ID is required']);
            return;
        }
        
        $busId = $input['bus_id'] ?? $input['id'];
        $updateFields = [];
        $params = [];
        
        $allowedFields = ['bus_number', 'bus_type', 'total_seats', 'status', 'license_plate', 'model'];
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updateFields[] = "$field = ?";
                $params[] = $input[$field];
            }
        }
        
        if (isset($input['amenities'])) {
            $updateFields[] = "amenities = ?";
            $params[] = json_encode($input['amenities']);
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            return;
        }
        
        $updateFields[] = "updated_at = NOW()";
        $params[] = $busId;
        $params[] = $busId;
        
        $sql = "UPDATE buses SET " . implode(', ', $updateFields) . " WHERE bus_id = ? OR id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode(['success' => true, 'message' => 'Bus updated successfully']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update bus: ' . $e->getMessage()]);
    }
}

function handleDeleteBus() {
    try {
        $pdo = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        
        $busId = $input['bus_id'] ?? $input['id'] ?? '';
        
        if (empty($busId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Bus ID is required']);
            return;
        }
        
        // Set to inactive instead of delete
        $stmt = $pdo->prepare("UPDATE buses SET status = 'inactive', updated_at = NOW() WHERE bus_id = ? OR id = ?");
        $stmt->execute([$busId, $busId]);
        
        echo json_encode(['success' => true, 'message' => 'Bus deactivated successfully']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete bus: ' . $e->getMessage()]);
    }
}
?>
