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

/*for Sending Messages*/
const sendBtn = document.getElementById('send-btn');
const input = document.getElementById('message-input');
const messageContainer = document.querySelector('.middle-part');

sendBtn.addEventListener('click', () => {
    const message = input.value.trim();

    if (message !== "") {
        const senderDiv = document.createElement('div');
        senderDiv.className = 'reciever';
        senderDiv.textContent = message;
        messageContainer.appendChild(senderDiv);
        input.value = "";
    }
});

