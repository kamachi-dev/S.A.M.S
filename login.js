imgIndex = 1;
changing = false;

async function ClosePopup() {
    var popup = document.getElementById("popup");
    popup.className = "popup hide";
}
async function OpenPopup() {
    var popup = document.getElementById("popup");
    popup.className = "popup show";
    console.log(popup);
}
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
    setTimeout(function() {
        img.parentNode.removeChild(img);
        changing = false;
    }, 1500);
}
async function LoopImg() {
    setTimeout(function() {
        imgIndex = imgIndex % 3 + 1;
        ChangeImg();
        LoopImg();
    }, 7000);
}
LoopImg();