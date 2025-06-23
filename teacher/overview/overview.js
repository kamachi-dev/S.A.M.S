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

// Popup Attendance
function uploadModelJS() {
    const form = document.getElementById("uploadForm");
    const formData = new FormData(form);

    if (!window.token || !window.provider) {
        alert("Missing token or provider.");
        return;
    }

    fetch(`https://sams-backend-u79d.onrender.com/api/postModel.php?tkn=${encodeURIComponent(window.token)}`, {
        method: 'POST',
        headers: {
            // 'Content-Type': 'application/json',
            'Provider': window.provider,
            'Token': window.token,
        },
        body: formData,
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            console.log("Upload response:", data);

            // Debug output
            if (data.courses_found) {
                console.log("🔍 Available Courses:");
                data.courses_found.forEach(course => {
                    console.log(`- ${course.name} (${course.id}) | Model uploaded: ${course.has_model}`);
                });
            }

            if (data.success) {
                alert("✅ Model uploaded successfully!");
            } else {
                alert("❌ Upload failed: " + data.error);
                console.warn("Debug info:", data.received || data.debug || data);
            }
        })
        .catch(err => {
            console.error("🚨 Upload error:", err);
        });
}


function startCamera() {
    const cameraContainer = document.getElementById("cameraContainer");
    const video = document.getElementById("video");

    cameraContainer.style.display = "block"; // Reveal the video container

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            console.error("Camera access denied:", err);
            alert("Unable to access the camera.");
        });
}

function openAttendanceSetup() {
    const token = window.token;
    const provider = window.provider;
    const url = `attendance_setup.html?tkn=${encodeURIComponent(token)}&provider=${encodeURIComponent(provider)}`;
    const newTab = window.open(url, "_blank");

    if (!newTab) {
        alert("Pop-up blocked! Please allow pop-ups for this site.");
    }
}
