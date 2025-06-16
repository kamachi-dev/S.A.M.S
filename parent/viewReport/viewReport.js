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
    const dayHeaders = calendarGrid.querySelectorAll('.day-header');
    calendarGrid.innerHTML = '';
    dayHeaders.forEach(header => calendarGrid.appendChild(header));
    
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

// Chart functionality
function drawDonutChart(canvasId, data, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return; // Exit if canvas doesn't exist
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 60;
    const innerRadius = 35;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate total and percentages
    const total = data.reduce((sum, value) => sum + value, 0);
    let currentAngle = -Math.PI / 2; // Start from top
    
    // Draw segments
    data.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        
        // Draw outer arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
        ctx.closePath();
        ctx.fillStyle = colors[index];
        ctx.fill();
        
        currentAngle += sliceAngle;
    });
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Generate initial calendar
    generateCalendar(currentMonth, currentYear);
    
    const currentAttendanceData = [75, 15, 10]; // Present, Late, Absent percentages
    const termAttendanceData = [80, 12, 8];
    const chartColors = ['#3498db', '#f39c12', '#e74c3c'];
    
    drawDonutChart('currentChart', currentAttendanceData, chartColors);
    drawDonutChart('termChart', termAttendanceData, chartColors);
});

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