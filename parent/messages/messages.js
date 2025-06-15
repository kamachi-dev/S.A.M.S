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

function getConvo(id) {
    const convo = fetch(`https://sams-backend-u79d.onrender.com/getData.php?action=getConvo&id=${id}`)
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
                    <p>${message.sent}</p>`;
                messageContainer.appendChild(messageDiv);
            });
        })
}

getConvo(1);

