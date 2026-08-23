import re

files = [
    r'd:\FFSD\18_stockOverflow\final_ims\backend\src\common\http-exception.filter.ts',
    r'd:\FFSD\18_stockOverflow\final_ims\backend\src\common\logger.service.ts'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('isoString()', 'toISOString()')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
