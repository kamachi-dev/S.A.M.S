function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const parentCards = document.querySelectorAll('.parent-card');
    const letterFilter = document.getElementById('letterFilter');
    const gradeFilter = document.getElementById('gradeFilter');
    const sectionFilter = document.getElementById('sectionFilter');
    const letterSections = document.querySelectorAll('.letter-section');
    const parentCountElement = document.querySelector('.count-number');
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            let visibleCount = 0;
            
            parentCards.forEach(card => {
                const parentName = card.querySelector('.parent-name').textContent.toLowerCase();
                const parentId = card.querySelector('.parent-id').textContent.toLowerCase();
                const phoneNumber = card.querySelector('.phone-number').textContent.toLowerCase();
                const emailAddress = card.querySelector('.email-address').textContent.toLowerCase();
                
                // Extract last name for search (everything after the last space)
                const nameParts = parentName.split(' ');
                const lastName = nameParts[nameParts.length - 1];
                
                const isVisible = parentName.includes(searchTerm) || 
                    lastName.includes(searchTerm) ||
                    parentId.includes(searchTerm) || 
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
                parentCountElement.textContent = visibleCount;
            } else {
                updateParentCount();
            }
        });
    }
    
    // Letter filter functionality
    if (letterFilter) {
        letterFilter.addEventListener('change', function() {
            const selectedLetter = this.value;
            
            if (selectedLetter === 'all') {
                // Show all sections and cards
                letterSections.forEach(section => {
                    section.classList.remove('hidden');
                });
                parentCards.forEach(card => {
                    card.classList.remove('hidden');
                    card.style.display = 'flex';
                });
            } else {
                // Hide all sections first
                letterSections.forEach(section => {
                    section.classList.add('hidden');
                });
                
                // Show only the selected letter section
                const targetSection = document.querySelector(`[data-letter="${selectedLetter}"]`);
                if (targetSection) {
                    targetSection.classList.remove('hidden');
                }
                
                // Hide all cards first, then show only matching ones
                parentCards.forEach(card => {
                    if (card.dataset.letter === selectedLetter) {
                        card.classList.remove('hidden');
                        card.style.display = 'flex';
                    } else {
                        card.classList.add('hidden');
                        card.style.display = 'none';
                    }
                });
            }
            
            // Update parent count
            updateParentCount();
            
            // Clear search when filter changes
            if (searchInput) {
                searchInput.value = '';
            }
        });
    }
    
    // Grade filter functionality (placeholder for future use)
    if (gradeFilter) {
        gradeFilter.addEventListener('change', function() {
            const selectedGrade = this.value;
            console.log('Grade filter selected:', selectedGrade);
            // Placeholder - functionality to be implemented later
            // For now, this doesn't affect the display
        });
    }
    
    // Section filter functionality (placeholder for future use)
    if (sectionFilter) {
        sectionFilter.addEventListener('change', function() {
            const selectedSection = this.value;
            console.log('Section filter selected:', selectedSection);
            // Placeholder - functionality to be implemented later
            // For now, this doesn't affect the display
        });
    }
    
    function updateParentCount() {
        const visibleCards = document.querySelectorAll('.parent-card:not(.hidden)');
        parentCountElement.textContent = visibleCards.length;
    }
    
    // Initialize count
    updateParentCount();
});

// Mobile menu functionality (inherited from general.js)
// Additional parent info specific functionality can be added here