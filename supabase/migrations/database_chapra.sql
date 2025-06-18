-- Chapra Gramin Hospital Database Schema
-- This script creates all necessary tables for the hospital management system

-- Create database
CREATE DATABASE IF NOT EXISTS chapra_hospital;
USE chapra_hospital;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'admin', 'staff') DEFAULT 'patient',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_bn VARCHAR(100),
    specialty VARCHAR(100) NOT NULL,
    specialty_bn VARCHAR(100),
    qualification VARCHAR(200) NOT NULL,
    qualification_bn VARCHAR(200),
    experience_years INT NOT NULL,
    department VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    schedule_days VARCHAR(50), -- JSON string for days
    schedule_start_time TIME,
    schedule_end_time TIME,
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    patient_name VARCHAR(100) NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    patient_email VARCHAR(100),
    patient_age INT NOT NULL,
    patient_gender ENUM('male', 'female', 'other') NOT NULL,
    department VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    visit_reason TEXT NOT NULL,
    additional_notes TEXT,
    status ENUM('confirmed', 'cancelled', 'completed', 'rescheduled') DEFAULT 'confirmed',
    cancellation_reason TEXT,
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_doctor_date (doctor_id, appointment_date),
    INDEX idx_patient_phone (patient_phone)
);

-- Birth certificate applications
CREATE TABLE IF NOT EXISTS birth_certificate_applications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    child_name VARCHAR(100) NOT NULL,
    child_dob DATE NOT NULL,
    father_name VARCHAR(100) NOT NULL,
    mother_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    hospital_reg_number VARCHAR(50) NOT NULL,
    status ENUM('submitted', 'under_review', 'approved', 'rejected', 'completed') DEFAULT 'submitted',
    processing_fee DECIMAL(10,2) DEFAULT 50.00,
    certificate_number VARCHAR(50),
    issued_date DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_hospital_reg (hospital_reg_number),
    INDEX idx_status (status)
);

-- Death certificate applications
CREATE TABLE IF NOT EXISTS death_certificate_applications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    deceased_name VARCHAR(100) NOT NULL,
    death_date DATE NOT NULL,
    death_cause VARCHAR(200) NOT NULL,
    applicant_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    status ENUM('submitted', 'under_review', 'approved', 'rejected', 'completed') DEFAULT 'submitted',
    processing_fee DECIMAL(10,2) DEFAULT 30.00,
    certificate_number VARCHAR(50),
    issued_date DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status)
);

-- Swasthya Sathi registration applications
CREATE TABLE IF NOT EXISTS swasthya_sathi_applications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    family_head_name VARCHAR(100) NOT NULL,
    aadhaar_number VARCHAR(12) UNIQUE NOT NULL,
    ration_card_number VARCHAR(50) NOT NULL,
    annual_income DECIMAL(12,2) NOT NULL,
    family_members INT NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    status ENUM('submitted', 'under_review', 'approved', 'rejected', 'completed') DEFAULT 'submitted',
    card_number VARCHAR(50),
    issued_date DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_aadhaar (aadhaar_number),
    INDEX idx_status (status)
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    category ENUM('service', 'staff', 'facility', 'billing', 'other') NOT NULL,
    details TEXT NOT NULL,
    status ENUM('submitted', 'under_review', 'resolved', 'closed') DEFAULT 'submitted',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to VARCHAR(50),
    resolution TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_category (category)
);

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_bn VARCHAR(100),
    generic_name VARCHAR(100),
    category ENUM('prescription', 'otc', 'emergency', 'chronic') NOT NULL,
    type VARCHAR(100) NOT NULL,
    type_bn VARCHAR(100),
    description TEXT,
    description_bn TEXT,
    dosage VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 10,
    prescription_required BOOLEAN DEFAULT FALSE,
    manufacturer VARCHAR(100),
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_name (name),
    INDEX idx_stock (stock_quantity)
);

-- Prescription uploads table
CREATE TABLE IF NOT EXISTS prescription_uploads (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    patient_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    prescription_image VARCHAR(255) NOT NULL,
    delivery_address TEXT NOT NULL,
    home_delivery BOOLEAN DEFAULT FALSE,
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('submitted', 'processing', 'ready', 'delivered', 'cancelled') DEFAULT 'submitted',
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    estimated_ready_time TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status)
);

-- Vaccination records table
CREATE TABLE IF NOT EXISTS vaccination_records (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    patient_name VARCHAR(100) NOT NULL,
    patient_age INT NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    vaccine_name VARCHAR(100) NOT NULL,
    vaccine_type VARCHAR(50) NOT NULL,
    dose_number INT DEFAULT 1,
    vaccination_date DATE NOT NULL,
    next_dose_date DATE,
    administered_by VARCHAR(100),
    batch_number VARCHAR(50),
    side_effects TEXT,
    status ENUM('scheduled', 'completed', 'missed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_vaccination_date (vaccination_date),
    INDEX idx_patient_phone (patient_phone)
);

-- Birth records table (for hospital deliveries)
CREATE TABLE IF NOT EXISTS birth_records (
    id VARCHAR(50) PRIMARY KEY,
    hospital_reg_number VARCHAR(50) UNIQUE NOT NULL,
    child_name VARCHAR(100),
    birth_date DATE NOT NULL,
    birth_time TIME,
    father_name VARCHAR(100) NOT NULL,
    mother_name VARCHAR(100) NOT NULL,
    mother_age INT,
    birth_weight DECIMAL(5,2),
    birth_height DECIMAL(5,2),
    delivery_type ENUM('normal', 'cesarean', 'assisted') NOT NULL,
    attending_doctor VARCHAR(100),
    ward_number VARCHAR(20),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_hospital_reg (hospital_reg_number),
    INDEX idx_birth_date (birth_date)
);

-- Death records table (for hospital deaths)
CREATE TABLE IF NOT EXISTS death_records (
    id VARCHAR(50) PRIMARY KEY,
    hospital_reg_number VARCHAR(50) UNIQUE NOT NULL,
    deceased_name VARCHAR(100) NOT NULL,
    death_date DATE NOT NULL,
    death_time TIME,
    age_at_death INT,
    cause_of_death VARCHAR(200) NOT NULL,
    attending_doctor VARCHAR(100),
    ward_number VARCHAR(20),
    family_contact VARCHAR(20),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_hospital_reg (hospital_reg_number),
    INDEX idx_death_date (death_date)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    title_bn VARCHAR(200),
    message TEXT NOT NULL,
    message_bn TEXT,
    type ENUM('appointment', 'vaccination', 'service', 'general', 'emergency') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_scheduled (scheduled_for)
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial data

-- Insert sample doctors
INSERT INTO doctors (id, name, name_bn, specialty, specialty_bn, qualification, qualification_bn, experience_years, department, phone, email, schedule_days, schedule_start_time, schedule_end_time, consultation_fee) VALUES
('DOC001', 'Dr. Rajesh Kumar', 'ডাঃ রাজেশ কুমার', 'General Medicine', 'সাধারণ চিকিৎসা', 'MBBS, MD (Medicine)', 'এমবিবিএস, এমডি (মেডিসিন)', 15, 'general', '+91-9876543210', 'rajesh.kumar@chapragramin.com', '["monday","tuesday","wednesday","thursday","friday"]', '09:00:00', '17:00:00', 300.00),
('DOC002', 'Dr. Priya Sharma', 'ডাঃ প্রিয়া শর্মা', 'Cardiologist', 'হৃদরোগ বিশেষজ্ঞ', 'MBBS, MD, DM (Cardiology)', 'এমবিবিএস, এমডি, ডিএম (কার্ডিওলজি)', 12, 'cardiology', '+91-9876543211', 'priya.sharma@chapragramin.com', '["tuesday","wednesday","thursday","friday","saturday"]', '10:00:00', '16:00:00', 500.00),
('DOC003', 'Dr. Amit Singh', 'ডাঃ অমিত সিং', 'Orthopedic Surgeon', 'অর্থোপেডিক সার্জন', 'MBBS, MS (Orthopedics)', 'এমবিবিএস, এমএস (অর্থোপেডিক্স)', 18, 'orthopedic', '+91-9876543212', 'amit.singh@chapragramin.com', '["monday","tuesday","wednesday","thursday"]', '08:00:00', '15:00:00', 600.00),
('DOC004', 'Dr. Sunita Devi', 'ডাঃ সুনিতা দেবী', 'Pediatrician', 'শিশু চিকিৎসক', 'MBBS, MD (Pediatrics)', 'এমবিবিএস, এমডি (পেডিয়াট্রিক্স)', 10, 'pediatric', '+91-9876543213', 'sunita.devi@chapragramin.com', '["monday","tuesday","wednesday","thursday","friday","saturday"]', '09:00:00', '18:00:00', 400.00),
('DOC005', 'Dr. Meena Jha', 'ডাঃ মীনা ঝা', 'Gynecologist', 'স্ত্রীরোগ বিশেষজ্ঞ', 'MBBS, MS (Gynecology)', 'এমবিবিএস, এমএস (গাইনোকোলজি)', 14, 'gynecology', '+91-9876543214', 'meena.jha@chapragramin.com', '["wednesday","thursday","friday","saturday","sunday"]', '10:00:00', '17:00:00', 450.00),
('DOC006', 'Dr. Vikash Kumar', 'ডাঃ বিকাশ কুমার', 'Emergency Medicine', 'জরুরি চিকিৎসা', 'MBBS, MD (Emergency Medicine)', 'এমবিবিএস, এমডি (জরুরি চিকিৎসা)', 8, 'general', '+91-9876543215', 'vikash.kumar@chapragramin.com', '["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]', '00:00:00', '23:59:59', 350.00);

-- Insert sample medicines
INSERT INTO medicines (id, name, name_bn, generic_name, category, type, type_bn, description, description_bn, dosage, price, stock_quantity, prescription_required, manufacturer) VALUES
('MED001', 'Paracetamol', 'প্যারাসিটামল', 'Acetaminophen', 'otc', 'Pain Reliever', 'ব্যথা উপশমকারী', 'Effective for fever and mild to moderate pain', 'জ্বর এবং হালকা থেকে মাঝারি ব্যথার জন্য কার্যকর', '500mg', 25.00, 500, FALSE, 'Generic Pharma'),
('MED002', 'Amoxicillin', 'অ্যামক্সিসিলিন', 'Amoxicillin', 'prescription', 'Antibiotic', 'অ্যান্টিবায়োটিক', 'Broad-spectrum antibiotic for bacterial infections', 'ব্যাকটেরিয়া সংক্রমণের জন্য ব্রড-স্পেকট্রাম অ্যান্টিবায়োটিক', '500mg', 120.00, 200, TRUE, 'Cipla'),
('MED003', 'Atenolol', 'অ্যাটেনোলল', 'Atenolol', 'prescription', 'Beta Blocker', 'বিটা ব্লকার', 'Used to treat high blood pressure and heart conditions', 'উচ্চ রক্তচাপ এবং হৃদরোগের চিকিৎসায় ব্যবহৃত', '50mg', 85.00, 150, TRUE, 'Sun Pharma'),
('MED004', 'Omeprazole', 'ওমিপ্রাজল', 'Omeprazole', 'otc', 'Antacid', 'অ্যান্টাসিড', 'Reduces stomach acid production', 'পেটের অ্যাসিড উৎপাদন কমায়', '20mg', 45.00, 300, FALSE, 'Dr. Reddy'),
('MED005', 'Adrenaline', 'অ্যাড্রেনালিন', 'Epinephrine', 'emergency', 'Emergency Drug', 'জরুরি ওষুধ', 'Life-saving medication for severe allergic reactions', 'গুরুতর অ্যালার্জি প্রতিক্রিয়ার জন্য জীবনরক্ষাকারী ওষুধ', '1mg/ml', 200.00, 50, TRUE, 'Lupin'),
('MED006', 'Metformin', 'মেটফরমিন', 'Metformin', 'chronic', 'Diabetes Medicine', 'ডায়াবেটিসের ওষুধ', 'First-line treatment for type 2 diabetes', 'টাইপ ২ ডায়াবেটিসের প্রথম সারির চিকিৎসা', '500mg', 65.00, 400, TRUE, 'Glenmark');

-- Insert sample birth records
INSERT INTO birth_records (id, hospital_reg_number, child_name, birth_date, birth_time, father_name, mother_name, mother_age, birth_weight, birth_height, delivery_type, attending_doctor, ward_number) VALUES
('BR001', 'CGH2024001', 'Baby Kumar', '2024-01-15', '08:30:00', 'Rajesh Kumar', 'Sunita Kumar', 28, 3.2, 48.5, 'normal', 'Dr. Meena Jha', 'W-101'),
('BR002', 'CGH2024002', 'Baby Singh', '2024-01-20', '14:45:00', 'Amit Singh', 'Priya Singh', 25, 2.8, 46.0, 'cesarean', 'Dr. Meena Jha', 'W-102'),
('BR003', 'CGH2024003', 'Baby Sharma', '2024-02-01', '22:15:00', 'Vikash Sharma', 'Ritu Sharma', 30, 3.5, 50.0, 'normal', 'Dr. Meena Jha', 'W-103');

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('hospital_name', 'Chapra Gramin Hospital', 'Hospital name'),
('hospital_address', 'Chapra, Bihar, India', 'Hospital address'),
('hospital_phone', '+91-8000-XXXX', 'Hospital contact number'),
('hospital_email', 'info@chapragramin.com', 'Hospital email address'),
('emergency_number', '+91-8000-XXXX', 'Emergency contact number'),
('appointment_slot_duration', '30', 'Appointment slot duration in minutes'),
('max_appointments_per_slot', '1', 'Maximum appointments per time slot'),
('advance_booking_days', '30', 'Maximum days in advance for booking'),
('birth_certificate_fee', '50', 'Birth certificate processing fee'),
('death_certificate_fee', '30', 'Death certificate processing fee'),
('home_delivery_fee', '50', 'Medicine home delivery fee'),
('free_delivery_minimum', '500', 'Minimum order amount for free delivery'),
('vaccination_reminder_days', '7', 'Days before vaccination to send reminder'),
('sms_enabled', '1', 'Enable SMS notifications'),
('email_enabled', '1', 'Enable email notifications');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_medicines_category ON medicines(category);
CREATE INDEX idx_notifications_user_date ON notifications(user_id, created_at);

-- Create views for common queries

-- View for appointment details with doctor information
CREATE VIEW appointment_details AS
SELECT 
    a.*,
    d.name as doctor_name,
    d.specialty,
    d.qualification,
    d.consultation_fee as doctor_fee
FROM appointments a
JOIN doctors d ON a.doctor_id = d.id;

-- View for available medicines
CREATE VIEW available_medicines AS
SELECT *
FROM medicines
WHERE is_active = TRUE AND stock_quantity > 0;

-- View for pending applications
CREATE VIEW pending_applications AS
SELECT id, 'birth_certificate' as type, child_name as applicant_name, contact_phone, status, created_at
FROM birth_certificate_applications
WHERE status IN ('submitted', 'under_review')
UNION ALL
SELECT id, 'death_certificate' as type, applicant_name, contact_phone, status, created_at
FROM death_certificate_applications
WHERE status IN ('submitted', 'under_review')
UNION ALL
SELECT id, 'swasthya_sathi' as type, family_head_name as applicant_name, contact_phone, status, created_at
FROM swasthya_sathi_applications
WHERE status IN ('submitted', 'under_review');

-- Create triggers for automatic updates

-- Trigger to update medicine stock when prescription is processed
DELIMITER //
CREATE TRIGGER update_medicine_stock
AFTER UPDATE ON prescription_uploads
FOR EACH ROW
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        -- In a real implementation, you would update medicine stock based on prescription details
        -- This is a placeholder for the logic
        INSERT INTO notifications (id, user_id, title, message, type)
        VALUES (CONCAT('NOT', UNIX_TIMESTAMP(), RAND()), NEW.user_id, 'Prescription Delivered', 'Your prescription has been delivered successfully.', 'general');
    END IF;
END//
DELIMITER ;

-- Trigger to send vaccination reminders
DELIMITER //
CREATE TRIGGER vaccination_reminder
AFTER INSERT ON vaccination_records
FOR EACH ROW
BEGIN
    IF NEW.next_dose_date IS NOT NULL THEN
        INSERT INTO notifications (id, user_id, title, message, type, scheduled_for)
        VALUES (
            CONCAT('NOT', UNIX_TIMESTAMP(), RAND()),
            NEW.user_id,
            'Vaccination Reminder',
            CONCAT('Your next vaccination for ', NEW.vaccine_name, ' is due on ', NEW.next_dose_date),
            'vaccination',
            DATE_SUB(NEW.next_dose_date, INTERVAL 7 DAY)
        );
    END IF;
END//
DELIMITER ;

-- Create stored procedures for common operations

-- Procedure to get doctor availability
DELIMITER //
CREATE PROCEDURE GetDoctorAvailability(
    IN doctor_id VARCHAR(50),
    IN check_date DATE
)
BEGIN
    SELECT 
        TIME_FORMAT(TIME('09:00:00') + INTERVAL (n * 30) MINUTE, '%H:%i') as time_slot,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM appointments 
                WHERE doctor_id = doctor_id 
                AND appointment_date = check_date 
                AND appointment_time = TIME_FORMAT(TIME('09:00:00') + INTERVAL (n * 30) MINUTE, '%H:%i')
                AND status NOT IN ('cancelled', 'completed')
            ) THEN 'booked'
            ELSE 'available'
        END as status
    FROM (
        SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION 
        SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION 
        SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
    ) numbers
    WHERE TIME('09:00:00') + INTERVAL (n * 30) MINUTE <= TIME('17:00:00');
END//
DELIMITER ;

-- Procedure to get application statistics
DELIMITER //
CREATE PROCEDURE GetApplicationStatistics()
BEGIN
    SELECT 
        'birth_certificate' as type,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM birth_certificate_applications
    UNION ALL
    SELECT 
        'death_certificate' as type,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM death_certificate_applications
    UNION ALL
    SELECT 
        'swasthya_sathi' as type,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM swasthya_sathi_applications;
END//
DELIMITER ;