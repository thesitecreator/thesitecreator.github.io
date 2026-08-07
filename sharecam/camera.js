const video = document.getElementById("camera");

navigator.mediaDevices.getUserMedia({video:true})
.then(stream => {
    video.srcObject = stream;
})
.catch(error => {
    alert(error.name + " : " + error.message);
});
