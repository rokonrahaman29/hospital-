// Pharmacy functionality including search and filtering

// Sample medicines data
const medicinesData = [
    // Prescription Medicines
    { name: 'Amoxicillin', category: 'prescription', type: 'Antibiotic', price: 45, available: true, description: 'Bacterial infection treatment' },
    { name: 'Azithromycin', category: 'prescription', type: 'Antibiotic', price: 125, available: true, description: 'Broad-spectrum antibiotic' },
    { name: 'Ciprofloxacin', category: 'prescription', type: 'Antibiotic', price: 85, available: true, description: 'Quinolone antibiotic' },
    { name: 'Atenolol', category: 'prescription', type: 'Cardiac', price: 35, available: true, description: 'Beta-blocker for hypertension' },
    { name: 'Amlodipine', category: 'prescription', type: 'Cardiac', price: 25, available: true, description: 'Calcium channel blocker' },
    { name: 'Metformin', category: 'chronic', type: 'Diabetes', price: 30, available: true, description: 'Type 2 diabetes medication' },
    { name: 'Insulin', category: 'chronic', type: 'Diabetes', price: 450, available: true, description: 'Hormone for diabetes management' },
    
    // OTC Medicines
    { name: 'Paracetamol', category: 'otc', type: 'Pain Relief', price: 15, available: true, description: 'Pain and fever relief' },
    { name: 'Ibuprofen', category: 'otc', type: 'Pain Relief', price: 25, available: true, description: 'Anti-inflammatory pain relief' },
    { name: 'Aspirin', category: 'otc', type: 'Pain Relief', price: 20, available: true, description: 'Pain relief and blood thinner' },
    { name: 'Omeprazole', category: 'otc', type: 'Digestive', price: 55, available: true, description: 'Acid reflux treatment' },
    { name: 'Antacid', category: 'otc', type: 'Digestive', price: 35, available: true, description: 'Stomach acid neutralizer' },
    { name: 'ORS', category: 'otc', type: 'Digestive', price: 8, available: true, description: 'Oral rehydration salts' },
    
    // Emergency Medicines
    { name: 'Adrenaline', category: 'emergency', type: 'Emergency', price: 250, available: true, description: 'Emergency epinephrine' },
    { name: 'Atropine', category: 'emergency', type: 'Emergency', price: 180, available: true, description: 'Anticholinergic agent' },
    { name: 'Dopamine', category: 'emergency', type: 'Emergency', price: 320, available: false, description: 'Cardiovascular support' },
    { name: 'Naloxone', category: 'emergency', type: 'Emergency', price: 890, available: true, description: 'Opioid overdose reversal' }
];

// Medical supplies data
const suppliesData = [
    { name: 'Blood Glucose Test Strips', category: 'diagnostic', price: 450, available: true },
    { name: 'Pregnancy Test Kit', category: 'diagnostic', price: 85, available: true },
    { name: 'Digital Thermometer', category: 'diagnostic', price: 350, available: true },
    { name: 'BP Monitor', category: 'diagnostic', price: 2500, available: true },
    { name: 'Bandages', category: 'firstaid', price: 25, available: true },
    { name: 'Antiseptic Solution', category: 'firstaid', price: 45, available: true },
    { name: 'Surgical Tape', category: 'firstaid', price: 35, available: true },
    { name: 'Disposable Gloves', category: 'firstaid', price: 120, available: true },
    { name: 'Hand Sanitizer', category: 'personal', price: 85, available: true },
    { name: 'Face Masks (Box)', category: 'personal', price: 150, available: true },
    { name: 'Baby Formula', category: 'baby', price: 650, available: true },
    { name: 'Diapers (Pack)', category: 'baby', price: 480, available: true }
];

let currentFilter = 'all';
let searchResults = [];

// Initialize pharmacy page
document.addEventListener('DOMContentLoaded', function() {
    setupPharmacySearch();
    setupCategoryFilters();
    displayMedicines(medicinesData);
});

// Setup pharmacy search functionality
function setupPharmacySearch() {
    // Create search section if it doesn't exist
    if (!document.querySelector('.pharmacy-search')) {
        createSearchSection();
    }
    
    const searchInput = document.getElementById('medicineSearch');
    const searchButton = document.getElementById('searchButton');
    const clearButton = document.getElementById('clearSearch');
    
    if (searchInput) {
        // Real-time search as user types
        searchInput.addEventListener('input', function() {
            performSearch(this.value);
        });
        
        // Search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const searchTerm = searchInput.value;
            performSearch(searchTerm);
        });
    }
    
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            clearSearch();
        });
    }
}

// Create search section HTML
function createSearchSection() {
    const pharmacyOverview = document.querySelector('.pharmacy-overview');
    if (pharmacyOverview) {
        const searchHTML = `
            <section class="pharmacy-search">
                <div class="container">
                    <h2 data-en="Search Medicines & Supplies" data-bn="ওষুধ এবং সরবরাহ খুঁজুন">Search Medicines & Supplies</h2>
                    <div class="search-container">
                        <div class="search-box">
                            <input type="text" id="medicineSearch" placeholder="Search for medicines, supplies..." 
                                   data-placeholder-en="Search for medicines, supplies..." 
                                   data-placeholder-bn="ওষুধ, সরবরাহ খুঁজুন...">
                            <button id="searchButton" class="btn btn-primary">
                                <i class="fas fa-search"></i>
                                <span data-en="Search" data-bn="খুঁজুন">Search</span>
                            </button>
                            <button id="clearSearch" class="btn btn-outline" style="display: none;">
                                <i class="fas fa-times"></i>
                                <span data-en="Clear" data-bn="পরিষ্কার">Clear</span>
                            </button>
                        </div>
                        <div class="search-filters">
                            <label>
                                <input type="checkbox" id="filterAvailable" checked>
                                <span data-en="Available only" data-bn="শুধুমাত্র উপলব্ধ">Available only</span>
                            </label>
                            <select id="priceRange">
                                <option value="all" data-en="All prices" data-bn="সব দাম">All prices</option>
                                <option value="0-50" data-en="Under ₹50" data-bn="₹৫০ এর নিচে">Under ₹50</option>
                                <option value="50-200" data-en="₹50 - ₹200" data-bn="₹৫০ - ₹২০০">₹50 - ₹200</option>
                                <option value="200-500" data-en="₹200 - ₹500" data-bn="₹২০০ - ₹৫০০">₹200 - ₹500</option>
                                <option value="500+" data-en="Above ₹500" data-bn="₹৫০০ এর উপরে">Above ₹500</option>
                            </select>
                        </div>
                    </div>
                    <div id="searchResults" class="search-results" style="display: none;"></div>
                </div>
            </section>
        `;
        
        pharmacyOverview.insertAdjacentHTML('afterend', searchHTML);
        
        // Add event listeners for filters
        document.getElementById('filterAvailable').addEventListener('change', function() {
            if (document.getElementById('medicineSearch').value) {
                performSearch(document.getElementById('medicineSearch').value);
            }
        });
        
        document.getElementById('priceRange').addEventListener('change', function() {
            if (document.getElementById('medicineSearch').value) {
                performSearch(document.getElementById('medicineSearch').value);
            }
        });
    }
}

// Perform search
function performSearch(searchTerm) {
    const searchInput = document.getElementById('medicineSearch');
    const clearButton = document.getElementById('clearSearch');
    const resultsContainer = document.getElementById('searchResults');
    
    if (!searchTerm || searchTerm.trim() === '') {
        clearSearch();
        return;
    }
    
    // Show clear button
    if (clearButton) {
        clearButton.style.display = 'inline-block';
    }
    
    // Filter medicines and supplies
    const availableOnly = document.getElementById('filterAvailable')?.checked || false;
    const priceRange = document.getElementById('priceRange')?.value || 'all';
    
    // Search in medicines
    let results = medicinesData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesAvailability = !availableOnly || item.available;
        const matchesPrice = checkPriceRange(item.price, priceRange);
        
        return matchesSearch && matchesAvailability && matchesPrice;
    });
    
    // Add supplies to results
    const supplyResults = suppliesData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesAvailability = !availableOnly || item.available;
        const matchesPrice = checkPriceRange(item.price, priceRange);
        
        return matchesSearch && matchesAvailability && matchesPrice;
    });
    
    results = results.concat(supplyResults.map(item => ({...item, type: item.category})));
    
    // Display results
    displaySearchResults(results, searchTerm);
}

// Check if price falls within selected range
function checkPriceRange(price, range) {
    switch (range) {
        case '0-50': return price < 50;
        case '50-200': return price >= 50 && price <= 200;
        case '200-500': return price >= 200 && price <= 500;
        case '500+': return price > 500;
        default: return true;
    }
}

// Display search results
function displaySearchResults(results, searchTerm) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (!resultsContainer) return;
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>No medicines or supplies found for "${searchTerm}". Please try a different search term.</p>
            </div>
        `;
    } else {
        const resultsHTML = `
            <div class="results-header">
                <h3>${results.length} result(s) found for "${searchTerm}"</h3>
            </div>
            <div class="results-grid">
                ${results.map(item => createSearchResultItem(item)).join('')}
            </div>
        `;
        resultsContainer.innerHTML = resultsHTML;
    }
    
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Create search result item HTML
function createSearchResultItem(item) {
    const availabilityClass = item.available ? 'available' : 'unavailable';
    const availabilityText = item.available ? 'Available' : 'Out of Stock';
    const prescriptionNote = item.category === 'prescription' ? '<span class="prescription-required">Prescription Required</span>' : '';
    
    return `
        <div class="search-result-item ${availabilityClass}">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p class="item-type">${item.type}</p>
                ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                ${prescriptionNote}
            </div>
            <div class="item-details">
                <div class="item-price">₹${item.price}</div>
                <div class="item-availability ${availabilityClass}">
                    <i class="fas ${item.available ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    ${availabilityText}
                </div>
                ${item.available ? `<button class="btn btn-sm btn-primary" onclick="contactPharmacy('${item.name}')">Contact Pharmacy</button>` : ''}
            </div>
        </div>
    `;
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('medicineSearch');
    const clearButton = document.getElementById('clearSearch');
    const resultsContainer = document.getElementById('searchResults');
    
    if (searchInput) searchInput.value = '';
    if (clearButton) clearButton.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'none';
}

// Contact pharmacy for specific medicine
function contactPharmacy(medicineName) {
    showNotification(`To inquire about ${medicineName}, please call our pharmacy at +91-8000-XXXX (Ext: 101)`, 'info');
}

// Setup category filters
function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get selected category
            const category = this.getAttribute('data-category');
            currentFilter = category;
            
            // Filter and display medicines
            filterMedicines(category);
        });
    });
}

// Filter medicines by category
function filterMedicines(category) {
    const medicineCards = document.querySelectorAll('.medicine-card');
    
    medicineCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Display medicines (if needed for dynamic content)
function displayMedicines(medicines) {
    // This function can be used if you want to dynamically populate medicine cards
    // For now, the medicines are statically in the HTML
}

// Add styles for search functionality
const searchStyles = `
<style>
.pharmacy-search {
    background: #f8f9fa;
    padding: 3rem 0;
}

.search-container {
    max-width: 800px;
    margin: 0 auto;
}

.search-box {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.search-box input {
    flex: 1;
    padding: 1rem;
    border: 2px solid #e9ecef;
    border-radius: 0.5rem;
    font-size: 1rem;
}

.search-box input:focus {
    border-color: var(--primary-color);
    outline: none;
}

.search-filters {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.search-filters label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.search-filters select {
    padding: 0.5rem;
    border: 1px solid #e9ecef;
    border-radius: 0.25rem;
}

.search-results {
    margin-top: 2rem;
    padding: 2rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.results-header h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.results-grid {
    display: grid;
    gap: 1rem;
}

.search-result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 1px solid #e9ecef;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
}

.search-result-item:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
}

.search-result-item.unavailable {
    opacity: 0.6;
    background: #f8f9fa;
}

.item-info h4 {
    margin: 0 0 0.25rem 0;
    color: var(--dark-color);
}

.item-type {
    color: var(--secondary-color);
    font-size: 0.875rem;
    margin: 0;
}

.item-description {
    color: #6c757d;
    font-size: 0.875rem;
    margin: 0.25rem 0;
}

.prescription-required {
    background: #fff3cd;
    color: #856404;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
}

.item-details {
    text-align: right;
}

.item-price {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.item-availability {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
}

.item-availability.available {
    color: #28a745;
}

.item-availability.unavailable {
    color: #dc3545;
}

.no-results {
    text-align: center;
    padding: 3rem;
    color: #6c757d;
}

.no-results i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

@media (max-width: 768px) {
    .search-box {
        flex-direction: column;
    }
    
    .search-result-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .item-details {
        text-align: left;
        width: 100%;
    }
}
</style>
`;

// Add styles to head
document.head.insertAdjacentHTML('beforeend', searchStyles);