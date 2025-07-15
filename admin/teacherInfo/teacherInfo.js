function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}
let teachers = null;
let currentUpdatingTeacher = null;
let addedTeachers = []; // Store added teachers data

// Add Teacher Modal Functions
function openAddTeacherModal() {
    document.getElementById('addTeacherModal').style.display = 'block';
}

function closeAddTeacherModal() {
    document.getElementById('addTeacherModal').style.display = 'none';
    // Clear form
    clearAddTeacherForm();
}

function clearAddTeacherForm() {
    document.getElementById('teacherFirstName').value = '';
    document.getElementById('teacherLastName').value = '';
    document.getElementById('teacherEmail').value = '';
    document.getElementById('teacherPhone').value = '';
    document.getElementById('teacherDepartment').value = '';
    document.getElementById('courseName').value = '';
    document.getElementById('courseCode').value = '';
}

function confirmAddTeacher() {
    // Validate required fields
    const firstName = document.getElementById('teacherFirstName').value.trim();
    const lastName = document.getElementById('teacherLastName').value.trim();
    const email = document.getElementById('teacherEmail').value.trim();
    const phone = document.getElementById('teacherPhone').value.trim();
    
    if (!firstName || !lastName || !email || !phone) {
        alert('Please fill in all required teacher information fields (First Name, Last Name, Email, Phone).');
        return;
    }
    
    // Get optional fields
    const department = document.getElementById('teacherDepartment').value.trim() || 'Unassigned';
    const courseName = document.getElementById('courseName').value.trim() || 'Unassigned';
    const courseCode = document.getElementById('courseCode').value.trim() || 'Unassigned';
    
    // Create teacher object
    const newTeacher = {
        id: Date.now(), // Simple ID generation
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        department: department,
        courseName: courseName,
        courseCode: courseCode
    };
    
    // Add to stored teachers
    addedTeachers.push(newTeacher);
    
    // Create and add teacher card to the page
    addTeacherCardToPage(newTeacher);
    
    // Close modal and clear form
    closeAddTeacherModal();
    
    // Update teacher count
    updateTeacherCount();
}

function addTeacherCardToPage(teacher) {
    // Find or create department section
    let departmentSection = document.querySelector(`[data-subject="${teacher.department}"]`);
    
    // If department section doesn't exist, create it
    if (!departmentSection) {
        departmentSection = createDepartmentSection(teacher.department);
    }
    
    // Create teacher card
    const teacherCard = document.createElement('div');
    teacherCard.className = 'teacher-card';
    teacherCard.setAttribute('data-subject', JSON.stringify([teacher.courseCode]));
    teacherCard.setAttribute('data-added', 'true');
    
    teacherCard.innerHTML = `
        <img src="/assets/Sample.png" alt="Teacher" class="teacher-photo">
        <div class="teacher-info">
            <div class="teacher-name">${teacher.firstName} ${teacher.lastName}</div>
            <div class="teacher-id">${teacher.courseCode}</div>
        </div>
        <div class="action-buttons">
            <button class="details-btn" onclick="showAddedTeacherDetails(${teacher.id})">Details</button>
            <button class="update-btn" onclick="updateAddedTeacher(${teacher.id})">Update</button>
            <button class="delete-btn" onclick="deleteAddedTeacher(${teacher.id}, this)">Delete</button>
        </div>
    `;
    
    // Add to the appropriate grid
    const teachersGrid = departmentSection.querySelector('.teachers-grid');
    teachersGrid.appendChild(teacherCard);
}

function createDepartmentSection(department) {
    const content = document.querySelector('.content');
    const departmentSection = document.createElement('div');
    departmentSection.className = 'subject-section';
    departmentSection.setAttribute('data-subject', department);
    
    departmentSection.innerHTML = `
        <h2 class="subject-title">${department}</h2>
        <div class="teachers-grid"></div>
    `;
    
    // Insert in alphabetical order (but keep "Unassigned" at the end)
    const existingSections = document.querySelectorAll('.subject-section');
    let inserted = false;
    
    if (department === 'Unassigned') {
        // Always put Unassigned at the end
        content.appendChild(departmentSection);
        inserted = true;
    } else {
        for (let section of existingSections) {
            const sectionDepartment = section.getAttribute('data-subject');
            if (sectionDepartment === 'Unassigned') {
                // Insert before Unassigned
                content.insertBefore(departmentSection, section);
                inserted = true;
                break;
            } else if (department.toLowerCase() < sectionDepartment.toLowerCase()) {
                content.insertBefore(departmentSection, section);
                inserted = true;
                break;
            }
        }
    }
    
    if (!inserted) {
        content.appendChild(departmentSection);
    }
    
    return departmentSection;
}

function showAddedTeacherDetails(teacherId) {
    const teacher = addedTeachers.find(t => t.id === teacherId);
    if (!teacher) return;
    
    document.getElementById('modalName').innerHTML = `${teacher.firstName} ${teacher.lastName}`;
    document.getElementById('modalPhone').textContent = teacher.phone;
    document.getElementById('modalEmail').textContent = teacher.email;
    document.getElementById('modalCourse').textContent = teacher.courseName;
    
    document.getElementById('detailsModal').style.display = 'block';
}

function deleteAddedTeacher(teacherId, button) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        // Remove from stored teachers
        addedTeachers = addedTeachers.filter(t => t.id !== teacherId);
        
        // Remove card from page
        const teacherCard = button.closest('.teacher-card');
        const departmentSection = teacherCard.closest('.subject-section');
        teacherCard.remove();
        
        // If department section is now empty, remove it
        const remainingCards = departmentSection.querySelectorAll('.teacher-card');
        if (remainingCards.length === 0) {
            departmentSection.remove();
        }
        
        // Update teacher count
        updateTeacherCount();
    }
}
// Search functionality
function teacherGrid(data) {
    const searchInput = document.querySelector('.search-input');
    const teacherCards = document.querySelectorAll('.teacher-card');
    const subjectFilter = document.getElementById('subjectFilter');
    const subjectSections = document.querySelectorAll('.subject-section');

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();

            teacherCards.forEach(card => {
                const teacherName = card.querySelector('.teacher-name').textContent.toLowerCase();
                const teacherId = card.querySelector('.teacher-id').textContent.toLowerCase();

                const isVisible = teacherName.includes(searchTerm) || teacherId.includes(searchTerm);

                if (isVisible && !card.classList.contains('hidden')) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });

            // Hide/show subject sections based on whether they have visible cards
            subjectSections.forEach(section => {
                const visibleCardsInSection = section.querySelectorAll('.teacher-card[style*="flex"]');
                if (searchTerm && visibleCardsInSection.length === 0) {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                }
            });

            // Always update count after search
            updateTeacherCount();
        });
    }

    // Subject filter functionality
    if (subjectFilter) {
        subjectFilter.addEventListener('change', function () {
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

                // Hide all cards first, then show only matching ones
                teacherCards.forEach(card => {
                    if (JSON.parse(card.dataset.subject).includes(selectedSubject)) {
                        card.classList.remove('hidden');
                        card.closest('.subject-section.hidden').classList.remove('hidden');
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

    // Initialize count
    updateTeacherCount();
}

function updateTeacherCount() {
    const visibleCards = document.querySelectorAll('.teacher-card[style*="flex"], .teacher-card:not([style*="none"]):not(.hidden)');
    const teacherCountElement = document.querySelector('.count-number');

    teachers = new Set();
    visibleCards.forEach(card => {
        teachers.add(`${card.querySelector('.teacher-name').innerText}`);
    });
    teacherCountElement.textContent = teachers.size;
}

// Helper functions for updating existing teacher details
function showTeacherDetails(name, phone, email, courseName = 'N/A') {
    document.getElementById('modalName').textContent = name;
    document.getElementById('modalPhone').textContent = phone;
    document.getElementById('modalEmail').textContent = email;
    document.getElementById('modalCourse').textContent = courseName;
    document.getElementById('detailsModal').style.display = 'block';
}

function updateExistingTeacher(firstName, lastName, phone, email, department, courseName, courseCode) {
    currentUpdatingTeacher = {
        isExisting: true,
        originalName: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        department: department,
        courseName: courseName,
        courseCode: courseCode
    };
    
    openUpdateTeacherModal();
}

function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

function deleteTeacher(button) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        const teacherCard = button.closest('.teacher-card');
        const grid = teacherCard.parentNode;
        if (grid.children.length <= 1) grid.closest('.subject-section').remove();
        else teacherCard.remove();

        // Update teacher count after deletion
        const teacherCountElement = document.querySelector('.count-number');
        const visibleCards = document.querySelectorAll('.teacher-card:not(.hidden)');
        updateTeacherCount()
    }
}

// Update Teacher Modal Functions
function updateTeacher(name, phone, email) {
    // For existing teachers (not added ones), create mock data
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    currentUpdatingTeacher = {
        isExisting: true,
        originalName: name,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        department: 'Sample Department',
        courseName: 'Sample Course',
        courseCode: 'SAM001'
    };
    
    openUpdateTeacherModal();
}

function updateAddedTeacher(teacherId) {
    const teacher = addedTeachers.find(t => t.id === teacherId);
    if (!teacher) return;
    
    currentUpdatingTeacher = { ...teacher, isExisting: false };
    openUpdateTeacherModal();
}

function openUpdateTeacherModal() {
    document.getElementById('updateTeacherModal').style.display = 'block';
    
    // Pre-fill teacher information
    document.getElementById('updateTeacherFirstName').value = currentUpdatingTeacher.firstName;
    document.getElementById('updateTeacherLastName').value = currentUpdatingTeacher.lastName;
    document.getElementById('updateTeacherEmail').value = currentUpdatingTeacher.email;
    document.getElementById('updateTeacherPhone').value = currentUpdatingTeacher.phone;
    document.getElementById('updateTeacherDepartment').value = currentUpdatingTeacher.department === 'Unassigned' ? '' : currentUpdatingTeacher.department;
    document.getElementById('updateCourseName').value = currentUpdatingTeacher.courseName === 'Unassigned' ? '' : currentUpdatingTeacher.courseName;
    document.getElementById('updateCourseCode').value = currentUpdatingTeacher.courseCode === 'Unassigned' ? '' : currentUpdatingTeacher.courseCode;
}

function closeUpdateTeacherModal() {
    document.getElementById('updateTeacherModal').style.display = 'none';
    currentUpdatingTeacher = null;
}

function saveTeacherChanges() {
    // Validate required fields
    const firstName = document.getElementById('updateTeacherFirstName').value.trim();
    const lastName = document.getElementById('updateTeacherLastName').value.trim();
    const email = document.getElementById('updateTeacherEmail').value.trim();
    const phone = document.getElementById('updateTeacherPhone').value.trim();
    
    if (!firstName || !lastName || !email || !phone) {
        alert('Please fill in all required teacher information fields (First Name, Last Name, Email, Phone).');
        return;
    }
    
    // Get optional fields
    const department = document.getElementById('updateTeacherDepartment').value.trim() || 'Unassigned';
    const courseName = document.getElementById('updateCourseName').value.trim() || 'Unassigned';
    const courseCode = document.getElementById('updateCourseCode').value.trim() || 'Unassigned';
    
    if (currentUpdatingTeacher.isExisting) {
        // For existing teachers, just show success message (no actual update to DOM)
        alert('Teacher information updated successfully!');
    } else {
        // For added teachers, update the stored data and card
        const teacherIndex = addedTeachers.findIndex(t => t.id === currentUpdatingTeacher.id);
        if (teacherIndex !== -1) {
            const oldDepartment = addedTeachers[teacherIndex].department;
            
            // Update stored data
            addedTeachers[teacherIndex] = {
                ...addedTeachers[teacherIndex],
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                department: department,
                courseName: courseName,
                courseCode: courseCode
            };
            
            // If department changed, move the card
            if (oldDepartment !== department) {
                // Remove old card
                const oldCard = document.querySelector(`[data-added="true"]`);
                if (oldCard && oldCard.querySelector('.teacher-name').textContent.includes(currentUpdatingTeacher.firstName)) {
                    const oldSection = oldCard.closest('.subject-section');
                    oldCard.remove();
                    
                    // Clean up empty section
                    if (oldSection && oldSection.querySelectorAll('.teacher-card').length === 0) {
                        oldSection.remove();
                    }
                }
                
                // Add new card in correct department
                addTeacherCardToPage(addedTeachers[teacherIndex]);
            } else {
                // Update existing card
                const card = document.querySelector(`[data-added="true"]`);
                if (card && card.querySelector('.teacher-name').textContent.includes(currentUpdatingTeacher.firstName)) {
                    card.querySelector('.teacher-name').textContent = `${firstName} ${lastName}`;
                    card.querySelector('.teacher-id').textContent = courseCode;
                }
            }
            
            alert('Teacher information updated successfully!');
        }
    }
    
    closeUpdateTeacherModal();
}

// Close modal when clicking outside of it
window.addEventListener('click', function (event) {
    const modal = document.getElementById('detailsModal');
    const addModal = document.getElementById('addTeacherModal');
    
    if (event.target === modal) {
        closeDetailsModal();
    }
    
    if (event.target === addModal) {
        closeAddTeacherModal();
    }
});

const parser = new DOMParser();

async function init() {
    const html = await fetch('/assets/templates/teacher.html')
        .then(res => res.text())
        .then(txt => parser.parseFromString(txt, 'text/html'));

    fetch(`https://sams-backend-u79d.onrender.com/api/getTeachers.php`, {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Provider': window.provider,
            'Token': window.token,
        }
    })
        .then(res => res.json())
        .then(data => {
            if (!window.verifyToken(data)) return;
            const box = document.querySelector('.content');
            let grid = null;
            let prevDepartment = '';
            const filterBox = document.querySelector('.filter-select');
            courseCodes = new Set();
            //update teachers and filters
            data.forEach((row) => {
                if (prevDepartment != (row['department'] ?? 'Unassigned')) {
                    const sec = document.createElement('div');
                    sec.className = 'subject-section'
                    sec.dataset.subject = row['department'] ?? 'Unassigned';
                    const departmentName = document.createElement('h2');
                    departmentName.className = 'subject-title';
                    departmentName.innerText = row['department'] ?? 'Unassigned';
                    grid = document.createElement('div');
                    grid.className = 'teachers-grid';
                    sec.appendChild(departmentName);
                    sec.appendChild(grid);
                    box.appendChild(sec);
                    prevDepartment = row['department'] ?? 'Unassigned';
                }
                let courses = '';
                JSON.parse(row['code']).forEach((course_i, i) => {
                    courses += `${course_i ?? 'Unassigned'} `;
                    courseCodes.add(JSON.stringify([JSON.parse(row['code'])[i] ?? 'Unassigned', JSON.parse(row['course'])[i] ?? 'Unassigned']));
                });
                const clone = html.querySelector('.teacher-card').cloneNode(true);
                clone.dataset.subject = (row['code'] == '[null]') ? JSON.stringify('Unassigned') : row['code'];
                clone.querySelector('.teacher-photo').src = row['pfp'];
                clone.querySelector('.teacher-name').innerText = `${row['firstname']} ${row['lastname']}`;
                clone.querySelector('.teacher-id').innerText = courses;
                clone.querySelector('.details-btn').onclick = () => showTeacherDetails(`${row['firstname']} ${row['lastname']}`, `${row['phone']}`, `${row['email']}`);
                grid.appendChild(clone)
            })
            document.querySelector('.loader').remove();

            //update 
            filterBox.innerHTML = '';
            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.innerText = 'All subjects';
            filterBox.appendChild(allOption);
            courseCodes.forEach((entry) => {
                const [code, name] = JSON.parse(entry);
                const option = document.createElement('option');
                option.value = code;
                option.innerText = name;
                filterBox.appendChild(option);
            });

            teacherGrid(data);
        });
}

init()