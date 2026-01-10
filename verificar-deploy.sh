#!/bin/bash

echo "🔍 VERIFICAÇÃO PÓS-DEPLOY"
echo "========================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SITE_URL="https://phenomenal-gnome-e43d9f.netlify.app"
SUPABASE_URL="https://peicfjwigfxnhkobpgmw.supabase.co"

echo "📡 Testando site..."
SITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")
if [ "$SITE_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Site acessível (HTTP $SITE_STATUS)${NC}"
else
    echo -e "${RED}❌ Site com problema (HTTP $SITE_STATUS)${NC}"
fi
echo ""

echo "🖼️ Testando imagens do Supabase Storage..."
IMAGES=(
    "Logo-Xzenpress-oficial.png"
    "ponto-da-acupuntura-que-tira-ex-hn-yintang-EX-HN3.jpg"
    "VG20Baihui.jpg"
    "R1-Acalma-a-mente-Vertigem-Tontura-Agitacao.jpg"
    "C-7-Shenmen-Acalma-a-mente-Estresse.jpg"
)

for img in "${IMAGES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/storage/v1/object/public/acupressure-images/$img")
    if [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}✅ $img${NC}"
    else
        echo -e "${RED}❌ $img (HTTP $STATUS)${NC}"
    fi
done
echo ""

echo "🔧 PRÓXIMOS PASSOS:"
echo "1. Abra o site no navegador"
echo "2. Pressione F12 (Console)"
echo "3. Procure por: '✅ Supabase configurado e ativo'"
echo ""
echo "Se aparecer '⚠️ Supabase não configurado':"
echo "→ As variáveis de ambiente no Netlify NÃO têm o prefixo VITE_"
echo ""
echo "📖 Leia RESUMO_FINAL.md para mais detalhes"
