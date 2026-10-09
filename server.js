const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// 2. The Proxy Logic
app.use('/proxy', createProxyMiddleware({
    target: 'http://google.com', // This is a placeholder; the actual target is dynamic
    changeOrigin: true,
    pathRewrite: {
        '/proxy': '', // removes /proxy from the URL before sending to target
    },
    onProxyReq: (proxyReq, req, res) => {
        // This part intercepts the request to the target URL
        const targetUrl = req.url.slice(1); // Get the URL after /proxy/
        if (targetUrl) {
            proxyReq.url = targetUrl;
        }
        // Mask the User-Agent to look like a standard browser
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari 537.36');
    },
    onProxyRes: (proxyRes, req, res) => {
        // STRIP HEADERS: This is what allows the site to load in an iframe
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
    }
}));

app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
