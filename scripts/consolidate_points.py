# -*- coding: utf-8 -*-
"""
consolidate_points.py

Phase 1: Audit
- Reads all point IDs from acupressurePoints.ts (monolithic)
- Reads all point IDs from points/*.ts (category files)
- Reports: duplicates, points only in monolithic, points only in categories

Phase 2: Migration plan
- For each point only in the monolithic file, determine its target category file
  based on the `category` field
- Output the IDs and target files for manual review or automated migration
"""
import os
import re
import json

PROJECT = r"C:\Users\Alexandre\.gemini\antigravity\scratch\XzenpressManus-GitHub"
MONO = os.path.join(PROJECT, "src", "data", "acupressurePoints.ts")
POINTS_DIR = os.path.join(PROJECT, "src", "data", "points")

# Map category value -> points/*.ts file
CATEGORY_FILE_MAP = {
    'general':      'general.ts',
    'cranio':       'cranio.ts',
    'neuro':        'neuro.ts',
    'septicemia':   'septicemia.ts',
    'atm':          'atm.ts',
    'cardio':       'cardio.ts',
    'sexual':       'sexual.ts',
    'kidney':       'kidney.ts',
    'back_pain':    'back_pain.ts',
    'headache':     'headache.ts',
    'digestive':    'digestive.ts',
    'immunity':     'immunity.ts',
    'ynsa':         'ynsa.ts',
    # fallback
    'avc':          'neuro.ts',
    'lung':         'general.ts',
    'emotional':    'general.ts',
    'female':       'sexual.ts',
    'menstrual':    'sexual.ts',
    'hormonal':     'sexual.ts',
    'neck':         'headache.ts',
    'zoster':       'septicemia.ts',
}

def extract_ids(content):
    """Return list of all id values in order of appearance."""
    return re.findall(r"id:\s*'([^']+)'", content)

def extract_point_block(content, point_id):
    """
    Extract the full object literal for a given point id.
    Returns the block string including surrounding braces, or None.
    """
    # Find the start: id: 'point_id'
    pat = re.compile(rf"id:\s*'{re.escape(point_id)}'")
    m = pat.search(content)
    if not m:
        return None
    # Walk backwards to find the opening {
    start = m.start()
    # Find the { before us
    brace_pos = content.rfind('{', 0, start)
    if brace_pos == -1:
        return None
    # Walk forward to find the matching }
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

def extract_category(block):
    """Extract the category field value from a point block."""
    m = re.search(r"category:\s*'([^']+)'", block)
    return m.group(1) if m else 'general'

# ---- Read monolithic file ----
mono_content = open(MONO, encoding='utf-8').read()
mono_ids = extract_ids(mono_content)

# ---- Read category files ----
category_ids = {}  # filename -> set of ids
all_category_ids = set()
for fname in os.listdir(POINTS_DIR):
    if not fname.endswith('.ts') or fname == 'index.ts':
        continue
    fpath = os.path.join(POINTS_DIR, fname)
    content = open(fpath, encoding='utf-8').read()
    ids = set(extract_ids(content))
    category_ids[fname] = ids
    all_category_ids |= ids

mono_id_set = set(mono_ids)

only_in_mono = mono_id_set - all_category_ids
only_in_categories = all_category_ids - mono_id_set
in_both = mono_id_set & all_category_ids

print(f"=== AUDIT RESULTS ===")
print(f"Monolithic file:     {len(mono_id_set)} unique IDs")
print(f"Category files:      {len(all_category_ids)} unique IDs")
print(f"In BOTH (duplicates): {len(in_both)}")
print(f"Only in MONOLITHIC:  {len(only_in_mono)}")
print(f"Only in CATEGORIES:  {len(only_in_categories)}")
print()

print("=== CATEGORY FILE COUNTS ===")
for fname, ids in sorted(category_ids.items()):
    print(f"  {fname:25s}: {len(ids)} points")
print()

if only_in_mono:
    print("=== POINTS ONLY IN MONOLITHIC (need to migrate to category files) ===")
    migration_plan = []
    for pid in sorted(only_in_mono):
        block = extract_point_block(mono_content, pid)
        category = extract_category(block) if block else 'general'
        target = CATEGORY_FILE_MAP.get(category, 'general.ts')
        migration_plan.append({'id': pid, 'category': category, 'target_file': target})
        print(f"  {pid:45s} category={category:12s} -> {target}")
    print()
    # Save migration plan as JSON
    plan_path = os.path.join(PROJECT, "scripts", "migration_plan.json")
    with open(plan_path, 'w', encoding='utf-8') as f:
        json.dump(migration_plan, f, indent=2, ensure_ascii=False)
    print(f"Migration plan saved to: {plan_path}")

if only_in_categories:
    print("=== POINTS ONLY IN CATEGORY FILES (not in monolithic - OK after consolidation) ===")
    for pid in sorted(only_in_categories):
        print(f"  {pid}")
