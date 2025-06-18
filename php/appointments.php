<?php
require_once 'config.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'POST':
        $action = $_GET['action'] ?? 'create';
        
        switch ($action) {
            case 'create':
                createAppointment($input);
                break;
            case 'cancel':
                cancelAppointment($input);
                break;
            default:
                sendError('Invalid action');
        }
        break;
        
    case 'GET':
        $action = $_GET['action'] ?? 'list';
        
        switch ($action) {
            case 'list':
                getAppointments();
                break;
            case 'details':
                getAppointmentDetails($_GET['id'] ?? '');
                break;
            case 'availability':
                checkAvailability($_GET['doctor_id'] ?? '', $_GET['date'] ?? '');
                break;
            default:
                sendError('Invalid action');
        }
        break;
        
    case 'PUT':
        updateAppointment($input);
        break;
        
    default:
        sendError('Method not allowed', 405);
}

function createAppointment($input) {
    try {
        // Validate input
        $patientName = validateInput($input['patientName'] ?? '');
        $patientPhone = validateInput($input['patientPhone'] ?? '');
        $patientEmail = validateInput($input['patientEmail'] ?? '');
        $patientAge = (int)($input['patientAge'] ?? 0);
        $patientGender = validateInput($input['patientGender'] ?? '');
        $department = validateInput($input['department'] ?? '');
        $doctorId = validateInput($input['doctor'] ?? '');
        $appointmentDate = validateInput($input['appointmentDate'] ?? '');
        $appointmentTime = validateInput($input['appointmentTime'] ?? '');
        $visitReason = validateInput($input['visitReason'] ?? '');
        $additionalNotes = validateInput($input['additionalNotes'] ?? '');
        
        // Validation
        if (empty($patientName) || empty($patientPhone) || empty($department) || 
            empty($doctorId) || empty($appointmentDate) || empty($appointmentTime) || 
            empty($visitReason)) {
            sendError('Required fields are missing');
        }
        
        if ($patientAge < 1 || $patientAge > 120) {
            sendError('Invalid age');
        }
        
        if (!validatePhone($patientPhone)) {
            sendError('Invalid phone number');
        }
        
        if (!empty($patientEmail) && !validateEmail($patientEmail)) {
            sendError('Invalid email address');
        }
        
        // Check if appointment date is in the future
        $appointmentDateTime = $appointmentDate . ' ' . $appointmentTime;
        if (strtotime($appointmentDateTime) <= time()) {
            sendError('Appointment must be scheduled for a future date and time');
        }
        
        $pdo = getDBConnection();
        
        // Check doctor availability
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count 
            FROM appointments 
            WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? 
            AND status NOT IN ('cancelled', 'completed')
        ");
        $stmt->execute([$doctorId, $appointmentDate, $appointmentTime]);
        $result = $stmt->fetch();
        
        if ($result['count'] > 0) {
            sendError('Doctor is not available at the selected time');
        }
        
        // Create appointment
        $appointmentId = generateUniqueId('APT');
        
        $stmt = $pdo->prepare("
            INSERT INTO appointments (
                id, patient_name, patient_phone, patient_email, patient_age, 
                patient_gender, department, doctor_id, appointment_date, 
                appointment_time, visit_reason, additional_notes, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', NOW())
        ");
        
        $stmt->execute([
            $appointmentId, $patientName, $patientPhone, $patientEmail, 
            $patientAge, $patientGender, $department, $doctorId, 
            $appointmentDate, $appointmentTime, $visitReason, $additionalNotes
        ]);
        
        // Get appointment details with doctor info
        $stmt = $pdo->prepare("
            SELECT a.*, d.name as doctor_name, d.specialty 
            FROM appointments a 
            JOIN doctors d ON a.doctor_id = d.id 
            WHERE a.id = ?
        ");
        $stmt->execute([$appointmentId]);
        $appointment = $stmt->fetch();
        
        // Send confirmation (implement email/SMS sending here)
        sendAppointmentConfirmation($appointment);
        
        sendResponse([
            'success' => true,
            'message' => 'Appointment booked successfully',
            'appointment' => $appointment
        ]);
        
    } catch (Exception $e) {
        logError("Create appointment error: " . $e->getMessage());
        sendError('Failed to book appointment. Please try again.');
    }
}

function getAppointments() {
    try {
        $userId = $_GET['user_id'] ?? '';
        $date = $_GET['date'] ?? '';
        $status = $_GET['status'] ?? '';
        
        $pdo = getDBConnection();
        
        $query = "
            SELECT a.*, d.name as doctor_name, d.specialty 
            FROM appointments a 
            JOIN doctors d ON a.doctor_id = d.id 
            WHERE 1=1
        ";
        $params = [];
        
        if (!empty($userId)) {
            $query .= " AND a.user_id = ?";
            $params[] = $userId;
        }
        
        if (!empty($date)) {
            $query .= " AND a.appointment_date = ?";
            $params[] = $date;
        }
        
        if (!empty($status)) {
            $query .= " AND a.status = ?";
            $params[] = $status;
        }
        
        $query .= " ORDER BY a.appointment_date DESC, a.appointment_time DESC";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $appointments = $stmt->fetchAll();
        
        sendResponse([
            'success' => true,
            'appointments' => $appointments
        ]);
        
    } catch (Exception $e) {
        logError("Get appointments error: " . $e->getMessage());
        sendError('Failed to retrieve appointments');
    }
}

function getAppointmentDetails($appointmentId) {
    try {
        if (empty($appointmentId)) {
            sendError('Appointment ID is required');
        }
        
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("
            SELECT a.*, d.name as doctor_name, d.specialty, d.qualification 
            FROM appointments a 
            JOIN doctors d ON a.doctor_id = d.id 
            WHERE a.id = ?
        ");
        $stmt->execute([$appointmentId]);
        $appointment = $stmt->fetch();
        
        if (!$appointment) {
            sendError('Appointment not found', 404);
        }
        
        sendResponse([
            'success' => true,
            'appointment' => $appointment
        ]);
        
    } catch (Exception $e) {
        logError("Get appointment details error: " . $e->getMessage());
        sendError('Failed to retrieve appointment details');
    }
}

function checkAvailability($doctorId, $date) {
    try {
        if (empty($doctorId) || empty($date)) {
            sendError('Doctor ID and date are required');
        }
        
        $pdo = getDBConnection();
        
        // Get booked time slots
        $stmt = $pdo->prepare("
            SELECT appointment_time 
            FROM appointments 
            WHERE doctor_id = ? AND appointment_date = ? 
            AND status NOT IN ('cancelled', 'completed')
        ");
        $stmt->execute([$doctorId, $date]);
        $bookedSlots = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Define available time slots (this could be dynamic based on doctor schedule)
        $allSlots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
        ];
        
        $availableSlots = array_diff($allSlots, $bookedSlots);
        
        sendResponse([
            'success' => true,
            'available_slots' => array_values($availableSlots),
            'booked_slots' => $bookedSlots
        ]);
        
    } catch (Exception $e) {
        logError("Check availability error: " . $e->getMessage());
        sendError('Failed to check availability');
    }
}

function updateAppointment($input) {
    try {
        $appointmentId = $input['id'] ?? '';
        $status = validateInput($input['status'] ?? '');
        
        if (empty($appointmentId) || empty($status)) {
            sendError('Appointment ID and status are required');
        }
        
        $validStatuses = ['confirmed', 'cancelled', 'completed', 'rescheduled'];
        if (!in_array($status, $validStatuses)) {
            sendError('Invalid status');
        }
        
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("
            UPDATE appointments 
            SET status = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$status, $appointmentId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Appointment not found or no changes made', 404);
        }
        
        sendResponse([
            'success' => true,
            'message' => 'Appointment updated successfully'
        ]);
        
    } catch (Exception $e) {
        logError("Update appointment error: " . $e->getMessage());
        sendError('Failed to update appointment');
    }
}

function cancelAppointment($input) {
    try {
        $appointmentId = $input['id'] ?? '';
        $reason = validateInput($input['reason'] ?? '');
        
        if (empty($appointmentId)) {
            sendError('Appointment ID is required');
        }
        
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("
            UPDATE appointments 
            SET status = 'cancelled', cancellation_reason = ?, updated_at = NOW() 
            WHERE id = ? AND status = 'confirmed'
        ");
        $stmt->execute([$reason, $appointmentId]);
        
        if ($stmt->rowCount() === 0) {
            sendError('Appointment not found or cannot be cancelled', 404);
        }
        
        sendResponse([
            'success' => true,
            'message' => 'Appointment cancelled successfully'
        ]);
        
    } catch (Exception $e) {
        logError("Cancel appointment error: " . $e->getMessage());
        sendError('Failed to cancel appointment');
    }
}

function sendAppointmentConfirmation($appointment) {
    // In a real application, implement email/SMS sending here
    // For now, just log the confirmation
    logError("Appointment confirmation sent for: " . $appointment['id']);
}
?>