const express = require('express');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Fallback for SPA-like behavior or static pages
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  // Try to serve the specific PHP file if it exists
  const filePath = path.join(__dirname, '../frontend', req.path === '/' ? 'index.php' : req.path);
  
  // Force text/html for .php files so they don't download
  if (filePath.endsWith('.php')) {
    res.setHeader('Content-Type', 'text/html');
  }

  res.sendFile(filePath, (err) => {
    if (err) {
      res.setHeader('Content-Type', 'text/html');
      res.sendFile(path.join(__dirname, '../frontend/index.php'));
    }
  });
});

// Start Server
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(port, () => {
    console.log(`
🚀 Solar Africa Platform Live
🌍 Mode: ${process.env.NODE_ENV || 'development'}
🔗 URL: http://localhost:${port}
    `);
  });
}
