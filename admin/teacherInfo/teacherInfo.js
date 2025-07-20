function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}
let teachers = null;
let currentUpdatingTeacher = null;
let addedTeachers = []; // Store added teachers data

// Add Teacher Modal Functions

function openAddTeacherModal() {
    document.getElementById('addTeacherModal').style.display = 'flex';

    // Clear form inputs
    clearAddTeacherForm();

    // Populate dropdowns
    populateDropdowns();
}

function clearAddTeacherForm() {
    // Clear all input fields
    document.getElementById('teacherFirstName').value = '';
    document.getElementById('teacherLastName').value = '';
    document.getElementById('teacherEmail').value = '';
    document.getElementById('teacherPhone').value = '';
    document.getElementById('teacherDepartment').value = '';
    document.getElementById('courseName').value = '';
    document.getElementById('courseCode').value = '';

    // Reset dropdowns to default
    const dropdowns = [
        'teacherDepartmentDropdown',
        'courseNameDropdown',
        'courseCodeDropdown'
    ];

    dropdowns.forEach(id => {
        const dropdown = document.getElementById(id);
        if (dropdown) {
            dropdown.selectedIndex = 0;
        }
    });
}

function populateDropdowns() {
    // Populate departments dropdown
    fetch('https://sams-backend-u79d.onrender.com/api/populateDepartmentDropdown.php', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('Department API Response:', data);
            const departmentDropdown = document.getElementById('teacherDepartmentDropdown');

            if (departmentDropdown) {
                departmentDropdown.innerHTML = '<option value="">Select department (optional)</option>';

                if (data.success && Array.isArray(data.departments) && data.departments.length > 0) {
                    data.departments.forEach(dep => {
                        const option = document.createElement('option');
                        option.value = dep;
                        option.textContent = dep;
                        departmentDropdown.appendChild(option);
                    });
                } else {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = data.error || 'No departments found';
                    option.disabled = true;
                    departmentDropdown.appendChild(option);
                }
            }
        })
        .catch(err => {
            console.error('Error fetching departments:', err);
            const departmentDropdown = document.getElementById('teacherDepartmentDropdown');
            if (departmentDropdown) {
                departmentDropdown.innerHTML = '<option value="">Select department (optional)</option>';
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Error loading departments';
                option.disabled = true;
                departmentDropdown.appendChild(option);
            }
        });

    // Populate courses dropdown
    fetch('https://sams-backend-u79d.onrender.com/api/populateCourseDropdown.php', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('Course API Response:', data);
            const courseNameDropdown = document.getElementById('courseNameDropdown');
            const courseCodeDropdown = document.getElementById('courseCodeDropdown');

            if (courseNameDropdown) {
                courseNameDropdown.innerHTML = '<option value="">Select unassigned course name (optional)</option>';

                if (data.success && Array.isArray(data.course_names) && data.course_names.length > 0) {
                    data.course_names.forEach(name => {
                        const option = document.createElement('option');
                        option.value = name;
                        option.textContent = name;
                        courseNameDropdown.appendChild(option);
                    });
                } else {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = data.error || 'No unassigned courses';
                    option.disabled = true;
                    courseNameDropdown.appendChild(option);
                }
            }

            if (courseCodeDropdown) {
                courseCodeDropdown.innerHTML = '<option value="">Select unassigned course code (optional)</option>';

                if (data.success && Array.isArray(data.course_codes) && data.course_codes.length > 0) {
                    data.course_codes.forEach(code => {
                        const option = document.createElement('option');
                        option.value = code;
                        option.textContent = code;
                        courseCodeDropdown.appendChild(option);
                    });
                } else {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = data.error || 'No unassigned courses';
                    option.disabled = true;
                    courseCodeDropdown.appendChild(option);
                }
            }
        })
        .catch(err => {
            console.error('Error fetching courses:', err);
            const courseNameDropdown = document.getElementById('courseNameDropdown');
            const courseCodeDropdown = document.getElementById('courseCodeDropdown');

            if (courseNameDropdown) {
                courseNameDropdown.innerHTML = '<option value="">Select unassigned course name (optional)</option>';
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Error loading courses';
                option.disabled = true;
                courseNameDropdown.appendChild(option);
            }

            if (courseCodeDropdown) {
                courseCodeDropdown.innerHTML = '<option value="">Select unassigned course code (optional)</option>';
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Error loading courses';
                option.disabled = true;
                courseCodeDropdown.appendChild(option);
            }
        });
}

// Move closeAddTeacherModal to top-level scope
function closeAddTeacherModal() {
    document.getElementById('addTeacherModal').style.display = 'none';
    // Reset dropdowns and inputs to default
    const courseNameDropdown = document.getElementById('courseNameDropdown');
    const courseCodeDropdown = document.getElementById('courseCodeDropdown');
    const departmentDropdown = document.getElementById('teacherDepartmentDropdown');
    const courseNameInput = document.getElementById('courseName');
    const courseCodeInput = document.getElementById('courseCode');
    const departmentInput = document.getElementById('teacherDepartment');
    if (courseNameInput) courseNameInput.value = '';
    if (courseCodeInput) courseCodeInput.value = '';
    if (departmentInput) departmentInput.value = '';
    if (courseNameDropdown) courseNameDropdown.selectedIndex = 0;
    if (courseCodeDropdown) courseCodeDropdown.selectedIndex = 0;
    if (departmentDropdown) departmentDropdown.selectedIndex = 0;
}


async function confirmAddTeacher() {
    // Validate required fields
    const firstName = document.getElementById('teacherFirstName').value.trim();
    const lastName = document.getElementById('teacherLastName').value.trim();
    const email = document.getElementById('teacherEmail').value.trim();
    const phone = document.getElementById('teacherPhone').value.trim();

    if (!firstName || !lastName || !email || !phone) {
        alert('Please fill in all required teacher information fields (First Name, Last Name, Email, Phone).');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Dual input: prioritize input field, fallback to dropdown, default to Unassigned
    let department = 'Unassigned';
    let courseName = 'Unassigned';
    let courseCode = 'Unassigned';

    const depInput = document.getElementById('teacherDepartment');
    const depDropdown = document.getElementById('teacherDepartmentDropdown');
    if (depInput && depInput.value.trim() !== '') {
        department = depInput.value.trim();
    } else if (depDropdown && depDropdown.value) {
        department = depDropdown.value;
    }

    const nameInput = document.getElementById('courseName');
    const nameDropdown = document.getElementById('courseNameDropdown');
    if (nameInput && nameInput.value.trim() !== '') {
        courseName = nameInput.value.trim();
    } else if (nameDropdown && nameDropdown.value) {
        courseName = nameDropdown.value;
    }

    const codeInput = document.getElementById('courseCode');
    const codeDropdown = document.getElementById('courseCodeDropdown');
    if (codeInput && codeInput.value.trim() !== '') {
        courseCode = codeInput.value.trim();
    } else if (codeDropdown && codeDropdown.value) {
        courseCode = codeDropdown.value;
    }

    // Show loading state
    const confirmBtn = document.querySelector('#addTeacherModal .confirm-btn');
    const originalText = confirmBtn.textContent;
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Adding Teacher...';

    // Prepare data for addTeacher API
    const teacherData = {
        firstname: firstName,
        lastname: lastName,
        email: email,
        phone: phone,
        department: department !== 'Unassigned' ? department : null,
        course_name: courseName !== 'Unassigned' ? courseName : null,
        course_code: courseCode !== 'Unassigned' ? courseCode : null
    };

    try {
        // Call the addTeacher.php API
        const response = await fetch('https://sams-backend-u79d.onrender.com/api/addTeacher.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Provider': window.provider,
                'Token': window.token,
            },
            body: JSON.stringify(teacherData)
        });

        const result = await response.json();

        // Check for authentication errors
        if (!window.verifyToken(result)) return;

        if (result.success === true) {
            // Show success message
            let successMessage = `✅ Successfully added teacher: ${result.teacher.firstname} ${result.teacher.lastname}`;
            if (result.teacher.course_name) {
                successMessage += `\n📚 Assigned to course: ${result.teacher.course_name}`;
            }
            if (result.teacher.department) {
                successMessage += `\n🏢 Department: ${result.teacher.department}`;
            }
            alert(successMessage);

            // Close modal and clear form
            closeAddTeacherModal();

            // Reload the page to show the new teacher from database
            location.reload();

        } else {
            // Handle API errors with detailed messages
            let errorMessage = '❌ Failed to add teacher: ' + (result.error || 'Unknown error');

            if (result.missing_fields) {
                errorMessage += '\n📝 Missing fields: ' + result.missing_fields.join(', ');
            }

            if (result.details) {
                errorMessage += '\n🔍 Details: ' + result.details;
            }

            alert(errorMessage);
        }

    } catch (error) {
        console.error('Error adding teacher:', error);
        alert('❌ Network error occurred while adding the teacher. Please check your connection and try again.');

    } finally {
        // Reset button state
        confirmBtn.disabled = false;
        confirmBtn.textContent = originalText;
    }
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

    document.getElementById('detailsModal').style.display = 'flex';
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
                    section.style.display = 'flex';
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

function showTeacherDetails(teacherObj) {
    document.getElementById('modalName').textContent = `${teacherObj.firstname} ${teacherObj.lastname}`;
    document.getElementById('modalPhone').textContent = teacherObj.phone;
    document.getElementById('modalEmail').textContent = teacherObj.email;
    // Show all courses as "Course Name (Code)" comma separated
    let courseDisplay = '';
    if (Array.isArray(teacherObj.courseNames) && Array.isArray(teacherObj.courseCodes)) {
        for (let i = 0; i < Math.max(teacherObj.courseNames.length, teacherObj.courseCodes.length); i++) {
            const name = teacherObj.courseNames[i] ?? 'Unassigned';
            const code = teacherObj.courseCodes[i] ?? 'Unassigned';
            courseDisplay += `${name} (${code})${i < Math.max(teacherObj.courseNames.length, teacherObj.courseCodes.length) - 1 ? ', ' : ''}`;
        }
    } else {
        courseDisplay = 'Unassigned';
    }
    document.getElementById('modalCourse').textContent = courseDisplay;
    document.getElementById('detailsModal').style.display = 'flex';
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
function updateTeacher(teacherObj) {
    // teacherObj should contain all real data for the teacher
    currentUpdatingTeacher = {
        isExisting: true,
        originalName: `${teacherObj.firstname} ${teacherObj.lastname}`,
        firstName: teacherObj.firstname,
        lastName: teacherObj.lastname,
        email: teacherObj.email,
        phone: teacherObj.phone,
        department: teacherObj.department || 'Unassigned',
        // Join all courses as comma separated for the update modal input fields
        courseName: Array.isArray(teacherObj.courseNames) ? teacherObj.courseNames.join(', ') : (teacherObj.courseName || 'Unassigned'),
        courseCode: Array.isArray(teacherObj.courseCodes) ? teacherObj.courseCodes.join(', ') : (teacherObj.courseCode || 'Unassigned'),
        id: teacherObj.id // if available
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
    document.getElementById('updateTeacherModal').style.display = 'flex';

    // Populate dropdowns first
    populateUpdateDropdowns();

    // Setup input/dropdown synchronization
    setTimeout(() => {
        setupUpdateInputDropdownSync();
    }, 600);

    // Pre-fill teacher information
    document.getElementById('updateTeacherFirstName').value = currentUpdatingTeacher.firstName;
    document.getElementById('updateTeacherLastName').value = currentUpdatingTeacher.lastName;
    document.getElementById('updateTeacherEmail').value = currentUpdatingTeacher.email;
    document.getElementById('updateTeacherPhone').value = currentUpdatingTeacher.phone;

    // Pre-fill department
    const department = currentUpdatingTeacher.department === 'Unassigned' ? '' : currentUpdatingTeacher.department;
    document.getElementById('updateTeacherDepartment').value = department;

    // Pre-fill course information
    const courseName = currentUpdatingTeacher.courseName === 'Unassigned' ? '' : currentUpdatingTeacher.courseName;
    const courseCode = currentUpdatingTeacher.courseCode === 'Unassigned' ? '' : currentUpdatingTeacher.courseCode;
    document.getElementById('updateCourseName').value = courseName;
    document.getElementById('updateCourseCode').value = courseCode;

    // Pre-select dropdowns after they are populated
    setTimeout(() => {
        preSelectUpdateDropdowns(department, courseName, courseCode);
    }, 500);
}

function populateUpdateDropdowns() {
    // Populate departments dropdown
    fetch('https://sams-backend-u79d.onrender.com/api/populateDepartmentDropdown.php', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            const departmentDropdown = document.getElementById('updateTeacherDepartmentDropdown');

            if (departmentDropdown) {
                departmentDropdown.innerHTML = '<option value="">Select department (optional)</option>';

                if (data.success && Array.isArray(data.departments) && data.departments.length > 0) {
                    data.departments.forEach(dep => {
                        const option = document.createElement('option');
                        option.value = dep;
                        option.textContent = dep;
                        departmentDropdown.appendChild(option);
                    });
                }
            }
        })
        .catch(err => {
            console.error('Error fetching departments for update:', err);
        });

    // Populate courses dropdown
    fetch('https://sams-backend-u79d.onrender.com/api/populateCourseDropdown.php', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            const courseNameDropdown = document.getElementById('updateCourseNameDropdown');
            const courseCodeDropdown = document.getElementById('updateCourseCodeDropdown');

            if (courseNameDropdown) {
                courseNameDropdown.innerHTML = '<option value="">Select unassigned course name (optional)</option>';

                if (data.success && Array.isArray(data.course_names) && data.course_names.length > 0) {
                    data.course_names.forEach(name => {
                        const option = document.createElement('option');
                        option.value = name;
                        option.textContent = name;
                        courseNameDropdown.appendChild(option);
                    });
                }
            }

            if (courseCodeDropdown) {
                courseCodeDropdown.innerHTML = '<option value="">Select unassigned course code (optional)</option>';

                if (data.success && Array.isArray(data.course_codes) && data.course_codes.length > 0) {
                    data.course_codes.forEach(code => {
                        const option = document.createElement('option');
                        option.value = code;
                        option.textContent = code;
                        courseCodeDropdown.appendChild(option);
                    });
                }
            }
        })
        .catch(err => {
            console.error('Error fetching courses for update:', err);
        });
}

// Add input/dropdown synchronization for update modal
function setupUpdateInputDropdownSync() {
    // Department sync
    const depInput = document.getElementById('updateTeacherDepartment');
    const depDropdown = document.getElementById('updateTeacherDepartmentDropdown');

    if (depInput && depDropdown) {
        depInput.addEventListener('input', function () {
            if (this.value.trim() !== '') {
                depDropdown.selectedIndex = 0; // Reset dropdown to default
            }
        });

        depDropdown.addEventListener('change', function () {
            if (this.value !== '') {
                depInput.value = ''; // Clear input field
            }
        });
    }

    // Course name sync
    const nameInput = document.getElementById('updateCourseName');
    const nameDropdown = document.getElementById('updateCourseNameDropdown');

    if (nameInput && nameDropdown) {
        nameInput.addEventListener('input', function () {
            if (this.value.trim() !== '') {
                nameDropdown.selectedIndex = 0; // Reset dropdown to default
            }
        });

        nameDropdown.addEventListener('change', function () {
            if (this.value !== '') {
                nameInput.value = ''; // Clear input field
            }
        });
    }

    // Course code sync
    const codeInput = document.getElementById('updateCourseCode');
    const codeDropdown = document.getElementById('updateCourseCodeDropdown');

    if (codeInput && codeDropdown) {
        codeInput.addEventListener('input', function () {
            if (this.value.trim() !== '') {
                codeDropdown.selectedIndex = 0; // Reset dropdown to default
            }
        });

        codeDropdown.addEventListener('change', function () {
            if (this.value !== '') {
                codeInput.value = ''; // Clear input field
            }
        });
    }
}

function preSelectUpdateDropdowns(department, courseName, courseCode) {
    // Don't pre-select dropdowns - let user choose between input or dropdown
    // All dropdowns should start at default "Select... (optional)" state
    const departmentDropdown = document.getElementById('updateTeacherDepartmentDropdown');
    const courseNameDropdown = document.getElementById('updateCourseNameDropdown');
    const courseCodeDropdown = document.getElementById('updateCourseCodeDropdown');

    if (departmentDropdown) departmentDropdown.selectedIndex = 0;
    if (courseNameDropdown) courseNameDropdown.selectedIndex = 0;
    if (courseCodeDropdown) courseCodeDropdown.selectedIndex = 0;
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

    // Clear either/or logic: input field OR dropdown, not both
    let department = 'Unassigned';
    let courseName = 'Unassigned';
    let courseCode = 'Unassigned';

    const depInput = document.getElementById('updateTeacherDepartment');
    const depDropdown = document.getElementById('updateTeacherDepartmentDropdown');

    // Department logic: input field takes priority, then dropdown, then Unassigned
    if (depInput && depInput.value.trim() !== '') {
        department = depInput.value.trim();
    } else if (depDropdown && depDropdown.value) {
        department = depDropdown.value;
    }

    const nameInput = document.getElementById('updateCourseName');
    const nameDropdown = document.getElementById('updateCourseNameDropdown');

    // Course name logic: input field takes priority, then dropdown, then Unassigned
    if (nameInput && nameInput.value.trim() !== '') {
        courseName = nameInput.value.trim();
    } else if (nameDropdown && nameDropdown.value) {
        courseName = nameDropdown.value;
    }

    const codeInput = document.getElementById('updateCourseCode');
    const codeDropdown = document.getElementById('updateCourseCodeDropdown');

    // Course code logic: input field takes priority, then dropdown, then Unassigned
    if (codeInput && codeInput.value.trim() !== '') {
        courseCode = codeInput.value.trim();
    } else if (codeDropdown && codeDropdown.value) {
        courseCode = codeDropdown.value;
    }

    console.log('Update values:', { department, courseName, courseCode }); // Debug log

    if (currentUpdatingTeacher.isExisting) {
        // For existing teachers, send update to backend
        const updateBtn = document.querySelector('#updateTeacherModal .confirm-btn');
        const originalText = updateBtn ? updateBtn.textContent : 'Save Changes';
        if (updateBtn) {
            updateBtn.disabled = true;
            updateBtn.textContent = 'Updating...';
        }


        // Prepare data for API
        const teacherData = {
            firstname: firstName,
            lastname: lastName,
            email: email, // new email (may be changed)
            phone: phone,
            original_email: currentUpdatingTeacher.email // always send original email for lookup
        };
        // Add department, courseName, courseCode if not Unassigned
        if (department !== 'Unassigned' && department !== '') {
            teacherData.department = department;
        }
        if (courseName !== 'Unassigned' && courseName !== '') {
            teacherData.course_name = courseName;
        }
        if (courseCode !== 'Unassigned' && courseCode !== '') {
            teacherData.course_code = courseCode;
        }

        console.log('Sending to API:', teacherData); // Debug log

        fetch('https://sams-backend-u79d.onrender.com/api/updateTeacher.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Provider': window.provider,
                'Token': window.token,
            },
            body: JSON.stringify(teacherData)
        })
            .then(res => res.json())
            .then(result => {
                if (!window.verifyToken(result)) return;
                if (result.success) {
                    alert('Teacher information updated successfully!');
                    closeUpdateTeacherModal();
                    location.reload();
                } else {
                    alert('Failed to update teacher: ' + (result.error || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error updating teacher:', error);
                alert('An error occurred while updating the teacher. Please try again.');
            })
            .finally(() => {
                if (updateBtn) {
                    updateBtn.disabled = false;
                    updateBtn.textContent = originalText;
                }
            });
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
        closeUpdateTeacherModal();
    }
}

// Close modal when clicking outside of it
window.addEventListener('click', function (event) {
    const modal = document.getElementById('detailsModal');
    const addModal = document.getElementById('addTeacherModal');
    const updateModal = document.getElementById('updateTeacherModal');
    if (event.target === modal) {
        closeDetailsModal();
    }
    if (event.target === addModal) {
        closeAddTeacherModal();
    }
    if (event.target === updateModal) {
        closeUpdateTeacherModal();
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
                // Build arrays of all course names and codes
                let courseNamesArr = [];
                let courseCodesArr = [];
                try {
                    courseCodesArr = JSON.parse(row['code']);
                    courseNamesArr = JSON.parse(row['course']);
                } catch (e) {
                    courseCodesArr = [];
                    courseNamesArr = [];
                }
                // Build a string with all courses (name + code)
                let coursesDisplay = '';
                for (let i = 0; i < Math.max(courseNamesArr.length, courseCodesArr.length); i++) {
                    const code = courseCodesArr[i] ?? 'Unassigned';
                    const name = courseNamesArr[i] ?? 'Unassigned';
                    coursesDisplay += `${name} (${code})${i < Math.max(courseNamesArr.length, courseCodesArr.length) - 1 ? ', ' : ''}`;
                    courseCodes.add(JSON.stringify([code, name]));
                }
                const clone = html.querySelector('.teacher-card').cloneNode(true);
                clone.dataset.subject = (row['code'] == '[null]') ? JSON.stringify('Unassigned') : row['code'];
                clone.querySelector('.teacher-photo').src = row['pfp'] ?? '/assets/icons/placeholder-parent.jpeg';
                clone.querySelector('.teacher-name').innerText = `${row['firstname']} ${row['lastname']}`;
                clone.querySelector('.teacher-id').innerText = coursesDisplay;
                // Attach Update and Details button handler with all real data for this card
                const teacherObj = {
                    id: row['id'],
                    firstname: row['firstname'],
                    lastname: row['lastname'],
                    email: row['email'],
                    phone: row['phone'],
                    department: row['department'] ?? 'Unassigned',
                    courseNames: courseNamesArr.length > 0 ? courseNamesArr : ['Unassigned'],
                    courseCodes: courseCodesArr.length > 0 ? courseCodesArr : ['Unassigned']
                };

                clone.querySelector('.details-btn').onclick = () => showTeacherDetails(teacherObj);
                clone.querySelector('.update-btn').onclick = () => updateTeacher(teacherObj);
                clone.querySelector('.delete-btn').onclick = function () {
                    if (confirm('Are you sure you want to delete this teacher? This will preserve all their courses, which will become unassigned.')) {
                        // Call backend API
                        fetch('https://sams-backend-u79d.onrender.com/api/deleteTeacher.php', {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json',
                                'Provider': window.provider,
                                'Token': window.token,
                            },
                            body: JSON.stringify({ email: teacherObj.email })
                        })
                            .then(res => res.json())
                            .then(result => {
                                if (!window.verifyToken(result)) return;
                                if (result.success) {
                                    alert('Teacher deleted. Courses are preserved and now unassigned.');
                                    // Remove card from UI
                                    clone.remove();
                                    // Remove empty section if needed (robust)
                                    const section = grid.closest('.subject-section');
                                    if (grid.querySelectorAll('.teacher-card').length === 0) {
                                        section.remove();
                                    }
                                    updateTeacherCount();
                                } else {
                                    alert('Failed to delete teacher: ' + (result.error || 'Unknown error'));
                                }
                            })
                            .catch(error => {
                                console.error('Error deleting teacher:', error);
                                alert('An error occurred while deleting the teacher. Please try again.');
                            });
                    }
                };
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