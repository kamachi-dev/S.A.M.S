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

/* Change Pass Function */
function showConfirmPassword() {
     // Show confirm password field
    document.querySelector('label[for="confirmPass"]').style.display = 'block';
    document.getElementById('confirmPass').style.display = 'block';

    // Show button-container2 and the individual buttons
    document.querySelector('.button-container2').style.display = 'flex';
    document.getElementById('saveBtn').style.display = 'inline-block';
    document.getElementById('cancelBtn').style.display = 'inline-block';

    // Hide
    document.getElementById('changePasswordBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';

    // Clear
    const passwordInput = document.getElementById('password');
    passwordInput.value = '';
    passwordInput.placeholder = 'Enter New Password...';
    passwordInput.removeAttribute('readonly');
}

/* For Save Btn and New Pass */
function saveNewPassword() {
    const newPass = document.getElementById('password').value;
    const confirmPass = document.getElementById('confirmPass').value;

    if (newPass === '' || confirmPass === '') {
        alert('Please enter and confirm your new password');
        return;
    }

    if (newPass !== confirmPass) {
        alert('Passwords do not match!');
        return;
    }

    // If passwords match
    document.getElementById('password').setAttribute('readonly', true);
    document.getElementById('confirmPass').style.display = 'none';
    document.querySelector('label[for="confirmPass"]').style.display = 'none';
    document.getElementById('confirmPass').value = '';

    document.getElementById('saveBtn').style.display = 'none';
    document.getElementById('cancelBtn').style.display = 'none';
    document.getElementById('changePasswordBtn').style.display = 'inline-block';
    document.getElementById('logoutBtn').style.display = 'inline-block';

    // If successful
    alert('Password successfully updated!');
}