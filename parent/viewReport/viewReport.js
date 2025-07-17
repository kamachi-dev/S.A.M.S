// Global variables
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let students = [];
let selectedStudent = null;
let attendanceData = {};

function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}

// Navigation functions
function viewStudentProfile(studentId) {
    sessionStorage.setItem('selectedStudentId', studentId);
    window.location.href = 'viewReport.html';
}

function goBackToOverview() {
    window.location.href = 'studentOverview.html';
}

// Calendar functionality
function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
}

// Fetch students data from API
async function fetchStudents() {
    try {
        const response = await fetch('https://sams-backend-u79d.onrender.com/api/getStudents.php', {
            credentials: 'include',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Provider': window.provider,
                'Token': window.token,
            }
        });
        
        const data = await response.json();
        
        if (!window.verifyToken(data)) return [];
        
        students = data.map(student => ({
            id: student.id,
            firstName: student.firstname,
            lastName: student.lastname,
            fullName: `${student.firstname} ${student.lastname}`,
            gradeLevel: student.grade_level,
            email: student.email || `${student.firstname.toLowerCase()}.${student.lastname.toLowerCase()}@student.mmcl.edu.ph`,
            phone: student.phone || '(555) 0000',
            pfp: student.pfp || '/assets/icons/placeholder-parent.jpeg',
            parentId: student.parent
        }));
        
        return students;
    } catch (error) {
        console.error('Error fetching students:', error);
        return [];
    }
}

// Fetch attendance data for a specific student
async function fetchStudentAttendance(studentId) {
    try {
        const response = await fetch(`https://sams-backend-u79d.onrender.com/api/getStudentAttendance.php?student_id=${studentId}`, {
            credentials: 'include',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Provider': window.provider,
                'Token': window.token,
            }
        });
        
        const data = await response.json();
        
        if (!window.verifyToken(data)) return {};
        
        // Process attendance data into a format suitable for calendar
        const processedData = {};
        data.forEach(record => {
            const date = new Date(record.date).toISOString().split('T')[0];
            const attendanceStatus = getAttendanceStatus(record.attendance);
            processedData[date] = attendanceStatus;
        });
        
        return processedData;
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return {};
    }
}

// Convert attendance number to status string
function getAttendanceStatus(attendanceCode) {
    const statusMap = {
        0: 'excused',
        1: 'absent', 
        2: 'late',
        3: 'present'
    };
    return statusMap[attendanceCode] || 'absent';
}

// Fetch course records for attendance timeline
async function fetchCourseRecords(studentId) {
    try {
        const response = await fetch(`https://sams-backend-u79d.onrender.com/api/getStudentCourseRecords.php?student_id=${studentId}`, {
            credentials: 'include',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Provider': window.provider,
                'Token': window.token,
            }
        });
        
        const data = await response.json();
        
        if (!window.verifyToken(data)) return [];
        
        return data;
    } catch (error) {
        console.error('Error fetching course records:', error);
        return [];
    }
}

// Generate calendar with dynamic attendance data
function generateCalendar(month, year) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;

    const calendarGrid = document.querySelector('.calendar-grid');
    const days = calendarGrid.querySelectorAll('.calendar-day, .other-month');
    days.forEach(day => day.remove());

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        const prevMonthDay = new Date(year, month, 0 - (startingDayOfWeek - 1 - i));
        emptyDay.textContent = prevMonthDay.getDate();
        calendarGrid.appendChild(emptyDay);
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Add attendance class if data exists
        if (attendanceData[dateStr]) {
            dayElement.classList.add(attendanceData[dateStr]);
        }

        // Highlight today
        const today = new Date();
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayElement.classList.add('today');
        }

        calendarGrid.appendChild(dayElement);
    }

    // Fill remaining cells
    const totalCells = 42;
    const currentCells = calendarGrid.children.length;
    for (let i = currentCells; i < totalCells; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        const nextMonthDay = i - currentCells + 1;
        emptyDay.textContent = nextMonthDay;
        calendarGrid.appendChild(emptyDay);
    }
}

// Create student card element
function createStudentCard(student) {
    const card = document.createElement('div');
    card.className = 'student-card';
    card.setAttribute('data-student-id', student.id);
    
    // Determine attendance status (you can enhance this with real-time data)
    const attendanceStatus = Math.random() > 0.7 ? 'present' : Math.random() > 0.5 ? 'late' : 'absent';
    
    card.innerHTML = `
        <div class="student-avatar">
            <img src="${student.pfp}" alt="Student Photo" />
        </div>
        <div class="student-details">
            <div class="student-name">${student.fullName}</div>
            <div class="student-id">${student.id.toString().padStart(10, '0')}</div>
            <button class="profile-button" onclick="viewStudentProfile('${student.id}')">PROFILE</button>
        </div>
    `;
    
    // Add click handler for student selection
    card.addEventListener('click', (e) => {
        if (e.target.classList.contains('profile-button')) return; // Don't trigger on button click
        
        const isMobile = window.matchMedia("(max-width: 750px)").matches;
        
        if (isMobile) {
            handleMobileStudentSelection(card, student, attendanceStatus);
        } else {
            handleDesktopStudentSelection(student, attendanceStatus);
        }
    });
    
    return card;
}

// Handle student selection on mobile
async function handleMobileStudentSelection(cardElement, student, status) {
    const isAlreadyPicked = cardElement.classList.contains('student-card_picked');
    
    // Reset all other cards
    document.querySelectorAll('.student-card_picked').forEach(card => {
        card.classList.remove('student-card_picked');
        card.classList.add('student-card');
        const charts = card.querySelector(".charts-top-bottom");
        if (charts) charts.remove();
    });
    
    if (!isAlreadyPicked) {
        cardElement.classList.remove('student-card');
        cardElement.classList.add('student-card_picked');
        
        selectedStudent = student;
        
        // Fetch and display student details
        await loadStudentDetails(cardElement, student, status);
    }
}

// Handle student selection on desktop
async function handleDesktopStudentSelection(student, status) {
    selectedStudent = student;
    
    // Load attendance data for this student
    attendanceData = await fetchStudentAttendance(student.id);
    
    const leftPanel = document.querySelector(".students-left");
    const statusIcon = status === 'present' ? '🔵' : status === 'late' ? '🟠' : '🔴';
    const statusColor = status === 'present' ? 'blue' : status === 'late' ? 'orange' : 'red';
    
    leftPanel.innerHTML = `
        <div class="student-card_picked">
            <div class="test">
                <div class="student-avatar_picked">
                    <img src="${student.pfp}" alt="Student Photo" />
                </div>
                <div class="student-details_picked">
                    <div class="student-name_picked">${student.fullName}</div>
                    <div class="student-id_picked">${student.id.toString().padStart(10, '0')}</div>
                    <div class="attendance-indicator ${statusColor}">
                        <span class="attendance-icon">${statusIcon}</span>
                        <span>${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </div>
                </div>
            </div>
            ${await generateChartsHTML(student)}
        </div>
    `;
    
    // Initialize calendar and charts
    generateCalendar(currentMonth, currentYear);
    setupCalendarNavigation(leftPanel);
    drawCharts();
}

// Load student details for mobile view
async function loadStudentDetails(cardElement, student, status) {
    attendanceData = await fetchStudentAttendance(student.id);
    const chartsHTML = await generateChartsHTML(student);
    
    cardElement.insertAdjacentHTML("beforeend", chartsHTML);
    
    generateCalendar(currentMonth, currentYear);
    setupCalendarNavigation(cardElement);
    drawCharts();
}

// Generate charts HTML
async function generateChartsHTML(student) {
    const courseRecords = await fetchCourseRecords(student.id);
    const timeBlocks = generateTimeBlocks(courseRecords);
    
    return `
        <div class="charts-top-bottom">
            <div class="charts-container">
                <div class="chart-section">
                    <h4>Today's Attendance</h4>
                    <div class="chart-wrapper">
                        <div class="time-blocks">
                            ${timeBlocks}
                        </div>
                    </div>
                </div>
                <div class="calendar-container">
                    <div class="calendar-header">
                        <button class="nav-button prev" onclick="previousMonth()"><</button>
                        <h3 id="monthYear">December 2026</h3>
                        <button class="nav-button next" onclick="nextMonth()">></button>
                    </div>
                    <div class="calendar-grid">
                        <div class="day-header">Mo</div>
                        <div class="day-header">Tu</div>
                        <div class="day-header">We</div>
                        <div class="day-header">Th</div>
                        <div class="day-header">Fr</div>
                        <div class="day-header">Sa</div>
                        <div class="day-header">Su</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Generate time blocks based on course records
function generateTimeBlocks(courseRecords) {
    if (!courseRecords || courseRecords.length === 0) {
        return `
            <div class="time-block time-7"><div class="subject">Math Class</div><div class="time">7:00</div></div>
            <div class="time-block time-8"><div class="subject">English Literature</div><div class="time">8:00</div></div>
            <div class="time-block time-9"><div class="subject">History</div><div class="time">9:00</div></div>
            <div class="time-block time-10"><div class="subject">Chemistry Lab</div><div class="time">10:00</div></div>
            <div class="time-block time-11"><div class="subject">Lunch</div><div class="time">11:00</div></div>
            <div class="time-block time-12"><div class="subject">Physics</div><div class="time">12:00</div></div>
            <div class="time-block time-1"><div class="subject">Computer Science</div><div class="time">1:00</div></div>
            <div class="time-block time-2"><div class="subject">Music</div><div class="time">2:00</div></div>
            <div class="time-block time-3"><div class="subject">Sports</div><div class="time">3:00</div></div>
        `;
    }
    
    return courseRecords.map(record => {
        const time = new Date(record.start_time).toLocaleTimeString([], {hour: 'numeric'});
        const timeClass = `time-${new Date(record.start_time).getHours()}`;
        const attendanceClass = getAttendanceStatus(record.attendance);
        
        return `
            <div class="time-block ${timeClass} ${attendanceClass}">
                <div class="subject">${record.course_name}</div>
                <div class="time">${time}</div>
            </div>
        `;
    }).join('');
}

// Setup calendar navigation
function setupCalendarNavigation(container) {
    const prevBtn = container.querySelector(".nav-button.prev");
    const nextBtn = container.querySelector(".nav-button.next");
    
    if (prevBtn) prevBtn.addEventListener("click", previousMonth);
    if (nextBtn) nextBtn.addEventListener("click", nextMonth);
}

// Draw donut charts
function drawCharts() {
    // Sample data - you can replace with real attendance statistics
    drawDonutChart('dailyDonut', [5, 1, 2], ['#0093ff', '#ffcd03', '#ef2722']);
    drawDonutChart('termDonut', [20, 4, 3], ['#0093ff', '#ffcd03', '#ef2722']);
}

function drawDonutChart(canvasId, data, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 60;
    const innerRadius = 35;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const total = data.reduce((a, b) => a + b, 0);
    let startAngle = -Math.PI / 2;

    data.forEach((value, index) => {
        const angle = (value / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + angle);
        ctx.closePath();
        ctx.fillStyle = colors[index];
        ctx.fill();
        startAngle += angle;
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
}

// Display students in the grid
async function displayStudents() {
    const studentsGrid = document.querySelector('.students-right');
    if (!studentsGrid) return;
    
    // Show loading state
    studentsGrid.innerHTML = '<div class="loading">Loading students...</div>';
    
    try {
        const students = await fetchStudents();
        
        if (students.length === 0) {
            studentsGrid.innerHTML = '<div class="no-students">No students found.</div>';
            return;
        }
        
        // Clear loading state
        studentsGrid.innerHTML = '';
        
        // Create and append student cards
        students.forEach(student => {
            const card = createStudentCard(student);
            studentsGrid.appendChild(card);
        });
        
        // Update student count if element exists
        const countElement = document.querySelector('.count-number');
        if (countElement) {
            countElement.textContent = students.length;
        }
        
    } catch (error) {
        console.error('Error displaying students:', error);
        studentsGrid.innerHTML = '<div class="error">Error loading students. Please try again.</div>';
    }
}

// Handle responsive behavior
let wasMobile = window.matchMedia("(max-width: 750px)").matches;

window.addEventListener('resize', () => {
    const isNowMobile = window.matchMedia("(max-width: 750px)").matches;

    if (wasMobile && !isNowMobile) {
        // Reset when switching from mobile to desktop
        const leftPanel = document.querySelector(".students-left");
        if (leftPanel) {
            leftPanel.innerHTML = `
                <div class="students-left" id="studentDetailsPanel">
                    Please Select a student to display its contents
                </div>
            `;
        }
        
        // Refresh student display
        displayStudents();
    }

    wasMobile = isNowMobile;
});

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Generate initial calendar
    generateCalendar(currentMonth, currentYear);
    
    // Load and display students
    displayStudents();
    
    // Set up global navigation functions
    window.previousMonth = previousMonth;
    window.nextMonth = nextMonth;
    window.viewStudentProfile = viewStudentProfile;
    window.showStudentDetails = (status, element) => {
        if (selectedStudent) {
            const isMobile = window.matchMedia("(max-width: 750px)").matches;
            if (isMobile) {
                handleMobileStudentSelection(element, selectedStudent, status);
            } else {
                handleDesktopStudentSelection(selectedStudent, status);
            }
        }
    };
});

// Export functions for global access
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.viewStudentProfile = viewStudentProfile;
window.showStudentDetails = showStudentDetails;