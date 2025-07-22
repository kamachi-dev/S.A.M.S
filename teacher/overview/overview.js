base_url = 'https://sams-backend-u79d.onrender.com';

// Global variables for charts
let dailyChart, termChart, yearChart;
let presentBarChart, absentBarChart, lateBarChart;
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
            ['Week 1', stats.weeklyData.present[0] + '%', stats.weeklyData.late[0] + '%', stats.weeklyData.absent[0] + '%'],
            ['Week 2', stats.weeklyData.present[1] + '%', stats.weeklyData.late[1] + '%', stats.weeklyData.absent[1] + '%'],
            ['Week 3', stats.weeklyData.present[2] + '%', stats.weeklyData.late[2] + '%', stats.weeklyData.absent[2] + '%'],
            ['Week 4', stats.weeklyData.present[3] + '%', stats.weeklyData.late[3] + '%', stats.weeklyData.absent[3] + '%']
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeDashboard);