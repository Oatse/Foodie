const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5173',
      changeOrigin: true,
      headers: {
        'Access-Control-Allow-Credentials': true
      },
      pathRewrite: {
        '^/api': '/api'
      },
      onProxyReq: function(proxyReq, req, res) {
        // Log proxy requests for debugging
        console.log('Proxying:', req.method, req.path, '->', proxyReq.path);
      }
    })
  );
};