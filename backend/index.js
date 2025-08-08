const fs = require('fs');
fs.writeFileSync('debug-index.txt', 'INDEX.JS EXECUTED !');
require('./src/app');
