const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3022;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // 添加CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    let filePath = path.join(FRONTEND_DIR, req.url === '/' ? 'index.html' : req.url);
    
    // 安全检查，防止路径遍历
    if (!filePath.startsWith(FRONTEND_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 - File Not Found');
            } else {
                res.writeHead(500);
                res.end('500 - Internal Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 DeFi Platform Server running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📂 Serving: ${FRONTEND_DIR}`);
    console.log(`🌐 Ready to serve files!`);
});

server.on('error', (err) => {
    console.error('❌ Server error:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.log(`🔄 Port ${PORT} is busy, trying next port...`);
        server.listen(PORT + 1, '127.0.0.1');
    }
});