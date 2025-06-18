// Doctors page specific functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeDoctorsPage();
});

function initializeDoctorsPage() {
    initializeDepartmentFilter();
    loadDoctorsData();
}

// Department filtering
function initializeDepartmentFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get selected department
            const selectedDepartment = this.getAttribute('data-department');
            
            // Filter doctors
            filterDoctors(selectedDepartment);
        });
    });
}

function filterDoctors(department) {
    const doctorCards = document.querySelectorAll('.doctor-card');
    
    doctorCards.forEach(card => {
        const cardDepartment = card.getAttribute('data-department');
        
        if (department === 'all' || cardDepartment === department) {
            card.style.display = 'block';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
            card.classList.remove('fade-in');
        }
    });
}

// Load doctors data (in a real app, this would come from an API)
function loadDoctorsData() {
    const doctorsData = [
        {
            id: 1,
            name: 'Dr. Rajesh Kumar',
            nameBn: 'ডাঃ রাজেশ কুমার',
            specialty: 'General Medicine',
            specialtyBn: 'সাধারণ চিকিৎসা',
            qualification: 'MBBS, MD (Medicine)',
            qualificationBn: 'এমবিবিএস, এমডি (মেডিসিন)',
            experience: '15 Years Experience',
            experienceBn: '১৫ বছরের অভিজ্ঞতা',
            schedule: 'Mon-Fri 9AM-5PM',
            scheduleBn: 'সোম-শুক্র সকাল ৯টা-বিকাল ৫টা',
            department: 'general',
            image: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg',
            available: true
        },
        {
            id: 2,
            name: 'Dr. Priya Sharma',
            nameBn: 'ডাঃ প্রিয়া শর্মা',
            specialty: 'Cardiologist',
            specialtyBn: 'হৃদরোগ বিশেষজ্ঞ',
            qualification: 'MBBS, MD, DM (Cardiology)',
            qualificationBn: 'এমবিবিএস, এমডি, ডিএম (কার্ডিওলজি)',
            experience: '12 Years Experience',
            experienceBn: '১২ বছরের অভিজ্ঞতা',
            schedule: 'Tue-Sat 10AM-4PM',
            scheduleBn: 'মঙ্গল-শনি সকাল ১০টা-বিকাল ৪টা',
            department: 'cardiology',
            image: 'https://images.pexels.com/photos/6749769/pexels-photo-6749769.jpeg',
            available: true
        },
        {
            id: 3,
            name: 'Dr. Amit Singh',
            nameBn: 'ডাঃ অমিত সিং',
            specialty: 'Orthopedic Surgeon',
            specialtyBn: 'অর্থোপেডিক সার্জন',
            qualification: 'MBBS, MS (Orthopedics)',
            qualificationBn: 'এমবিবিএস, এমএস (অর্থোপেডিক্স)',
            experience: '18 Years Experience',
            experienceBn: '১৮ বছরের অভিজ্ঞতা',
            schedule: 'Mon-Thu 8AM-3PM',
            scheduleBn: 'সোম-বৃহ সকাল ৮টা-বিকাল ৩টা',
            department: 'orthopedic',
            image: 'https://images.pexels.com/photos/5214949/pexels-photo-5214949.jpeg',
            available: true
        },
        {
            id: 4,
            name: 'Dr. Sunita Devi',
            nameBn: 'ডাঃ সুনিতা দেবী',
            specialty: 'Pediatrician',
            specialtyBn: 'শিশু চিকিৎসক',
            qualification: 'MBBS, MD (Pediatrics)',
            qualificationBn: 'এমবিবিএস, এমডি (পেডিয়াট্রিক্স)',
            experience: '10 Years Experience',
            experienceBn: '১০ বছরের অভিজ্ঞতা',
            schedule: 'Mon-Sat 9AM-6PM',
            scheduleBn: 'সোম-শনি সকাল ৯টা-সন্ধ্যা ৬টা',
            department: 'pediatric',
            image: 'https://images.pexels.com/photos/5998474/pexels-photo-5998474.jpeg',
            available: true
        },
        {
            id: 5,
            name: 'Dr. Meena Jha',
            nameBn: 'ডাঃ মীনা ঝা',
            specialty: 'Gynecologist',
            specialtyBn: 'স্ত্রীরোগ বিশেষজ্ঞ',
            qualification: 'MBBS, MS (Gynecology)',
            qualificationBn: 'এমবিবিএস, এমএস (গাইনোকোলজি)',
            experience: '14 Years Experience',
            experienceBn: '১৪ বছরের অভিজ্ঞতা',
            schedule: 'Wed-Sun 10AM-5PM',
            scheduleBn: 'বুধ-রবি সকাল ১০টা-বিকাল ৫টা',
            department: 'gynecology',
            image: 'https://images.pexels.com/photos/5214997/pexels-photo-5214997.jpeg',
            available: true
        },
        {
            id: 6,
            name: 'Dr. Vikash Kumar',
            nameBn: 'ডাঃ বিকাশ কুমার',
            specialty: 'Emergency Medicine',
            specialtyBn: 'জরুরি চিকিৎসা',
            qualification: 'MBBS, MD (Emergency Medicine)',
            qualificationBn: 'এমবিবিএস, এমডি (জরুরি চিকিৎসা)',
            experience: '8 Years Experience',
            experienceBn: '৮ বছরের অভিজ্ঞতা',
            schedule: '24/7 Emergency',
            scheduleBn: '২৪/৭ জরুরি',
            department: 'general',
            image: 'https://images.pexels.com/photos/5214954/pexels-photo-5214954.jpeg',
            available: true
        }
    ];
    
    // Store doctors data for use in appointment booking
    localStorage.setItem('doctorsData', JSON.stringify(doctorsData));
}

// Get doctor by ID
function getDoctorById(doctorId) {
    const doctorsData = JSON.parse(localStorage.getItem('doctorsData') || '[]');
    return doctorsData.find(doctor => doctor.id === parseInt(doctorId));
}

// Get doctors by department
function getDoctorsByDepartment(department) {
    const doctorsData = JSON.parse(localStorage.getItem('doctorsData') || '[]');
    if (department === 'all') {
        return doctorsData;
    }
    return doctorsData.filter(doctor => doctor.department === department);
}

// Check doctor availability
function checkDoctorAvailability(doctorId, date, time) {
    // In a real application, this would check against a booking system
    const doctor = getDoctorById(doctorId);
    if (!doctor) return false;
    
    // Simple availability check (in real app, this would be more complex)
    const dayOfWeek = new Date(date).getDay();
    const hour = parseInt(time.split(':')[0]);
    
    // Basic schedule checking based on doctor's schedule
    switch (doctor.department) {
        case 'general':
            return dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour <= 17; // Mon-Fri 9AM-5PM
        case 'cardiology':
            return dayOfWeek >= 2 && dayOfWeek <= 6 && hour >= 10 && hour <= 16; // Tue-Sat 10AM-4PM
        case 'orthopedic':
            return dayOfWeek >= 1 && dayOfWeek <= 4 && hour >= 8 && hour <= 15; // Mon-Thu 8AM-3PM
        case 'pediatric':
            return dayOfWeek >= 1 && dayOfWeek <= 6 && hour >= 9 && hour <= 18; // Mon-Sat 9AM-6PM
        case 'gynecology':
            return dayOfWeek >= 3 && dayOfWeek <= 0 && hour >= 10 && hour <= 17; // Wed-Sun 10AM-5PM
        default:
            return true; // Emergency doctors are always available
    }
}

// Search doctors
function searchDoctors(query) {
    const doctorsData = JSON.parse(localStorage.getItem('doctorsData') || '[]');
    const searchTerm = query.toLowerCase();
    
    return doctorsData.filter(doctor => 
        doctor.name.toLowerCase().includes(searchTerm) ||
        doctor.specialty.toLowerCase().includes(searchTerm) ||
        doctor.qualification.toLowerCase().includes(searchTerm)
    );
}

// Export functions for use in other files
window.doctorsModule = {
    getDoctorById,
    getDoctorsByDepartment,
    checkDoctorAvailability,
    searchDoctors,
    filterDoctors
};