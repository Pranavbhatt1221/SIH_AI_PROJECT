const fs = require('fs');
['check_env.js', 'test.js'].forEach(f => {
  if (fs.existsSync(f)) fs.unlinkSync(f);
});
console.log('Scratch files cleaned.');
