# -*- coding: utf-8 -*-
"""
migrate_points.py

Uses migration_plan.json to extract point blocks from acupressurePoints.ts
and append them to the correct category file in points/*.ts
"""
import os
import re
import json

PROJECT = r"C:\Users\Alexandre\.gemini\antigravity\scratch\XzenpressManus-GitHub"
MONO = os.path.join(PROJECT, "src", "data", "acupressurePoints.ts")
POINTS_DIR = os.path.join(PROJECT, "src", "data", "points")
PLAN = os.path.join(PROJECT, "scripts", "migration_plan.json")

plan = json.load(open(PLAN, encoding='utf-8'))
mono_content = open(MONO, encoding='utf-8').read()

def extract_point_block(content, point_id):
    """Extract the full { ... } object literal for a given point_id."""
    pat = re.compile(rf"id:\s*'{re.escape(point_id)}'")
    m = pat.search(content)
    if not m:
        return None
    start = m.start()
    brace_pos = content.rfind('{', 0, start)
    if brace_pos == -1:
        return None
    depth = 0
    pos = brace_pos
    while pos < len(content):
        c = content[pos]
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                return content[brace_pos:pos+1]
        pos += 1
    return None

# Group migrations by target file
by_target = {}
for entry in plan:
    tf = entry['target_file']
    by_target.setdefault(tf, []).append(entry)

total_migrated = 0
for target_file, entries in sorted(by_target.items()):
    fpath = os.path.join(POINTS_DIR, target_file)
    if not os.path.exists(fpath):
        print(f"WARNING: target file not found: {fpath}")
        continue

    content = open(fpath, encoding='utf-8').read()
    existing_ids = set(re.findall(r"id:\s*'([^']+)'", content))

    # Find the closing bracket of the array (last ] before export or EOF)
    # The array ends with "];" or "],"
    close_bracket = content.rfind('];')
    if close_bracket == -1:
        print(f"WARNING: could not find ]; in {target_file}")
        continue

    inserts = []
    for entry in entries:
        pid = entry['id']
        if pid in existing_ids:
            print(f"  SKIP (already exists): {pid} in {target_file}")
            continue
        block = extract_point_block(mono_content, pid)
        if not block:
            print(f"  WARNING: could not extract block for {pid}")
            continue
        inserts.append((pid, block))

    if not inserts:
        continue

    # Build insert string
    insert_str = "\n"
    for pid, block in inserts:
        insert_str += f"  {block},\n"

    # Insert before ];
    new_content = content[:close_bracket] + insert_str + content[close_bracket:]
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    for pid, block in inserts:
        print(f"  MIGRATED: {pid} -> {target_file}")
        total_migrated += 1

print(f"\nMigration complete: {total_migrated} points added to category files.")
