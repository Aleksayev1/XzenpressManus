
import re
import os

# Paths
INPUT_FILE = r'C:\Users\Alexandre\.gemini\antigravity\scratch\XzenpressManus\src\data\acupressurePoints.ts'
OUTPUT_FILE = r'C:\Users\Alexandre\.gemini\antigravity\scratch\XzenpressManus\CLIQUE_AQUI_PARA_COPIAR.sql'

def escape_sql(text):
    if not text:
        return 'NULL'
    # Escape single quotes
    return "'" + text.replace("'", "''").replace('\n', '\\n') + "'"

def parse_file():
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the array content
    start_tag = "export const acupressurePoints: AcupressurePoint[] = ["
    end_tag = "];"
    
    try:
        start_idx = content.index(start_tag) + len(start_tag)
        end_idx = content.rindex(end_tag)
        array_content = content[start_idx:end_idx]
    except ValueError:
        print("Could not find start/end tags for data array")
        return []

    # Split into object blocks (rough splitting by "  {\n    id:")
    # We'll use a state machine or regex to be more robust
    # Actually, simpler: regex to find all `id: '...',` property and assume it starts an object
    
    points = []
    
    # Regex to capture content of each object roughly
    # We assume objects are separated by "  },\n\n  {"
    # Let's split by "  {\n    id:" which is consistent in the file
    
    raw_objects = re.split(r'\n\s*\{\s*id:', array_content)
    
    for raw in raw_objects:
        if not raw.strip():
            continue
            
        current_point = {}
        # Re-add the id which was consumed by split
        # The split consumes "id:", so the start of `raw` is " 'some-id',"
        
        # Extract ID
        id_match = re.match(r"\s*'([^']+)',", raw)
        if not id_match:
            continue
        current_point['id'] = id_match.group(1)
        
        # Extract other string fields
        fields = ['name', 'nameEn', 'nameEs', 'nameFr', 'nameZh', 'nameHi', 'nameAr', 'nameBn', 'nameRu', 'nameJa', 'nameDe',
                  'description', 'descriptionEn', 'descriptionEs', 'descriptionFr',
                  'image', 'category', 'pressure', 'instructions']
                  
        for field in fields:
            # Regex: field: 'value', (multiline supported for description?)
            # Descriptions in this file seem to be single line quoted strings usually, or using backticks?
            # In the file viewed, they are single quotes.
            # Example: description: 'Value...',
            
            # We need to match: field: '...', OR field: "...", 
            # Non-greedy match until the next quote
            pattern = rf"{field}:\s*'((?:[^']|\\'|'')*)',"
            match = re.search(pattern, raw)
            if match:
                current_point[field] = match.group(1)
            else:
                current_point[field] = None
        
        # Checking for isPremium
        if "isPremium: true" in raw:
            current_point['isPremium'] = True
        else:
            current_point['isPremium'] = False
            
        points.append(current_point)
        
    return points

def generate_sql(points):
    sql = """-- Migration Script for Acupressure Points
DROP TABLE IF EXISTS acupressure_points;

CREATE TABLE acupressure_points (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  name_es TEXT,
  name_fr TEXT,
  name_zh TEXT,
  name_hi TEXT,
  name_ar TEXT,
  name_bn TEXT,
  name_ru TEXT,
  name_ja TEXT,
  name_de TEXT,
  description TEXT,
  description_en TEXT,
  description_es TEXT,
  description_fr TEXT,
  image_url TEXT,
  category TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  pressure_level TEXT,
  instructions TEXT
);

INSERT INTO acupressure_points (
  id, name, name_en, name_es, name_fr, 
  name_zh, name_hi, name_ar, name_bn, name_ru, name_ja, name_de,
  description, description_en, description_es, description_fr,
  image_url, category, is_premium, pressure_level, instructions
) VALUES
"""
    
    values_list = []
    for p in points:
        val = f"""(
    {escape_sql(p.get('id'))},
    {escape_sql(p.get('name'))},
    {escape_sql(p.get('nameEn'))},
    {escape_sql(p.get('nameEs'))},
    {escape_sql(p.get('nameFr'))},
    {escape_sql(p.get('nameZh'))},
    {escape_sql(p.get('nameHi'))},
    {escape_sql(p.get('nameAr'))},
    {escape_sql(p.get('nameBn'))},
    {escape_sql(p.get('nameRu'))},
    {escape_sql(p.get('nameJa'))},
    {escape_sql(p.get('nameDe'))},
    {escape_sql(p.get('description'))},
    {escape_sql(p.get('descriptionEn'))},
    {escape_sql(p.get('descriptionEs'))},
    {escape_sql(p.get('descriptionFr'))},
    {escape_sql(p.get('image'))},
    {escape_sql(p.get('category'))},
    {'TRUE' if p.get('isPremium') else 'FALSE'},
    {escape_sql(p.get('pressure'))},
    {escape_sql(p.get('instructions'))}
)"""
        values_list.append(val)
    
    sql += ",\n".join(values_list) + ";"
    return sql

def main():
    print("Reading TS file...")
    points = parse_file()
    print(f"Found {len(points)} points.")
    
    print("Generating SQL...")
    sql_content = generate_sql(points)
    
    print(f"Writing parsed SQL to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(sql_content)
    print("Done!")

if __name__ == "__main__":
    main()
