let splitor = "/"
let urlSplitor = "/"
let folderPath = "/home/share/"
let assembleFilePath = (nowMiddlePath, path) => {
    // 找当前path中最后一个splitor的位置idxPathSplit
    let idxPathSplit = path.lastIndexOf(splitor)
    console.log(idxPathSplit)
    if (idxPathSplit < 0) {
        return nowMiddlePath
    }
    // idxPathSplit前部（包括splitor）：beforeContent
    let beforeContent = path.substring(0, idxPathSplit + splitor.length)
    // idxPathSplit后部：afterContent
    let afterContent = path.substring(idxPathSplit + splitor.length)
    // IF 后部非空,则中间路径加上后部
    console.log(beforeContent, afterContent)
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

let rst = assembleFilePath("/", "/home/share")
console.log(rst)