function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}

// Global variables
let allStudents = [];
let filteredStudents = [];

// Fetch students from backend
async function fetchStudents() {
    try {
        const response = await fetch('https://sams-backend-u79d.onrender.com/api/getStudentTeacher.php', {
            credentials: 'include',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Provider': window.provider,
                'Token': window.token,
            }
        });

        const data = await response.json();

        if (!window.verifyToken(data)) return;

        allStudents = data;
        filteredStudents = [...allStudents];
        displayStudents(filteredStudents);
        updateStudentCount();

        // Remove loader if it exists
        const loader = document.querySelector('.loader');
        if (loader) loader.remove();

    } catch (error) {
        console.error('Error fetching students:', error);
        showError('Failed to load students. Please try again.');
    }
}

// Display students grouped by grade and section
function displayStudents(students) {
    const content = document.querySelector('.content');

    // Clear existing content except filter section
    const filterSection = content.querySelector('.filter-section');
    content.innerHTML = '';
    content.appendChild(filterSection);

    if (students.length === 0) {
        const noStudentsMsg = document.createElement('div');
        noStudentsMsg.className = 'no-students';
        noStudentsMsg.innerHTML = '<h3>No students found matching your criteria.</h3>';
        content.appendChild(noStudentsMsg);
        return;
    }

    // Group students by grade level
    const groupedStudents = {};

    students.forEach(student => {
        const gradeLevel = student.grade_level || 'Unknown Grade';
        if (!groupedStudents[gradeLevel]) {
            groupedStudents[gradeLevel] = {};
        }

        // For now, we'll use a default section since the API might not provide section info
        const section = student.department ?? 'unassigned'; // You can modify this based on your data structure
        if (!groupedStudents[gradeLevel][section]) {
            groupedStudents[gradeLevel][section] = [];
        }

        groupedStudents[gradeLevel][section].push(student);
    });

    // Sort grades
    const sortedGrades = Object.keys(groupedStudents).sort();

    // Create sections for each grade
    sortedGrades.forEach(grade => {
        const gradeSection = document.createElement('div');
        gradeSection.className = 'grade-section';
        gradeSection.setAttribute('data-grade', extractGradeNumber(grade));

        const gradeTitle = document.createElement('h2');
        gradeTitle.className = 'grade-title';
        gradeTitle.textContent = `${grade} Students`;

        gradeSection.appendChild(gradeTitle);

        // Create sections for each section within the grade
        Object.keys(groupedStudents[grade]).forEach(section => {
            if (groupedStudents[grade][section].length > 0) {
                const sectionSubtitle = document.createElement('h3');
                sectionSubtitle.className = 'section-subtitle';
                sectionSubtitle.textContent = section;

                const studentsGrid = document.createElement('div');
                studentsGrid.className = 'students-grid';

                // Sort students by name within each section
                groupedStudents[grade][section].sort((a, b) =>
                    `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`)
                );

                // Create student cards
                groupedStudents[grade][section].forEach(student => {
                    const studentCard = createStudentCard(student);
                    studentsGrid.appendChild(studentCard);
                });

                gradeSection.appendChild(sectionSubtitle);
                gradeSection.appendChild(studentsGrid);
            }
        });

        content.appendChild(gradeSection);
    });
}

// Create a student card element
function createStudentCard(student) {
    const studentCard = document.createElement('div');
    studentCard.className = 'student-card';
    studentCard.setAttribute('data-grade', extractGradeNumber(student.grade_level));
    studentCard.setAttribute('data-section', 'main'); // Default section

    const fullName = `${student.firstname} ${student.lastname}`;
    const studentId = student.id ? student.id.toString().padStart(10, '0') : 'N/A';

    studentCard.innerHTML = `
        <img src="${student.pfp || '/assets/Sample.png'}" alt="Student" class="student-photo">
        <div class="student-info">
            <div class="student-name">${fullName}</div>
        </div>
        <div class="action-buttons">
            <button class="details-btn" onclick="showStudentDetails('${fullName}', '${studentId}', '${student.phone || 'N/A'}', '${student.email || 'N/A'}', '${student.grade_level || 'N/A'}')">Details</button>
        </div>
    `;

    return studentCard;
}

// Extract grade number from grade level string
function extractGradeNumber(gradeLevel) {
    if (!gradeLevel) return '0';
    const match = gradeLevel.match(/\d+/);
    return match ? match[0] : '0';
}

// Show error message
function showError(message) {
    const content = document.querySelector('.content');
    const filterSection = content.querySelector('.filter-section');
    content.innerHTML = '';
    content.appendChild(filterSection);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <h3 style="color: #e74c3c; text-align: center; margin-top: 50px;">
            ${message}
        </h3>
        <div style="text-align: center; margin-top: 20px;">
            <button onclick="fetchStudents()" style="padding: 10px 20px; background: #4A90E2; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Retry
            </button>
        </div>
    `;
    content.appendChild(errorDiv);
}

// Search and filter functionality
function initializeFilters() {
    const searchInput = document.querySelector('.search-input');
    const gradeFilter = document.getElementById('gradeFilter');
    const sectionFilter = document.getElementById('sectionFilter');

    // Populate grade filter with available grades
    if (gradeFilter && allStudents.length > 0) {
        const grades = [...new Set(allStudents.map(s => extractGradeNumber(s.grade_level)))].sort();

        // Clear existing options except "All Grades"
        gradeFilter.innerHTML = '<option value="all">All Grades</option>';

        grades.forEach(grade => {
            if (grade && grade !== '0') {
                const option = document.createElement('option');
                option.value = grade;
                option.textContent = `Grade ${grade}`;
                gradeFilter.appendChild(option);
            }
        });
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();

            if (searchTerm === '') {
                filteredStudents = [...allStudents];
            } else {
                filteredStudents = allStudents.filter(student => {
                    const fullName = `${student.firstname} ${student.lastname}`.toLowerCase();
                    const studentId = student.id ? student.id.toString() : '';
                    return fullName.includes(searchTerm) || studentId.includes(searchTerm);
                });
            }

            displayStudents(filteredStudents);
            updateStudentCount();
        });
    }

    // Grade filter functionality
    if (gradeFilter) {
        gradeFilter.addEventListener('change', function () {
            const selectedGrade = this.value;

            if (selectedGrade === 'all') {
                filteredStudents = [...allStudents];
            } else {
                filteredStudents = allStudents.filter(student =>
                    extractGradeNumber(student.grade_level) === selectedGrade
                );
            }

            displayStudents(filteredStudents);
            updateStudentCount();

            // Clear search when filter changes
            if (searchInput) {
                searchInput.value = '';
            }
        });
    }

    // Section filter functionality (placeholder for future use)
    if (sectionFilter) {
        sectionFilter.addEventListener('change', function () {
            // This can be implemented when section data is available
            console.log('Section filter selected:', this.value);
        });
    }
}

// Update student count
function updateStudentCount() {
    const studentCountElement = document.querySelector('.count-number');
    if (studentCountElement) {
        studentCountElement.textContent = filteredStudents.length;
    }
}

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
window.addEventListener('click', function (event) {
    const modal = document.getElementById('detailsModal');
    if (event.target === modal) {
        closeDetailsModal();
    }
});

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Add loading indicator
    const content = document.querySelector('.content');
    const filterSection = content.querySelector('.filter-section');

    const loader = document.createElement('h2');
    loader.className = 'loader';
    loader.textContent = 'Please wait while the data is being fetched...';
    loader.style.textAlign = 'center';
    loader.style.color = '#666';
    loader.style.marginTop = '50px';

    content.appendChild(loader);

    // Fetch students and initialize filters
    fetchStudents().then(() => {
        initializeFilters();
    });
});

// Make functions globally available
window.showStudentDetails = showStudentDetails;
window.closeDetailsModal = closeDetailsModal;
window.fetchStudents = fetchStudents;