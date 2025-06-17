const params = window.location.search;
document.querySelectorAll('a').forEach(link => {
    if (link.href.includes('#') || link.href.startsWith('mailto:') || link.target === '_blank') return;
    if (!link.href.includes('?')) {
        link.href += params;
    } else {
        link.href += '&' + params.slice(1);
    }
});

const urlParams = new URLSearchParams(window.location.search);
window.token = urlParams.get('tkn');
fetch(`https://sams-backend-u79d.onrender.com/getData.php?action=getUserdetails&tkn=${window.token}`, {
    credentials: 'include'
})
    .then(res => res.json())
    .then(json => {
        window.email = json['email']
    });

const url = new URL(window.location);
url.search = '';
window.history.replaceState({}, document.title, url.pathname);