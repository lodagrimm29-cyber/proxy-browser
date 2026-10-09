const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// The Proxy Logic
app.use('/proxy', createProxyMiddleware({
    target: 'http://www.google.com', // Default target, will be overridden
    changeOrigin: true,
    pathRewrite: {
        '^/proxy': '', // Removes /proxy from the start of the URL
    },
    onProxyReq: (proxyReq, req, res) => {
        // Extract the destination URL from the request path
        // e.g., /proxy/https://google.com -> https://google.com
        const targetUrl = req.url.replace(/^\//, ''); 
        
        if (targetUrl) {
            console.log("Proxying to:", targetUrl);
            proxyReq.url = targetUrl;
        }
        
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari 537.36');
    },
    onProxyRes: (proxyRes, req, res) => {
        // Remove security headers that block iframes
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
    },
    onError: (err, req, res) => {
        res.status(500).send("Proxy Error: " + err.message);
    }
}));

// Catch-all route to ensure the home page loads
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
