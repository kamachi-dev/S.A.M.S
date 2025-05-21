function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const hideIcon = document.querySelector('.password-toggle .hide-icon'); // eye-slash SVG
    const showIcon = document.querySelector('.password-toggle .show-icon'); // eye SVG

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        hideIcon.style.display = 'none';
        showIcon.style.display = 'block';
    } else {
        passwordInput.type = 'password';
        hideIcon.style.display = 'block'; 
        showIcon.style.display = 'none';
    }
}

function TogglePopup() {
  const popup = document.getElementById("popup");
  popup.classList.toggle("show");
}
