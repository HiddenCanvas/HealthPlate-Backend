const app = require('../src/app');

const routes = [];
function extractRoutes(stack, prefix = '') {
  stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
      routes.push({ method: methods.join(','), path: prefix + layer.route.path });
    } else if (layer.name === 'router' && layer.handle.stack) {
      const match = layer.regexp.source.match(/^\^\\\/([^\\]+)/);
      const subPrefix = match ? '/' + match[1].replace(/\\\//g, '/') : '';
      extractRoutes(layer.handle.stack, prefix + subPrefix);
    }
  });
}
extractRoutes(app._router.stack);
console.log('Total registered routes:', routes.length);
console.log(JSON.stringify(routes, null, 2));
