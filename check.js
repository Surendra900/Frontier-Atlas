const fs = require('fs');
const path = require('path');
const lockfilePath = path.join(__dirname, 'package-lock.json');
const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
const hasLinux = Object.keys(lockfile.packages).some(p => p.includes('@img/sharp-linux-x64'));
console.log('Has @img/sharp-linux-x64:', hasLinux);
