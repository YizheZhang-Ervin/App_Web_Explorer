export default {
    props: {
    },
    watch: {
    },
    mounted() {
    },
    data() {
        return {
            ocrResult: undefined
        }
    },
    methods: {
        // 启动OCR
        startOCR(e) {
            const ocrFileObj = e.target.files;
            if (ocrFileObj) {
                // 预览上传的文件
                document.getElementById("imgInput").src = URL.createObjectURL(ocrFileObj[0]);
                let conf = {
                    corePath: '../lib/ocr/corePath',
                    workerPath: "../lib/ocr/worker.min.js",
                    langPath: "../lib/ocr/langPath"
                    // logger: (m) => { console.log(m); }
                }
                // 处理上传的图片
                Tesseract.createWorker("chi_sim", 1, conf).then(worker => {
                    worker.recognize(ocrFileObj[0]).then(res => {
                        this.ocrResult = res.data.text
                    })
                })
            }
        }
    },
    template:
        `
<section>
    <div class="input-group">
    <input type="file" class="form-control" id="ocrInputFile"
        aria-describedby="ocrInput" aria-label="ocrInput"
        @change="startOCR">
    </div>
    <br />
    <img id="imgInput" style="max-width:300px;">
    <br />
    <textarea v-model="ocrResult" readonly
    class="form-control resultColor border-none" rows="10">
    </textarea>
</section>
`
}