// Engagement monitoring variables
let monitoringSession = null;
let engagementCharts = {};
let sessionStartTime = null;
let sessionInterval = null;
let engagementData = [];

// Initialize engagement monitoring
document.addEventListener('DOMContentLoaded', function() {
    initializeEngagementMonitoring();
    loadEngagementHistory();
});

async function initializeEngagementMonitoring() {
    try {
        // Load available courses
        await loadTeacherCourses();
        
        // Initialize charts
        initializeEngagementCharts();
        
        // Setup WebSocket connection for real-time data
        setupWebSocketConnection();
        
        console.log('Engagement monitoring initialized');
    } catch (error) {
        console.error('Error initializing engagement monitoring:', error);
    }
}

async function loadTeacherCourses() {
    try {
        const response = await fetch('https://sams-backend-u79d.onrender.com/api/getTeacherCourses.php', {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Provider': window.provider,
                'Token': window.token,
            }
        });

        const courses = await response.json();
        if (!window.verifyToken(courses)) return;

        const courseSelect = document.getElementById('courseSelect');
        const courseHistoryFilter = document.getElementById('courseHistoryFilter');
        
        courseSelect.innerHTML = '<option value="">Select a course...</option>';
        courseHistoryFilter.innerHTML = '<option value="all">All Courses</option>';
        
        courses.forEach(course => {
            const option = `<option value="${course.name}">${course.name} - ${course.grade_level}</option>`;
            courseSelect.innerHTML += option;
            courseHistoryFilter.innerHTML += option;
        });
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

function initializeEngagementCharts() {
    // Engagement Trend Chart
    const trendCtx = document.getElementById('engagementTrendChart').getContext('2d');
    engagementCharts.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Average Engagement %',
                data: [],
                borderColor: '#0093ff',
                backgroundColor: 'rgba(0, 147, 255, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Engagement %'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Real-time Engagement Trend'
                }
            }
        }
    });

    // Emotion Pie Chart
    const emotionCtx = document.getElementById('emotionPieChart').getContext('2d');
    engagementCharts.emotion = new Chart(emotionCtx, {
        type: 'pie',
        data: {
            labels: ['Happy', 'Focused', 'Surprised', 'Sad', 'Distracted'],
            datasets: [{
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    '#ffcd03',  // Happy - Yellow
                    '#0093ff',  // Focused - Blue
                    '#ff9500',  // Surprised - Orange
                    '#6c757d',  // Sad - Gray
                    '#ef2722'   // Distracted - Red
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Current Emotion Distribution'
                }
            }
        }
    });

    // Attention Bar Chart
    const attentionCtx = document.getElementById('attentionBarChart').getContext('2d');
    engagementCharts.attention = new Chart(attentionCtx, {
        type: 'bar',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
                label: 'Number of Students',
                data: [0, 0, 0],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Students'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Current Attention Levels'
                }
            }
        }
    });
}

async function startEngagementMonitoring() {
    const selectedCourse = document.getElementById('courseSelect').value;
    if (!selectedCourse) {
        alert('Please select a course first');
        return;
    }

    try {
        // Start camera feed
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.getElementById('cameraFeed');
        videoElement.srcObject = stream;
        videoElement.style.display = 'block';
        
        document.getElementById('cameraPlaceholder').style.display = 'none';

        // Update UI
        document.getElementById('startMonitoringBtn').style.display = 'none';
        document.getElementById('stopMonitoringBtn').style.display = 'inline-block';

        // Start session timer
        sessionStartTime = new Date();
        sessionInterval = setInterval(updateSessionDuration, 1000);

        // Initialize monitoring session
        monitoringSession = {
            course: selectedCourse,
            startTime: sessionStartTime,
            isActive: true
        };

        // Start processing video frames
        startVideoProcessing(videoElement);

        console.log(`Started engagement monitoring for course: ${selectedCourse}`);
        
    } catch (error) {
        console.error('Error starting engagement monitoring:', error);
        alert('Failed to start camera. Please check permissions and try again.');
    }
}

function startVideoProcessing(videoElement) {
    const canvas = document.getElementById('engagementCanvas');
    const ctx = canvas.getContext('2d');

    function processFrame() {
        if (!monitoringSession?.isActive) return;

        // Draw video frame to canvas
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Here you would integrate with your Python backend
        // For now, we'll simulate engagement detection
        simulateEngagementDetection(ctx);

        // Continue processing
        requestAnimationFrame(processFrame);
    }

    videoElement.addEventListener('loadedmetadata', () => {
        processFrame();
    });
}

function simulateEngagementDetection(ctx) {
    // Simulate detected faces and engagement levels
    const mockData = {
        detectedStudents: Math.floor(Math.random() * 5) + 1,
        avgEngagement: Math.floor(Math.random() * 40) + 60, // 60-100%
        emotions: {
            happy: Math.floor(Math.random() * 30),
            focused: Math.floor(Math.random() * 50) + 40,
            surprised: Math.floor(Math.random() * 20),
            sad: Math.floor(Math.random() * 10),
            distracted: Math.floor(Math.random() * 20)
        },
        attentionLevels: {
            high: Math.floor(Math.random() * 3) + 1,
            medium: Math.floor(Math.random() * 2) + 1,
            low: Math.floor(Math.random() * 2)
        }
    };

    // Draw mock face detection rectangles
    ctx.strokeStyle = '#0093ff';
    ctx.lineWidth = 2;
    for (let i = 0; i < mockData.detectedStudents; i++) {
        const x = Math.random() * (canvas.width - 100);
        const y = Math.random() * (canvas.height - 100);
        ctx.strokeRect(x, y, 80, 100);
        
        // Add engagement score text
        ctx.fillStyle = '#0093ff';
        ctx.font = '14px Arial';
        ctx.fillText(`${mockData.avgEngagement}%`, x, y - 5);
    }

    // Update live stats
    updateLiveStats(mockData);
    updateEngagementCharts(mockData);
}

function updateLiveStats(data) {
    document.getElementById('detectedCount').textContent = data.detectedStudents;
    document.getElementById('avgEngagement').textContent = data.avgEngagement + '%';
}

function updateSessionDuration() {
    if (!sessionStartTime) return;
    
    const now = new Date();
    const duration = Math.floor((now - sessionStartTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    document.getElementById('sessionDuration').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateEngagementCharts(data) {
    // Update trend chart
    const now = new Date().toLocaleTimeString();
    engagementCharts.trend.data.labels.push(now);
    engagementCharts.trend.data.datasets[0].data.push(data.avgEngagement);
    
    // Keep only last 20 data points
    if (engagementCharts.trend.data.labels.length > 20) {
        engagementCharts.trend.data.labels.shift();
        engagementCharts.trend.data.datasets[0].data.shift();
    }
    engagementCharts.trend.update();

    // Update emotion chart
    engagementCharts.emotion.data.datasets[0].data = [
        data.emotions.happy,
        data.emotions.focused,
        data.emotions.surprised,
        data.emotions.sad,
        data.emotions.distracted
    ];
    engagementCharts.emotion.update();

    // Update attention chart
    engagementCharts.attention.data.datasets[0].data = [
        data.attentionLevels.high,
        data.attentionLevels.medium,
        data.attentionLevels.low
    ];
    engagementCharts.attention.update();
}

function stopEngagementMonitoring() {
    if (monitoringSession) {
        monitoringSession.isActive = false;
        monitoringSession = null;
    }

    // Stop camera
    const videoElement = document.getElementById('cameraFeed');
    if (videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.style.display = 'none';
    }

    // Clear canvas
    const canvas = document.getElementById('engagementCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Show placeholder
    document.getElementById('cameraPlaceholder').style.display = 'block';

    // Update UI
    document.getElementById('startMonitoringBtn').style.display = 'inline-block';
    document.getElementById('stopMonitoringBtn').style.display = 'none';

    // Stop session timer
    if (sessionInterval) {
        clearInterval(sessionInterval);
        sessionInterval = null;
    }

    console.log('Engagement monitoring stopped');
}

async function loadEngagementHistory() {
    try {
        const courseFilter = document.getElementById('courseHistoryFilter').value;
        const dateFilter = document.getElementById('dateFilter').value || new Date().toISOString().split('T')[0];

        const response = await fetch(`https://sams-backend-u79d.onrender.com/api/getEngagementData.php?course_name=${courseFilter}&date=${dateFilter}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Provider': window.provider,
                'Token': window.token,
            }
        });

        const data = await response.json();
        if (!window.verifyToken(data)) return;

        displayEngagementHistory(data);
    } catch (error) {
        console.error('Error loading engagement history:', error);
    }
}

function displayEngagementHistory(data) {
    const tbody = document.querySelector('#engagementHistoryTable tbody');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No engagement data available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(record => {
        const dominantEmotion = record.emotions ? 
            Object.keys(record.emotions).reduce((a, b) => record.emotions[a] > record.emotions[b] ? a : b) : 
            'Unknown';
        
        const engagementClass = record.engagement_level > 0.7 ? 'high-engagement' : 
                               record.engagement_level > 0.4 ? 'medium-engagement' : 'low-engagement';

        return `
            <tr>
                <td>${new Date(record.timestamp).toLocaleTimeString()}</td>
                <td>${record.student_name}</td>
                <td>${record.course_name}</td>
                <td><span class="${engagementClass}">${(record.engagement_level * 100).toFixed(1)}%</span></td>
                <td>${dominantEmotion}</td>
                <td>${(record.attention_score * 100).toFixed(1)}%</td>
            </tr>
        `;
    }).join('');
}

function setupWebSocketConnection() {
    // This would connect to your Python backend for real-time data
    // For now, we'll use polling
    setInterval(() => {
        if (monitoringSession?.isActive) {
            // In a real implementation, this would fetch latest engagement data
            // from your Python processing service
        }
    }, 5000);
}

// Event listeners
document.getElementById('courseHistoryFilter').addEventListener('change', loadEngagementHistory);
document.getElementById('dateFilter').addEventListener('change', loadEngagementHistory);
