let express = require('express');
let app = express();
const bodyParser = require('body-parser')
const multer = require('multer')
const { exec } = require("child_process");
let fs = require('fs');
let path = require("path")
let https = require('https')
// let config = require("./config/config-test.json")
let config = require("./config/config-prod.json")

// read config
let folderPath = config["folderPath"]
let port = config["port"] || 3000
let address = config["address"] || "0.0.0.0"
let virtualStaticUrl = config["virtualStaticUrl"] || "static"
let splitor = config["splitor"] || "/"
let uploadPath = config["uploadPath"] || "uploads/"
let urlSplitor = "/"
let userJsonPath = "./config/user.json"
let serverKeyPath = './keys/server.key'
let serverCrtPath = './keys/server.crt'
let useHttps = config["useHttps"] || "yes"

// response
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// cors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "*")
    res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept")
    next()
});

// file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath) // 指定保存到uploads文件夹下
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage });

// frontend view
app.engine("html", require("ejs").__express);
app.set('view engine', 'html'); // 指定使用EJS作为模板引擎
app.set('views', path.join(__dirname, '../explorer-client'))
app.use(express.static(path.join(__dirname, '../explorer-client')));

// main page
app.get("/", (req, res) => {
    res.render('index');
})

// static folder
app.use(`/${virtualStaticUrl}`, express.static(folderPath));

// TOOL: verify token
let verifyToken = (req) => {
    const token = req.get('Authorization')
    if (!token) {
        return false
    }
    let tokenStr = Buffer.from(token, 'base64').toString()
    if (tokenStr) {
        let tokenList = tokenStr.split("#")
        let userJson = require(userJsonPath)
        let testPwd = userJson[tokenList[0]]
        if (testPwd && testPwd === tokenList[1]) {
            return true
        } else {
            return false
        }
    }
}

// TOOL: read folder files
let readFileList = (path, filesList, target = null) => {
    var files = fs.readdirSync(path);
    files.forEach((itm, index) => {
        var stat = fs.statSync(path + itm);
        if (stat.isDirectory()) {
            //递归读取文件
            readFileList(path + itm + splitor, filesList, target)
        } else {
            if (target == null || itm.includes(target)) {
                let appendMiddlePath = "/"
                // 组装文件路径
                if (path !== folderPath) {
                    let judgePath = path.substring(0, path.length - splitor.length)
                    appendMiddlePath = assembleFilePath(urlSplitor, judgePath)
                }
                let nowFile = `${virtualStaticUrl}${appendMiddlePath}${itm}`
                let objStr = `<a href="${nowFile}">${itm}</a><br/>`
                filesList.content += objStr;
            }
        }
    })
}

// TOOL: assemble file path
let assembleFilePath = (nowMiddlePath, path) => {
    // 找当前path中最后一个splitor的位置idxPathSplit
    let idxPathSplit = path.lastIndexOf(splitor)
    if (idxPathSplit < 0) {
        return nowMiddlePath
    }
    // idxPathSplit前部（包括splitor）：beforeContent
    let beforeContent = path.substring(0, idxPathSplit + splitor.length)
    // idxPathSplit后部：afterContent
    let afterContent = path.substring(idxPathSplit + splitor.length)
    // IF 后部非空,则中间路径加上后部
    // console.log(beforeContent, afterContent)
    if (!!afterContent.trim()) {
        nowMiddlePath = urlSplitor + afterContent + nowMiddlePath
    } else {
        return nowMiddlePath
    }
    // IF 前部!=folderPath，则递归assembleFilePath
    if (beforeContent.substring(0, idxPathSplit) !== folderPath.substring(0, folderPath.length - 1)) {
        return assembleFilePath(nowMiddlePath, beforeContent)
    } else {
        // ELSE 返回最新的中间路径nowMiddlePath
        return nowMiddlePath
    }
}

// API: basic route
app.get('/file', (req, res) => {
    // 验证请求头
    if (!verifyToken(req)) {
        res.status(500)
        res.send(`ERR,验证身份失败`)
        return
    }
    let filesList = { content: "" }
    readFileList(folderPath, filesList)
    res.status(200)
    res.send(filesList.content)
})

// API: upload api
app.post("/upload", upload.single("file"), (req, res) => {
    // 验证请求头
    if (!verifyToken(req)) {
        res.status(500)
        res.send(`ERR,验证身份失败`)
        return
    }
    const uploadedFile = req.file
    if (uploadedFile) {
        res.status(200)
        res.send(`OK,${uploadedFile.originalname}`)
    } else {
        res.status(500)
        res.send(`ERR,上传失败`)
    }
})

// API: global search api
app.get("/gsearch", (req, res) => {
    // 验证请求头
    if (!verifyToken(req)) {
        res.status(500)
        res.send(`ERR,验证身份失败`)
        return
    }
    let keyword = req.query.keyword
    // console.log(keyword)
    let filesList = { content: "" }
    readFileList(folderPath, filesList, keyword)
    if (filesList.content) {
        res.status(200)
        res.send(filesList.content)
    } else {
        res.status(500)
        res.send("查无结果")
    }
})

// API: cmd api
app.post("/run", (req, res) => {
    // 验证请求头
    if (!verifyToken(req)) {
        res.status(500)
        res.send(`ERR,验证身份失败`)
        return
    }
    let commands = req.body["commands"]
    // 禁止的命令
    if (commands.includes("rm ") || commands.includes("shutdown") || commands.includes("reboot")) {
        res.status(200)
        res.send(`命令不允许`)
        return
    }
    // console.log(commands)
    try {
        exec(commands, (error, stdout, stderr) => {
            if (error) {
                // console.error(`执行错误: ${error}`);
                res.status(500)
                res.send(`ERR,${error},${stderr}`)
            } else {
                res.status(200)
                res.send(`${stdout}`)
            }
        });
    } catch (err) {
        res.status(500)
        res.send(`${err}`)
    }
})

// API: login
app.post("/login", (req, res) => {
    let username = req.body["username"]
    let pwd = req.body["pwd"]
    let userJson = require(userJsonPath)
    let testPwd = userJson[username]
    if (testPwd && testPwd === pwd) {
        // 组装token
        let token = Buffer.from(username + "#" + pwd).toString('base64')
        res.status(200)
        res.send(token)
    } else {
        res.status(500)
        res.send("Login Failed")
    }
})

// web server
if (useHttps === "yes") {
    let httpsServer = https.createServer({
        key: fs.readFileSync(serverKeyPath),
        cert: fs.readFileSync(serverCrtPath)
    }, app);
    let server = httpsServer.listen(port, address, () => {
        let host = server.address().address
        let port = server.address().port
        console.log("App Starts At: https://%s:%s", host, port)
    })
} else {
    let server = app.listen(port, address, () => {
        let host = server.address().address
        let port = server.address().port
        console.log("App Starts At: http://%s:%s", host, port)
    })
}
