function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const studentCards = document.querySelectorAll('.student-card');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            studentCards.forEach(card => {
                const studentName = card.querySelector('.student-name').textContent.toLowerCase();
                const studentId = card.querySelector('.student-id').textContent.toLowerCase();
                const phoneNumber = card.querySelector('.phone-number').textContent.toLowerCase();
                
                if (studentName.includes(searchTerm) || 
                    studentId.includes(searchTerm) || 
                    phoneNumber.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Filter functionality
    const gradeFilter = document.querySelector('.filter-select[value="all"]');
    const sectionFilter = document.querySelectorAll('.filter-select')[1];
    
    // Add filter event listeners here if needed
    // This is a basic structure for future filter implementation
});

// Mobile menu functionality (inherited from general.js)
// Additional student info specific functionality can be added here