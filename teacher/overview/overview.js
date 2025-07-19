base_url = 'https://sams-backend-u79d.onrender.com'; 

// Donut Charts SAMPLE data
const donutData = [
    {
        ctxId: 'dailyDonut',
        percent: 81.25,
        data: [25, 1, 0], // Present, Late, Absent
        colors: ['#0093ff', '#ffcd03', '#ef2722'],
    },
    {
        ctxId: 'termDonut',
        percent: 76.5,
        data: [204, 103, 27],
        colors: ['#0093ff', '#ffcd03', '#ef2722'],
    },
    {
        ctxId: 'semDonut',
        percent: 63.85,
        data: [548, 236, 259],
        colors: ['#0093ff', '#ffcd03', '#ef2722'],
    }
];

// Draw donut charts
donutData.forEach(donut => {
    const ctx = document.getElementById(donut.ctxId).getContext('2d');
    new Chart(ctx, {
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
});

// Bar Charts data
const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

// Present bar chart (blue)
new Chart(document.getElementById('presentBar').getContext('2d'), {
    type: 'bar',
    data: {
        labels: weeks,
        datasets: [{
            label: 'Present',
            data: [83.45, 94.44, 78.17, 80.81],
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

// Absent bar chart (yellow)
new Chart(document.getElementById('absentBar').getContext('2d'), {
    type: 'bar',
    data: {
        labels: weeks,
        datasets: [{
            label: 'Absent',
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

// Late bar chart (red)
new Chart(document.getElementById('lateBar').getContext('2d'), {
    type: 'bar',
    data: {
        labels: weeks,
        datasets: [{
            label: 'Late',
            data: [97.62, 29.82, 24.11, 27.86],
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

// Download attendance data as CSV
function downloadAttendanceData() {
    // Get current filter values (you can expand this to use actual filter values)
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
        
        // Semester data
        ['Class Semester Attendance', '548', '236', '259', '1043', '63.85%'],
        
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

// Make function globally available
window.downloadAttendanceData = downloadAttendanceData;

// Adding Actual Attendance

// Helper function to get token from cookies
fetch(`${base}/api/getTeacherCourses.php`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Token': window.token,
        'Provider': window.provider
    },
    credentials: 'include'
})
.then(res => res.json())
.then(data => {
    if (data.error) {
        console.error('Failed to fetch courses:', data.error);
    } else {
        console.log('Teacher courses:', data);
    }
})
.catch(err => {
    console.error('Error fetching courses:', err);
});
