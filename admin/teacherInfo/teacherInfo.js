function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}

// Search functionality
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search-input');
    const teacherCards = document.querySelectorAll('.teacher-card');
    const subjectFilter = document.getElementById('subjectFilter');
    const subjectSections = document.querySelectorAll('.subject-section');
    const teacherCountElement = document.querySelector('.count-number');

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            let visibleCount = 0;

            teacherCards.forEach(card => {
                const teacherName = card.querySelector('.teacher-name').textContent.toLowerCase();
                const teacherId = card.querySelector('.teacher-id').textContent.toLowerCase();

                const isVisible = teacherName.includes(searchTerm) ||
                    teacherId.includes(searchTerm);

                if (isVisible && !card.classList.contains('hidden')) {
                    card.style.display = 'flex';
                    visibleCount++;
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

            // Update count based on search results
            if (searchTerm) {
                teacherCountElement.textContent = visibleCount;
            } else {
                // Show all sections when search is cleared
                subjectSections.forEach(section => {
                    section.style.display = 'block';
                });
                updateTeacherCount();
            }
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

// Modal functionality
function showTeacherDetails(name, phone, email) {
    document.getElementById('modalName').textContent = name;
    document.getElementById('modalPhone').textContent = phone;
    document.getElementById('modalEmail').textContent = email;
    document.getElementById('detailsModal').style.display = 'block';
}

function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

function deleteTeacher(button) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        const teacherCard = button.closest('.teacher-card');
        teacherCard.remove();

        // Update teacher count after deletion
        const teacherCountElement = document.querySelector('.count-number');
        const visibleCards = document.querySelectorAll('.teacher-card:not(.hidden)');
        teacherCountElement.textContent = visibleCards.length;
    }
}

// Close modal when clicking outside of it
window.addEventListener('click', function (event) {
    const modal = document.getElementById('detailsModal');
    if (event.target === modal) {
        closeDetailsModal();
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
            const box = document.querySelector('.content');
            let grid = null;
            let prevDepartment = '';
            data.forEach((row) => {
                if (prevDepartment != row['department']) {
                    const sec = document.createElement('div');
                    sec.className = 'subject-section'
                    sec.dataset.subject = row['department'];
                    const departmentName = document.createElement('h2');
                    departmentName.className = 'subject-title';
                    departmentName.innerText = row['department'];
                    grid = document.createElement('div');
                    grid.className = 'teachers-grid';
                    sec.appendChild(departmentName);
                    sec.appendChild(grid);
                    box.appendChild(sec);
                    prevDepartment = row['department'];
                }
                const clone = html.querySelector('.teacher-card').cloneNode(true);
                clone.dataset.subject = row['department'];
                clone.querySelector('.teacher-photo').src = row['pfp'];
                clone.querySelector('.teacher-name').innerText = `${row['firstname']} ${row['lastname']}`;
                clone.querySelector('.teacher-id').innerText = row['pfp'];
                clone.querySelector('.details-btn').onclick = `showTeacherDetails('${row['firstname']} ${row['lastname']}', '${row['phone']}', '${row[email]}')`
                grid.appendChild(clone)
            })
        });
}

init()