#!/usr/bin/env python3
"""
Analyzes emotional coverage of existing acupressure points
Maps 7 global emotions to existing points in acupressurePoints.ts
"""

import re
import json

# 7 Global Emotions (data-validated)
EMOTIONS = {
    'ansiedade': ['ansiedade', 'anxiety', 'preocup', 'worry', 'nervous'],
    'estresse': ['stress', 'estresse', 'tension', 'tensão'],
    'tristeza': ['tristeza', 'sadness', 'depress', 'melanc'],
    'raiva': ['raiva', 'anger', 'irritab', 'frustração', 'frustration'],
    'medo': ['medo', 'fear', 'panic', 'pânico', 'pavor'],
    'solidao': ['solidão', 'loneliness', 'isolamento', 'isolation'],
    'insonia': ['insônia', 'insomnia', 'sono', 'sleep']
}

def analyze_points_file(filepath):
    """Analyze acupressurePoints.ts for emotional coverage"""
    
    with open(filepath, 'r', encoding='utf8') as f:
        content = f.read()
    
    # Find all point objects
    point_pattern = r'\{[^}]*?id:\s*["\']([^"\']+)["\'][^}]*?\}'
    
    results = {}
    for emotion, keywords in EMOTIONS.items():
        results[emotion] = {'count': 0, 'points': []}
        
    # Split into individual point blocks
    points = re.split(r'\n\s*\},\s*\n\s*\{', content)
    
    for point_block in points:
        # Extract point ID
        id_match = re.search(r"id:\s*['\"]([^'\"]+)['\"]", point_block)
        if not id_match:
            continue
            
        point_id = id_match.group(1)
        point_text = point_block.lower()
        
        # Check each emotion
        for emotion, keywords in EMOTIONS.items():
            for keyword in keywords:
                if keyword in point_text:
                    if point_id not in results[emotion]['points']:
                        results[emotion]['points'].append(point_id)
                        results[emotion]['count'] += 1
                    break
    
    return results

def print_report(results):
    """Print analysis report"""
    print("=" * 80)
    print("ANÁLISE DE COBERTURA EMOCIONAL - 66 PONTOS XZENPRESS")
    print("=" * 80)
    print()
    
    total_points = 66
    
    for emotion, data in sorted(results.items(), key=lambda x: x[1]['count'], reverse=True):
        count = data['count']
        coverage = (count / total_points) * 100
        
        emoji = "✅" if count >= 5 else ("⚠️" if count >= 2 else "❌")
        
        print(f"{emoji} {emotion.upper()}: {count} pontos ({coverage:.1f}%)")
        if data['points']:
            print(f"   Pontos: {', '.join(data['points'][:5])}")
            if len(data['points']) > 5:
                print(f"   + {len(data['points']) - 5} mais...")
        print()

if __name__ == "__main__":
    filepath = r"C:\Users\Alexandre\.gemini\antigravity\scratch\XzenpressManus-GitHub\src\data\acupressurePoints.ts"
    
    results = analyze_points_file(filepath)
    print_report(results)
    
    # Save JSON for comparison
    output = {
        'total_points': 66,
        'emotions': results
    }
    
    with open('emotional_coverage.json', 'w', encoding='utf8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print("=" * 80)
    print("Análise salva em: emotional_coverage.json")
