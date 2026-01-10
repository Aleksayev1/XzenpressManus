# ⚙️ Semi-Automação (Tier 2) - Scripts e Workflows

## 🎯 Objetivo

Automatizar descoberta de vídeos e preparação de comentários, mantendo postagem manual para controle de qualidade.

**Meta**: 40-60 comentários/semana com 50% menos tempo

---

## 🔧 Ferramentas Necessárias

### Obrigatórias
- ✅ Google Sheets (banco de dados)
- ✅ Zapier ou Make.com (automação)
- ✅ Browser extension (copiar/colar)

### Opcionais
- 🔜 Python (scripts personalizados)
- 🔜 Chrome DevTools (monitoramento)

---

## 📊 Workflow 1: Descoberta Automática de Vídeos

### Setup no Zapier/Make

```
TRIGGER: Schedule (Every 2 hours)
    ↓
ACTION 1: TikTok - Search Hashtags
    Hashtags: #mentalhealth OR #ansiedade OR #anxiety
    Filter: Last 24h, Min 10k views
    ↓
ACTION 2: Filter
    Remove: Already commented
    Remove: Commercial accounts
    ↓
ACTION 3: Score Videos
    Calculate priority (views × engagement rate)
    ↓
ACTION 4: Google Sheets - Add Row
    Sheet: "Videos_Queue"
    Columns: [URL, Platform, Views, Theme, Priority, Status]
```

### Resultado

Planilha atualizada automaticamente com vídeos virais frescos:

| URL | Platform | Views | Theme | Priority | Status | Message |
|-----|----------|-------|-------|----------|--------|---------|
| tiktok.com/... | TikTok | 45k | Anxiety | 9.2 | Pending | [vazio] |
| instagram.com/... | Insta | 32k | Insomnia | 8.5 | Pending | [vazio] |

---

## 💬 Workflow 2: Seleção Semi-Automática de Mensagens

### Google Sheets com Fórmulas Inteligentes

**Coluna "Suggested_Message":**
```excel
=IF(
  REGEXMATCH(D2,"(?i)anxiety|ansiedade"),
  VLOOKUP("anxiety", Messages!A:B, 2, FALSE),
  IF(
    REGEXMATCH(D2,"(?i)insomnia|insônia"),
    VLOOKUP("insomnia", Messages!A:B, 2, FALSE),
    IF(
      REGEXMATCH(D2,"(?i)depression|depressão"),
      VLOOKUP("depression", Messages!A:B, 2, FALSE),
      "MANUAL_REVIEW"
    )
  )
)
```

**Explicação**: Fórmula analisa tema do vídeo e sugere mensagem automaticamente

### Aba "Messages" (Banco de Dados)

| Theme | Message | Language |
|-------|---------|----------|
| anxiety | "Seu coração acelerado não é fraqueza..." | PT-BR |
| anxiety | "Your racing heart isn't weakness..." | EN |
| insomnia | "3h da manhã de novo? Ponto Anmian..." | PT-BR |

---

## 🤖 Workflow 3: Preparação de Comentários

### Script Google Apps Script

```javascript
function prepareComments() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    var status = data[i][5]; // Coluna Status
    
    if (status == "Pending") {
      var theme = data[i][3];
      var language = detectLanguage(data[i][1]); // Detecta idioma do vídeo
      
      // Busca mensagem adequada
      var message = selectMessage(theme, language);
      
      // Adiciona UTM tracking
      var trackedMessage = message + " xzenpress.com?utm_source=tiktok&utm_campaign=viral";
      
      // Preenche coluna Message
      sheet.getRange(i+1, 7).setValue(trackedMessage);
      
      // Atualiza status
      sheet.getRange(i+1, 6).setValue("Ready");
    }
  }
}

function selectMessage(theme, lang) {
  var messagesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Messages");
  var messages = messagesSheet.getDataRange().getValues();
  
  // Filtrar por tema e idioma
  var filtered = messages.filter(function(row) {
    return row[0] == theme && row[2] == lang;
  });
  
  // Retornar mensagem aleatória (para variar)
  var randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex][1];
}
```

### Como Usar

1. Abrir Google Sheets
2. Ir em **Extensões > Apps Script**
3. Colar código acima
4. Configurar trigger: Rodar a cada 4 horas
5. **Resultado**: Coluna "Message" preenchida automaticamente!

---

## 📱 Workflow 4: Postagem Semi-Automática

### Extensão Chrome Customizada (Simples)

```javascript
// manifest.json
{
  "name": "XZenPress Comment Helper",
  "version": "1.0",
  "manifest_version": 3,
  "action": {
    "default_popup": "popup.html"
  },
  "permissions": ["activeTab", "clipboardWrite"]
}

// popup.html
<button id="copyNext">Copy Next Comment</button>
<div id="comment"></div>

// popup.js
document.getElementById('copyNext').addEventListener('click', function() {
  // Busca próximo comentário "Ready" da planilha (via API Google Sheets)
  fetch('https://sheets.googleapis.com/v4/spreadsheets/...')
    .then(res => res.json())
    .then(data => {
      var comment = data.values[0][6]; // Coluna Message
      
      // Copia para clipboard
      navigator.clipboard.writeText(comment);
      
      // Mostra no popup
      document.getElementById('comment').innerText = comment;
      
      // Marca como "Posted" na planilha
      updateStatus(data.values[0][0], "Posted");
    });
});
```

### Uso Prático

1. Acessar vídeo viral no TikTok/Instagram
2. Clicar na extensão
3. Clicar em "Copy Next Comment"
4. Colar no campo de comentário
5. Postar!

**Tempo por comentário**: ~15 segundos (vs 2-3 min manual)

---

## 📈 Workflow 5: Tracking Automático

### Zapier: TikTok Comment → Google Sheets

```
TRIGGER: New Comment by Me (TikTok)
    ↓
ACTION 1: Extract Data
    Video URL, Comment Text, Timestamp
    ↓
ACTION 2: Google Sheets - Update Row
    Find row with matching URL
    Update: Status = "Posted", Posted_At = [timestamp]
    ↓
ACTION 3: Wait 24 hours
    ↓
ACTION 4: TikTok - Get Comment Stats
    Fetch: Likes, Replies
    ↓
ACTION 5: Google Sheets - Update Performance
    Columns: Likes, Replies, Engagement_Rate
```

### Analytics Automático

Planilha mostra performance em tempo real:

| Comment | Likes | Replies | Clicks | Conversions | ROI |
|---------|-------|---------|--------|-------------|-----|
| "Seu coração acelerado..." | 234 | 12 | 45 | 3 | 150% |
| "3h da manhã de novo..." | 189 | 8 | 32 | 2 | 100% |

---

## 🛠️ Setup Completo (Passo a Passo)

### Passo 1: Criar Google Sheets

1. Criar nova planilha: "XZenPress_Viral_Comments"
2. Aba 1: "Videos_Queue"
   - Colunas: URL, Platform, Views, Theme, Priority, Status, Message, Posted_At
3. Aba 2: "Messages"
   - Colunas: Theme, Message, Language
4. Aba 3: "Performance"
   - Colunas: URL, Likes, Replies, Clicks, Conversions

### Passo 2: Popular Banco de Mensagens

1. Abrir aba "Messages"
2. Copiar 50 mensagens do arquivo `02_Conteudo/Mensagens_da_Alma/01_Mensagens_PT-BR.md`
3. Organizar por tema

### Passo 3: Configurar Zapier

1. Criar conta em Zapier.com
2. Criar Zap: "TikTok Search → Google Sheets"
3. Configurar trigger (a cada 2h)
4. Conectar Google Sheets
5. Testar!

### Passo 4: Instalar Apps Script

1. Abrir Google Sheets
2. Extensões > Apps Script
3. Colar código do Workflow 3
4. Salvar e configurar trigger

### Passo 5: Começar a Comentar!

1. Abrir planilha
2. Ver vídeos em "Ready"
3. Copiar mensagem
4. Postar
5. Marcar como "Posted"

---

## 📊 Comparação: Manual vs Semi-Auto

| Métrica | Manual (Tier 1) | Semi-Auto (Tier 2) |
|---------|-----------------|-------------------|
| Tempo/comentário | 3-5 min | 15-30 seg |
| Comentários/hora | 12-20 | 40-60 |
| Comentários/semana | 20-30 | 40-60 |
| Tempo total/semana | 3-4h | 2-3h |
| Taxa de erro | 5-10% | <2% |
| Qualidade | Alta | Alta |

---

## ✅ Checklist de Implementação

- [ ] Criar Google Sheets com estrutura
- [ ] Popular banco de 50 mensagens
- [ ] Configurar Zapier para descoberta automática
- [ ] Instalar Apps Script para seleção
- [ ] Testar workflow completo (10 comentários teste)
- [ ] Otimizar baseado em primeiros resultados
- [ ] Escalar para 40-60/semana

---

**Status**: 🟢 Pronto para Implementação
**Dificuldade**: Média (requer configuração inicial)
**ROI**: Alto (dobra produtividade)
**Tempo de Setup**: 4-6 horas
