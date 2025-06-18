// Global variables
let currentLanguage = 'en';
let currentTheme = 'light';
let isLoggedIn = false;
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load saved preferences
    loadUserPreferences();
    
    // Initialize language
    initializeLanguage();
    
    // Initialize theme
    initializeTheme();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize modals
    initializeModals();
    
    // Initialize notifications
    initializeNotifications();
    
    // Set minimum date for appointment booking
    setMinimumDate();
    
    // Check login status
    checkLoginStatus();
    
    // Initialize vaccination notifications
    initializeVaccinationNotifications();
}

// Language Management
function initializeLanguage() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.id === 'lang-en' ? 'en' : 'bn';
            switchLanguage(lang);
        });
    });
    
    // Apply current language
    updateLanguageDisplay();
}

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    
    // Update all text elements
    updateLanguageDisplay();
    
    // Save preference
    localStorage.setItem('preferredLanguage', lang);
}

function updateLanguageDisplay() {
    const elements = document.querySelectorAll('[data-en], [data-bn]');
    
    elements.forEach(element => {
        const text = element.getAttribute(`data-${currentLanguage}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    // Update placeholders
    const placeholderElements = document.querySelectorAll('[data-placeholder-en], [data-placeholder-bn]');
    placeholderElements.forEach(element => {
        const placeholder = element.getAttribute(`data-placeholder-${currentLanguage}`);
        if (placeholder) {
            element.placeholder = placeholder;
        }
    });
}

// Theme Management
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Apply current theme
    applyTheme();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme();
    localStorage.setItem('preferredTheme', currentTheme);
}

function applyTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    
    if (currentTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    } else {
        body.removeAttribute('data-theme');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
}

// Mobile Menu
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger menu
            const spans = this.querySelectorAll('span');
            spans.forEach((span, index) => {
                span.style.transform = navMenu.classList.contains('active') 
                    ? `rotate(${index === 1 ? 45 : -45}deg) translate(${index === 0 ? '5px, 5px' : index === 2 ? '-5px, -5px' : '0'})` 
                    : 'none';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                const spans = mobileToggle.querySelectorAll('span');
                spans.forEach(span => span.style.transform = 'none');
            }
        });
    }
}

// Modal Management
function initializeModals() {
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('fade-in');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('fade-in');
    }
}

function showLoginModal() {
    showModal('loginModal');
}

function showSignupModal() {
    showModal('signupModal');
}

function showComplaintModal() {
    showModal('complaintModal');
}

function showVaccinationPopup() {
    showModal('vaccinationModal');
}

function showBirthCertificateModal() {
    showModal('birthCertificateModal');
}

function showDeathCertificateModal() {
    showModal('deathCertificateModal');
}

function showSwasthyaSathiModal() {
    showModal('swasthyaSathiModal');
}

// Authentication
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simulate login process
    if (email && password) {
        // In a real application, this would make an API call
        isLoggedIn = true;
        currentUser = {
            email: email,
            name: email.split('@')[0] // Simple name extraction
        };
        
        // Save login status
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update UI
        updateAuthUI();
        
        // Close modal
        closeModal('loginModal');
        
        // Show success notification
        showNotification(
            currentLanguage === 'en' ? 'Login successful!' : 'লগইন সফল!',
            'success'
        );
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    
    // Simulate signup process
    if (name && email && phone && password) {
        // In a real application, this would make an API call
        const userData = {
            name: name,
            email: email,
            phone: phone,
            registrationDate: new Date().toISOString()
        };
        
        // Save user data
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Auto login after signup
        isLoggedIn = true;
        currentUser = userData;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update UI
        updateAuthUI();
        
        // Close modal
        closeModal('signupModal');
        
        // Show success notification
        showNotification(
            currentLanguage === 'en' ? 'Account created successfully!' : 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!',
            'success'
        );
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

function logout() {
    isLoggedIn = false;
    currentUser = null;
    
    // Clear storage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    
    // Update UI
    updateAuthUI();
    
    // Show notification
    showNotification(
        currentLanguage === 'en' ? 'Logged out successfully!' : 'সফলভাবে লগ আউট হয়েছে!',
        'success'
    );
    
    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function checkLoginStatus() {
    const savedLoginStatus = localStorage.getItem('isLoggedIn');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedLoginStatus === 'true' && savedUser) {
        isLoggedIn = true;
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
}

function updateAuthUI() {
    const authButtons = document.querySelector('.auth-buttons');
    
    if (authButtons) {
        if (isLoggedIn && currentUser) {
            authButtons.innerHTML = `
                <div class="user-menu">
                    <span>Welcome, ${currentUser.name}</span>
                    <button class="btn btn-outline" onclick="logout()" data-en="Logout" data-bn="লগ আউট">Logout</button>
                </div>
            `;
        } else {
            authButtons.innerHTML = `
                <button class="btn btn-outline" onclick="showLoginModal()" data-en="Login" data-bn="লগইন">Login</button>
                <button class="btn btn-primary" onclick="showSignupModal()" data-en="Sign Up" data-bn="সাইন আপ">Sign Up</button>
            `;
        }
        
        // Update language display for new elements
        updateLanguageDisplay();
    }
}

// Complaint Handling
function handleComplaint(event) {
    event.preventDefault();
    
    const name = document.getElementById('complaintName').value;
    const phone = document.getElementById('complaintPhone').value;
    const category = document.getElementById('complaintCategory').value;
    const details = document.getElementById('complaintDetails').value;
    
    if (name && phone && category && details) {
        // Generate complaint ID
        const complaintId = 'CMP' + Date.now().toString().slice(-6);
        
        const complaintData = {
            id: complaintId,
            name: name,
            phone: phone,
            category: category,
            details: details,
            status: 'submitted',
            submissionDate: new Date().toISOString()
        };
        
        // Save complaint data
        const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        complaints.push(complaintData);
        localStorage.setItem('complaints', JSON.stringify(complaints));
        
        // Close modal
        closeModal('complaintModal');
        
        // Show success notification
        showNotification(
            currentLanguage === 'en' 
                ? `Complaint submitted successfully! Reference ID: ${complaintId}` 
                : `অভিযোগ সফলভাবে জমা দেওয়া হয়েছে! রেফারেন্স আইডি: ${complaintId}`,
            'success'
        );
        
        // Reset form
        document.getElementById('complaintForm').reset();
    }
}

// Service Applications
function handleBirthCertificate(event) {
    event.preventDefault();
    
    const childName = document.getElementById('childName').value;
    const childDob = document.getElementById('childDob').value;
    const fatherName = document.getElementById('fatherName').value;
    const motherName = document.getElementById('motherName').value;
    const contactPhone = document.getElementById('birthContactPhone').value;
    const hospitalRegNumber = document.getElementById('hospitalRegNumber').value;
    
    if (childName && childDob && fatherName && motherName && contactPhone && hospitalRegNumber) {
        const applicationId = 'BC' + Date.now().toString().slice(-6);
        
        const applicationData = {
            id: applicationId,
            type: 'birth_certificate',
            childName: childName,
            childDob: childDob,
            fatherName: fatherName,
            motherName: motherName,
            contactPhone: contactPhone,
            hospitalRegNumber: hospitalRegNumber,
            status: 'submitted',
            submissionDate: new Date().toISOString(),
            estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
        };
        
        // Save application data
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        applications.push(applicationData);
        localStorage.setItem('applications', JSON.stringify(applications));
        
        // Close modal
        closeModal('birthCertificateModal');
        
        // Show success notification
        showNotification(
            currentLanguage === 'en' 
                ? `Birth certificate application submitted! Reference ID: ${applicationId}` 
                : `জন্ম সনদের আবেদন জমা দেওয়া হয়েছে! রেফারেন্স আইডি: ${applicationId}`,
            'success'
        );
        
        // Reset form
        document.getElementById('birthCertificateForm').reset();
    }
}

function handleDeathCertificate(event) {
    event.preventDefault();
    
    const deceasedName = document.getElementById('deceasedName').value;
    const deathDate = document.getElementById('deathDate').value;
    const deathCause = document.getElementById('deathCause').value;
    const applicantName = document.getElementById('applicantName').value;
    const relationship = document.getElementById('relationship').value;
    const contactPhone = document.getElementById('deathContactPhone').value;
    
    if (deceasedName && deathDate && deathCause && applicantName && relationship && contactPhone) {
        const applicationId = 'DC' + Date.now().toString().slice(-6);
        
        const applicationData = {
            id: applicationId,
            type: 'death_certificate',
            deceasedName: deceasedName,
            deathDate: deathDate,
            deathCause: deathCause,
            applicantName: applicantName,
            relationship: relationship,
            contactPhone: contactPhone,
            status: 'submitted',
            submissionDate: new Date().toISOString(),
            estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days
        };
        
        // Save application data
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        applications.push(applicationData);
        localStorage.setItem('applications', JSON.stringify(applications));
        
        // Close modal
        closeModal('deathCertificateModal');
        
        // Show success notification
        showNotification(
            currentLanguage === 'en' 
                ? `Death certificate application submitted! Reference ID: ${applicationId}` 
                : `মৃত্যু সনদের আবেদন জমা দেওয়া হয়েছে! রেফারেন্স আইডি: ${applicationId}`,
            'success'
        );
        
        // Reset form
        document.getElementById('deathCertificateForm').reset();
    }
}

function handleSwasthyaSathi(event) {
    event.preventDefault();
    
    const familyHeadName = document.getElementById('familyHeadName').value;
    const aadhaarNumber = document.getElementById('aadhaarNumber').value;
    const rationCardNumber = document.getElementById('rationCardNumber').value;
    const annualIncome = document.getElementById('annualIncome').value;
    const familyMembers = document.getElementById('familyMembers').value;
    const contactPhone = document.getElementById('swasthyaContactPhone').value;
    const address = document.getElementById('address').value;
    
    if (familyHeadName && aadhaarNumber && rationCardNumber && annualIncome && familyMembers && contactPhone && address) {
        const applicationId = 'SS' + Date.now().toString().slice(-6);
        
        const applicationData = {
            id: applicationId,
            type: 'swasthya_sathi',
            familyHeadName: familyHeadName,
            aadhaarNumber: aadhaarNumber,
            rationCardNumber: rationCardNumber,
            annualIncome: annualIncome,
            familyMembers: familyMembers,
            contactPhone: contactPhone,
            address: address,
            status: 'submitted',
            submissionDate: new Date().toISOString(),
            estimatedCompletion: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days
        };
        
        // Save application data
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        applications.push(applicationData);
        localStorage.setItem('applications', JSON.stringify(applications));
        
        // Close modal
        closeModal('swasthyaSathiModal');
        
        // Show success notification
        showNotification(
            currentLanguage === 'en' 
                ? `Swasthya Sathi registration submitted! Reference ID: ${applicationId}` 
                : `স্বাস্থ্য সাথী নিবন্ধন জমা দেওয়া হয়েছে! রেফারেন্স আইডি: ${applicationId}`,
            'success'
        );
        
        // Reset form
        document.getElementById('swasthyaSathiForm').reset();
    }
}

// Vaccination
function scheduleVaccination() {
    if (!isLoggedIn) {
        showNotification(
            currentLanguage === 'en' ? 'Please login to schedule vaccination' : 'টিকাকরণের সময় নির্ধারণ করতে লগইন করুন',
            'warning'
        );
        closeModal('vaccinationModal');
        showLoginModal();
        return;
    }
    
    // Redirect to appointment page with vaccination pre-selected
    localStorage.setItem('preSelectedService', 'vaccination');
    window.location.href = 'appointment.html';
}

// Emergency Services
function callAmbulance() {
    const phoneNumber = '+91-8000-XXXX';
    
    // Show confirmation dialog
    const confirmCall = confirm(
        currentLanguage === 'en' 
            ? `Call ambulance at ${phoneNumber}?` 
            : `${phoneNumber} নম্বরে অ্যাম্বুলেন্স কল করবেন?`
    );
    
    if (confirmCall) {
        // In a real application, this would initiate a call
        window.open(`tel:${phoneNumber}`);
        
        // Show notification
        showNotification(
            currentLanguage === 'en' ? 'Calling ambulance...' : 'অ্যাম্বুলেন্স কল করা হচ্ছে...',
            'success'
        );
    }
}

// Notifications
function initializeNotifications() {
    // Auto-hide notifications after 5 seconds
    const notification = document.getElementById('notification');
    if (notification) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (notification.style.display === 'flex') {
                        setTimeout(() => {
                            if (notification.style.display === 'flex') {
                                closeNotification();
                            }
                        }, 5000);
                    }
                }
            });
        });
        
        observer.observe(notification, { attributes: true });
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notificationMessage');
    
    if (notification && messageElement) {
        messageElement.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'flex';
        notification.classList.add('fade-in');
    }
}

function closeNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.style.display = 'none';
        notification.classList.remove('fade-in');
    }
}

// Vaccination Notifications
function initializeVaccinationNotifications() {
    // Check if user has vaccination reminders
    const vaccinationReminders = JSON.parse(localStorage.getItem('vaccinationReminders') || '[]');
    const today = new Date().toDateString();
    
    vaccinationReminders.forEach(reminder => {
        const reminderDate = new Date(reminder.date).toDateString();
        if (reminderDate === today && !reminder.notified) {
            setTimeout(() => {
                showNotification(
                    currentLanguage === 'en' 
                        ? `Vaccination reminder: ${reminder.vaccine} is due today!` 
                        : `টিকাকরণ অনুস্মারক: ${reminder.vaccine} আজ নেওয়ার সময়!`,
                    'warning'
                );
                
                // Mark as notified
                reminder.notified = true;
                localStorage.setItem('vaccinationReminders', JSON.stringify(vaccinationReminders));
            }, 2000);
        }
    });
}

// Utility Functions
function setMinimumDate() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        if (input.id === 'appointmentDate') {
            input.min = today;
        }
    });
}

function loadUserPreferences() {
    // Load language preference
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
    }
    
    // Load theme preference
    const savedTheme = localStorage.getItem('preferredTheme');
    if (savedTheme) {
        currentTheme = savedTheme;
    }
}

// Book appointment from doctor card
function bookAppointment(doctorName) {
    localStorage.setItem('preSelectedDoctor', doctorName);
    window.location.href = 'appointment.html';
}

// Search functionality (can be extended)
function searchContent(query) {
    // This is a basic search implementation
    // In a real application, this would search through content
    console.log('Searching for:', query);
}

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[+]?[\d\s\-\(\)]{10,}$/;
    return re.test(phone);
}

// Export functions for use in other files
window.hospitalApp = {
    showModal,
    closeModal,
    showNotification,
    switchLanguage,
    toggleTheme,
    callAmbulance,
    bookAppointment,
    scheduleVaccination,
    currentLanguage: () => currentLanguage,
    currentTheme: () => currentTheme,
    isLoggedIn: () => isLoggedIn,
    currentUser: () => currentUser
};