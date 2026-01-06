const fs = require('fs');
const data = fs.readFileSync('src/views/nhapHang.vue', 'utf-8');
console.log(data.includes('<option value= fil>'));
console.log(data.includes('Ti?ng Hàn (ko)'));
console.log(data.indexOf('<option value=fil>'));
