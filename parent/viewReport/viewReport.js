// Global variables
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let students = [];
let selectedStudent = null;
let attendanceData = {};
let allStudentRecords = [];

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

// Fetch all student records from your API
async function fetchStudentRecords() {
    try {
        const response = await fetch('https://sams-backend-u79d.onrender.com/api/getStudentsProfiles.php', {
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

        allStudentRecords = data;
        return data;
    } catch (error) {
        console.error('Error fetching student records:', error);
        return [];
    }
}

// Process attendance data for calendar display
function processAttendanceForCalendar(records, studentName) {
    const attendanceMap = {};
    const dailyAttendance = {};

    records.forEach(record => {
        if (`${record.firstname} ${record.lastname}` === studentName) {
            const date = new Date(record.sent);
            const dateStr = date.toISOString().split('T')[0];
            const attendance = parseInt(record.attendance);

            // Store attendance for this date and course
            if (!dailyAttendance[dateStr]) {
                dailyAttendance[dateStr] = [];
            }

            dailyAttendance[dateStr].push({
                courseName: record.name,
                attendance: attendance,
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

            // Determine overall day status (worst case scenario)
            if (!attendanceMap[dateStr] || attendance < attendanceMap[dateStr]) {
                attendanceMap[dateStr] = attendance;
            }
        }
    });

    // Convert attendance codes to CSS classes
    const processedData = {};
    Object.keys(attendanceMap).forEach(date => {
        const status = getAttendanceStatus(attendanceMap[date]);
        processedData[date] = status;
    });

    return { calendarData: processedData, dailyData: dailyAttendance };
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

// Get attendance status display name
function getAttendanceDisplayName(attendanceCode) {
    const statusMap = {
        0: 'Excused',
        1: 'Absent',
        2: 'Late',
        3: 'Present'
    };
    return statusMap[attendanceCode] || 'Absent';
}

// Get attendance color class
function getAttendanceColorClass(attendanceCode) {
    const colorMap = {
        0: 'excused',
        1: 'absent',
        2: 'late',
        3: 'present'
    };
    return colorMap[attendanceCode] || 'absent';
}

// Generate calendar with dynamic attendance data
function generateCalendar(month, year) {
    // Only generate calendar if a student is selected
    if (!selectedStudent) return;

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthYearElement = document.getElementById('monthYear');
    if (monthYearElement) {
        monthYearElement.textContent = `${monthNames[month]} ${year}`;
    }

    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;

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
        if (attendanceData.calendarData && attendanceData.calendarData[dateStr]) {
            dayElement.classList.add(attendanceData.calendarData[dateStr]);
        }

        // Highlight today
        const today = new Date();
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayElement.classList.add('today');
        }

        // Add click handler to show daily attendance details
        dayElement.addEventListener('click', () => showDayAttendance(dateStr));

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

// Show attendance details for a specific day
function showDayAttendance(dateStr) {
    if (!attendanceData.dailyData || !attendanceData.dailyData[dateStr]) {
        alert('No attendance data available for this date.');
        return;
    }

    const dayData = attendanceData.dailyData[dateStr];
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let attendanceDetails = `Attendance for ${formattedDate}:\n\n`;

    dayData.forEach(record => {
        const status = getAttendanceDisplayName(record.attendance);
        attendanceDetails += `${record.time} - ${record.courseName}: ${status}\n`;
    });

    alert(attendanceDetails);
}

// Get today's attendance for display
function getTodaysAttendance(studentName) {
    const today = new Date().toISOString().split('T')[0];

    if (!attendanceData.dailyData || !attendanceData.dailyData[today]) {
        return [];
    }

    return attendanceData.dailyData[today];
}

// Create student card element
function createStudentCard(student) {
    const card = document.createElement('div');
    card.className = 'student-card';
    card.setAttribute('data-student-id', student.id);

    card.innerHTML = `
        <div class="student-avatar">
            <img src="/assets/icons/placeholder-parent.jpeg" alt="Student Photo" />
        </div>
        <div class="student-details">
            <div class="student-name">${student.fullName}</div>
            <div class="student-id">${student.id.toString().padStart(10, '0')}</div>
            <button class="profile-button" onclick="viewStudentProfile('${student.id}')">PROFILE</button>
        </div>
    `;

    // Add click handler for student selection
    card.addEventListener('click', (e) => {
        if (e.target.classList.contains('profile-button')) return;

        // Determine attendance status for the card
        const todaysAttendance = getTodaysAttendanceForStudent(student.fullName);
        let status = 'absent';

        if (todaysAttendance.length > 0) {
            const worstAttendance = Math.min(...todaysAttendance.map(a => a.attendance));
            status = getAttendanceStatus(worstAttendance);
        }

        showStudentDetails(status, card);
    });

    return card;
}

// Get today's attendance for a specific student (used for card status)
function getTodaysAttendanceForStudent(studentName) {
    const today = new Date().toISOString().split('T')[0];
    const studentRecords = allStudentRecords.filter(record =>
        `${record.firstname} ${record.lastname}` === studentName
    );

    return studentRecords.filter(record => {
        const recordDate = new Date(record.sent).toISOString().split('T')[0];
        return recordDate === today;
    });
}

// PRESERVED ORIGINAL FUNCTION - Handle student selection (both mobile and desktop)
function showStudentDetails(status, element) {
    // Find the student data from the clicked element
    const studentId = element.getAttribute('data-student-id');
    const student = students.find(s => s.id.toString() === studentId);

    if (!student) return;

    selectedStudent = student;

    // Process attendance data for this student
    attendanceData = processAttendanceForCalendar(allStudentRecords, student.fullName);

    const isMobile = window.matchMedia("(max-width: 750px)").matches;

    if (isMobile) {
        handleMobileStudentSelection(element, student);
    } else {
        handleDesktopStudentSelection(student);
    }
}

// Handle student selection on mobile
async function handleMobileStudentSelection(cardElement, student) {
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

        // Load attendance data and display
        await loadStudentDetails(cardElement, student);
    } 
}

// Handle student selection on desktop
async function handleDesktopStudentSelection(student) {
    const leftPanel = document.querySelector(".students-left");
    const todaysAttendance = getTodaysAttendance(student.fullName);

    // Determine overall status for today
    let overallStatus = 'absent';
    let statusIcon = '🔴';
    let statusColor = 'red';

    if (todaysAttendance.length > 0) {
        const worstAttendance = Math.min(...todaysAttendance.map(a => a.attendance));
        overallStatus = getAttendanceStatus(worstAttendance);
        statusIcon = worstAttendance === 3 ? '🔵' : worstAttendance === 2 ? '🟠' : worstAttendance === 1 ? '🔴' : '⚪';
        statusColor = getAttendanceColorClass(worstAttendance);
    }

    leftPanel.innerHTML = `
        <div class="student-card_picked">
            <div class="test">
                <div class="student-avatar_picked">
                    <img src="/assets/icons/placeholder-parent.jpeg" alt="Student Photo" />
                </div>
                <div class="student-details_picked">
                    <div class="student-name_picked">${student.fullName}</div>
                    <div class="student-id_picked">${student.id.toString().padStart(10, '0')}</div>
                    <div class="attendance-indicator ${statusColor}">
                        <span class="attendance-icon">${statusIcon}</span>
                        <span>${overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}</span>
                    </div>
                </div>
            </div>
            ${await generateChartsHTML(student)}
        </div>
    `;

    // Initialize calendar and charts
    generateCalendar(currentMonth, currentYear);
    setupCalendarNavigation(leftPanel);
}

// Load student details for mobile view
async function loadStudentDetails(cardElement, student) {
    const chartsHTML = await generateChartsHTML(student);

    cardElement.insertAdjacentHTML("beforeend", chartsHTML);

    generateCalendar(currentMonth, currentYear);
    setupCalendarNavigation(cardElement);
}

// Generate charts HTML with today's attendance
async function generateChartsHTML(student) {
    const todaysAttendance = getTodaysAttendance(student.fullName);
    const timeBlocks = generateTimeBlocks(todaysAttendance);

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

// Generate time blocks based on today's attendance
function generateTimeBlocks(todaysAttendance) {
    if (!todaysAttendance || todaysAttendance.length === 0) {
        return '<div class="no-attendance">No classes today</div>';
    }
    return todaysAttendance.map(record => {
        return `<div class="time-block ${getAttendanceColorClass(record.attendance)}">
            <div class="subject">${record.courseName}</div>
            <div class="time">${record.time}</div>
        </div>`;
    }).join('');
}

// Setup calendar navigation
function setupCalendarNavigation(container) {
    const prevBtn = container.querySelector(".nav-button.prev");
    const nextBtn = container.querySelector(".nav-button.next");

    if (prevBtn) prevBtn.addEventListener("click", previousMonth);
    if (nextBtn) nextBtn.addEventListener("click", nextMonth);
}

// Extract unique students from records
function extractStudentsFromRecords(records) {
    const studentMap = new Map();

    records.forEach(record => {
        const studentKey = `${record.firstname}_${record.lastname}`;

        if (!studentMap.has(studentKey)) {
            studentMap.set(studentKey, {
                id: record.id || Math.random().toString(36).substr(2, 9),
                firstName: record.firstname,
                lastName: record.lastname,
                fullName: `${record.firstname} ${record.lastname}`,
                pfp: '/assets/icons/placeholder-parent.jpeg'
            });
        }
    });

    return Array.from(studentMap.values());
}

// Display students in the grid
async function displayStudents() {
    const studentsGrid = document.querySelector('.students-right');
    if (!studentsGrid) return;

    // Show loading state
    studentsGrid.innerHTML = '<div class="loading">Loading students...</div>';

    try {
        const records = await fetchStudentRecords();

        if (records.length === 0) {
            studentsGrid.innerHTML = '<div class="no-students">No students found.</div>';
            return;
        }

        // Extract unique students from records
        students = extractStudentsFromRecords(records);

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

        // Clear selected student
        selectedStudent = null;

        // Refresh student display
        displayStudents();
    }

    wasMobile = isNowMobile;
});

// document.addEventListener('DOMContentLoaded', function () {
//     // Load and display students
//     displayStudents();

//     // Set up global navigation functions
//     window.previousMonth = previousMonth;
//     window.nextMonth = nextMonth;
//     window.viewStudentProfile = viewStudentProfile;

//     document.addEventListener('click', function(event) {
//         const pickedCard = document.querySelector('.student-card_picked');
//         if (pickedCard && !pickedCard.contains(event.target)) {
//             pickedCard.classList.remove('student-card_picked');

//             selectedStudent = null;
//         }
//     });
// });

// Export functions for global access
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;