base_url = 'https://sams-backend-u79d.onrender.com';

// Global variables for charts
let dailyChart, termChart, yearChart;
let presentBarChart, absentBarChart, lateBarChart;
let trendChart, dayPatternChart, comparativeChart; // Advanced analytics charts
let allDashboardData = []; // Store all data for filtering
let filteredData = []; // Store currently filtered data
let allStudentsData = []; // Store enrolled students data for accurate count
let currentSearchTerm = ''; // Store current search term

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
    const currentDate = new Date();
    const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    // Create more descriptive week labels with actual date ranges
    const weekLabels = getWeekLabelsForCurrentMonth();
    
    // Present bar chart (blue)
    presentBarChart = new Chart(document.getElementById('presentBar').getContext('2d'), {
        type: 'bar',
        data: {
            labels: weekLabels,
            datasets: [{
                label: `Present % - ${currentMonthName} ${currentYear}`,
                data: [0, 0, 0, 0],
                backgroundColor: '#0093ff'
            }]
        },
        options: {
            responsive: true,
            plugins: { 
                legend: { display: true },
                title: {
                    display: true,
                    text: `Weekly Present Attendance - ${currentMonthName} ${currentYear}`,
                    font: { size: 14, weight: 'bold' },
                    padding: { bottom: 10 }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    max: 100, 
                    grid: { color: "#e7e7e7" },
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                },
                x: { 
                    grid: { display: false },
                    title: {
                        display: true,
                        text: 'Week of Month'
                    }
                }
            }
        }
    });

    // Absent bar chart (red)
    absentBarChart = new Chart(document.getElementById('absentBar').getContext('2d'), {
        type: 'bar',
        data: {
            labels: weekLabels,
            datasets: [{
                label: `Absent % - ${currentMonthName} ${currentYear}`,
                data: [0, 0, 0, 0],
                backgroundColor: '#ef2722'
            }]
        },
        options: {
            responsive: true,
            plugins: { 
                legend: { display: true },
                title: {
                    display: true,
                    text: `Weekly Absent Attendance - ${currentMonthName} ${currentYear}`,
                    font: { size: 14, weight: 'bold' },
                    padding: { bottom: 10 }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    max: 100, 
                    grid: { color: "#e7e7e7" },
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                },
                x: { 
                    grid: { display: false },
                    title: {
                        display: true,
                        text: 'Week of Month'
                    }
                }
            }
        }
    });

    // Late bar chart (yellow)
    lateBarChart = new Chart(document.getElementById('lateBar').getContext('2d'), {
        type: 'bar',
        data: {
            labels: weekLabels,
            datasets: [{
                label: `Late % - ${currentMonthName} ${currentYear}`,
                data: [0, 0, 0, 0],
                backgroundColor: '#ffcd03'
            }]
        },
        options: {
            responsive: true,
            plugins: { 
                legend: { display: true },
                title: {
                    display: true,
                    text: `Weekly Late Attendance - ${currentMonthName} ${currentYear}`,
                    font: { size: 14, weight: 'bold' },
                    padding: { bottom: 10 }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    max: 100, 
                    grid: { color: "#e7e7e7" },
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                },
                x: { 
                    grid: { display: false },
                    title: {
                        display: true,
                        text: 'Week of Month'
                    }
                }
            }
        }
    });
}

// Helper function to generate descriptive week labels
function getWeekLabelsForCurrentMonth() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Get first day of current month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    const weekLabels = [];
    
    for (let week = 0; week < 4; week++) {
        const weekStart = Math.max(1, (week * 7) + 1);
        const weekEnd = Math.min(lastDay.getDate(), (week + 1) * 7);
        
        if (weekStart <= lastDay.getDate()) {
            weekLabels.push(`Week ${week + 1} (${weekStart}-${weekEnd})`);
        } else {
            weekLabels.push(`Week ${week + 1}`);
        }
    }
    
    return weekLabels;
}

// Fetch dashboard data from API
async function fetchDashboardData() {
    try {
        // Use the new enhanced API that includes grade levels
        const response = await fetch(`${base_url}/api/getTeacherDashboardWithGrades.php`, {
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

        // The new API returns both attendance and student data combined
        allStudentsData = data.students || [];
        
        console.log('Enhanced dashboard data received:', data.attendance);
        console.log('Students data received:', data.students);
        
        return data.attendance;

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Fallback to original API if new one fails
        try {
            const [attendanceResponse, studentsResponse] = await Promise.all([
                fetch(`${base_url}/api/getTeacherDashboard.php`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Provider': window.provider,
                        'Token': window.token,
                    }
                }),
                fetch(`${base_url}/api/getStudentTeacher.php`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Provider': window.provider,
                        'Token': window.token,
                    }
                })
            ]);

            const attendanceData = await attendanceResponse.json();
            const studentsData = await studentsResponse.json();

            if (!window.verifyToken(attendanceData) || !window.verifyToken(studentsData)) {
                console.error('Token verification failed');
                return null;
            }

            if (attendanceData.error || studentsData.error) {
                console.error('API Error:', attendanceData.error || studentsData.error);
                return null;
            }

            // Store both datasets
            allStudentsData = Array.isArray(studentsData) ? studentsData : [];
            
            console.log('Fallback - Dashboard data received:', attendanceData);
            console.log('Fallback - Students data received:', studentsData);
            return attendanceData;

        } catch (fallbackError) {
            console.error('Fallback API also failed:', fallbackError);
            return null;
        }
    }
}

// Enhanced filter data function with search support
function filterData() {
    const subjectSelect = document.querySelector('.filter-select');
    const gradeSelect = document.querySelectorAll('.filter-select')[1];
    const searchInput = document.getElementById('studentSearch');

    const selectedSubject = subjectSelect ? subjectSelect.value : 'all';
    const selectedGrade = gradeSelect ? gradeSelect.value : 'all';
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    currentSearchTerm = searchTerm; // Store for Excel export

    console.log('Filtering by:', { 
        subject: selectedSubject, 
        grade: selectedGrade, 
        search: searchTerm 
    });

    filteredData = allDashboardData.filter(record => {
        // Subject filter
        const subjectMatch = selectedSubject === 'all' || record.name === selectedSubject;
        
        // Grade filter - improved logic
        let gradeMatch = selectedGrade === 'all';
        if (!gradeMatch && record.grade_level) {
            const recordGrade = record.grade_level.toString().toLowerCase().trim();
            const filterGrade = selectedGrade.toString().toLowerCase().trim();
            
            // Handle various grade formats
            gradeMatch = recordGrade === filterGrade || 
                        recordGrade === filterGrade.replace('grade ', '') ||
                        recordGrade.replace('grade ', '') === filterGrade ||
                        recordGrade.includes(filterGrade.replace('grade ', '')) ||
                        filterGrade.includes(recordGrade.replace('grade ', ''));
        }
        
        // Student name search filter
        let searchMatch = true;
        if (searchTerm !== '') {
            const studentName = `${record.firstname} ${record.lastname}`.toLowerCase();
            searchMatch = studentName.includes(searchTerm);
        }

        return subjectMatch && gradeMatch && searchMatch;
    });

    console.log('Filtered data count:', filteredData.length);
    console.log('Sample filtered records:', filteredData.slice(0, 3)); // Debug log

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

// Fallback API fetch function
async function fetchFallbackData() {
    try {
        // Fallback to original API if new one fails
        const [attendanceResponse, studentsResponse] = await Promise.all([
            fetch(`${base_url}/api/getTeacherDashboard.php`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Provider': window.provider,
                    'Token': window.token,
                }
            })
        ]);

        const attendanceData = await attendanceResponse.json();
        const studentsData = await studentsResponse.json();

        if (!window.verifyToken(attendanceData) || !window.verifyToken(studentsData)) {
            console.error('Token verification failed');
            return null;
        }

        if (attendanceData.error || studentsData.error) {
            console.error('API Error:', attendanceData.error || studentsData.error);
            return null;
        }

        // Store both datasets
        allStudentsData = Array.isArray(studentsData) ? studentsData : [];
        
        console.log('Dashboard data received:', attendanceData);
        console.log('Students data received:', studentsData);
        return attendanceData;

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return null;
    }
}

// Populate filter dropdowns with unique values from data
function populateFilterDropdowns(data) {
    const subjects = new Set();
    const grades = new Set();

    // Use students data for more accurate grade population
    allStudentsData.forEach(student => {
        if (student.grade_level) grades.add(student.grade_level);
    });

    // Use attendance data for subjects
    data.forEach(record => {
        if (record.name) subjects.add(record.name);
        // Also collect grades from attendance data to ensure we have all grades
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
            // Store the full grade format (e.g., "Grade 12") as the value
            option.value = grade;
            option.textContent = grade;
            gradeSelect.appendChild(option);
        });
    }
    
    console.log('Available grades:', Array.from(grades)); // Debug log
    console.log('Available subjects:', Array.from(subjects)); // Debug log
}

// Filter data based on selected criteria
function filterData() {
    const subjectSelect = document.querySelector('.filter-select');
    const gradeSelect = document.querySelectorAll('.filter-select')[1];
    const searchInput = document.getElementById('studentSearch');

    const selectedSubject = subjectSelect ? subjectSelect.value : 'all';
    const selectedGrade = gradeSelect ? gradeSelect.value : 'all';
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    currentSearchTerm = searchTerm; // Store for Excel export

    console.log('Filtering by:', { subject: selectedSubject, grade: selectedGrade, search: searchTerm });

    filteredData = allDashboardData.filter(record => {
        const subjectMatch = selectedSubject === 'all' || record.name === selectedSubject;
        
        // Fix grade matching - handle multiple grade formats
        let gradeMatch = selectedGrade === 'all';
        if (!gradeMatch && record.grade_level) {
            const recordGrade = record.grade_level.toString().toLowerCase();
            const filterGrade = selectedGrade.toString().toLowerCase();
            
            // Handle various grade formats: "Grade 12", "12", "grade 12", etc.
            if (filterGrade.includes('grade')) {
                // Selected filter is "Grade 12" format
                gradeMatch = recordGrade === filterGrade || recordGrade === filterGrade.replace('grade ', '');
            } else {
                // Selected filter is just "12" format
                gradeMatch = recordGrade === filterGrade || 
                           recordGrade === `grade ${filterGrade}` ||
                           recordGrade.includes(filterGrade);
            }
        }

        // Student name search filter
        let searchMatch = true;
        if (searchTerm !== '') {
            const studentName = `${record.firstname} ${record.lastname}`.toLowerCase();
            searchMatch = studentName.includes(searchTerm);
        }

        return subjectMatch && gradeMatch && searchMatch;
    });

    console.log('Filtered data count:', filteredData.length);
    console.log('Sample filtered records:', filteredData.slice(0, 3)); // Debug log

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
    const searchInput = document.getElementById('studentSearch');

    if (subjectSelect) {
        subjectSelect.addEventListener('change', function () {
            console.log('Subject filter changed to:', this.value);
            filterData();
        });
    }

    if (gradeSelect) {
        gradeSelect.addEventListener('change', function () {
            console.log('Grade filter changed to:', this.value);
            filterData();
        });
    }

    // Student search functionality
    if (searchInput) {
        // Add debounced search to avoid too many filter calls
        let searchTimeout;
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                console.log('Search term changed to:', this.value);
                filterData();
            }, 300); // 300ms delay
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
        daily: { present: 0, late: 0, absent: 0, excused: 0, total: 0, percent: 0 },
        term: { present: 0, late: 0, absent: 0, excused: 0, total: 0, percent: 0 },
        year: { present: 0, late: 0, absent: 0, excused: 0, total: 0, percent: 0 },
        uniqueStudents: new Set(),
        weeklyData: {
            present: [0, 0, 0, 0],
            late: [0, 0, 0, 0],
            absent: [0, 0, 0, 0],
            excused: [0, 0, 0, 0],
            percent: [0, 0, 0, 0]
        }
    };

    // Helper for weighted attendance
    function weighted(att) {
        if (att === 3) return 1; // present
        if (att === 2) return 0.5; // late
        return 0; // absent or excused
    }

    // Helper for excused
    function isExcused(att) {
        return att === 0;
    }

    // For weekly percent calculation
    const weekTotals = [0, 0, 0, 0]; // total records per week (excluding excused)
    const weekWeighted = [0, 0, 0, 0]; // sum of weighted attendance per week

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
        switch (attendance) {
            case 0: category = 'excused'; break;
            case 1: category = 'absent'; break;
            case 2: category = 'late'; break;
            case 3: category = 'present'; break;
            default: category = 'absent'; break;
        }

        // Daily stats (today only)
        if (recordDay === todayString) {
            stats.daily[category]++;
            if (!isExcused(attendance)) stats.daily.total++;
        }

        // Term stats (current term)
        if (recordYear === currentYear && recordMonth >= termStart && recordMonth <= termEnd) {
            stats.term[category]++;
            if (!isExcused(attendance)) stats.term.total++;
        }

        // Year stats (current calendar year)
        if (recordYear === currentYear) {
            stats.year[category]++;
            if (!isExcused(attendance)) stats.year.total++;

            // Calculate weekly data for bar charts
            const weekOfMonth = Math.ceil(recordDate.getDate() / 7) - 1;
            if (weekOfMonth >= 0 && weekOfMonth < 4) {
                stats.weeklyData[category][weekOfMonth]++;
                if (!isExcused(attendance)) {
                    weekTotals[weekOfMonth]++;
                    weekWeighted[weekOfMonth] += weighted(attendance);
                }
            }
        }
    });

    // Calculate weighted percentages for each period
    function calcPercent(present, late, absent, total) {
        if (total === 0) return 0;
        return (((present * 1 + late * 0.5) / total) * 100).toFixed(2);
    }

    stats.daily.percent = calcPercent(stats.daily.present, stats.daily.late, stats.daily.absent, stats.daily.total);
    stats.term.percent = calcPercent(stats.term.present, stats.term.late, stats.term.absent, stats.term.total);
    stats.year.percent = calcPercent(stats.year.present, stats.year.late, stats.year.absent, stats.year.total);

    // Calculate weekly percentages for present, late, absent (exclude excused)
    stats.weeklyData.presentPerc = [0, 0, 0, 0];
    stats.weeklyData.latePerc = [0, 0, 0, 0];
    stats.weeklyData.absentPerc = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
        const total = stats.weeklyData.present[i] + stats.weeklyData.late[i] + stats.weeklyData.absent[i];
        stats.weeklyData.presentPerc[i] = total > 0 ? ((stats.weeklyData.present[i] / total) * 100).toFixed(2) : "0.00";
        stats.weeklyData.latePerc[i] = total > 0 ? ((stats.weeklyData.late[i] / total) * 100).toFixed(2) : "0.00";
        stats.weeklyData.absentPerc[i] = total > 0 ? ((stats.weeklyData.absent[i] / total) * 100).toFixed(2) : "0.00";
    }

    return stats;
}

// Update charts with real data
function updateChartsWithData(stats) {
    // Update donut charts
    updateDonutChart(dailyChart, stats.daily, 'dailyDonut');
    updateDonutChart(termChart, stats.term, 'termDonut');
    updateDonutChart(yearChart, stats.year, 'yearDonut');

    // Update bar charts with weekly present, late, absent percentages
    if (stats.weeklyData && stats.weeklyData.presentPerc && stats.weeklyData.latePerc && stats.weeklyData.absentPerc) {
        updateBarChart(presentBarChart, stats.weeklyData.presentPerc);
        updateBarChart(lateBarChart, stats.weeklyData.latePerc);
        updateBarChart(absentBarChart, stats.weeklyData.absentPerc);
    } else {
        updateBarChart(presentBarChart, [0, 0, 0, 0]);
        updateBarChart(lateBarChart, [0, 0, 0, 0]);
        updateBarChart(absentBarChart, [0, 0, 0, 0]);
    }

    // Update student count
    const studentCountElement = document.querySelector('.count-number');
    if (studentCountElement) {
        // If uniqueStudents is a Set, use its size, otherwise fallback to 0
        studentCountElement.textContent = stats.uniqueStudents && typeof stats.uniqueStudents.size === "number"
            ? stats.uniqueStudents.size
            : 0;
    }
}

// Update individual donut chart
function updateDonutChart(chart, periodStats, chartId) {
    // Defensive: if chart is not initialized, skip
    if (!chart) return;

    const presentCount = periodStats.present || 0;
    const lateCount = periodStats.late || 0;
    const absentCount = periodStats.absent || 0;
    const attendancePercentage = periodStats.percent || 0;

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

// Update bar chart with new data
function updateBarChart(chart, data) {
    if (!chart) return;
    chart.data.datasets[0].data = data;
    chart.update();
}

// Get list of students in current filtered data
function getCurrentStudentsList() {
    const students = new Set();
    const dataToUse = filteredData.length > 0 ? filteredData : allDashboardData;
    
    dataToUse.forEach(record => {
        const studentName = `${record.firstname} ${record.lastname}`;
        const studentInfo = {
            name: studentName,
            grade: record.grade_level || 'Unknown',
            course: record.name || 'Unknown Course'
        };
        students.add(JSON.stringify(studentInfo));
    });
    
    return Array.from(students).map(s => JSON.parse(s));
}

// Download attendance data as CSV with real data
async function downloadAttendanceData() {
    try {
        // Use the current filtered data or all data if no filters applied
        const dataToExport = filteredData.length > 0 ? filteredData : allDashboardData;

        if (dataToExport.length === 0) {
            alert('No data available to download');
            return;
        }

        // Calculate current statistics for export
        const stats = calculateAttendanceStats(dataToExport);

        // Get current students list
        const currentStudents = getCurrentStudentsList();

        // Get current filter values
        const subjectSelect = document.querySelector('.filter-select');
        const gradeSelect = document.querySelectorAll('.filter-select')[1];

        const subject = subjectSelect ? subjectSelect.value : 'All Subjects';
        const grade = gradeSelect ? gradeSelect.value : 'All Grades';

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();

        // Summary data
        const summaryData = [
            ['SAMS Attendance Report'],
            ['Generated on:', new Date().toLocaleDateString()],
            ['Subject Filter:', subject === 'all' ? 'All Subjects' : subject],
            ['Grade Filter:', grade === 'all' ? 'All Grades' : grade],
            ['Total Students in View:', stats.uniqueStudents.size],
            ['Total Records:', dataToExport.length],
            [''],
            ['Period', 'Present', 'Late', 'Absent', 'Excused', 'Total', 'Attendance %'],
            ['Daily', stats.daily.present, stats.daily.late, stats.daily.absent, stats.daily.excused, stats.daily.total,
                stats.daily.total > 0 ? (((stats.daily.present + stats.daily.late) / stats.daily.total) * 100).toFixed(2) + '%' : '0%'],
            ['Term', stats.term.present, stats.term.late, stats.term.absent, stats.term.excused, stats.term.total,
                stats.term.total > 0 ? (((stats.term.present + stats.term.late) / stats.term.total) * 100).toFixed(2) + '%' : '0%'],
            ['Year', stats.year.present, stats.year.late, stats.year.absent, stats.year.excused, stats.year.total,
                stats.year.total > 0 ? (((stats.year.present + stats.year.late) / stats.year.total) * 100).toFixed(2) + '%' : '0%'],
            [''],
            ['Weekly Breakdown (Percentages)'],
            ['Week', 'Present %', 'Late %', 'Absent %'],
            ['Week 1', stats.weeklyData.presentPerc[0] + '%', stats.weeklyData.latePerc[0] + '%', stats.weeklyData.absentPerc[0] + '%'],
            ['Week 2', stats.weeklyData.presentPerc[1] + '%', stats.weeklyData.latePerc[1] + '%', stats.weeklyData.absentPerc[1] + '%'],
            ['Week 3', stats.weeklyData.presentPerc[2] + '%', stats.weeklyData.latePerc[2] + '%', stats.weeklyData.absentPerc[2] + '%'],
            ['Week 4', stats.weeklyData.presentPerc[3] + '%', stats.weeklyData.latePerc[3] + '%', stats.weeklyData.absentPerc[3] + '%']
        ];

        // Add individual student attendance summaries
        if (currentStudents.length > 0) {
            summaryData.push(
                [''],
                ['Individual Student Attendance Summary' + (currentSearchTerm ? ` (Search: "${currentSearchTerm}")` : '')],
                ['Student Name', 'Grade Level', 'Course', 'Total Records', 'Present', 'Late', 'Absent', 'Excused', 'Attendance %']
            );
            
            // Calculate individual student stats
            const studentStats = new Map();
            
            // Process each attendance record to build per-student statistics
            dataToExport.forEach(record => {
                const studentKey = `${record.firstname} ${record.lastname}`;
                
                if (!studentStats.has(studentKey)) {
                    studentStats.set(studentKey, {
                        name: studentKey,
                        grade: record.grade_level || 'N/A',
                        course: record.name || 'N/A',
                        present: 0,
                        late: 0,
                        absent: 0,
                        excused: 0,
                        total: 0
                    });
                }
                
                const studentData = studentStats.get(studentKey);
                const attendance = parseInt(record.attendance);
                
                // Map attendance codes: 0=excused, 1=absent, 2=late, 3=present
                switch (attendance) {
                    case 0: studentData.excused++; break;
                    case 1: studentData.absent++; break;
                    case 2: studentData.late++; break;
                    case 3: studentData.present++; break;
                    default: studentData.absent++; break;
                }
                
                // Only count non-excused records in total for percentage calculation
                if (attendance !== 0) {
                    studentData.total++;
                }
            });
            
            // Sort students by name and add to summary
            const sortedStudents = Array.from(studentStats.values()).sort((a, b) => a.name.localeCompare(b.name));
            
            sortedStudents.forEach(student => {
                // Calculate attendance percentage (Present + Late counts as attended)
                const attendancePercentage = student.total > 0 
                    ? (((student.present + student.late * 0.5) / student.total) * 100).toFixed(2) + '%'
                    : '0%';
                
                summaryData.push([
                    student.name,
                    student.grade,
                    student.course,
                    student.present + student.late + student.absent + student.excused,
                    student.present,
                    student.late,
                    student.absent,
                    student.excused,
                    attendancePercentage
                ]);
            });
        }

        // Create summary worksheet
        const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summaryWS, 'Summary');

        // Create individual student detailed worksheets
        if (dataToExport.length > 0) {
            // Group records by student
            const studentRecords = new Map();
            
            dataToExport.forEach(record => {
                const studentKey = `${record.firstname} ${record.lastname}`;
                
                if (!studentRecords.has(studentKey)) {
                    studentRecords.set(studentKey, []);
                }
                
                studentRecords.get(studentKey).push(record);
            });
            
            // Create a worksheet for each student (limit to first 10 students to avoid too many sheets)
            let studentCount = 0;
            const maxStudentSheets = 10;
            
            for (const [studentName, records] of studentRecords) {
                if (studentCount >= maxStudentSheets) break;
                
                // Sort records by date (newest first)
                records.sort((a, b) => new Date(b.sent) - new Date(a.sent));
                
                const studentData = [
                    [`Attendance Details: ${studentName}`],
                    ['Grade Level:', records[0].grade_level || 'N/A'],
                    ['Course:', records[0].name || 'N/A'],
                    ['Total Records:', records.length],
                    [''],
                    ['Date', 'Time', 'Attendance Status', 'Confidence', 'Distance']
                ];
                
                records.forEach(record => {
                    const attendanceStatus = ['Excused', 'Absent', 'Late', 'Present'][parseInt(record.attendance)] || 'Unknown';
                    const recordDate = new Date(record.sent);
                    
                    studentData.push([
                        recordDate.toLocaleDateString(),
                        recordDate.toLocaleTimeString(),
                        attendanceStatus,
                        record.confidence ? parseFloat(record.confidence).toFixed(2) : 'N/A',
                        record.distance ? parseFloat(record.distance).toFixed(2) : 'N/A'
                    ]);
                });
                
                // Create worksheet for this student
                const studentWS = XLSX.utils.aoa_to_sheet(studentData);
                
                // Clean student name for sheet name (remove special characters)
                const cleanStudentName = studentName.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 25);
                XLSX.utils.book_append_sheet(workbook, studentWS, cleanStudentName);
                
                studentCount++;
            }
        }

        // All records detailed data (keep existing functionality)
        if (dataToExport.length > 0) {
            const detailedData = [
                ['Student Name', 'Course', 'Grade Level', 'Date', 'Time', 'Attendance Status', 'Confidence', 'Distance']
            ];

            // Sort by date and student name
            const sortedData = [...dataToExport].sort((a, b) => {
                const dateCompare = new Date(b.sent) - new Date(a.sent);
                if (dateCompare !== 0) return dateCompare;
                return `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`);
            });

            sortedData.forEach(record => {
                const attendanceStatus = ['Excused', 'Absent', 'Late', 'Present'][parseInt(record.attendance)] || 'Unknown';
                const recordDate = new Date(record.sent);

                detailedData.push([
                    `${record.firstname} ${record.lastname}`,
                    record.name || 'N/A',
                    record.grade_level || 'N/A',
                    recordDate.toLocaleDateString(),
                    recordDate.toLocaleTimeString(),
                    attendanceStatus,
                    record.confidence ? parseFloat(record.confidence).toFixed(2) : 'N/A',
                    record.distance ? parseFloat(record.distance).toFixed(2) : 'N/A'
                ]);
            });

            // Create detailed records worksheet
            const detailedWS = XLSX.utils.aoa_to_sheet(detailedData);
            XLSX.utils.book_append_sheet(workbook, detailedWS, 'All Records');
        }

        // Generate filename with current date and filters
        const date = new Date().toISOString().split('T')[0];
        const subjectSuffix = subject !== 'all' && subject !== 'All Subjects' ? `_${subject.replace(/\s+/g, '_')}` : '';
        const gradeSuffix = grade !== 'all' && grade !== 'All Grades' ? `_${grade.replace(/\s+/g, '_')}` : '';
        const searchSuffix = currentSearchTerm ? `_Search_${currentSearchTerm.replace(/\s+/g, '_')}` : '';
        const filename = `SAMS_Attendance_Report_${date}${subjectSuffix}${gradeSuffix}${searchSuffix}.xlsx`;

        // Download the file
        XLSX.writeFile(workbook, filename);

    } catch (error) {
        console.error('Error generating Excel file:', error);
        // Fallback to CSV if Excel generation fails
        downloadCSVFallback();
    }
}

// Fallback CSV download function
function downloadCSVFallback() {

    // Get current students list
    const currentStudents = getCurrentStudentsList();

    // Get current filter values
    const subjectSelect = document.querySelector('.filter-select');
    const gradeSelect = document.querySelectorAll('.filter-select')[1];

    const subject = subjectSelect ? subjectSelect.value : 'All Subjects';
    const grade = gradeSelect ? gradeSelect.value : 'All Grades';

    // Use real data if available, otherwise use sample data
    const stats = filteredData.length > 0 ? calculateAttendanceStats(filteredData) : null;

    const attendanceData = [
        // Header row
        ['Period', 'Present', 'Late', 'Absent', 'Total', 'Percentage'],

        // Daily data
        ['Daily Class Attendance',
            stats ? stats.daily.present : '25',
            stats ? stats.daily.late : '1',
            stats ? stats.daily.absent : '0',
            stats ? stats.daily.total : '26',
            stats && stats.daily.total > 0 ? (((stats.daily.present + stats.daily.late) / stats.daily.total) * 100).toFixed(2) + '%' : '81.25%'],

        // Term data  
        ['Class Term Attendance',
            stats ? stats.term.present : '204',
            stats ? stats.term.late : '103',
            stats ? stats.term.absent : '27',
            stats ? stats.term.total : '334',
            stats && stats.term.total > 0 ? (((stats.term.present + stats.term.late) / stats.term.total) * 100).toFixed(2) + '%' : '76.5%'],

        // School Year data
        ['Class School Year Attendance',
            stats ? stats.year.present : '548',
            stats ? stats.year.late : '236',
            stats ? stats.year.absent : '259',
            stats ? stats.year.total : '1043',
            stats && stats.year.total > 0 ? (((stats.year.present + stats.year.late) / stats.year.total) * 100).toFixed(2) + '%' : '63.85%']
    ];

    // Add filter information at the top
    const headerInfo = [
        ['SAMS Attendance Report'],
        ['Generated on:', new Date().toLocaleDateString()],
        ['Subject:', subject],
        ['Grade:', grade],
        ['Search Term:', currentSearchTerm || 'None'],
        ['Students Count:', currentStudents.length],
        [''], // Empty row for spacing
    ];

    // Combine header info with attendance data
    const fullData = [...headerInfo, ...attendanceData];

    // Add students list if available
    if (currentStudents.length > 0) {
        fullData.push(
            [''], // Empty row
            ['Students in This Report'],
            ['Student Name', 'Grade Level', 'Course']
        );
        
        currentStudents.sort((a, b) => a.name.localeCompare(b.name));
        currentStudents.forEach(student => {
            fullData.push([student.name, student.grade, student.course]);
        });
    }

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
        const filename = `SAMS_Attendance_Report_${date}_CSV_Fallback.csv`;

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

        console.log('Dashboard data loaded:', dashboardData.length, 'records');
        console.log('Sample record:', dashboardData[0]); // Debug log
        
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
window.toggleAdvancedAnalytics = toggleAdvancedAnalytics;

// ===== ADVANCED ANALYTICS FUNCTIONS =====

// Initialize advanced analytics charts
function initializeAdvancedCharts() {
    // 1. 30-Day Trend Line Chart
    const trendCanvas = document.getElementById('trendChart');
    if (trendCanvas) {
        trendChart = new Chart(trendCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: getLast30DaysLabels(),
                datasets: [{
                    label: 'Daily Attendance %',
                    data: Array(30).fill(null),
                    borderColor: '#0093ff',
                    backgroundColor: 'rgba(0, 147, 255, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '30-Day Attendance Trend',
                        font: { size: 14, weight: 'bold' }
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'Attendance %' }
                    },
                    x: {
                        title: { display: true, text: 'Days Ago' }
                    }
                }
            }
        });
    }

    // 2. Day-of-Week Pattern Chart
    const dayPatternCanvas = document.getElementById('dayPatternChart');
    if (dayPatternCanvas) {
        dayPatternChart = new Chart(dayPatternCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                datasets: [{
                    label: 'Average Attendance %',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#28a745',  // Monday - Green
                        '#17a2b8',  // Tuesday - Teal  
                        '#ffc107',  // Wednesday - Yellow
                        '#fd7e14',  // Thursday - Orange
                        '#dc3545'   // Friday - Red (typically lowest)
                    ],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Attendance by Day of Week',
                        font: { size: 14, weight: 'bold' }
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'Average Attendance %' }
                    }
                }
            }
        });
    }

    // 3. Monthly Comparison Chart  
    const comparativeCanvas = document.getElementById('comparativeChart');
    if (comparativeCanvas) {
        comparativeChart = new Chart(comparativeCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: getLast6MonthsLabels(),
                datasets: [{
                    label: 'Monthly Attendance %',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: '#6f42c1',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Last 6 Months Comparison',
                        font: { size: 14, weight: 'bold' }
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'Monthly Average %' }
                    }
                }
            }
        });
    }
}

// Calculate 30-day trend data
function calculate30DayTrend(records) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const dailyData = {};
    
    // Group records by day
    records.forEach(record => {
        const recordDate = new Date(record.sent);
        if (recordDate >= thirtyDaysAgo) {
            const dateKey = recordDate.toDateString();
            
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = { present: 0, late: 0, absent: 0, total: 0 };
            }
            
            const attendance = parseInt(record.attendance);
            if (attendance === 3) dailyData[dateKey].present++;
            else if (attendance === 2) dailyData[dateKey].late++;
            else if (attendance === 1) dailyData[dateKey].absent++;
            
            if (attendance !== 0) dailyData[dateKey].total++; // Exclude excused
        }
    });
    
    // Generate 30-day trend percentages
    const trendData = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
        const dateKey = date.toDateString();
        
        if (dailyData[dateKey] && dailyData[dateKey].total > 0) {
            const { present, late, total } = dailyData[dateKey];
            const percentage = ((present + late * 0.5) / total * 100).toFixed(1);
            trendData.push(parseFloat(percentage));
        } else {
            trendData.push(null); // No data for this day
        }
    }
    
    return trendData;
}

// Calculate day-of-week patterns
function calculateDayPatterns(records) {
    const dayData = Array(5).fill(0).map(() => ({ present: 0, late: 0, absent: 0, total: 0 }));
    
    records.forEach(record => {
        const recordDate = new Date(record.sent);
        const dayOfWeek = recordDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Only process Monday-Friday (1-5)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const dayIndex = dayOfWeek - 1; // Convert to 0-4 index
            const attendance = parseInt(record.attendance);
            
            if (attendance === 3) dayData[dayIndex].present++;
            else if (attendance === 2) dayData[dayIndex].late++;
            else if (attendance === 1) dayData[dayIndex].absent++;
            
            if (attendance !== 0) dayData[dayIndex].total++;
        }
    });
    
    // Calculate percentages for each day
    return dayData.map(day => {
        if (day.total === 0) return 0;
        return ((day.present + day.late * 0.5) / day.total * 100).toFixed(1);
    }).map(p => parseFloat(p));
}

// Calculate monthly comparison data
function calculateMonthlyComparison(records) {
    const today = new Date();
    const monthlyData = Array(6).fill(0).map(() => ({ present: 0, late: 0, absent: 0, total: 0 }));
    
    records.forEach(record => {
        const recordDate = new Date(record.sent);
        const monthsAgo = (today.getFullYear() - recordDate.getFullYear()) * 12 + 
                         (today.getMonth() - recordDate.getMonth());
        
        if (monthsAgo >= 0 && monthsAgo < 6) {
            const attendance = parseInt(record.attendance);
            
            if (attendance === 3) monthlyData[5 - monthsAgo].present++;
            else if (attendance === 2) monthlyData[5 - monthsAgo].late++;
            else if (attendance === 1) monthlyData[5 - monthsAgo].absent++;
            
            if (attendance !== 0) monthlyData[5 - monthsAgo].total++;
        }
    });
    
    return monthlyData.map(month => {
        if (month.total === 0) return 0;
        return ((month.present + month.late * 0.5) / month.total * 100).toFixed(1);
    }).map(p => parseFloat(p));
}

// Generate student risk alerts
function generateStudentRiskAlerts(records) {
    const studentStats = new Map();
    
    // Calculate individual student attendance rates
    records.forEach(record => {
        const studentKey = `${record.firstname} ${record.lastname}`;
        
        if (!studentStats.has(studentKey)) {
            studentStats.set(studentKey, { 
                name: studentKey,
                grade: record.grade_level || 'N/A',
                course: record.name || 'N/A',
                present: 0, 
                late: 0, 
                absent: 0, 
                total: 0 
            });
        }
        
        const stats = studentStats.get(studentKey);
        const attendance = parseInt(record.attendance);
        
        if (attendance === 3) stats.present++;
        else if (attendance === 2) stats.late++;
        else if (attendance === 1) stats.absent++;
        
        if (attendance !== 0) stats.total++;
    });
    
    // Identify at-risk students
    const riskAlerts = [];
    
    studentStats.forEach(stats => {
        if (stats.total > 0) {
            const percentage = (stats.present + stats.late * 0.5) / stats.total * 100;
            
            if (percentage < 70) {
                riskAlerts.push({
                    name: stats.name,
                    grade: stats.grade,
                    course: stats.course,
                    percentage: percentage.toFixed(1),
                    level: 'critical'
                });
            } else if (percentage < 85) {
                riskAlerts.push({
                    name: stats.name,
                    grade: stats.grade,
                    course: stats.course,
                    percentage: percentage.toFixed(1),
                    level: 'warning'
                });
            }
        }
    });
    
    return riskAlerts.sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage));
}

// Helper functions for labels
function getLast30DaysLabels() {
    const labels = [];
    for (let i = 29; i >= 0; i--) {
        labels.push(i === 0 ? 'Today' : `${i}d ago`);
    }
    return labels;
}

function getLast6MonthsLabels() {
    const labels = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
    }
    
    return labels;
}

// Update advanced analytics with data
function updateAdvancedAnalytics(records) {
    if (!records || records.length === 0) return;
    
    // Update 30-day trend
    if (trendChart) {
        const trendData = calculate30DayTrend(records);
        trendChart.data.datasets[0].data = trendData;
        trendChart.update();
    }
    
    // Update day patterns
    if (dayPatternChart) {
        const dayData = calculateDayPatterns(records);
        dayPatternChart.data.datasets[0].data = dayData;
        dayPatternChart.update();
    }
    
    // Update monthly comparison
    if (comparativeChart) {
        const monthlyData = calculateMonthlyComparison(records);
        comparativeChart.data.datasets[0].data = monthlyData;
        comparativeChart.update();
    }
    
    // Update risk alerts
    updateRiskAlerts(records);
}

// Update risk alerts section
function updateRiskAlerts(records) {
    const riskAlerts = generateStudentRiskAlerts(records);
    const alertsContainer = document.getElementById('riskAlerts');
    
    if (!alertsContainer) return;
    
    if (riskAlerts.length === 0) {
        alertsContainer.innerHTML = '<div class="no-alerts">✅ No students at risk - Great job!</div>';
        return;
    }
    
    let alertsHTML = '<div class="risk-alerts-header">⚠️ Students Needing Attention:</div>';
    
    riskAlerts.forEach(alert => {
        const alertClass = alert.level === 'critical' ? 'alert-critical' : 'alert-warning';
        const emoji = alert.level === 'critical' ? '🚨' : '⚠️';
        
        alertsHTML += `
            <div class="risk-alert ${alertClass}">
                <span class="alert-emoji">${emoji}</span>
                <div class="alert-info">
                    <div class="alert-name">${alert.name}</div>
                    <div class="alert-details">${alert.grade} • ${alert.course} • ${alert.percentage}% attendance</div>
                </div>
                <div class="alert-action">
                    <button class="contact-btn" onclick="alert('Contact parent feature coming soon!')">Contact Parent</button>
                </div>
            </div>
        `;
    });
    
    alertsContainer.innerHTML = alertsHTML;
}

// Toggle advanced analytics section
function toggleAdvancedAnalytics() {
    const analyticsContent = document.querySelector('.analytics-content');
    const toggleButton = document.querySelector('.analytics-toggle');
    
    if (analyticsContent.style.display === 'none' || analyticsContent.style.display === '') {
        analyticsContent.style.display = 'block';
        toggleButton.innerHTML = '📊 Hide Advanced Analytics';
        
        // Initialize charts if they haven't been initialized yet
        if (!trendChart) {
            setTimeout(() => {
                initializeAdvancedCharts();
                // Update with current data
                const dataToUse = filteredData.length > 0 ? filteredData : allDashboardData;
                updateAdvancedAnalytics(dataToUse);
            }, 100); // Small delay to ensure DOM is ready
        } else {
            // Update with current data
            const dataToUse = filteredData.length > 0 ? filteredData : allDashboardData;
            updateAdvancedAnalytics(dataToUse);
        }
        
    } else {
        analyticsContent.style.display = 'none';
        toggleButton.innerHTML = '📊 Show Advanced Analytics';
    }
}

// Update the existing updateChartsWithData function to also update advanced analytics
const originalUpdateChartsWithData = updateChartsWithData;
updateChartsWithData = function(stats) {
    // Call original function
    originalUpdateChartsWithData(stats);
    
    // Update advanced analytics if they're visible
    const analyticsContent = document.querySelector('.analytics-content');
    if (analyticsContent && analyticsContent.style.display === 'block') {
        const dataToUse = filteredData.length > 0 ? filteredData : allDashboardData;
        updateAdvancedAnalytics(dataToUse);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeDashboard);