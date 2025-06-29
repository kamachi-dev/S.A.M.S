function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const studentCards = document.querySelectorAll('.student-card');
    const gradeFilter = document.getElementById('gradeFilter');
    const sectionFilter = document.getElementById('sectionFilter');
    const gradeSections = document.querySelectorAll('.grade-section');
    const studentCountElement = document.querySelector('.count-number');
    
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
                    section.style.display = 'block';
                });
                studentCards.forEach(card => {
                    card.classList.remove('hidden');
                    card.style.display = 'flex';
                });
            } else {
                // Hide all sections first
                gradeSections.forEach(section => {
                    if (section.dataset.grade === selectedGrade) {
                        section.classList.remove('hidden');
                        section.style.display = 'block';
                    } else {
                        section.classList.add('hidden');
                        section.style.display = 'none';
                    }
                });
                
                // Hide all cards first, then show only matching ones
                studentCards.forEach(card => {
                    if (card.dataset.grade === selectedGrade) {
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
                    section.style.display = 'block';
                });
                studentCards.forEach(card => {
                    card.classList.remove('hidden');
                    card.style.display = 'flex';
                });
            } else {
                // Hide all sections first
                gradeSections.forEach(section => {
                    section.classList.add('hidden');
                    section.style.display = 'none';
                });
                
                // Show sections that have matching cards
                studentCards.forEach(card => {
                    if (card.dataset.section === selectedSection) {
                        // Show the parent section
                        const parentSection = card.closest('.grade-section');
                        if (parentSection) {
                            parentSection.classList.remove('hidden');
                            parentSection.style.display = 'block';
                        }
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