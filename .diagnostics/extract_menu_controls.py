from pathlib import Path

text = Path('/home/ubuntu/nfood-restaurant-saas/client/src/components/HomeModules.tsx').read_text()
for needle in ('setMenuGridColumns', 'setMenuImageRatio', 'menuDisplayDraft.gridColumns'):
    print(f'--- {needle} ---')
    start = 0
    found = 0
    while found < 4:
        index = text.find(needle, start)
        if index < 0:
            break
        print(text[max(0, index - 700): index + 1100])
        print()
        start = index + len(needle)
        found += 1
