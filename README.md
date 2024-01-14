# App_Web_Explorer

## Features
1. 网页文件浏览器
- GET /file

2. 登录登出
- POST /login

3. 全局搜
- GET /gsearch

4. 上传
- POST /upload

5. 命令行运行
- POST /run

6. 前端工具
- 摄像头&截屏
- 转盘
- canvas赛车游戏
- title时钟
- 经纬度
- 通知
    - chrome://flags/#unsafely-treat-insecure-origin-as-secure
    - 设置Insecure origins treated as secure为enabled，地址填127.0.0.1:3000

7. 其他
- webRTC 视频会议
- webSocket 服务端推送
- webSSH 网页终端
- webGL 网页游戏

## Config Files
```
user-template.json
config-template.json
```

## https
```
# 生成服务器端私钥
openssl genrsa -out server.key 1024 

# 生成服务端公钥
openssl rsa -in server.key -pubout -out server.pem

# 生成CA私钥
openssl genrsa -out ca.key 1024

# 生成csr文件
openssl req -new -key ca.key -out ca.csr

# 生成自签名证书
openssl x509 -req -in ca.csr -signkey ca.key -out ca.crt

# 生成server.csr文件
openssl req -new -key server.key -out server.csr

# 生成带有ca签名的证书
openssl x509 -req -CA ca.crt -CAkey ca.key -CAcreateserial -in server.csr -out server.crt
```