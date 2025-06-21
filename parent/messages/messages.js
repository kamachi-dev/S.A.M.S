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

function getMessages(id) {
    fetch(`https://sams-backend-u79d.onrender.com/api/getMessages.php?convo=${id}`, {
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
            if (convo_id != id) return;
            if (!window.verifyToken(data)) return;
            if (JSON.stringify(data) === JSON.stringify(prevConvo)) return;
            prevConvo = data;
            let i = 0;
            const messageContainer = document.querySelector('.middle-part');
            messageContainer.innerHTML = '';

            const recipient = data.find(m => m.email !== window.email);
            const recipient_pfp = document.querySelector(`#recipient-${id}`).querySelector('#pfp').src;
            document.querySelector('#recipient-pfp').src = recipient_pfp == null ? '/assets/icons/placeholder-parent.jpeg' : recipient_pfp;
            document.querySelector('#profile-name').innerHTML = recipient.lastname + ', ' + recipient.firstname;

            data.forEach((message, i) => {
                const messageDiv = document.createElement('div');
                messageDiv.className = window.email == message.email ? 'reciever' : 'sender';
                messageDiv.innerHTML = `${message.message}
                    <p>${formatTimestamp(message.sent)}</p>`;
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
            convo_id = id;
            el = document.querySelector(".middle-part");
            el.scrollTop = el.scrollHeight;
        })
}

function getCourses() {
    fetch(`https://sams-backend-u79d.onrender.com/api/getStudentCourses.php`, {
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
            const leftContent = document.querySelector('.left-content');
            leftContent.innerHTML = '';

            data.forEach(course => {
                clone = courseHTML.querySelector('.courses').cloneNode(true);
                clone.id = `course-${course['name']}`;
                clone.querySelector('#pfp').src = course['pfp'] == null ? '/assets/icons/placeholder-parent.jpeg' : course['pfp'];
                clone.querySelector('.course-name').textContent = course['name'];
                clone.querySelector('.course-preview').textContent = `${course['attendance']} : ${course['firstname']} ${course['lastname']}`;
                clone.querySelector('.course-status').textContent = formatTimestamp(course['sent']);
                clone.addEventListener('click', () => {
                    convo_id = course['conversation'];
                    getMessages(course['conversation']);
                    const leftContent = document.querySelector('.middle-part');
                    leftContent.innerHTML = 'loading...';
                });
                leftContent.appendChild(clone);
            });
        });
}

function updateMessages() {
    if (convo_id)
        getMessages(convo_id);
}

document.querySelector("#message-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        msg = document.querySelector('#message-input').value;
        fetch(`https://sams-backend-u79d.onrender.com/api/postMessage.php`, {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Provider': window.provider,
                'Token': window.token,
            },
            body: JSON.stringify({
                convo: convo_id,
                msg: msg
            })
        });
        const messageDiv = document.createElement('div');
        messageDiv.className = 'reciever';
        messageDiv.innerHTML = `${msg}
        <p>${formatTimestamp(new Date())}</p>`;
        document.querySelector('.middle-part').appendChild(messageDiv);
        el = document.querySelector(".middle-part");
        el.scrollTop = el.scrollHeight;
    }
});

let prevConvo = null;
let convo_id = null;
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

