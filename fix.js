const fs = require('fs');
let code = fs.readFileSync('js/app.js', 'utf8');
code = code.replace(/onclick="window\.triggerToggleProduct\('" \+ p\.id \+ '\)"/g, 'onclick="window.triggerToggleProduct(\\\'" + p.id + "\\\')"');
fs.writeFileSync('js/app.js', code);

