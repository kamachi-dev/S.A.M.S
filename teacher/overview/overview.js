base_url = 'https://sams-backend-u79d.onrender.com'; 

// Global variables for charts
let dailyChart, termChart, yearChart;
let presentBarChart, absentBarChart, lateBarChart;
let allDashboardData = []; // Store all data for filtering
let filteredData = []; // Store currently filtered data

// Initialize charts with placeholder data first
function initializeCharts() {
    // Donut Charts initial data (will be updated with real data)
    const initialDonutData = [
        {
            ctxId: 'dailyDonut',
            percent: 0,
            data: [0, 0, 0], // Present, Late, Absent
            colors: ['#0093ff', '#ffcd03', '#ef2722'],
        },
        {
            ctxId: 'termDonut',
            percent: 0,
            data: [0, 0, 0],
            colors: ['#0093ff', '#ffcd03', '#ef2722'],
        },
        {
            ctxId: 'yearDonut',
            percent: 0,
            data: [0, 0, 0],
            colors: ['#0093ff', '#ffcd03', '#ef2722'],
        }
    ];

    // Create donut charts
    initialDonutData.forEach((donut, index) => {
        const ctx = document.getElementById(donut.ctxId).getContext('2d');
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Late', 'Absent'],
                datasets: [{
                    data: donut.data,
                    backgroundColor: donut.colors,
                    borderWidth: 0,
                    hoverOffset: 6,
                }]
            },
            options: {
                cutout: '74%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function (context) {
                                return `${context.label}: ${context.parsed}`;
                            }
                        }
                    }
                }
            }
        });

        // Store chart references
        if (index === 0) dailyChart = chart;
        else if (index === 1) termChart = chart;
        else if (index === 2) yearChart = chart;
    });

    // Initialize bar charts
    initializeBarCharts();
}

// Initialize bar charts
function initializeBarCharts() {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    // Present bar chart (blue)
    presentBarChart = new Chart(document.getElementById('presentBar').getContext('2d'), {
        type: 'bar',
        data: {
            labels: weeks,
            datasets: [{
                label: 'Present (%)',
                data: [0, 0, 0, 0],
                backgroundColor: '#0093ff'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: "#e7e7e7" } },
                x: { grid: { display: false } }
            }
        }
    });

    // Absent bar chart (red)
    absentBarChart = new Chart(document.getElementById('absentBar').getContext('2d'), {
        type: 'bar',
        data: {
            labels: weeks,
            datasets: [{
                label: 'Absent (%)',
                data: [0, 0, 0, 0],
                backgroundColor: '#ef2722'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: "#e7e7e7" } },
                x: { grid: { display: false } }
            }
        }
    });

    // Late bar chart (yellow)
    lateBarChart = new Chart(document.getElementById('lateBar').getContext('2d'), {
        type: 'bar',
        data: {
            labels: weeks,
            datasets: [{
                label: 'Late (%)',
                data: [0, 0, 0, 0],
                backgroundColor: '#ffcd03'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: "#e7e7e7" } },
                x: { grid: { display: false } }
            }
        }
    });
}

// Fetch dashboard data from API
async function fetchDashboardData() {
    try {
        const response = await fetch(`${base_url}/api/getTeacherDashboard.php`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Provider': window.provider,
                'Token': window.token,
            }
        });

        const data = await response.json();

        if (!window.verifyToken(data)) {
            console.error('Token verification failed');
            return null;
        }

        if (data.error) {
            console.error('API Error:', data.error);
            return null;
        }

        console.log('Dashboard data received:', data);
        return data;

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return null;
    }
}

// Populate filter dropdowns with unique values from data
function populateFilterDropdowns(data) {
    const subjects = new Set();
    const grades = new Set();
    
    data.forEach(record => {
        if (record.name) subjects.add(record.name);
        if (record.grade_level) grades.add(record.grade_level);
    });
    
    // Populate subject dropdown
    const subjectSelect = document.querySelector('.filter-select');
    if (subjectSelect) {
        // Clear existing options except "All Subjects"
        subjectSelect.innerHTML = '<option value="all">All Subjects</option>';
        
        Array.from(subjects).sort().forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });
    }
    
    // Populate grade dropdown
    const gradeSelect = document.querySelectorAll('.filter-select')[1];
    if (gradeSelect) {
        // Clear existing options except "All Grades"
        gradeSelect.innerHTML = '<option value="all">All Grades</option>';
        
        Array.from(grades).sort().forEach(grade => {
            const option = document.createElement('option');
            option.value = grade;
            option.textContent = grade;
            gradeSelect.appendChild(option);
        });
    }
}

// Filter data based on selected criteria
function filterData() {
    const subjectSelect = document.querySelector('.filter-select');
    const gradeSelect = document.querySelectorAll('.filter-select')[1];
    
    const selectedSubject = subjectSelect ? subjectSelect.value : 'all';
    const selectedGrade = gradeSelect ? gradeSelect.value : 'all';
    
    console.log('Filtering by:', { subject: selectedSubject, grade: selectedGrade });
    
    filteredData = allDashboardData.filter(record => {
        const subjectMatch = selectedSubject === 'all' || record.name === selectedSubject;
        const gradeMatch = selectedGrade === 'all' || record.grade_level === selectedGrade;
        
        return subjectMatch && gradeMatch;
    });
    
    console.log('Filtered data count:', filteredData.length);
    
    // Update charts with filtered data
    if (filteredData.length > 0) {
        const stats = calculateAttendanceStats(filteredData);
        updateChartsWithData(stats);
    } else {
        // Show empty state if no data matches filters
        const emptyStats = {
            daily: { present: 0, late: 0, absent: 0, excused: 0, total: 0 },
            term: { present: 0, late: 0, absent: 0, excused: 0, total: 0 },
            year: { present: 0, late: 0, absent: 0, excused: 0, total: 0 },
            uniqueStudents: new Set(),
            weeklyData: {
                present: [0, 0, 0, 0],
                absent: [0, 0, 0, 0],
                late: [0, 0, 0, 0]
            }
        };
        updateChartsWithData(emptyStats);
    }
}

// Setup filter event listeners
function setupFilterListeners() {
    const subjectSelect = document.querySelector('.filter-select');
    const gradeSelect = document.querySelectorAll('.filter-select')[1];
    
    if (subjectSelect) {
        subjectSelect.addEventListener('change', function() {
            console.log('Subject filter changed to:', this.value);
            filterData();
        });
    }
    
    if (gradeSelect) {
        gradeSelect.addEventListener('change', function() {
            console.log('Grade filter changed to:', this.value);
            filterData();
        });
    }
}

// Calculate attendance statistics
function calculateAttendanceStats(records) {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Calculate current term (4-month periods)
    const currentMonth = today.getMonth() + 1; // 1-12
    let termStart, termEnd;
    
    if (currentMonth >= 1 && currentMonth <= 4) {
        termStart = 1; termEnd = 4;
    } else if (currentMonth >= 5 && currentMonth <= 8) {
        termStart = 5; termEnd = 8;
    } else {
        termStart = 9; termEnd = 12;
    }

    const stats = {
        daily: { present: 0, late: 0, absent: 0, excused: 0, total: 0 },
        term: { present: 0, late: 0, absent: 0, excused: 0, total: 0 },
        year: { present: 0, late: 0, absent: 0, excused: 0, total: 0 },
        uniqueStudents: new Set(),
        weeklyData: {
            present: [0, 0, 0, 0],
            absent: [0, 0, 0, 0],
            late: [0, 0, 0, 0]
        }
    };

    records.forEach(record => {
        const recordDate = new Date(record.sent);
        const recordYear = recordDate.getFullYear();
        const recordMonth = recordDate.getMonth() + 1;
        const recordDay = recordDate.toDateString();
        const todayString = today.toDateString();
        
        // Track unique students
        stats.uniqueStudents.add(`${record.firstname}_${record.lastname}`);
        
        // Map attendance codes: 0=excused, 1=absent, 2=late, 3=present
        const attendance = parseInt(record.attendance);
        let category;
        
        switch(attendance) {
            case 0: category = 'excused'; break;
            case 1: category = 'absent'; break;
            case 2: category = 'late'; break;
            case 3: category = 'present'; break;
            default: category = 'absent'; break;
        }

        // Daily stats (today only)
        if (recordDay === todayString) {
            stats.daily[category]++;
            stats.daily.total++;
        }

        // Term stats (current term)
        if (recordYear === currentYear && recordMonth >= termStart && recordMonth <= termEnd) {
            stats.term[category]++;
            stats.term.total++;
        }

        // Year stats (current calendar year)
        if (recordYear === currentYear) {
            stats.year[category]++;
            stats.year.total++;
            
            // Calculate weekly data for bar charts
            const weekOfMonth = Math.ceil(recordDate.getDate() / 7) - 1;
            if (weekOfMonth >= 0 && weekOfMonth < 4) {
                if (attendance === 3) { // present
                    stats.weeklyData.present[weekOfMonth]++;
                } else if (attendance === 1) { // absent
                    stats.weeklyData.absent[weekOfMonth]++;
                } else if (attendance === 2) { // late
                    stats.weeklyData.late[weekOfMonth]++;
                }
            }
        }
    });

    // Calculate percentages for weekly data
    const totalStudents = stats.uniqueStudents.size || 1;
    stats.weeklyData.present = stats.weeklyData.present.map(count => 
        totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(2) : 0
    );
    stats.weeklyData.absent = stats.weeklyData.absent.map(count => 
        totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(2) : 0
    );
    stats.weeklyData.late = stats.weeklyData.late.map(count => 
        totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(2) : 0
    );

    return stats;
}

// Update charts with real data
function updateChartsWithData(stats) {
    // Update donut charts
    updateDonutChart(dailyChart, stats.daily, 'dailyDonut');
    updateDonutChart(termChart, stats.term, 'termDonut');
    updateDonutChart(yearChart, stats.year, 'yearDonut');

    // Update bar charts
    updateBarChart(presentBarChart, stats.weeklyData.present);
    updateBarChart(absentBarChart, stats.weeklyData.absent);
    updateBarChart(lateBarChart, stats.weeklyData.late);

    // Update student count
    const studentCountElement = document.querySelector('.count-number');
    if (studentCountElement) {
        studentCountElement.textContent = stats.uniqueStudents.size;
    }
}

// Update individual donut chart
function updateDonutChart(chart, periodStats, chartId) {
    const total = periodStats.total || 1;
    const presentCount = periodStats.present || 0;
    const lateCount = periodStats.late || 0;
    const absentCount = periodStats.absent || 0;
    
    // Calculate percentage (present + late as "attendance")
    const attendancePercentage = total > 0 ? (((presentCount + lateCount) / total) * 100).toFixed(2) : 0;
    
    // Update chart data
    chart.data.datasets[0].data = [presentCount, lateCount, absentCount];
    chart.update();
    
    // Update percentage display
    const percentElement = document.querySelector(`#${chartId}`).parentElement.querySelector('.chart-percent');
    if (percentElement) {
        percentElement.textContent = `${attendancePercentage}%`;
    }
    
    // Update legend values
    const legendContainer = document.querySelector(`#${chartId}`).parentElement.querySelector('.legend-donut');
    if (legendContainer) {
        const legendItems = legendContainer.querySelectorAll('.legend-val');
        if (legendItems.length >= 3) {
            legendItems[0].textContent = presentCount; // Present
            legendItems[1].textContent = lateCount;    // Late
            legendItems[2].textContent = absentCount;  // Absent
        }
    }
}

// Update bar chart
function updateBarChart(chart, data) {
    chart.data.datasets[0].data = data;
    chart.update();
}

// Download attendance data as CSV with real data
function downloadAttendanceData() {
    // This function will be enhanced with real data when available
    // For now, keeping the existing implementation
    
    // Get current filter values
    const subject = document.querySelector('.filter-select').value || 'All Subjects';
    const grade = document.querySelectorAll('.filter-select')[1].value || 'All Grades';
    const section = document.querySelectorAll('.filter-select')[2].value || 'All Sections';
    const term = document.querySelectorAll('.filter-select')[3].value || 'All Terms';
    
    // Sample attendance data based on the visualizations
    const attendanceData = [
        // Header row
        ['Period', 'Present', 'Late', 'Absent', 'Total', 'Percentage'],
        
        // Daily data
        ['Daily Class Attendance', '25', '1', '0', '26', '81.25%'],
        
        // Term data  
        ['Class Term Attendance', '204', '103', '27', '334', '76.5%'],
        
        // School Year data
        ['Class School Year Attendance', '548', '236', '259', '1043', '63.85%'],
        
        // Weekly breakdown (from bar charts)
        ['Week 1 - Present', '83.45%', '', '', '', ''],
        ['Week 1 - Late', '97.62%', '', '', '', ''],
        ['Week 2 - Present', '94.44%', '', '', '', ''],
        ['Week 2 - Late', '29.82%', '', '', '', ''],
        ['Week 3 - Present', '78.17%', '', '', '', ''],
        ['Week 3 - Late', '24.11%', '', '', '', ''],
        ['Week 4 - Present', '80.81%', '', '', '', ''],
        ['Week 4 - Late', '27.86%', '', '', '', ''],
    ];
    
    // Add filter information at the top
    const headerInfo = [
        ['SAMS Attendance Report'],
        ['Generated on:', new Date().toLocaleDateString()],
        ['Subject:', subject],
        ['Grade:', grade], 
        ['Section:', section],
        ['Term:', term],
        [''], // Empty row for spacing
    ];
    
    // Combine header info with attendance data
    const fullData = [...headerInfo, ...attendanceData];
    
    // Convert to CSV format
    const csvContent = fullData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        
        // Generate filename with current date and filters
        const date = new Date().toISOString().split('T')[0];
        const filename = `SAMS_Attendance_Report_${date}.csv`;
        
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Initialize everything when page loads
async function initializeDashboard() {
    // Initialize charts first
    initializeCharts();
    
    // Check if we have the required authentication
    if (!window.token) {
        console.error('No authentication token found');
        return;
    }
    
    // Fetch and display real data
    const dashboardData = await fetchDashboardData();
    
    if (dashboardData && Array.isArray(dashboardData)) {
        // Store all data for filtering
        allDashboardData = dashboardData;
        filteredData = dashboardData; // Initially show all data
        
        // Populate filter dropdowns
        populateFilterDropdowns(dashboardData);
        
        // Setup filter event listeners
        setupFilterListeners();
        
        // Calculate and display initial stats
        const stats = calculateAttendanceStats(dashboardData);
        updateChartsWithData(stats);
        console.log('Dashboard updated with real data:', stats);
    } else {
        console.log('Using placeholder data - API data not available');
        // Setup filter listeners even with placeholder data
        setupFilterListeners();
    }
}

// Make functions globally available
window.downloadAttendanceData = downloadAttendanceData;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeDashboard);