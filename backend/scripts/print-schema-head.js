const fs = require('fs');
const path = require('path');
const p = path.join(__dirname,'..','prisma','schema.prisma');
const buf = fs.readFileSync(p);
console.log('Byte length:', buf.length);
console.log('First 120 chars:\n'+buf.toString('utf8',0,120));
console.log('Contains base64 prefix Ly8g at start?', buf.toString('utf8',0,4)==='// T');
