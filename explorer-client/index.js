const { createApp } = Vue
import Media from "./components/media.js"
import Carrace from "./components/carrace.js"
import Wheel from "./components/wheel.js"
import Ocr from "./components/ocr.js"

const axiosInstance = axios.create()

const app = createApp({
    data() {
        return {
            keyword: undefined,
            searchResult: undefined,
            fileResult: undefined,
            commands: undefined,
            cmdResult: undefined,
            fileObj: undefined,
            username: undefined,
            pwd: undefined,
            currentUser: undefined,
            showLogin: true,
            canRequest: false,
            token: undefined,
            showCarrace: false,
            showWheel: false,
            // currentEle: undefined,
            mouseX: undefined,
            mouseY: undefined,
            randomBg: {
                backgroundImage: 'url(./imgs/bg1.jpg)',
                backgroundSize: 'cover'
            },
            showOcr: false
        }
    },
    mounted() {
        // title时钟
        setInterval(() => {
            this.checkVisibility()
        }, 1000);
        // 鼠标移动
        document.onmousemove = this.mouseMove;
        // 设置背景图
        this.changeBg()
    },
    methods: {
        // 打开全局搜索
        openSearch() {
            this.keyword = undefined
            this.searchResult = undefined
            // 判断是否已登录，没登录不允许调用
            this.judgeLogin()
        },
        // 全局搜索
        globalSearch() {
            // 关键词
            // console.log(this.keyword)
            // 查询关键词相关内容
            if (!this.canRequest) {
                this.generateMsg("请先登录")
                return;
            }
            // 判空
            if (this.keyword == '') {
                this.keyword = undefined
            }
            axiosInstance.get(`/gsearch?keyword=${this.keyword}`)
                .then((res) => {
                    // 返回结果
                    // console.log(res);
                    if (res.data.code === "OK") {
                        this.searchResult = res.data.data
                    } else {
                        this.searchResult = res.data.msg
                    }
                }).catch((err) => {
                    // 返回结果
                    this.searchResult = err
                    // this.generateMsg(err)
                })
        },
        // 文件浏览器
        fileBrowser() {
            // 判断是否已登录，没登录不允许调用
            this.judgeLogin()
            // 查询相关文件
            if (!this.canRequest) {
                this.generateMsg("请先登录")
                return;
            }
            axiosInstance.get(`/file`)
                .then((res) => {
                    // 返回结果
                    if (res.data.code === "OK") {
                        this.fileResult = res.data.data
                    } else {
                        this.fileResult = undefined
                        this.generateMsg(res.data.msg)
                    }
                }).catch((err) => {
                    // 返回结果
                    this.fileResult = undefined
                    this.generateMsg(err)
                })
        },
        // 打开上传界面
        openUploadFile() {
            // 判断是否已登录，没登录不允许调用
            this.judgeLogin()
        },
        // 文件上传监听
        handleFileUpload(e) {
            const files = e.target.files;
            // 对上传的文件数组进行处理
            this.fileObj = files
        },
        // 上传
        uploadFile() {
            // 上传文件
            // console.log(this.fileObj)
            if (!this.canRequest) {
                this.generateMsg("请先登录")
                return;
            }
            let fileQuantity = this.fileObj.length
            let count = 0
            for (let file of this.fileObj) {
                count++
                let formObj = new FormData()
                formObj.append("file", file)
                axiosInstance.post(`/upload`, formObj).then((res) => {
                    // 返回结果
                    // console.log(res);
                    if (res.data.code === "OK") {
                        // 返回消息弹窗
                        this.generateMsg("上传成功")
                    } else {
                        // 返回消息弹窗
                        this.generateMsg(res.data.msg)
                    }
                }).catch((err) => {
                    // 返回消息弹窗
                    this.generateMsg(err)
                }).finally(() => {
                    // 清理上传框
                    if (count === fileQuantity) {
                        document.getElementById("inputFile").value = ""
                    }
                })
            }
        },
        // 打开命令行
        openRunCmd() {
            this.commands = undefined
            this.cmdResult = undefined
            // 判断是否已登录，没登录不允许调用
            this.judgeLogin()
        },
        // 命令行
        runCmd() {
            // 输入的命令
            // console.log(this.commands)
            // 处理命令
            if (!this.canRequest) {
                this.generateMsg("请先登录")
                return;
            }
            axiosInstance.post(`/run`, { "commands": this.commands })
                .then((res) => {
                    // 返回结果
                    // console.log(res);
                    if (res.data.code === "OK") {
                        // 返回结果
                        this.cmdResult = res.data.data
                    } else {
                        // 返回消息弹窗
                        this.generateMsg(res.data.msg)
                    }
                }).catch((err) => {
                    // 返回消息弹窗
                    this.generateMsg(err)
                })
        },
        // 打开登录
        openLogin() {
            this.username = undefined
            this.pwd = undefined
        },
        // 登录
        login() {
            // console.log(this.username, this.pwd)
            axiosInstance.post(`/login`, { "username": this.username, "pwd": this.pwd })
                .then((res) => {
                    // 返回结果
                    // console.log(res);
                    if (res.data.code === "OK") {
                        // 返回结果
                        this.currentUser = this.username
                        this.showLogin = false
                        this.canRequest = true
                        this.token = res.data.data
                        axiosInstance.defaults.headers.common['Authorization'] = this.token;
                        // 发送通知
                        this.sendNotification(this.currentUser)
                    } else {
                        // 返回消息弹窗
                        this.generateMsg(res.data.msg)
                    }
                }).catch((err) => {
                    // 返回消息弹窗
                    this.generateMsg(err)
                })
        },
        // 登出
        logout() {
            // TODO: 存入localstorage
            // 表头显示login按钮
            this.currentUser = undefined
            this.showLogin = true
            this.canRequest = false
            this.token = undefined
            axiosInstance.defaults.headers.common['Authorization'] = undefined;
        },
        // 判断是否已登录
        judgeLogin() {
            // 若已登录
            if (this.currentUser) {
                this.canRequest = true
            } else {
                this.canRequest = false
            }
        },
        // 弹框消息
        generateMsg(msg) {
            const alertPlaceholder = document.getElementById('myAlert')
            const alert = (message, type) => {
                const wrapper = document.createElement('div')
                wrapper.innerHTML = [
                    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
                    `   <div>${message}</div>`,
                    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
                    '</div>'
                ].join('')
                for (let childNode of alertPlaceholder.childNodes) {
                    // console.log(childNode)
                    alertPlaceholder.removeChild(childNode)
                }
                alertPlaceholder.append(wrapper)
            }
            alert(msg, 'success')
        },
        // title时钟，当页面挂在后台时播放
        checkVisibility() {
            let timer;
            if (document.visibilityState != "visible") {
                timer = setInterval(() => {
                    let date = new Date(Date.now());
                    document.title =
                        "Explorer - " +
                        date.getHours() +
                        ":" +
                        date.getMinutes() +
                        ":" +
                        date.getSeconds();
                    if (document.visibilityState == "visible") {
                        clearInterval(timer);
                        document.title = "Explorer";
                    }
                }, 1000);
            }
        },
        // 发送通知
        sendNotification(user) {
            navigator.geolocation.getCurrentPosition((position) => {
                let latitude =
                    position.coords.latitude > 0
                        ? position.coords.latitude + " N"
                        : position.coords.latitude + " S";
                let longitude =
                    position.coords.longitude > 0
                        ? position.coords.longitude + " E"
                        : position.coords.longitude + " W";
                console.log(`你的地理位置是：${latitude},${longitude}`)
            }, (err) => { console.log(err) })
            var n = new Notification(`Hi ${user}`, {
                body: `Welcome to Explorer!`,
                tag: "backup",
                requireInteraction: false,
                data: {},
            });
            n.onclick = () => {
                n.close();
            };
        },
        // 获取鼠标位置
        mouseMove(ev) {
            ev = ev || window.event;
            var mousePos = this.mouseCoords(ev);
            //获取当前的x,y坐标
            this.mouseX = mousePos.x;
            this.mouseY = mousePos.y;
            // 获取当前位置的元素
            // let ele = document.elementFromPoint(this.mouseX, this.mouseY);
            // this.currentEle = ele;
        },
        mouseCoords(ev) {
            //鼠标移动的位置
            if (ev.pageX || ev.pageY) {
                return { x: ev.pageX, y: ev.pageY };
            }
            return {
                x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
                y: ev.clientY + document.body.scrollTop - document.body.clientTop,
            };
        },
        // 切换壁纸
        changeBg() {
            // 随机1~4
            let num = Math.floor(Math.random() * (5 - 1)) + 1;
            this.randomBg = {
                backgroundImage: `url(./imgs/bg${num}.jpg)`,
                backgroundSize: 'cover'
            }
        }
    }
})
app.component("media", Media)
app.component("carrace", Carrace)
app.component("wheel", Wheel)
app.component("ocr", Ocr)
app.mount('#app')