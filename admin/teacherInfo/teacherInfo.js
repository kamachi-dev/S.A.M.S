function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const teacherCards = document.querySelectorAll('.teacher-card');
    const subjectFilter = document.getElementById('subjectFilter');
    const subjectSections = document.querySelectorAll('.subject-section');
    const teacherCountElement = document.querySelector('.count-number');
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            let visibleCount = 0;
            
            teacherCards.forEach(card => {
                const teacherName = card.querySelector('.teacher-name').textContent.toLowerCase();
                const teacherId = card.querySelector('.teacher-id').textContent.toLowerCase();
                const phoneNumber = card.querySelector('.phone-number').textContent.toLowerCase();
                const emailAddress = card.querySelector('.email-address').textContent.toLowerCase();
                
                const isVisible = teacherName.includes(searchTerm) || 
                    teacherId.includes(searchTerm) || 
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
                teacherCountElement.textContent = visibleCount;
            } else {
                updateTeacherCount();
            }
        });
    }
    
    // Subject filter functionality
    if (subjectFilter) {
        subjectFilter.addEventListener('change', function() {
            const selectedSubject = this.value;
            
            if (selectedSubject === 'all') {
                // Show all sections and cards
                subjectSections.forEach(section => {
                    section.classList.remove('hidden');
                });
                teacherCards.forEach(card => {
                    card.classList.remove('hidden');
                    card.style.display = 'flex';
                });
            } else {
                // Hide all sections first
                subjectSections.forEach(section => {
                    section.classList.add('hidden');
                });
                
                // Show only the selected subject section
                const targetSection = document.querySelector(`[data-subject="${selectedSubject}"]`);
                if (targetSection) {
                    targetSection.classList.remove('hidden');
                }
                
                // Hide all cards first, then show only matching ones
                teacherCards.forEach(card => {
                    if (card.dataset.subject === selectedSubject) {
                        card.classList.remove('hidden');
                        card.style.display = 'flex';
                    } else {
                        card.classList.add('hidden');
                        card.style.display = 'none';
                    }
                });
            }
            
            // Update teacher count
            updateTeacherCount();
            
            // Clear search when filter changes
            if (searchInput) {
                searchInput.value = '';
            }
        });
    }
    
    function updateTeacherCount() {
        const visibleCards = document.querySelectorAll('.teacher-card:not(.hidden)');
        teacherCountElement.textContent = visibleCards.length;
    }
    
    // Initialize count
    updateTeacherCount();
});

// Mobile menu functionality (inherited from general.js)
// Additional teacher info specific functionality can be added here