const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3022;

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // 解析URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // 如果请求根路径，返回我们的DApp页面
    if (pathname === '/') {
        pathname = '/complete-dapp.html';
    }
    
    // 构建文件路径
    const filePath = path.join(__dirname, pathname);
    
    // 获取文件扩展名
    const ext = path.parse(filePath).ext;
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // 检查文件是否存在
    fs.exists(filePath, (exists) => {
        if (!exists) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - 文件未找到</h1>');
            return;
        }
        
        // 读取文件
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 - 内部服务器错误</h1>');
                console.error('读取文件错误:', err);
                return;
            }
            
            // 设置正确的MIME类型
            const mimeType = mimeTypes[ext] || 'text/plain';
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📱 DApp地址: http://localhost:${PORT}`);
    console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
    console.log('===============================================');
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});

// 错误处理
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`端口 ${PORT} 已被占用，请尝试其他端口或关闭占用该端口的程序`);
    } else {
        console.error('服务器错误:', err);
    }
});