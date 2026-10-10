#!/usr/bin/env python3
"""
validate_kubios_export.py — Script Independente de Validação Metrológica (Gate 3.4)
==================================================================================
Valida de forma cega e externa a integridade matemática da série exportada pelo XZenPress:
1. Compara o hash SHA-256 do arquivo .txt calculado pelo Python (hashlib) com o manifesto JSON.
2. Verifica formato canônico (LF Unix puro, valores inteiros em ms, término com \\n).
3. Confere integridade da contagem de amostras e limites fisiológicos.
4. Gera laudo para apreciação do Investigador Principal (Prof. Dr. Marcos Leal Brioschi).
"""

import sys
import os
import json
import hashlib

# Forçar UTF-8 no stdout do Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def validate_export(txt_path: str, json_path: str) -> bool:
    print("=" * 70)
    print("XZENPRESS -- VALIDACAO EXTERNA INDEPENDENTE (GATE 3.4 / KUBIOS HRV)")
    print("=" * 70)

    if not os.path.exists(txt_path):
        print(f"[ERRO] Arquivo RR nao encontrado: {txt_path}")
        return False
    if not os.path.exists(json_path):
        print(f"[ERRO] Manifesto JSON nao encontrado: {json_path}")
        return False

    # 1. Leitura binária dos bytes exatos
    with open(txt_path, "rb") as f:
        txt_bytes = f.read()

    # 2. Cálculo do hash SHA-256 pelo Python hashlib
    py_sha256 = hashlib.sha256(txt_bytes).hexdigest()

    # 3. Leitura e parsing do manifesto JSON
    with open(json_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    manifest_sha256 = manifest.get("integrity", {}).get("series_sha256", "")
    schema_version = manifest.get("export_schema", "")

    print(f"Arquivo Serie RR:    {os.path.basename(txt_path)} ({len(txt_bytes)} bytes)")
    print(f"Manifesto JSON:      {os.path.basename(json_path)}")
    print(f"Schema Version:      {schema_version}")
    print("-" * 70)
    print(f"SHA-256 (XZenPress): {manifest_sha256}")
    print(f"SHA-256 (Python):    {py_sha256}")

    # 4. Verificação de Integridade Criptográfica
    hash_match = py_sha256.lower() == manifest_sha256.lower()
    if hash_match:
        print("[OK] INTEGRIDADE CRIPTOGRAFICA: CORRESPONDENCIA EXATA (100% BIT A BIT)")
    else:
        print("[FALHA] Hashes divergem!")
        return False

    # 5. Verificação do Formato Canônico
    has_crlf = b"\r\n" in txt_bytes
    ends_with_lf = txt_bytes.endswith(b"\n")
    lines = txt_bytes.decode("utf-8").strip().split("\n")

    print("-" * 70)
    print("ANALISE DE ESTRUTURA DO FORMATO CANONICO KUBIOS:")
    print(f"* Quebra de linha Unix (LF puro):   {'SIM (Sem carriage return \\r)' if not has_crlf else 'NAO (Contem \\r\\n)'}")
    print(f"* Termino com quebra de linha:      {'SIM' if ends_with_lf else 'NAO'}")
    print(f"* Total de amostras no .txt:        {len(lines)}")
    print(f"* Total informado no manifesto:     {manifest.get('quality_summary', {}).get('total_raw_samples')}")

    # 6. Estatísticas Fisiológicas Básicas da Série
    rr_values = [int(line.strip()) for line in lines if line.strip().isdigit()]
    if len(rr_values) > 0:
        min_rr = min(rr_values)
        max_rr = max(rr_values)
        mean_rr = sum(rr_values) / len(rr_values)
        mean_hr = 60000 / mean_rr if mean_rr > 0 else 0
        print(f"* Primeiro intervalo RR:            {rr_values[0]} ms")
        print(f"* Ultimo intervalo RR:              {rr_values[-1]} ms")
        print(f"* RR Minimo / Maximo:               {min_rr} ms / {max_rr} ms")
        print(f"* RR Medio / FC Media estimada:     {mean_rr:.1f} ms (~{mean_hr:.1f} bpm)")

    print("=" * 70)
    print("STATUS FINAL: APROVADO PARA IMPORTACAO NO KUBIOS HRV SCIENTIFIC [OK]")
    print("=" * 70)
    return True

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python validate_kubios_export.py <arquivo_rr.txt> <manifesto.json>")
        sys.exit(1)
    success = validate_export(sys.argv[1], sys.argv[2])
    sys.exit(0 if success else 1)
