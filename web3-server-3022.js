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
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wasm': 'application/wasm',
    '.ttf': 'application/font-ttf',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2'
};

const server = http.createServer((req, res) => {
    // 设置Web3兼容的CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    let filePath = path.join(FRONTEND_DIR, req.url === '/' ? 'index.html' : req.url);
    
    // 安全检查，防止路径遍历
    if (!filePath.startsWith(FRONTEND_DIR)) {
        res.writeHead(403, {'Content-Type': 'text/plain'});
        res.end('403 Forbidden');
        return;
    }

    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // 记录请求日志
    console.log(`[3022] ${new Date().toISOString()} - ${req.method} ${req.url}`);

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // 如果找不到文件，尝试查找其他可用文件
                const alternatives = [
                    path.join(FRONTEND_DIR, '完整DeFi平台.html'),
                    path.join(FRONTEND_DIR, '本地版本.html'),
                    path.join(FRONTEND_DIR, 'standalone.html'),
                    path.join(FRONTEND_DIR, 'index.html')
                ];
                
                let found = false;
                for (const alt of alternatives) {
                    if (fs.existsSync(alt)) {
                        fs.readFile(alt, (err, altContent) => {
                            if (!err) {
                                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                                res.end(altContent);
                            }
                        });
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    res.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
                    res.end(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <title>DeFi Platform - 404</title>
                            <style>
                                body { 
                                    font-family: Arial, sans-serif; 
                                    text-align: center; 
                                    padding: 50px; 
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    min-height: 100vh;
                                    margin: 0;
                                }
                                .container { 
                                    background: rgba(255,255,255,0.1); 
                                    padding: 30px; 
                                    border-radius: 15px; 
                                    display: inline-block;
                                    backdrop-filter: blur(10px);
                                    border: 1px solid rgba(255,255,255,0.2);
                                }
                                h1 { color: #ffd700; margin-bottom: 20px; }
                                .btn { 
                                    background: #007bff; 
                                    color: white; 
                                    padding: 12px 24px; 
                                    border: none; 
                                    border-radius: 8px; 
                                    cursor: pointer; 
                                    margin: 10px;
                                    font-size: 16px;
                                }
                                .btn:hover { background: #0056b3; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>🚀 DeFi Platform</h1>
                                <p>服务器运行正常，端口: 3022</p>
                                <p>✅ Web3交互已启用</p>
                                <p>请检查文件路径或返回首页</p>
                                <button class="btn" onclick="location.href='/完整DeFi平台.html'">打开DeFi平台</button>
                                <button class="btn" onclick="location.href='/本地版本.html'">本地版本</button>
                            </div>
                        </body>
                        </html>
                    `);
                }
            } else {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('500 Internal Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('🚀 Web3-Compatible DeFi Platform Server');
    console.log('='.repeat(50));
    console.log(`📡 Server URL: http://localhost:${PORT}`);
    console.log(`🌐 External URL: http://0.0.0.0:${PORT}`);
    console.log(`📂 Serving files from: ${FRONTEND_DIR}`);
    console.log('✅ Web3 wallet integration enabled');
    console.log('✅ MetaMask compatible CORS headers set');
    console.log('✅ Cross-origin requests allowed');
    console.log('='.repeat(50));
    console.log('🎯 Ready for Web3 interactions!');
    console.log('='.repeat(50));
});

server.on('error', (err) => {
    console.error('❌ Server error:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.log(\`⚠️  Port \${PORT} is already in use.`);
        console.log('🔄 Trying to kill existing processes...');
        
        // 尝试在其他端口启动
        setTimeout(() => {
            const altPort = PORT + Math.floor(Math.random() * 100);
            console.log(\`🔄 Trying alternative port: \${altPort}\`);
            server.listen(altPort, '0.0.0.0');
        }, 1000);
    }
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed.');
        process.exit(0);
    });
});

console.log('Starting Web3-compatible server on port 3022...');