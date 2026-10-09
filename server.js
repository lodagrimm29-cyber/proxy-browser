const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// The Proxy Logic
// Any request coming to /proxy/ will be forwarded to the target site
app.use('/proxy', createProxyMiddleware({
    target: 'https://www.google.com', // Default target
    changeOrigin: true,
    pathRewrite: {
        '^/proxy': '', // remove /proxy from the url before sending to target
    },
    onProxyReq: (proxyReq, req, res) => {
        // This hides the fact that it's a proxy from some basic filters
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    }
}));

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});