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
        // window.location.href = "https://sams-mmcl.netlify.app?error=credential_error";
        window.location.href = "https://localhost:8000?error=credential_error";
        return false;
    }
    return true;
}

if (urlParams.has('tkn')/* && urlParams.has('provider')*/) {
    document.cookie = `tkn=${urlParams.get('tkn')}; path=/; max-age=10800`;
    document.cookie = `provider=${urlParams.get('provider')}; path=/; max-age=10800`;
}
if (!cookieExists('tkn')/* || !cookieExists('provider')*/) {
    // window.location.href = "https://sams-mmcl.netlify.app?error=credential_error";
    window.location.href = "https://localhost:8000?error=credential_error";
}
window.verifyToken = verifyToken;
window.token = getCookie('tkn');
window.provider = getCookie('provider');

console.log('token:', window.token);
console.log('provider:', window.provider);

// fetch(`https://sams-backend-u79d.onrender.com/api/getUserdetails.php`
    
fetch(`https://localhost:8000/api/getUserdetails.php`, {
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