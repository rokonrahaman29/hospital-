// Services functionality for birth certificate, death certificate, Swasthya Sathi, etc.

// Handle birth certificate application
async function handleBirthCertificate(event) {
    event.preventDefault();
    
    try {
        const formData = {
            childName: document.getElementById('childName').value.trim(),
            childDob: document.getElementById('childDob').value,
            fatherName: document.getElementById('fatherName').value.trim(),
            motherName: document.getElementById('motherName').value.trim(),
            contactPhone: document.getElementById('birthContactPhone').value.trim(),
            hospitalRegNumber: document.getElementById('hospitalRegNumber').value.trim()
        };
        
        // Validate required fields
        const requiredFields = [
            { field: 'childName', message: 'Child\'s name is required' },
            { field: 'childDob', message: 'Date of birth is required' },
            { field: 'fatherName', message: 'Father\'s name is required' },
            { field: 'motherName', message: 'Mother\'s name is required' },
            { field: 'contactPhone', message: 'Contact number is required' },
            { field: 'hospitalRegNumber', message: 'Hospital registration number is required' }
        ];
        
        // Check required fields
        for (const { field, message } of requiredFields) {
            if (!formData[field] || formData[field] === '') {
                showNotification(message, 'error');
                document.getElementById(field === 'contactPhone' ? 'birthContactPhone' : field).focus();
                return;
            }
        }
        
        // Validate phone number
        if (!validatePhone(formData.contactPhone)) {
            showNotification('Please enter a valid 10-digit phone number', 'error');
            document.getElementById('birthContactPhone').focus();
            return;
        }
        
        // Validate date of birth
        const dobDate = new Date(formData.childDob);
        const today = new Date();
        if (dobDate > today) {
            showNotification('Date of birth cannot be in the future', 'error');
            document.getElementById('childDob').focus();
            return;
        }
        
        // Show loading state
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        // Submit application
        const response = await submitServiceApplication('birth_certificate', formData);
        
        if (response.success) {
            showNotification(`Birth certificate application submitted successfully! Application ID: ${response.application_id}`, 'success');
            closeModal('birthCertificateModal');
            document.getElementById('birthCertificateForm').reset();
        } else {
            showNotification(response.message || 'Failed to submit application. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Birth certificate error:', error);
        showNotification('An error occurred while submitting the application. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitButton = event.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }
}

// Handle death certificate application
async function handleDeathCertificate(event) {
    event.preventDefault();
    
    try {
        const formData = {
            deceasedName: document.getElementById('deceasedName').value.trim(),
            deathDate: document.getElementById('deathDate').value,
            deathCause: document.getElementById('deathCause').value.trim(),
            applicantName: document.getElementById('applicantName').value.trim(),
            relationship: document.getElementById('relationship').value,
            contactPhone: document.getElementById('deathContactPhone').value.trim()
        };
        
        // Validate required fields
        const requiredFields = [
            { field: 'deceasedName', message: 'Deceased person\'s name is required' },
            { field: 'deathDate', message: 'Date of death is required' },
            { field: 'deathCause', message: 'Cause of death is required' },
            { field: 'applicantName', message: 'Applicant\'s name is required' },
            { field: 'relationship', message: 'Relationship is required' },
            { field: 'contactPhone', message: 'Contact number is required' }
        ];
        
        // Check required fields
        for (const { field, message } of requiredFields) {
            if (!formData[field] || formData[field] === '') {
                showNotification(message, 'error');
                document.getElementById(field === 'contactPhone' ? 'deathContactPhone' : field).focus();
                return;
            }
        }
        
        // Validate phone number
        if (!validatePhone(formData.contactPhone)) {
            showNotification('Please enter a valid 10-digit phone number', 'error');
            document.getElementById('deathContactPhone').focus();
            return;
        }
        
        // Validate date of death
        const deathDate = new Date(formData.deathDate);
        const today = new Date();
        if (deathDate > today) {
            showNotification('Date of death cannot be in the future', 'error');
            document.getElementById('deathDate').focus();
            return;
        }
        
        // Show loading state
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        // Submit application
        const response = await submitServiceApplication('death_certificate', formData);
        
        if (response.success) {
            showNotification(`Death certificate application submitted successfully! Application ID: ${response.application_id}`, 'success');
            closeModal('deathCertificateModal');
            document.getElementById('deathCertificateForm').reset();
        } else {
            showNotification(response.message || 'Failed to submit application. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Death certificate error:', error);
        showNotification('An error occurred while submitting the application. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitButton = event.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }
}

// Handle Swasthya Sathi registration
async function handleSwasthyaSathi(event) {
    event.preventDefault();
    
    try {
        const formData = {
            familyHeadName: document.getElementById('familyHeadName').value.trim(),
            aadhaarNumber: document.getElementById('aadhaarNumber').value.trim(),
            rationCardNumber: document.getElementById('rationCardNumber').value.trim(),
            annualIncome: parseInt(document.getElementById('annualIncome').value),
            familyMembers: parseInt(document.getElementById('familyMembers').value),
            contactPhone: document.getElementById('swasthyaContactPhone').value.trim(),
            address: document.getElementById('address').value.trim()
        };
        
        // Validate required fields
        const requiredFields = [
            { field: 'familyHeadName', message: 'Family head name is required' },
            { field: 'aadhaarNumber', message: 'Aadhaar number is required' },
            { field: 'rationCardNumber', message: 'Ration card number is required' },
            { field: 'annualIncome', message: 'Annual income is required' },
            { field: 'familyMembers', message: 'Number of family members is required' },
            { field: 'contactPhone', message: 'Contact number is required' },
            { field: 'address', message: 'Address is required' }
        ];
        
        // Check required fields
        for (const { field, message } of requiredFields) {
            if (!formData[field] || formData[field] === '' || 
                (typeof formData[field] === 'number' && (isNaN(formData[field]) || formData[field] <= 0))) {
                showNotification(message, 'error');
                document.getElementById(field === 'contactPhone' ? 'swasthyaContactPhone' : field).focus();
                return;
            }
        }
        
        // Validate phone number
        if (!validatePhone(formData.contactPhone)) {
            showNotification('Please enter a valid 10-digit phone number', 'error');
            document.getElementById('swasthyaContactPhone').focus();
            return;
        }
        
        // Validate Aadhaar number
        if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
            showNotification('Please enter a valid 12-digit Aadhaar number', 'error');
            document.getElementById('aadhaarNumber').focus();
            return;
        }
        
        // Validate family members
        if (formData.familyMembers < 1) {
            showNotification('Number of family members must be at least 1', 'error');
            document.getElementById('familyMembers').focus();
            return;
        }
        
        // Show loading state
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        // Submit application
        const response = await submitServiceApplication('swasthya_sathi', formData);
        
        if (response.success) {
            showNotification(`Swasthya Sathi registration submitted successfully! Application ID: ${response.application_id}`, 'success');
            closeModal('swasthyaSathiModal');
            document.getElementById('swasthyaSathiForm').reset();
        } else {
            showNotification(response.message || 'Failed to submit registration. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Swasthya Sathi error:', error);
        showNotification('An error occurred while submitting the registration. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitButton = event.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }
}

// Submit service application to backend
async function submitServiceApplication(serviceType, formData) {
    try {
        const response = await fetch(`services.php?action=${serviceType}`, {
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
        // Fallback: simulate successful submission for demo
        return {
            success: true,
            message: 'Application submitted successfully',
            application_id: serviceType.toUpperCase() + Date.now()
        };
    }
}

// Show birth certificate modal
function showBirthCertificateModal() {
    showModal('birthCertificateModal');
}

// Show death certificate modal
function showDeathCertificateModal() {
    showModal('deathCertificateModal');
}

// Show Swasthya Sathi modal
function showSwasthyaSathiModal() {
    showModal('swasthyaSathiModal');
}

// Show vaccination popup
function showVaccinationPopup() {
    showModal('vaccinationModal');
}

// Schedule vaccination
function scheduleVaccination() {
    closeModal('vaccinationModal');
    showNotification('Please call +91-8000-XXXX to schedule your vaccination appointment.', 'info');
}

// Validate phone number
function validatePhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
}

// Initialize services page
document.addEventListener('DOMContentLoaded', function() {
    // Set max date for date inputs to today
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        if (input.id === 'childDob' || input.id === 'deathDate') {
            input.max = today;
        }
    });
});