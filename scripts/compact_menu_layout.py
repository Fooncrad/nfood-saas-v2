from pathlib import Path
import re

path = Path('/home/ubuntu/nfood-restaurant-saas/client/src/pages/RestaurantPublic.tsx')
text = path.read_text()
pattern = re.compile(
    r'      <section className="nfood-menu-section mt-2 grid gap-6 lg:grid-cols-\[250px_1fr\]">.*?\n\n        <div id="menu"',
    re.S,
)
replacement = '      <section className="nfood-menu-section mt-2">\n        <div id="menu"'
updated, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit(f'expected one menu shell replacement, got {count}')
path.write_text(updated)
print('removed duplicate menu sidebar')
