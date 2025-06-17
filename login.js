imgIndex = 1;
changing = false;

console.log("\x1b[34m you really shouldnt be here!")
console.log("\x1b[34m sneaky little developer!")
console.log("\x1b[34m tsk tsk tsk!")

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

window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
        alert("Authentication failed: " + decodeURIComponent(error));
    }
};
LoopImg();
