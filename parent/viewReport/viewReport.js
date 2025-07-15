// donutData.forEach(entry => {
//     drawDonutChart(entry.ctxId, entry.data, entry.colors);
// });

function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}

// Navigation functions
function viewStudentProfile(studentId) {
    // Store the student ID in sessionStorage for later use if needed
    sessionStorage.setItem('selectedStudentId', studentId);
    // Navigate to the detailed view
    window.location.href = 'viewReport.html';
}

function goBackToOverview() {
    // Navigate back to the overview page
    window.location.href = 'studentOverview.html';
}

// Calendar functionality
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();


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

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Generate initial calendar
    generateCalendar(currentMonth, currentYear);
});

// SAMPLE DATA
const attendanceData = {
    '2026-12-01': 'present',
    '2026-12-02': 'present',
    '2026-12-03': 'late',
    '2026-12-04': 'present',
    '2026-12-05': 'absent',
    '2026-12-08': 'present',
    '2026-12-09': 'present',
    '2026-12-10': 'present',
    '2026-12-11': 'late',
    '2026-12-12': 'present',
    '2026-12-15': 'present',
    '2026-12-16': 'present',
    '2026-12-17': 'present',
    '2026-12-18': 'present',
    '2026-12-19': 'absent',
    '2026-12-22': 'present',
    '2026-12-23': 'present',
    '2026-12-24': 'late',
    '2026-12-25': 'absent',
    '2026-12-26': 'present',
    '2026-12-29': 'present',
    '2026-12-30': 'present',
    '2026-12-31': 'present'
};

function generateCalendar(month, year) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Update month/year display
    document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;

    // Get calendar grid
    const calendarGrid = document.querySelector('.calendar-grid');

    // Clear existing days (keep headers)
    const days = calendarGrid.querySelectorAll('.calendar-day, .other-month');
    days.forEach(day => day.remove());

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert to Monday = 0

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

        // Format date for lookup
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
    const totalCells = 42; // 6 rows × 7 days
    const currentCells = calendarGrid.children.length;
    for (let i = currentCells; i < totalCells; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        const nextMonthDay = i - currentCells + 1;
        emptyDay.textContent = nextMonthDay;
        calendarGrid.appendChild(emptyDay);
    }
}

// // // Chart functionality
// function drawDonutChart(canvasId, data, colors) {
//     const canvas = document.getElementById(canvasId);
//     if (!canvas) return; // Exit if canvas doesn't exist

//     const ctx = canvas.getContext('2d');
//     const centerX = canvas.width / 2;
//     const centerY = canvas.height / 2;
//     const outerRadius = 60;
//     const innerRadius = 35;

//     // Clear canvas
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Calculate total and percentages
//     const total = data.reduce((sum, value) => sum + value, 0);
//     let currentAngle = -Math.PI / 2; // Start from top

//     // Draw segments
//     data.forEach((value, index) => {
//         const sliceAngle = (value / total) * 2 * Math.PI;

//         // Draw outer arc
//         ctx.beginPath();
//         ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
//         ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
//         ctx.closePath();
//         ctx.fillStyle = colors[index];
//         ctx.fill();

//         currentAngle += sliceAngle;
//     });
// }



// Enable Swiping for profile contents
const grid = document.querySelector('.students-grid');

let isDragging = false;
let startX = 0;
let scrollLeft = 0;
const scrollSpeed = 3; // 🔧 Increase this value for faster scroll

grid.addEventListener('mousedown', (e) => {
    isDragging = true;
    grid.classList.add('dragging');
    startX = e.clientX;
    scrollLeft = grid.scrollLeft;
    e.preventDefault(); // prevent text/image drag
});

grid.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x = e.clientX;
    const walk = (x - startX) * scrollSpeed;
    grid.scrollLeft = scrollLeft - walk;
});

grid.addEventListener('mouseup', () => {
    isDragging = false;
    grid.classList.remove('dragging');
});

grid.addEventListener('mouseleave', () => {
    isDragging = false;
    grid.classList.remove('dragging');
});

function viewStudentProfile(studentId) {
    window.location.href = `viewReport.html?studentId=${studentId}`;
}

function getStudents() {
    fetch('https://sams-backend-u79d.onrender.com/api/getStudents.php', {
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
            const leftContent = document.querySelector('.students-grid');
            leftContent.innerHTML = '';
            data.forEach(student => {
                const clone = studentProfile.querySelector('.student-card').cloneNode(true);
                clone.id = `student-${student['id']}`;
                clone.querySelector('.student-id').innerHTML = student['id'].toString().padStart(10, '0');
                clone.querySelector('#pfp').src = '/assets/icons/placeholder-parent.jpeg';
                clone.querySelector('.student-name').textContent = `${student['lastname']}, ${student['firstname']}`;
                clone.addEventListener('click', () => {
                    viewStudentProfile(student['id']);
                });
                leftContent.appendChild(clone);
            });
        });
}

const parser = new DOMParser();
let studentProfile;
fetch('/assets/templates/child.html')
    .then(res => res.text())
    .then(txt => parser.parseFromString(txt, 'text/html'))
    .then(html => {
        studentProfile = html;
        getStudents();
    });

// Chart Generation
function drawDonutChart(canvasId, data, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 60;
    const innerRadius = 35;

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const total = data.reduce((a, b) => a + b, 0);
    let startAngle = -Math.PI / 2;

    // Draw each segment
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

    // Draw inner circle to create the donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
}

// For Showing Selected profile on left and add details if mobile
function showStudentDetails(status, element = null) {
    const isMobile = window.matchMedia("(max-width: 750px)").matches;

    const dailyId = `dailyDonut-${status}-${Date.now()}`;
    const termId = `termDonut-${status}-${Date.now()}`;

    const statusIcon = status === 'present' ? '🔵' : status === 'late' ? '🟠' : '🔴';
    const statusColor = status === 'present' ? 'blue' : status === 'late' ? 'orange' : 'red';

    const chartsHTML = `
        <div class="charts-top-bottom">
            <div class="charts-container">
                <div class="chart-section">
                    <h4>Today's Attendance</h4>
                    <div class="chart-wrapper">
                        <div class="time-blocks">
                            <div class="time-block time-7"><div class="subject">Math Class</div><div class="time">7:00</div></div>
                            <div class="time-block time-8"><div class="subject">English Literature</div><div class="time">8:00</div></div>
                            <div class="time-block time-9"><div class="subject">History</div><div class="time">9:00</div></div>
                            <div class="time-block time-10"><div class="subject">Chemistry Lab</div><div class="time">10:00</div></div>
                            <div class="time-block time-11"><div class="subject">Lunch</div><div class="time">11:00</div></div>
                            <div class="time-block time-12"><div class="subject">Physics</div><div class="time">12:00</div></div>
                            <div class="time-block time-1"><div class="subject">Computer Science</div><div class="time">1:00</div></div>
                            <div class="time-block time-2"><div class="subject">Music</div><div class="time">2:00</div></div>
                            <div class="time-block time-3"><div class="subject">Sports</div><div class="time">3:00</div></div>
                        </div>
                    </div>
                </div>
                <div class="calendar-container">
                    <div class="calendar-header">
                        <button class="nav-button prev">&lt;</button>
                        <h3 id="monthYear">December 2026</h3>
                        <button class="nav-button next">&gt;</button>
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

    if (isMobile) {
        const existing = element.querySelector(".charts-top-bottom");
        if (existing) {
            existing.remove();
            return;
        }

        document.querySelectorAll(".charts-top-bottom").forEach(el => el.remove());

        element.insertAdjacentHTML("beforeend", chartsHTML);

        // ✅ Generate calendar after HTML is added
        generateCalendar(currentMonth, currentYear);

        // ✅ Attach navigation listeners
        element.querySelector(".nav-button.prev").addEventListener("click", previousMonth);
        element.querySelector(".nav-button.next").addEventListener("click", nextMonth);

        drawDonutChart(dailyId, [5, 1, 2], ['#0093ff', '#ffcd03', '#ef2722']);
        drawDonutChart(termId, [20, 4, 3], ['#0093ff', '#ffcd03', '#ef2722']);

    } else {
        const leftPanel = document.querySelector(".students-left");
        leftPanel.innerHTML = `
            <div class="student-card_picked">
                <div class="test">
                    <div class="student-avatar_picked">
                        <img src="/assets/Sample.png" alt="Student Photo" />
                    </div>
                    <div class="student-details_picked">
                        <div class="student-name_picked">Joshua Simon S. Komachi</div>
                        <div class="student-id_picked">20211535356</div>
                        <div class="attendance-indicator ${statusColor}">
                            <span class="attendance-icon">${statusIcon}</span>
                            <span>${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                        </div>
                    </div>
                </div>
                ${chartsHTML}
            </div>
        `;

        // ✅ Generate calendar after HTML is added
        generateCalendar(currentMonth, currentYear);

        // ✅ Attach navigation listeners
        leftPanel.querySelector(".nav-button.prev").addEventListener("click", previousMonth);
        leftPanel.querySelector(".nav-button.next").addEventListener("click", nextMonth);

        drawDonutChart(dailyId, [5, 1, 2], ['#0093ff', '#ffcd03', '#ef2722']);
        drawDonutChart(termId, [20, 4, 3], ['#0093ff', '#ffcd03', '#ef2722']);
    }
}


window.previousMonth = previousMonth;
window.nextMonth = nextMonth;