// Preview the site locally: node tools/serve.js [port]   then open the printed URL.
// (Opening index.html straight from the file system does not run the kitchen: browsers refuse to load
// ES modules from file:// URLs. The live site on GitHub Pages has no such problem.)
const { serve } = require('./target');
serve(+process.argv[2] || 8080).then(srv => {
  console.log('Batter & Dough preview at http://127.0.0.1:' + srv.address().port + '/   (Ctrl+C to stop)');
});
