function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}

/* Hides right content when left content is clicked */
const profiles = document.querySelector('.left-content');
const rightContent = document.querySelector('.right-content');
const filterContent = document.querySelector('.filter-content');

profiles.addEventListener('click', () => {
    if (window.matchMedia("(max-width: 750px)").matches) {
        profiles.style.display = 'none';
        rightContent.style.display = 'block';
        filterContent.style.display = 'none';
        rightContent.style.flex = '1';
    }
});

function isToday(date) {
    const today = new Date();
    const givenDate = new Date(date);

    return (
        today.getFullYear() === givenDate.getFullYear() &&
        today.getMonth() === givenDate.getMonth() &&
        today.getDate() === givenDate.getDate()
    );
}

function formatTimestamp(dateString) {
    const date = new Date(dateString);
    const isToday = new Date().toDateString() === date.toDateString();

    if (isToday) {
        // Show only time (e.g., "10:30 AM")
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        // Show date + time (e.g., "Jun 14, 10:30 AM")
        return date.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function levenshtein(a, b) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
    }
    return dp[a.length][b.length];
}

function getCourseRecords(id) {
    fetch(`https://sams-backend-u79d.onrender.com/api/getCourseRecordsWithNotifications.php?course=${id}`, {
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
            if (course_id != id) return;
            if (!window.verifyToken(data)) return;
            if (JSON.stringify(data) === JSON.stringify(prevConvo)) return;
            prevConvo = data;
            
            // Debug: Log the received data
            console.log('Received course records data:', data);
            console.log('Data length:', data ? data.length : 'null/undefined');
            if (data && data.length > 0) {
                data.forEach((record, index) => {
                    console.log(`Record ${index}:`, {
                        attendance: record.attendance,
                        type: record.type,
                        message: record.message,
                        firstname: record.firstname,
                        lastname: record.lastname
                    });
                });
            }
            
            let i = 0;
            const messageContainer = document.querySelector('.middle-part');
            messageContainer.innerHTML = '';

            const recipient_pfp = document.querySelector(`#course-${id}`).querySelector('#pfp').src;
            document.querySelector('#recipient-pfp').src = recipient_pfp == null ? '/assets/icons/placeholder-parent.jpeg' : recipient_pfp;
            document.querySelector('#profile-name').innerHTML = document.querySelector(`#course-${id}`).querySelector('.course-name').innerHTML;

            data.forEach((message, i) => {
                const messageDiv = document.createElement('div');
                const attendanceIndex = parseInt(message['attendance']);
                const attendanceType = attendanceArr[attendanceIndex];
                
                // Special handling for notifications
                if (attendanceIndex === 4 && message['message']) {
                    messageDiv.className = `sender notification`;
                    // Display the full notification message from database
                    messageDiv.innerHTML = `<div style="white-space: pre-line; padding: 10px;">${message['message']}</div>
                        <p>${formatTimestamp(message.sent)}</p>`;
                } else if (attendanceIndex === 4) {
                    // Fallback if no message content
                    messageDiv.className = `sender notification`;
                    messageDiv.innerHTML = `${attendanceType}<br><strong>Your child's attendance is at risk!</strong><br>From: ${message['firstname']} ${message['lastname']} (Teacher)
                        <p>${formatTimestamp(message.sent)}</p>`;
                } else {
                    messageDiv.className = `sender ${attendanceType.toLowerCase().replace('🚨 ', '')}`;
                    messageDiv.innerHTML = `${attendanceType} : ${message['firstname']} ${message['lastname']}
                        <p>${formatTimestamp(message.sent)}</p>`;
                }
                
                if (i > 0) {
                    const prevMsg = data[i - 1];
                    const prevTime = new Date(prevMsg.sent).getTime();
                    const currTime = new Date(message.sent).getTime();
                    const diffHours = Math.abs(currTime - prevTime) / 60000;
                    if (diffHours <= 1) {
                        const p = messageDiv.querySelector('p');
                        if (p) p.remove();
                    }
                }
                messageContainer.appendChild(messageDiv);
            });
            course_id = id;
            el = document.querySelector(".middle-part");
            el.scrollTop = el.scrollHeight;
        })
}

function getCourses() {
    fetch(`https://sams-backend-u79d.onrender.com/api/getStudentsRecords.php`, {
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
            if (!window.verifyToken(data)) return;
            const filter = document.querySelector('#search-input').value;
            const leftContent = document.querySelector('.left-content');
            leftContent.innerHTML = '';

            data.forEach(course => {
                if (filter !== '' && levenshtein(filter, course['name']) > 4) console.log(`filtered out ${course['name']}`);
                else {
                    clone = courseHTML.querySelector('.course-root').cloneNode(true);
                    clone.id = `course-${course['id']}`;
                    clone.querySelector('#pfp').src = course['pfp'] == null ? '/assets/icons/placeholder-parent.jpeg' : course['pfp'];
                    clone.querySelector('.course-name').textContent = course['name'];
                    
                    // Special handling for notifications in course preview
                    const attendanceIndex = parseInt(course['attendance']);
                    if (attendanceIndex === 4) {
                        clone.querySelector('.course-preview').textContent = `🚨 Teacher Alert: Attendance Risk - ${course['firstname']} ${course['lastname']}`;
                        clone.style.borderLeft = '4px solid #ff4444';
                    } else {
                        clone.querySelector('.course-preview').textContent = `${attendanceArr[attendanceIndex]} : ${course['firstname']} ${course['lastname']}`;
                    }
                    
                    clone.querySelector('.course-status').textContent = formatTimestamp(course['sent']);
                    clone.addEventListener('click', () => {
                        course_id = course['id'];
                        getCourseRecords(course['id']);
                        const leftContent = document.querySelector('.middle-part');
                        leftContent.innerHTML = 'loading...';
                    });
                    leftContent.appendChild(clone);
                }
            });
        });
}

function updateMessages() {
    if (course_id)
        getCourseRecords(course_id);
}

const attendanceArr = [
    'Excused',
    'Absent',
    'Late',
    'Present',
    '🚨 Notification'
];
let prevConvo = null;
let course_id = null;
const parser = new DOMParser();

let courseHTML;

fetch('/assets/templates/course.html')
    .then(res => res.text())
    .then(txt => parser.parseFromString(txt, 'text/html'))
    .then(html => {
        courseHTML = html;
        console.log(courseHTML);
        setInterval(updateMessages, 1000);
        getCourses();
    });

document.querySelector("#search-input").addEventListener("input", (e) => {
    getCourses();
});
