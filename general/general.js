const params = window.location.search;
document.querySelectorAll('a').forEach(link => {
    if (link.href.includes('#') || link.href.startsWith('mailto:') || link.target === '_blank') return;
    if (!link.href.includes('?')) {
        link.href += params;
    } else {
        link.href += '&' + params.slice(1);
    }
});