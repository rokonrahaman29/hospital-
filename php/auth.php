<?php
require_once 'config.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'POST':
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'signup':
                handleSignup($input);
                break;
            case 'login':
                handleLogin($input);
                break;
            case 'logout':
                handleLogout();
                break;
            default:
                sendError('Invalid action');
        }
        break;
        
    case 'GET':
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'profile':
                getUserProfile();
                break;
            case 'check':
                checkAuthStatus();
                break;
            default:
                sendError('Invalid action');
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
}

function handleSignup($input) {
    try {
        // Validate input
        $name = validateInput($input['name'] ?? '');
        $email = validateInput($input['email'] ?? '');
        $phone = validateInput($input['phone'] ?? '');
        $password = $input['password'] ?? '';
        
        if (empty($name) || empty($email) || empty($phone) || empty($password)) {
            sendError('All fields are required');
        }
        
        if (!validateEmail($email)) {
            sendError('Invalid email format');
        }
        
        if (!validatePhone($phone)) {
            sendError('Invalid phone number format');
        }
        
        if (strlen($password) < 6) {
            sendError('Password must be at least 6 characters long');
        }
        
        $pdo = getDBConnection();
        
        // Check if user already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR phone = ?");
        $stmt->execute([$email, $phone]);
        
        if ($stmt->fetch()) {
            sendError('User with this email or phone already exists');
        }
        
        // Create new user
        $hashedPassword = hashPassword($password);
        $userId = generateUniqueId('USR');
        
        $stmt = $pdo->prepare("
            INSERT INTO users (id, name, email, phone, password, created_at) 
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([$userId, $name, $email, $phone, $hashedPassword]);
        
        // Get user data
        $stmt = $pdo->prepare("SELECT id, name, email, phone, created_at FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        // Set session
        setUserSession($user);
        
        sendResponse([
            'success' => true,
            'message' => 'Account created successfully',
            'user' => $user
        ]);
        
    } catch (Exception $e) {
        logError("Signup error: " . $e->getMessage());
        sendError('Registration failed. Please try again.');
    }
}

function handleLogin($input) {
    try {
        $email = validateInput($input['email'] ?? '');
        $password = $input['password'] ?? '';
        
        if (empty($email) || empty($password)) {
            sendError('Email and password are required');
        }
        
        $pdo = getDBConnection();
        
        // Get user by email or phone
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR phone = ?");
        $stmt->execute([$email, $email]);
        $user = $stmt->fetch();
        
        if (!$user || !verifyPassword($password, $user['password'])) {
            sendError('Invalid credentials');
        }
        
        // Update last login
        $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        // Remove password from response
        unset($user['password']);
        
        // Set session
        setUserSession($user);
        
        sendResponse([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user
        ]);
        
    } catch (Exception $e) {
        logError("Login error: " . $e->getMessage());
        sendError('Login failed. Please try again.');
    }
}

function handleLogout() {
    try {
        destroySession();
        
        sendResponse([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
        
    } catch (Exception $e) {
        logError("Logout error: " . $e->getMessage());
        sendError('Logout failed');
    }
}

function getUserProfile() {
    try {
        if (!isLoggedIn()) {
            sendError('Not authenticated', 401);
        }
        
        $user = getCurrentUser();
        
        sendResponse([
            'success' => true,
            'user' => $user
        ]);
        
    } catch (Exception $e) {
        logError("Get profile error: " . $e->getMessage());
        sendError('Failed to get profile');
    }
}

function checkAuthStatus() {
    try {
        $isAuthenticated = isLoggedIn();
        $user = $isAuthenticated ? getCurrentUser() : null;
        
        sendResponse([
            'authenticated' => $isAuthenticated,
            'user' => $user
        ]);
        
    } catch (Exception $e) {
        logError("Check auth error: " . $e->getMessage());
        sendError('Failed to check authentication status');
    }
}
?>