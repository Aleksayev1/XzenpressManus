#!/usr/bin/env python3
"""Remove duplicate acupressure points from acupressurePoints.ts"""

import re

# IDs dos duplicados a remover (segundas ocorrências)
DUPLICATES_TO_REMOVE = [
    'kd3-taixi',       # linha ~1680
    'sp6-sanyinjiao',  # linha ~1705
    'sp4-gongsun',     # linha ~1730
    'cv3-zhongji',     # linha ~1805
    'cv4-guanyuan',    # linha ~1830
    'bl23-shenshu',    # linha ~1855
    'gb20-fengchi',    # linha ~2270
    'ynsa-zf-vesicula',# linha ~2312
    'ynsa-zf-figado',  # linha ~2332
]

def remove_duplicates(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    skip_until = -1
    seen_ids = {}
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Check if this is an ID line
        id_match = re.search(r"id: '([^']+)'", line)
        if id_match:
            point_id = id_match.group(1)
            
            # Track if we've seen this ID before
            if point_id in seen_ids:
                # This is a duplicate - skip this entire block
                print(f"🗑️  Removing duplicate: {point_id} at line {i+1}")
                
                # Find the end of this object (next closing brace after a comma)
                depth = 0
                j = i
                while j < len(lines):
                    if '{' in lines[j]:
                        depth += lines[j].count('{')
                    if '}' in lines[j]:
                        depth -= lines[j].count('}')
                    
                    if depth == 0 and '}' in lines[j]:
                        # Found the end of this object
                        i = j + 1
                        # Skip any trailing comma and whitespace
                        while i < len(lines) and (lines[i].strip() == ',' or not lines[i].strip()):
                            i += 1
                        break
                    j += 1
                continue
            else:
                # First occurrence - keep it
                seen_ids[point_id] = i
        
        new_lines.append(line)
        i += 1
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    removed = len(lines) - len(new_lines)
    print(f"\n✅ Removed {removed} lines")
    print(f"📊 Original: {len(lines)} lines → New: {len(new_lines)} lines")

if __name__ == '__main__':
    filepath = 'src/data/acupressurePoints.ts'
    remove_duplicates(filepath)
