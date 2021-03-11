const express = require('express');
const app = express();
const http = require('http');

// 中间件
const middlewares = require("./Backend/middlewares");
middlewares(app);

// 端口
const port = normalizePort(process.env.PORT || '3000');
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

// server监听和app监听二选一
// app监听
// app.listen(port, () => console.log(`NodeJS Web Server starts at http://127.0.0.1:${port} ...`));

// server监听
const server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : `NodeJS Web Server starts at http://127.0.0.1:${addr.port} ...`;
    console.log(bind);
}