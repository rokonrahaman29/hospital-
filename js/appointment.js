// Appointment booking functionality

// Doctor data for different departments
const doctorsData = {
    general: [
        { id: 'dr001', name: 'Dr. Rajesh Kumar', specialty: 'General Medicine' },
        { id: 'dr002', name: 'Dr. Priya Sharma', specialty: 'General Medicine' },
        { id: 'dr003', name: 'Dr. Amit Singh', specialty: 'General Medicine' }
    ],
    cardiology: [
        { id: 'dr004', name: 'Dr. Suresh Gupta', specialty: 'Cardiologist' },
        { id: 'dr005', name: 'Dr. Meena Patel', specialty: 'Cardiologist' }
    ],
    orthopedic: [
        { id: 'dr006', name: 'Dr. Ramesh Yadav', specialty: 'Orthopedic Surgeon' },
        { id: 'dr007', name: 'Dr. Sunita Jha', specialty: 'Orthopedic Surgeon' }
    ],
    pediatric: [
        { id: 'dr008', name: 'Dr. Kavita Roy', specialty: 'Pediatrician' },
        { id: 'dr009', name: 'Dr. Manoj Kumar', specialty: 'Pediatrician' }
    ],
    gynecology: [
        { id: 'dr010', name: 'Dr. Anita Devi', specialty: 'Gynecologist' },
        { id: 'dr011', name: 'Dr. Ritu Singh', specialty: 'Gynecologist' }
    ],
    emergency: [
        { id: 'dr012', name: 'Dr. Emergency On-Duty', specialty: 'Emergency Medicine' }
    ]
};

// Update doctors dropdown based on selected department
function updateDoctors() {
    const departmentSelect = document.getElementById('department');
    const doctorSelect = document.getElementById('doctor');
    const selectedDepartment = departmentSelect.value;
    
    // Clear existing options
    doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
    
    if (selectedDepartment && doctorsData[selectedDepartment]) {
        doctorsData[selectedDepartment].forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = `${doctor.name} - ${doctor.specialty}`;
            doctorSelect.appendChild(option);
        });
    }
}

// Set minimum date to today
function setMinDate() {
    const dateInput = document.getElementById('appointmentDate');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const minDate = tomorrow.toISOString().split('T')[0];
    dateInput.min = minDate;
    dateInput.value = minDate;
}

// Validate phone number
function validatePhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
}

// Validate email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle appointment form submission
async function handleAppointment(event) {
    event.preventDefault();
    
    try {
        // Get form data
        const formData = {
            patientName: document.getElementById('patientName').value.trim(),
            patientPhone: document.getElementById('patientPhone').value.trim(),
            patientEmail: document.getElementById('patientEmail').value.trim(),
            patientAge: parseInt(document.getElementById('patientAge').value),
            patientGender: document.getElementById('patientGender').value,
            department: document.getElementById('department').value,
            doctor: document.getElementById('doctor').value,
            appointmentDate: document.getElementById('appointmentDate').value,
            appointmentTime: document.getElementById('appointmentTime').value,
            visitReason: document.getElementById('visitReason').value.trim(),
            additionalNotes: document.getElementById('additionalNotes').value.trim(),
            termsAgree: document.getElementById('termsAgree').checked
        };
        
        // Validate required fields
        const requiredFields = [
            { field: 'patientName', message: 'Patient name is required' },
            { field: 'patientPhone', message: 'Phone number is required' },
            { field: 'patientAge', message: 'Age is required' },
            { field: 'patientGender', message: 'Gender is required' },
            { field: 'department', message: 'Department is required' },
            { field: 'doctor', message: 'Doctor selection is required' },
            { field: 'appointmentDate', message: 'Appointment date is required' },
            { field: 'appointmentTime', message: 'Appointment time is required' },
            { field: 'visitReason', message: 'Reason for visit is required' }
        ];
        
        // Check required fields
        for (const { field, message } of requiredFields) {
            if (!formData[field] || formData[field] === '') {
                showNotification(message, 'error');
                document.getElementById(field).focus();
                return;
            }
        }
        
        // Validate phone number
        if (!validatePhone(formData.patientPhone)) {
            showNotification('Please enter a valid 10-digit phone number', 'error');
            document.getElementById('patientPhone').focus();
            return;
        }
        
        // Validate email if provided
        if (formData.patientEmail && !validateEmail(formData.patientEmail)) {
            showNotification('Please enter a valid email address', 'error');
            document.getElementById('patientEmail').focus();
            return;
        }
        
        // Validate age
        if (formData.patientAge < 1 || formData.patientAge > 120) {
            showNotification('Please enter a valid age between 1 and 120', 'error');
            document.getElementById('patientAge').focus();
            return;
        }
        
        // Check terms agreement
        if (!formData.termsAgree) {
            showNotification('Please agree to the terms and conditions', 'error');
            document.getElementById('termsAgree').focus();
            return;
        }
        
        // Show loading state
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Booking...';
        submitButton.disabled = true;
        
        // Simulate API call (replace with actual API endpoint)
        const response = await simulateAppointmentBooking(formData);
        
        if (response.success) {
            showNotification('Appointment booked successfully! You will receive a confirmation SMS/Email shortly.', 'success');
            document.getElementById('appointmentForm').reset();
            setMinDate(); // Reset date to tomorrow
        } else {
            showNotification(response.message || 'Failed to book appointment. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Appointment booking error:', error);
        showNotification('An error occurred while booking the appointment. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Simulate appointment booking (replace with actual API call)
async function simulateAppointmentBooking(formData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
        const response = await fetch('appointments.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        // Fallback: simulate successful booking for demo
        return {
            success: true,
            message: 'Appointment booked successfully',
            appointmentId: 'APT' + Date.now()
        };
    }
}

// Initialize appointment page
document.addEventListener('DOMContentLoaded', function() {
    setMinDate();
    
    // Update placeholders based on current language
    updateLanguagePlaceholders();
});

// Update placeholders when language changes
function updateLanguagePlaceholders() {
    const currentLang = getCurrentLanguage();
    const visitReasonTextarea = document.getElementById('visitReason');
    const additionalNotesTextarea = document.getElementById('additionalNotes');
    
    if (visitReasonTextarea) {
        const placeholder = visitReasonTextarea.getAttribute(`data-placeholder-${currentLang}`);
        if (placeholder) {
            visitReasonTextarea.placeholder = placeholder;
        }
    }
    
    if (additionalNotesTextarea) {
        const placeholder = additionalNotesTextarea.getAttribute(`data-placeholder-${currentLang}`);
        if (placeholder) {
            additionalNotesTextarea.placeholder = placeholder;
        }
    }
}

// Get current language
function getCurrentLanguage() {
    return document.querySelector('.lang-btn.active')?.id === 'lang-bn' ? 'bn' : 'en';
}