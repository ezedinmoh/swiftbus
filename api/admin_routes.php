<?php
/**
 * SwiftBus Admin Routes API
 * Handles route management for admin dashboard
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

$action = $_GET['action'] ?? $_POST['action'] ?? 'get_routes';

switch ($action) {
    case 'get_routes':
        handleGetRoutes();
        break;
    case 'get_route_stats':
        handleGetRouteStats();
        break;
    case 'add_route':
        handleAddRoute();
        break;
    case 'update_route':
        handleUpdateRoute();
        break;
    case 'delete_route':
        handleDeleteRoute();
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function handleGetRoutes() {
    try {
        $pdo = getDB();
        
        $search = $_GET['search'] ?? '';
        $status = $_GET['status'] ?? '';
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);
        
        $sql = "SELECT 
                    r.id,
                    r.route_id,
                    oc.name as origin_city,
                    dc.name as destination_city,
                    r.distance_km,
                    r.estimated_duration_hours,
                    r.base_price,
                    r.is_active,
                    r.created_at,
                    r.updated_at
                FROM routes r
                LEFT JOIN cities oc ON r.origin_city_id = oc.id
                LEFT JOIN cities dc ON r.destination_city_id = dc.id
                WHERE 1=1";
        
        $params = [];
        
        if (!empty($search)) {
            $sql .= " AND (oc.name LIKE ? OR dc.name LIKE ? OR r.route_id LIKE ?)";
            $searchParam = "%$search%";
            $params = array_merge($params, [$searchParam, $searchParam, $searchParam]);
        }
        
        if (!empty($status)) {
            $sql .= " AND r.is_active = ?";
            $params[] = ($status === 'active') ? 1 : 0;
        }
        
        $sql .= " ORDER BY r.created_at DESC LIMIT $limit OFFSET $offset";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($routes as &$route) {
            $route['route_name'] = $route['origin_city'] . ' → ' . $route['destination_city'];
            $route['status'] = $route['is_active'] ? 'active' : 'inactive';
            $route['distance'] = (int)$route['distance_km'];
            $route['fare_base'] = (float)$route['base_price'];
            
            // Format duration
            $hours = floor($route['estimated_duration_hours'] ?? 0);
            $minutes = round((($route['estimated_duration_hours'] ?? 0) - $hours) * 60);
            $route['estimated_duration'] = $hours > 0 ? "{$hours}h {$minutes}m" : "{$minutes}m";
        }
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM routes r 
                     LEFT JOIN cities oc ON r.origin_city_id = oc.id 
                     LEFT JOIN cities dc ON r.destination_city_id = dc.id WHERE 1=1";
        $countParams = [];
        
        if (!empty($search)) {
            $countSql .= " AND (oc.name LIKE ? OR dc.name LIKE ? OR r.route_id LIKE ?)";
            $countParams = array_merge($countParams, ["%$search%", "%$search%", "%$search%"]);
        }
        if (!empty($status)) {
            $countSql .= " AND r.is_active = ?";
            $countParams[] = ($status === 'active') ? 1 : 0;
        }
        
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($countParams);
        $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        echo json_encode([
            'success' => true,
            'data' => $routes,
            'pagination' => [
                'total' => (int)$totalCount,
                'limit' => $limit,
                'offset' => $offset
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("handleGetRoutes error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch routes: ' . $e->getMessage()]);
    }
}

function handleGetRouteStats() {
    try {
        $pdo = getDB();
        
        $stmt = $pdo->prepare("SELECT 
            COUNT(*) as total_routes,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_routes,
            SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_routes
            FROM routes");
        $stmt->execute();
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => [
                'total_routes' => (int)($stats['total_routes'] ?? 0),
                'active_routes' => (int)($stats['active_routes'] ?? 0),
                'inactive_routes' => (int)($stats['inactive_routes'] ?? 0)
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch route stats: ' . $e->getMessage()]);
    }
}

function handleAddRoute() {
    try {
        $pdo = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['origin_city_id']) || empty($input['destination_city_id']) || empty($input['base_price'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Origin, destination and base price are required']);
            return;
        }
        
        $routeId = 'RT' . date('Y') . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
        
        $stmt = $pdo->prepare("INSERT INTO routes (route_id, origin_city_id, destination_city_id, distance_km, estimated_duration_hours, base_price, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())");
        $stmt->execute([
            $routeId,
            $input['origin_city_id'],
            $input['destination_city_id'],
            $input['distance_km'] ?? 0,
            $input['estimated_duration_hours'] ?? 0,
            $input['base_price']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Route added successfully', 'route_id' => $routeId]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to add route: ' . $e->getMessage()]);
    }
}

function handleUpdateRoute() {
    try {
        $pdo = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['id']) && empty($input['route_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Route ID is required']);
            return;
        }
        
        $routeId = $input['route_id'] ?? $input['id'];
        $updateFields = [];
        $params = [];
        
        if (isset($input['is_active'])) {
            $updateFields[] = "is_active = ?";
            $params[] = $input['is_active'];
        }
        if (isset($input['base_price'])) {
            $updateFields[] = "base_price = ?";
            $params[] = $input['base_price'];
        }
        if (isset($input['distance_km'])) {
            $updateFields[] = "distance_km = ?";
            $params[] = $input['distance_km'];
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            return;
        }
        
        $updateFields[] = "updated_at = NOW()";
        $params[] = $routeId;
        
        $sql = "UPDATE routes SET " . implode(', ', $updateFields) . " WHERE route_id = ? OR id = ?";
        $params[] = $routeId;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode(['success' => true, 'message' => 'Route updated successfully']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update route: ' . $e->getMessage()]);
    }
}

function handleDeleteRoute() {
    try {
        $pdo = getDB();
        $input = json_decode(file_get_contents('php://input'), true);
        
        $routeId = $input['route_id'] ?? $input['id'] ?? '';
        
        if (empty($routeId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Route ID is required']);
            return;
        }
        
        // Deactivate instead of delete
        $stmt = $pdo->prepare("UPDATE routes SET is_active = 0, updated_at = NOW() WHERE route_id = ? OR id = ?");
        $stmt->execute([$routeId, $routeId]);
        
        echo json_encode(['success' => true, 'message' => 'Route deactivated successfully']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete route: ' . $e->getMessage()]);
    }
}
?>
