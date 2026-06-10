const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/health', (req, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV,
  version: '2.0.0'
}));

// Debug: list all registered routes (disable in production jika perlu)
app.get('/debug/routes', (req, res) => {
  const routes = [];
  function extractRoutes(stack, prefix = '') {
    stack.forEach(layer => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
        routes.push({ method: methods.join(','), path: prefix + layer.route.path });
      } else if (layer.name === 'router' && layer.handle.stack) {
        const match = layer.regexp.source.match(/\^\\\/([^\\]+)/);
        const subPrefix = match ? '/' + match[1].replace(/\\\//g, '/') : '';
        extractRoutes(layer.handle.stack, prefix + subPrefix);
      }
    });
  }
  extractRoutes(app._router.stack);
  res.json({ total: routes.length, routes });
});

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;