imgIndex = 1;
changing = false;

//pop up///////////////////////////////////////////////////////////////
async function ClosePopup() {
    var popup = document.getElementById("popup");
    popup.className = "popup hide";
}
async function OpenPopup() {
    var popup = document.getElementById("popup");
    popup.className = "popup show";
    console.log(popup);
}

//gallery///////////////////////////////////////////////////////////////
async function PrevImg() {
    if (imgIndex <= 1) imgIndex = 3;
    else imgIndex -= 1;
    ChangeImg();
}

async function NextImg() {
    imgIndex = imgIndex % 3 + 1;
    ChangeImg();
}
function ChangeImg() {
    if (changing) return;
    changing = true;
    var img = document.getElementById("school"),
        newImg = new Image();
    newImg.id = "school";
    newImg.src = "assets/School" + imgIndex + ".jpg";
    img.parentNode.insertBefore(newImg, img.nextSibling);
    setTimeout(function () {
        img.parentNode.removeChild(img);
        changing = false;
    }, 1500);
}

async function LoopImg() {
    setTimeout(function () {
        imgIndex = imgIndex % 3 + 1;
        ChangeImg();
        LoopImg();
    }, 7000);
}

//sign in///////////////////////////////////////////////////////////////
async function LogIn(e) {
}
document.querySelector('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    console.log('iya~~ (*/ω＼*)'); //PLEASE PLEASE PLEASE REMOVE THIS PLEASEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
    LogIn(e);
});

function handleCredentialResponse(response) {
    fetch("google_login.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ credential: response.credential })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.location.href = "welcome.php";
            } else {
                document.getElementById("errorMessage").innerText = data.message || "Google login failed.";
                document.getElementById("errorPopup").style.display = "block";
            }
        })
        .catch(() => {
            document.getElementById("errorMessage").innerText = "Network error.";
            document.getElementById("errorPopup").style.display = "block";
        });
}

LoopImg();
