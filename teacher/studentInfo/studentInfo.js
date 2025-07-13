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
    
    // Combined filtering function
    function applyFilters() {
        const selectedGrade = gradeFilter.value;
        const selectedSection = sectionFilter.value;
        
        // Hide all sections first
        gradeSections.forEach(section => {
            section.classList.add('hidden');
            section.style.display = 'none';
        });
        
        // Hide all cards first
        studentCards.forEach(card => {
            card.classList.add('hidden');
            card.style.display = 'none';
        });
        
        // Apply combined filtering logic
        if (selectedGrade === 'all' && selectedSection === 'all') {
            // Show everything
            gradeSections.forEach(section => {
                section.classList.remove('hidden');
                section.style.display = 'block';
            });
            studentCards.forEach(card => {
                card.classList.remove('hidden');
                card.style.display = 'flex';
            });
        } else if (selectedGrade !== 'all' && selectedSection === 'all') {
            // Filter by grade only
            gradeSections.forEach(section => {
                if (section.dataset.grade === selectedGrade) {
                    section.classList.remove('hidden');
                    section.style.display = 'block';
                }
            });
            studentCards.forEach(card => {
                if (card.dataset.grade === selectedGrade) {
                    card.classList.remove('hidden');
                    card.style.display = 'flex';
                }
            });
        } else if (selectedGrade === 'all' && selectedSection !== 'all') {
            // Filter by section only
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
                }
            });
        } else {
            // Filter by both grade AND section
            studentCards.forEach(card => {
                if (card.dataset.grade === selectedGrade && card.dataset.section === selectedSection) {
                    // Show the parent section
                    const parentSection = card.closest('.grade-section');
                    if (parentSection) {
                        parentSection.classList.remove('hidden');
                        parentSection.style.display = 'block';
                    }
                    card.classList.remove('hidden');
                    card.style.display = 'flex';
                }
            });
        }
        
        // Update student count
        updateStudentCount();
        
        // Clear search when filters change
        if (searchInput) {
            searchInput.value = '';
        }
    }
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            let visibleCount = 0;
            
            studentCards.forEach(card => {
                const studentName = card.querySelector('.student-name').textContent.toLowerCase();
                
                const isVisible = studentName.includes(searchTerm);
                
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
            applyFilters();
        });
    }
    
    // Section filter functionality
    if (sectionFilter) {
        sectionFilter.addEventListener('change', function() {
            applyFilters();
        });
    }
    
    function updateStudentCount() {
        const visibleCards = document.querySelectorAll('.student-card:not(.hidden)');
        studentCountElement.textContent = visibleCards.length;
    }
    
    // Initialize count
    updateStudentCount();
});

// Modal functionality
function showStudentDetails(name, studentId, phone, email, gradeSection) {
    document.getElementById('modalName').textContent = name;
    document.getElementById('modalStudentId').textContent = studentId;
    document.getElementById('modalPhone').textContent = phone;
    document.getElementById('modalEmail').textContent = email;
    document.getElementById('modalGradeSection').textContent = gradeSection;
    document.getElementById('detailsModal').style.display = 'block';
}

function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('detailsModal');
    if (event.target === modal) {
        closeDetailsModal();
    }
});

// Mobile menu functionality (inherited from general.js)
// Additional student info specific functionality can be added here