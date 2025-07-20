const params = window.location.search;

const urlParams = new URLSearchParams(window.location.search);

function getCookie(name) {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
}
function cookieExists(name) {
    return document.cookie.split('; ').some(cookie => cookie.startsWith(name + '='));
}

function verifyToken(data) {
    if (data.hasOwnProperty('credential_error')) {
        console.log('session expired, redirecting to login');
        window.location.href = "https://sams-mmcl.netlify.app?error=credential_error";
        return false;
    }
    return true;
}

if (urlParams.has('tkn')/* && urlParams.has('provider')*/) {
    document.cookie = `tkn=${urlParams.get('tkn')}; path=/; max-age=10800`;
    document.cookie = `provider=${urlParams.get('provider')}; path=/; max-age=10800`;
}
if (!cookieExists('tkn')/* || !cookieExists('provider')*/) {
    window.location.href = "https://sams-mmcl.netlify.app?error=credential_error";
}
window.verifyToken = verifyToken;
window.token = getCookie('tkn');
window.provider = getCookie('provider');

console.log('token:', window.token);
console.log('provider:', window.provider);

fetch(`https://sams-backend-u79d.onrender.com/api/getUserdetails.php`, {
    credentials: 'include',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Provider': window.provider,
        'Token': window.token,
    }
})
    .then(res => res.json())
    .then(json => {
        window.email = json['email'];
        window.pfp = json['pfp'];
    });

const url = new URL(window.location);
url.search = '';
window.history.replaceState({}, document.title, url.pathname);

// Signout functionality
function signOut() {
    // Clear cookies
    document.cookie = 'tkn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'provider=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Redirect to login page
    window.location.href = '/index.html';
}

// Handle student selection on mobile
async function handleMobileStudentSelection(cardElement, student) {
    const isAlreadyPicked = cardElement.classList.contains('student-card_picked');

    // Reset all other cards
    document.querySelectorAll('.student-card_picked').forEach(card => {
        card.classList.remove('student-card_picked');
        card.classList.add('student-card');
        const charts = card.querySelector(".charts-top-bottom");
        if (charts) charts.remove();
    });

    if (!isAlreadyPicked) {
        cardElement.classList.remove('student-card');
        cardElement.classList.add('student-card_picked');

        // Load attendance data and display
        await loadStudentDetails(cardElement, student);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Load and display students
    displayStudents();

    // Set up global navigation functions
    window.previousMonth = previousMonth;
    window.nextMonth = nextMonth;
    window.viewStudentProfile = viewStudentProfile;
});


// Make signOut function globally available
window.signOut = signOut;