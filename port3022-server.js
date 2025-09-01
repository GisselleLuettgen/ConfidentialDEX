const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3022;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
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
    // Web3兼容的CORS头设置
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 处理根路径请求，优先显示 MetaMask 演示页面
    let requestedFile = req.url === '/' ? '/metamask-interaction.html' : req.url;
    let filePath = path.join(__dirname, requestedFile);
    
    // 如果根目录没有文件，再尝试 frontend 目录
    if (!fs.existsSync(filePath)) {
        filePath = path.join(FRONTEND_DIR, requestedFile === '/metamask-interaction.html' ? '完整DeFi平台.html' : requestedFile);
    }
    
    // 安全检查，允许根目录和frontend目录
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    console.log('[3022] ' + new Date().toISOString() + ' - ' + req.method + ' ' + req.url);

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // 如果文件不存在，尝试其他文件
                const alternatives = [
                    path.join(FRONTEND_DIR, '完整DeFi平台.html'),
                    path.join(FRONTEND_DIR, '本地版本.html'),
                    path.join(FRONTEND_DIR, 'index.html'),
                    path.join(FRONTEND_DIR, 'standalone.html')
                ];
                
                for (const alt of alternatives) {
                    if (fs.existsSync(alt)) {
                        fs.readFile(alt, (err, altContent) => {
                            if (!err) {
                                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                                res.end(altContent);
                                return;
                            }
                        });
                        return;
                    }
                }
                
                // 如果都没找到，返回404
                res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
                res.end('<h1>404 - 文件未找到</h1><p>服务器运行正常，端口3022</p>');
            } else {
                res.writeHead(500);
                res.end('500 - 服务器内部错误');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log('==================================================');
    console.log('🚀 DeFi Platform Web3 Server Started!');
    console.log('==================================================');
    console.log('📡 URL: http://localhost:' + PORT);
    console.log('📂 Serving: ' + FRONTEND_DIR);
    console.log('✅ Web3 wallet integration enabled');
    console.log('✅ MetaMask compatible');
    console.log('✅ CORS headers configured');
    console.log('==================================================');
    console.log('🎯 Ready for MetaMask interactions!');
    console.log('==================================================');
    
    // 自动打开浏览器
    const { spawn } = require('child_process');
    spawn('cmd', ['/c', 'start', 'http://localhost:' + PORT], { detached: true });
});

server.on('error', (err) => {
    console.error('❌ Server error:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.log('⚠️  Port 3022 is already in use.');
        console.log('请先停止占用3022端口的程序，然后重试。');
        process.exit(1);
    }
});

console.log('Starting DeFi Platform server on port 3022...');