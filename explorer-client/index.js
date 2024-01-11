const { createApp } = Vue

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
            token: undefined
        }
    },
    mounted() {
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
                    if (res.status == 200) {
                        this.searchResult = res.data
                    }
                }).catch((err) => {
                    // 返回结果
                    this.searchResult = err.response.data
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
                    // console.log(res);
                    this.fileResult = res.data
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
            let formObj = new FormData()
            formObj.append("file", this.fileObj[0])
            axiosInstance.post(`/upload`, formObj)
                .then((res) => {
                    // 返回结果
                    // console.log(res);
                    if (res.status === 200) {
                        // 返回消息弹窗
                        this.generateMsg("上传成功")
                    } else {
                        // 返回消息弹窗
                        this.generateMsg("上传失败")
                    }
                }).catch((err) => {
                    // 返回消息弹窗
                    this.generateMsg(err)
                }).finally(
                    // 清理上传框
                    document.getElementById("inputFile").value = ""
                )
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
                    if (res.status === 200) {
                        // 返回结果
                        this.cmdResult = res.data
                    } else {
                        // 返回消息弹窗
                        this.generateMsg("执行失败")
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
                    if (res.status === 200) {
                        // 返回结果
                        this.currentUser = this.username
                        this.showLogin = false
                        this.canRequest = true
                        this.token = res.data
                        axiosInstance.defaults.headers.common['Authorization'] = this.token;
                    } else {
                        // 返回消息弹窗
                        this.generateMsg("登陆失败，账号或密码错误")
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
        }
    }
})
app.mount('#app')