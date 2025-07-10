function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const parentCards = document.querySelectorAll('.parent-card');
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
                
                // Extract last name for search (everything after the last space)
                const nameParts = parentName.split(' ');
                const lastName = nameParts[nameParts.length - 1];
                
                const isVisible = parentName.includes(searchTerm) || 
                    lastName.includes(searchTerm);
                
                if (isVisible && !card.classList.contains('hidden')) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Hide/show letter sections based on whether they have visible cards
            letterSections.forEach(section => {
                const visibleCardsInSection = section.querySelectorAll('.parent-card[style*="flex"]');
                if (searchTerm && visibleCardsInSection.length === 0) {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                }
            });
            
            // Update count based on search results
            if (searchTerm) {
                parentCountElement.textContent = visibleCount;
            } else {
                // Show all sections when search is cleared
                letterSections.forEach(section => {
                    section.style.display = 'block';
                });
                updateParentCount();
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

// Modal functionality
function showParentDetails(name, phone, email) {
    document.getElementById('modalName').textContent = name;
    document.getElementById('modalPhone').textContent = phone;
    document.getElementById('modalEmail').textContent = email;
    document.getElementById('detailsModal').style.display = 'block';
}

function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

function deleteParent(button) {
    if (confirm('Are you sure you want to delete this parent?')) {
        const parentCard = button.closest('.parent-card');
        parentCard.remove();
        
        // Update parent count after deletion
        const parentCountElement = document.querySelector('.count-number');
        const visibleCards = document.querySelectorAll('.parent-card:not(.hidden)');
        parentCountElement.textContent = visibleCards.length;
    }
}

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('detailsModal');
    if (event.target === modal) {
        closeDetailsModal();
    }
});