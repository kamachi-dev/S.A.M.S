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
    console.log("fetching convo:", id)
    const convo = fetch(`https://sams-backend-u79d.onrender.com/getData.php?action=getMessages&id=${id}`, {
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            let i = 0;
            const messageContainer = document.querySelector('.middle-part');
            messageContainer.innerHTML = '';

            console.log(data);

            data.forEach(message => {
                const messageDiv = document.createElement('div');
                messageDiv.className = i++ % 2 == 0 ? 'reciever' : 'sender';
                messageDiv.innerHTML = `${message.message}
                    <p>${formatTimestamp(message.sent)}</p>`;
                messageContainer.appendChild(messageDiv);
            });
        })
}

function getRecepients() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('tkn');
    fetch(`https://sams-backend-u79d.onrender.com/getData.php?action=getRecipients&tkn=${token}`, {
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            const leftContent = document.querySelector('.left-content');
            leftContent.innerHTML = '';

            const parser = new DOMParser();
            console.log(data);

            fetch('/assets/templates/profile.html')
                .then(res => res.text())
                .then(txt => parser.parseFromString(txt, 'text/html'))
                .then(html => {
                    data.forEach(recipient => {
                        html.querySelector('.profile-name').textContent = recipient['lastname'] + ', ' + recipient['firstname'];
                        html.querySelector('.profile-preview').textContent = recipient['message'];
                        html.querySelector('.profile-status').textContent = formatTimestamp(recipient['sent']);
                        html.querySelector('.profiles').addEventListener('click', () => getMessages(recipient['conversation']));
                        leftContent.appendChild(html.querySelector('.profiles').cloneNode(true));
                    });
                });
        });
}

getRecepients();

