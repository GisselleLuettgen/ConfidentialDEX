const http = require('http');
const fs = require('fs');
const path = require('path');

function findAvailablePort(startPort) {
    return new Promise((resolve) => {
        const server = http.createServer();
        server.listen(startPort, () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
        server.on('error', () => {
            resolve(findAvailablePort(startPort + 1));
        });
    });
}

async function startServer() {
    const PORT = await findAvailablePort(3030);
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
        // 设置CORS头
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        let filePath = path.join(FRONTEND_DIR, req.url === '/' ? 'index.html' : req.url);
        
        // 安全检查
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
                    res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
                    res.end(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <title>404 - 文件未找到</title>
                            <style>
                                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f0f0; }
                                .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: inline-block; }
                                h1 { color: #e74c3c; }
                                a { color: #3498db; text-decoration: none; }
                                a:hover { text-decoration: underline; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>404 - 文件未找到</h1>
                                <p>请求的文件不存在</p>
                                <p><a href="/">返回首页</a> | <a href="/本地版本.html">本地版本</a></p>
                            </div>
                        </body>
                        </html>
                    `);
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
        console.log('================================');
        console.log('🚀 DeFi Platform Server Started!');
        console.log('================================');
        console.log(`📡 URL: http://localhost:${PORT}`);
        console.log(`📂 Serving: ${FRONTEND_DIR}`);
        console.log('🌐 Server is ready!');
        console.log('================================');
        
        // 自动打开浏览器
        const { spawn } = require('child_process');
        spawn('cmd', ['/c', 'start', `http://localhost:${PORT}`]);
    });

    server.on('error', (err) => {
        console.error('❌ Server error:', err.message);
    });
}

startServer();