function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}

/* Hides right content when left content is clicked */
const profiles = document.querySelector('.left-content');
const rightContent = document.querySelector('.right-content');

profiles.addEventListener('click', () => {
    if (window.matchMedia("(max-width: 750px)").matches) {
        profiles.style.display = 'none';
        rightContent.style.display = 'block';
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
    fetch(`https://sams-backend-u79d.onrender.com/getData.php?action=getMessages&convo=${id}&provider=${window.provider}&tkn=${window.token}`, {
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            if (!window.verifyToken(data)) return;
            let i = 0;
            const messageContainer = document.querySelector('.middle-part');
            messageContainer.innerHTML = '';

            const recipient = data.find(m => m.email !== window.email);
            document.querySelector('#profile-name').innerHTML = recipient.lastname + ', ' + recipient.firstname;

            data.forEach(message => {
                const messageDiv = document.createElement('div');
                messageDiv.className = window.email == message.email ? 'reciever' : 'sender';
                messageDiv.innerHTML = `${message.message}
                    <p>${formatTimestamp(message.sent)}</p>`;
                messageContainer.appendChild(messageDiv);
            });
            convo_id = id;
            el = document.querySelector(".middle-part");
            el.scrollTop = el.scrollHeight;
        })
}

function getRecepients() {
    fetch(`https://sams-backend-u79d.onrender.com/getData.php?action=getRecipients&provider=${window.provider}&tkn=${window.token}`, {
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            if (!window.verifyToken(data)) return;
            const leftContent = document.querySelector('.left-content');
            leftContent.innerHTML = '';

            data.forEach(recipient => {
                clone = profileHTML.querySelector('.profiles').cloneNode(true);
                clone.querySelector('.profile-name').textContent = recipient['lastname'] + ', ' + recipient['firstname'];
                clone.querySelector('.profile-preview').textContent = recipient['message'];
                clone.querySelector('.profile-status').textContent = formatTimestamp(recipient['sent']);
                clone.addEventListener('click', () => getMessages(recipient['conversation']));
                leftContent.appendChild(clone);
            });
        });
}

function updateMessages() {
    if (convo_id)
        getMessages(convo_id);
}

document.getElementById("#message-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        console.log("Enter pressed! Value:", this.value);
        msg = document.querySelector('#message-input').value;
        fetch(`https://sams-backend-u79d.onrender.com/getData.php?action=addMessage&convo=${convo_id}&msg=${msg}&provider=${window.provider}&tkn=${window.token}`, {
            credentials: 'include'
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

let convo_id = null;
const parser = new DOMParser();

let profileHTML;

fetch('/assets/templates/profile.html')
    .then(res => res.text())
    .then(txt => parser.parseFromString(txt, 'text/html'))
    .then(html => {
        profileHTML = html;
        console.log(profileHTML);
        setInterval(updateMessages, 1000);
        getRecepients();
    });

