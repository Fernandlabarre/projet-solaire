require('dotenv').config();
console.log('→ JWT_SECRET vaut :', process.env.JWT_SECRET);

const fs = require('fs');
fs.writeFileSync('debug-index.txt', 'INDEX.JS EXECUTED !');
require('./src/app');
