export default {
    props: {
    },
    watch: {
    },
    mounted() {
    },
    data() {
        return {
        }
    },
    methods: {
        getCamera() {
            let video = document.getElementById("video001");
            let constraints = {
                video: { width: 300, height: 300 },
                audio: true
            };
            if (!navigator) {
                alert("No navigator")
                return
            }
            if (!navigator.mediaDevices) {
                alert("No mediaDevices")
                return
            }
            if (navigator.mediaDevices.getUserMedia(constraints) == 'undefined') {
                alert("can't use media devices!");
            } else {
                var promise = navigator.mediaDevices.getUserMedia(constraints);
            }
            promise.then(function (MediaStream) {
                video.srcObject = MediaStream;
                video.play();
            }).catch(function (PermissionDeniedError) {
                console.log(PermissionDeniedError);
            })
        },
        takePhoto() {
            let video = document.getElementById("video001");
            let canvas = document.getElementById("canvas001");
            let ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, 240, 240);
            // canvas.toDataURL("image/jpg")
        },
        getScreenShot() {
            let video = document.getElementById("video001");
            let constraints = {
                video: { width: 300, height: 300 },
                audio: true
            };
            if (navigator.mediaDevices.getDisplayMedia(constraints) == 'undefined') {
                alert("can't use media devices!");
            } else {
                var promise = navigator.mediaDevices.getDisplayMedia(constraints);
            }
            promise.then((MediaStream) => {
                video.srcObject = MediaStream;
                video.play();
            }).catch((PermissionDeniedError) => {
                console.log(PermissionDeniedError);
            })
        },
    },
    template:
        `
<section>
    <video id="video001" height="200px" width="200px" autoplay class="bordered"></video>
    <canvas id="canvas001" height="200px" width="200px" class="bordered"></canvas>
    <div class="d-grid gap-2 d-md-flex justify-content-md-center">
        <button @click="getCamera" type="button" class="btn btn-outline-primary">Open Camera</button >
        <button @click="takePhoto" type="button" class="btn btn-outline-success">Take Photo</button >
        <button @click="getScreenShot" type="button" class="btn btn-outline-info">Open ScreenShot</button>
    </div>
</section>
`
}