from pathlib import Path
path = Path('src/views/nhapHang.vue')
data = path.read_text(encoding='utf-8')
old = '                <option value= fil>dYØædYØ- Filipino (fil)</option>'
if old not in data:
    raise SystemExit('old snippet missing')
if 'Ti?ng Hàn (ko)' in data:
    raise SystemExit('already added')
new = old + '\n                <option value=ko>Ti?ng Hàn (ko)</option>'
path.write_text(data.replace(old, new, 1), encoding='utf-8')
