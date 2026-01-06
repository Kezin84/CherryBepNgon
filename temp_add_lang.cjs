const fs = require('fs');
const path = 'src/views/nhapHang.vue';
let data = fs.readFileSync(path, 'utf-8');
const insertText = '\r\n                <option value= ko>Ti?ng Hàn (ko)</option>';
const insertAfterModel = model => {
  const modelMarker = -model=;
  const modelIdx = data.indexOf(modelMarker);
  if (modelIdx === -1) throw new Error('model marker missing: ' + model);
  const selectStart = data.lastIndexOf('<select', modelIdx);
  if (selectStart === -1) throw new Error('select start missing for ' + model);
  const selectEnd = data.indexOf('</select>', selectStart);
  if (selectEnd === -1) throw new Error('select closing tag missing for ' + model);
  data = data.slice(0, selectEnd) + insertText + data.slice(selectEnd);
};
if (data.includes('<option value=ko>Ti?ng Hàn (ko)</option>')) {
  throw new Error('already inserted');
}
insertAfterModel('form.Lang');
insertAfterModel('editForm.Lang');
fs.writeFileSync(path, data, 'utf-8');
