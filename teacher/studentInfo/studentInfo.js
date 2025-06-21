function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const studentCards = document.querySelectorAll('.student-card');
    const gradeFilters = document.querySelectorAll('.filter-select');
    const gradeSections = document.querySelectorAll('.grade-section');
    const studentCountElement = document.querySelector('.count-number');
    
    // Get the specific filter dropdowns
    const gradeFilter = gradeFilters[0]; // First dropdown (Grade)
    const sectionFilter = gradeFilters[1]; // Second dropdown (Section)
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            let visibleCount = 0;
            
            studentCards.forEach(card => {
                const studentName = card.querySelector('.student-name').textContent.toLowerCase();
                const studentId = card.querySelector('.student-id').textContent.toLowerCase();
                const phoneNumber = card.querySelector('.phone-number').textContent.toLowerCase();
                const emailAddress = card.querySelector('.email-address').textContent.toLowerCase();
                
                const isVisible = studentName.includes(searchTerm) || 
                    studentId.includes(searchTerm) || 
                    phoneNumber.includes(searchTerm) ||
                    emailAddress.includes(searchTerm);
                
                if (isVisible && !card.classList.contains('hidden')) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Update count based on search results
            if (searchTerm) {
                studentCountElement.textContent = visibleCount;
            } else {
                updateStudentCount();
            }
        });
    }
    
    // Grade filter functionality
    if (gradeFilter) {
        gradeFilter.addEventListener('change', function() {
            const selectedGrade = this.value;
            
            if (selectedGrade === 'all') {
                // Show all sections and cards
                gradeSections.forEach(section => {
                    section.classList.remove('hidden');
                });
                studentCards.forEach(card => {
                    card.classList.remove('hidden');
                    card.style.display = 'flex';
                });
            } else {
                // Hide all sections first
                gradeSections.forEach(section => {
                    section.classList.add('hidden');
                });
                
                // Show sections that match the selected grade
                gradeSections.forEach(section => {
                    const sectionTitle = section.querySelector('.grade-title').textContent;
                    if (sectionTitle.includes(`Grade ${selectedGrade}`)) {
                        section.classList.remove('hidden');
                    }
                });
                
                // Hide all cards first, then show only matching ones
                studentCards.forEach(card => {
                    // Check if the card's parent section is visible
                    const parentSection = card.closest('.grade-section');
                    if (parentSection && !parentSection.classList.contains('hidden')) {
                        card.classList.remove('hidden');
                        card.style.display = 'flex';
                    } else {
                        card.classList.add('hidden');
                        card.style.display = 'none';
                    }
                });
            }
            
            // Update student count
            updateStudentCount();
            
            // Clear search when filter changes
            if (searchInput) {
                searchInput.value = '';
            }
        });
    }
    
    // Section filter functionality
    if (sectionFilter) {
        sectionFilter.addEventListener('change', function() {
            const selectedSection = this.value;
            
            if (selectedSection === 'all') {
                // Show all sections and cards
                gradeSections.forEach(section => {
                    section.classList.remove('hidden');
                });
                studentCards.forEach(card => {
                    card.classList.remove('hidden');
                    card.style.display = 'flex';
                });
            } else {
                // Hide all sections first
                gradeSections.forEach(section => {
                    section.classList.add('hidden');
                });
                
                // Show sections that match the selected section
                gradeSections.forEach(section => {
                    const sectionSubtitle = section.querySelector('.section-subtitle');
                    if (sectionSubtitle && sectionSubtitle.textContent.toLowerCase().includes(selectedSection)) {
                        section.classList.remove('hidden');
                    }
                });
                
                // Hide all cards first, then show only matching ones
                studentCards.forEach(card => {
                    // Check if the card's parent section is visible
                    const parentSection = card.closest('.grade-section');
                    if (parentSection && !parentSection.classList.contains('hidden')) {
                        card.classList.remove('hidden');
                        card.style.display = 'flex';
                    } else {
                        card.classList.add('hidden');
                        card.style.display = 'none';
                    }
                });
            }
            
            // Update student count
            updateStudentCount();
            
            // Clear search when filter changes
            if (searchInput) {
                searchInput.value = '';
            }
        });
    }
    
    function updateStudentCount() {
        const visibleCards = document.querySelectorAll('.student-card:not(.hidden)');
        studentCountElement.textContent = visibleCards.length;
    }
    
    // Initialize count
    updateStudentCount();
});

// Mobile menu functionality (inherited from general.js)
// Additional student info specific functionality can be added here