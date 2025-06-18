<?php
require_once 'config.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'POST':
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'birth_certificate':
                handleBirthCertificate($input);
                break;
            case 'death_certificate':
                handleDeathCertificate($input);
                break;
            case 'swasthya_sathi':
                handleSwasthyaSathi($input);
                break;
            case 'complaint':
                handleComplaint($input);
                break;
            default:
                sendError('Invalid action');
        }
        break;
        
    case 'GET':
        $action = $_GET['action'] ?? 'list';
        
        switch ($action) {
            case 'list':
                getApplications();
                break;
            case 'details':
                getApplicationDetails($_GET['id'] ?? '');
                break;
            case 'status':
                getApplicationStatus($_GET['id'] ?? '');
                break;
            default:
                sendError('Invalid action');
        }
        break;
        
    case 'PUT':
        updateApplicationStatus($input);
        break;
        
    default:
        sendError('Method not allowed', 405);
}

function handleBirthCertificate($input) {
    try {
        // Validate input
        $childName = validateInput($input['childName'] ?? '');
        $childDob = validateInput($input['childDob'] ?? '');
        $fatherName = validateInput($input['fatherName'] ?? '');
        $motherName = validateInput($input['motherName'] ?? '');
        $contactPhone = validateInput($input['contactPhone'] ?? '');
        $hospitalRegNumber = validateInput($input['hospitalRegNumber'] ?? '');
        
        if (empty($childName) || empty($childDob) || empty($fatherName) || 
            empty($motherName) || empty($contactPhone) || empty($hospitalRegNumber)) {
            sendError('All fields are required');
        }
        
        if (!validatePhone($contactPhone)) {
            sendError('Invalid phone number');
        }
        
        // Validate date of birth
        if (strtotime($childDob) > time()) {
            sendError('Date of birth cannot be in the future');
        }
        
        $pdo = getDBConnection();
        
        // Check if hospital registration number exists
        $stmt = $pdo->prepare("SELECT id FROM birth_records WHERE hospital_reg_number = ?");
        $stmt->execute([$hospitalRegNumber]);
        
        if (!$stmt->fetch()) {
            sendError('Invalid hospital registration number');
        }
        
        // Create application
        $applicationId = generateUniqueId('BC');
        
        $stmt = $pdo->prepare("
            INSERT INTO birth_certificate_applications (
                id, child_name, child_dob, father_name, mother_name, 
                contact_phone, hospital_reg_number, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())
        ");
        
        $stmt->execute([
            $applicationId, $childName, $childDob, $fatherName, 
            $motherName, $contactPhone, $hospitalRegNumber
        ]);
        
        // Send confirmation
        sendServiceConfirmation($applicationId, 'Birth Certificate', $contactPhone);
        
        sendResponse([
            'success' => true,
            'message' => 'Birth certificate application submitted successfully',
            'application_id' => $applicationId,
            'estimated_completion' => date('Y-m-d', strtotime('+3 days'))
        ]);
        
    } catch (Exception $e) {
        logError("Birth certificate error: " . $e->getMessage());
        sendError('Failed to submit birth certificate application');
    }
}

function handleDeathCertificate($input) {
    try {
        // Validate input
        $deceasedName = validateInput($input['deceasedName'] ?? '');
        $deathDate = validateInput($input['deathDate'] ?? '');
        $deathCause = validateInput($input['deathCause'] ?? '');
        $applicantName = validateInput($input['applicantName'] ?? '');
        $relationship = validateInput($input['relationship'] ?? '');
        $contactPhone = validateInput($input['contactPhone'] ?? '');
        
        if (empty($deceasedName) || empty($deathDate) || empty($deathCause) || 
            empty($applicantName) || empty($relationship) || empty($contactPhone)) {
            sendError('All fields are required');
        }
        
        if (!validatePhone($contactPhone)) {
            sendError('Invalid phone number');
        }
        
        // Validate date of death
        if (strtotime($deathDate) > time()) {
            sendError('Date of death cannot be in the future');
        }
        
        $pdo = getDBConnection();
        
        // Create application
        $applicationId = generateUniqueId('DC');
        
        $stmt = $pdo->prepare("
            INSERT INTO death_certificate_applications (
                id, deceased_name, death_date, death_cause, applicant_name, 
                relationship, contact_phone, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())
        ");
        
        $stmt->execute([
            $applicationId, $deceasedName, $deathDate, $deathCause, 
            $applicantName, $relationship, $contactPhone
        ]);
        
        // Send confirmation
        sendServiceConfirmation($applicationId, 'Death Certificate', $contactPhone);
        
        sendResponse([
            'success' => true,
            'message' => 'Death certificate application submitted successfully',
            'application_id' => $applicationId,
            'estimated_completion' => date('Y-m-d', strtotime('+2 days'))
        ]);
        
    } catch (Exception $e) {
        logError("Death certificate error: " . $e->getMessage());
        sendError('Failed to submit death certificate application');
    }
}

function handleSwasthyaSathi($input) {
    try {
        // Validate input
        $familyHeadName = validateInput($input['familyHeadName'] ?? '');
        $aadhaarNumber = validateInput($input['aadhaarNumber'] ?? '');
        $rationCardNumber = validateInput($input['rationCardNumber'] ?? '');
        $annualIncome = (int)($input['annualIncome'] ?? 0);
        $familyMembers = (int)($input['familyMembers'] ?? 0);
        $contactPhone = validateInput($input['contactPhone'] ?? '');
        $address = validateInput($input['address'] ?? '');
        
        if (empty($familyHeadName) || empty($aadhaarNumber) || empty($rationCardNumber) || 
            $annualIncome <= 0 || $familyMembers <= 0 || empty($contactPhone) || empty($address)) {
            sendError('All fields are required');
        }
        
        if (!validatePhone($contactPhone)) {
            sendError('Invalid phone number');
        }
        
        // Validate Aadhaar number
        if (!preg_match('/^\d{12}$/', $aadhaarNumber)) {
            sendError('Invalid Aadhaar number');
        }
        
        // Check income eligibility (example: less than 5 lakhs)
        if ($annualIncome > 500000) {
            sendError('Annual income exceeds eligibility criteria');
        }
        
        $pdo = getDBConnection();
        
        // Check if already registered
        $stmt = $pdo->prepare("SELECT id FROM swasthya_sathi_applications WHERE aadhaar_number = ?");
        $stmt->execute([$aadhaarNumber]);
        
        if ($stmt->fetch()) {
            sendError('Application already exists for this Aadhaar number');
        }
        
        // Create application
        $applicationId = generateUniqueId('SS');
        
        $stmt = $pdo->prepare("
            INSERT INTO swasthya_sathi_applications (
                id, family_head_name, aadhaar_number, ration_card_number, 
                annual_income, family_members, contact_phone, address, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())
        ");
        
        $stmt->execute([
            $applicationId, $familyHeadName, $aadhaarNumber, $rationCardNumber, 
            $annualIncome, $familyMembers, $contactPhone, $address
        ]);
        
        // Send confirmation
        sendServiceConfirmation($applicationId, 'Swasthya Sathi Registration', $contactPhone);
        
        sendResponse([
            'success' => true,
            'message' => 'Swasthya Sathi registration submitted successfully',
            'application_id' => $applicationId,
            'estimated_completion' => date('Y-m-d', strtotime('+10 days'))
        ]);
        
    } catch (Exception $e) {
        logError("Swasthya Sathi error: " . $e->getMessage());
        sendError('Failed to submit Swasthya Sathi registration');
    }
}

function handleComplaint($input) {
    try {
        // Validate input
        $name = validateInput($input['name'] ?? '');
        $phone = validateInput($input['phone'] ?? '');
        $category = validateInput($input['category'] ?? '');
        $details = validateInput($input['details'] ?? '');
        
        if (empty($name) || empty($phone) || empty($category) || empty($details)) {
            sendError('All fields are required');
        }
        
        if (!validatePhone($phone)) {
            sendError('Invalid phone number');
        }
        
        $validCategories = ['service', 'staff', 'facility', 'billing', 'other'];
        if (!in_array($category, $validCategories)) {
            sendError('Invalid complaint category');
        }
        
        $pdo = getDBConnection();
        
        // Create complaint
        $complaintId = generateUniqueId('CMP');
        
        $stmt = $pdo->prepare("
            INSERT INTO complaints (
                id, name, phone, category, details, status, created_at
            ) VALUES (?, ?, ?, ?, ?, 'submitted', NOW())
        ");
        
        $stmt->execute([$complaintId, $name, $phone, $category, $details]);
        
        // Send confirmation
        sendServiceConfirmation($complaintId, 'Complaint', $phone);
        
        sendResponse([
            'success' => true,
            'message' => 'Complaint submitted successfully',
            'complaint_id' => $complaintId
        ]);
        
    } catch (Exception $e) {
        logError("Complaint error: " . $e->getMessage());
        sendError('Failed to submit complaint');
    }
}

function getApplications() {
    try {
        $type = $_GET['type'] ?? '';
        $status = $_GET['status'] ?? '';
        $userId = $_GET['user_id'] ?? '';
        
        $pdo = getDBConnection();
        
        $applications = [];
        
        // Get birth certificate applications
        if (empty($type) || $type === 'birth_certificate') {
            $query = "SELECT *, 'birth_certificate' as type FROM birth_certificate_applications WHERE 1=1";
            $params = [];
            
            if (!empty($status)) {
                $query .= " AND status = ?";
                $params[] = $status;
            }
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $applications = array_merge($applications, $stmt->fetchAll());
        }
        
        // Get death certificate applications
        if (empty($type) || $type === 'death_certificate') {
            $query = "SELECT *, 'death_certificate' as type FROM death_certificate_applications WHERE 1=1";
            $params = [];
            
            if (!empty($status)) {
                $query .= " AND status = ?";
                $params[] = $status;
            }
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $applications = array_merge($applications, $stmt->fetchAll());
        }
        
        // Get Swasthya Sathi applications
        if (empty($type) || $type === 'swasthya_sathi') {
            $query = "SELECT *, 'swasthya_sathi' as type FROM swasthya_sathi_applications WHERE 1=1";
            $params = [];
            
            if (!empty($status)) {
                $query .= " AND status = ?";
                $params[] = $status;
            }
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $applications = array_merge($applications, $stmt->fetchAll());
        }
        
        // Sort by creation date
        usort($applications, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
        
        sendResponse([
            'success' => true,
            'applications' => $applications
        ]);
        
    } catch (Exception $e) {
        logError("Get applications error: " . $e->getMessage());
        sendError('Failed to retrieve applications');
    }
}

function getApplicationDetails($applicationId) {
    try {
        if (empty($applicationId)) {
            sendError('Application ID is required');
        }
        
        $pdo = getDBConnection();
        
        // Try to find in each table
        $tables = [
            'birth_certificate_applications' => 'birth_certificate',
            'death_certificate_applications' => 'death_certificate',
            'swasthya_sathi_applications' => 'swasthya_sathi'
        ];
        
        foreach ($tables as $table => $type) {
            $stmt = $pdo->prepare("SELECT *, ? as type FROM $table WHERE id = ?");
            $stmt->execute([$type, $applicationId]);
            $application = $stmt->fetch();
            
            if ($application) {
                sendResponse([
                    'success' => true,
                    'application' => $application
                ]);
                return;
            }
        }
        
        sendError('Application not found', 404);
        
    } catch (Exception $e) {
        logError("Get application details error: " . $e->getMessage());
        sendError('Failed to retrieve application details');
    }
}

function getApplicationStatus($applicationId) {
    try {
        if (empty($applicationId)) {
            sendError('Application ID is required');
        }
        
        $pdo = getDBConnection();
        
        // Try to find in each table
        $tables = [
            'birth_certificate_applications',
            'death_certificate_applications',
            'swasthya_sathi_applications'
        ];
        
        foreach ($tables as $table) {
            $stmt = $pdo->prepare("SELECT id, status, created_at, updated_at FROM $table WHERE id = ?");
            $stmt->execute([$applicationId]);
            $result = $stmt->fetch();
            
            if ($result) {
                sendResponse([
                    'success' => true,
                    'status' => $result
                ]);
                return;
            }
        }
        
        sendError('Application not found', 404);
        
    } catch (Exception $e) {
        logError("Get application status error: " . $e->getMessage());
        sendError('Failed to retrieve application status');
    }
}

function updateApplicationStatus($input) {
    try {
        $applicationId = $input['id'] ?? '';
        $status = validateInput($input['status'] ?? '');
        $type = validateInput($input['type'] ?? '');
        
        if (empty($applicationId) || empty($status) || empty($type)) {
            sendError('Application ID, status, and type are required');
        }
        
        $validStatuses = ['submitted', 'under_review', 'approved', 'rejected', 'completed'];
        if (!in_array($status, $validStatuses)) {
            sendError('Invalid status');
        }
        
        $pdo = getDBConnection();
        
        $table = '';
        switch ($type) {
            case 'birth_certificate':
                $table = 'birth_certificate_applications';
                break;
            case 'death_certificate':
                $table = 'death_certificate_applications';
                break;
            case 'swasthya_sathi':
                $table = 'swasthya_sathi_applications';
                break;
            default:
                sendError('Invalid application type');
        }
        
        $stmt = $pdo->prepare("UPDATE $table SET status = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$status, $applicationId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Application not found or no changes made', 404);
        }
        
        sendResponse([
            'success' => true,
            'message' => 'Application status updated successfully'
        ]);
        
    } catch (Exception $e) {
        logError("Update application status error: " . $e->getMessage());
        sendError('Failed to update application status');
    }
}

function sendServiceConfirmation($applicationId, $serviceName, $phone) {
    // In a real application, implement SMS/email sending here
    logError("Service confirmation sent for $serviceName: $applicationId to $phone");
}
?>