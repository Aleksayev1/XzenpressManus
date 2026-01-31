import datetime
import time
import requests

# INSTRUÇÕES DE USO:
# 1. Envie uma mensagem "/start" para o bot @XZenRadar_Bot no Telegram do seu celular.
# 2. Rode este script. Ele vai encontrar o seu "Chat ID" automaticamente e mandar o alerta.

class GlobalRadar:
    def __init__(self):
        # Configuração do Telegram (Bot Privado do Cliente)
        self.telegram_token = "8429414341:AAG3rqCYJuEGMcsN7S38fr524LxNvn5t-_g"
        self.chat_id = None  # Será descoberto automaticamente

        # 1. O Dicionário Global (Clusters de Idiomas) - Atualizado para MATINAL
        self.keywords = {
            'en-US': ['woke up tired', 'adrenal fatigue', 'no energy morning', 'kidney exhaustion'],
            'pt-BR': ['acordei cansado', 'sem energia', 'fadiga adrenal', 'rim fraco medicina chinesa'],
            'es-ES': ['me desperte cansado', 'fatiga adrenal', 'sin energia']
        }
        self.min_upvotes = 10 

    def get_chat_id(self):
        try:
            url = f"https://api.telegram.org/bot{self.telegram_token}/getUpdates"
            response = requests.get(url).json()
            if response["ok"] and len(response["result"]) > 0:
                self.chat_id = response["result"][-1]["message"]["chat"]["id"]
                return True
        except Exception:
            pass
        print("⏳ Aguardando você mandar '/start' para o bot @XZenRadar_Bot...")
        return False

    def send_telegram_alert(self, message):
        if not self.chat_id: return
        url = f"https://api.telegram.org/bot{self.telegram_token}/sendMessage"
        data = {"chat_id": self.chat_id, "text": message, "parse_mode": "Markdown"}
        requests.post(url, data=data)

    def scan_network(self, network_name):
        print(f"📡 Iniciando Radar MATINAL no {network_name}...")
        
        # Simulação de dados MATINAIS (Morning Scenario)
        mock_findings = [
            {
                'source': 'Reddit (r/Sleep)',
                'title': 'Desperate: I wake up more tired than when I went to bed',
                'text': 'It feels like my batteries are drained. My lower back hurts too. Is this adrenal fatigue?',
                'upvotes': 210,
                'lang': 'en-US',
                'url': 'https://reddit.com/r/Sleep/wake_up_tired'
            },
            {
                'source': 'Twitter (BR)',
                'title': '@usuario_aleatorio',
                'text': 'Gente, acordar já cansada é normal? Parece que fui atropelada. #exaustão',
                'upvotes': 89,
                'lang': 'pt-BR',
                'url': 'https://twitter.com/user/status/123'
            }
        ]
        return mock_findings

    def analyze_opportunity(self, post):
        score = 0
        detected_issue = "Unknown"
        text_lower = (post['title'] + " " + post['text']).lower()
        
        # Diagnóstico de Manhã (Rim/Kidney)
        if 'tired' in text_lower or 'cansad' in text_lower or 'drained' in text_lower:
            score += 5
            detected_issue = "Kidney Qi Deficiency / Adrenal Exhaustion"
        
        return {'is_opportunity': score >= 5, 'issue': detected_issue}

    def generate_ammo(self, post, diagnosis):
        # A Munição Teaser + Upsell (Foco: Energia/Rim)
        if post['lang'] == 'en-US':
            return f"""
🎯 *AMMO (Energy Booster)* 
"That 'drained battery' feeling often signals Kidney Qi deficiency in YNSA.
Try this Morning Reset:
1. 🔋 YNSA Point K (Kidney) - To recharge adrenals.
2. 🔥 MTC Point K3 (Taixi) - Deep energy source.

For the exact visual map of Point K (it's tricky to find without the guide), check XZenPress Premium."
"""
        elif post['lang'] == 'pt-BR':
            return f"""
🎯 *MUNIÇÃO (Energia Matinal)* 
"Acordar drenado geralmente é sinal de Deficiência no Qi do Rim (Baterias esgotadas).
Tente este Reset Matinal:
1. 🔋 Ponto YNSA K (Rim) - Para recarregar as suprarrenais.
2. 🔥 Ponto MTC R3 (Taixi) - Fonte de energia vital.

O Ponto K é difícil de achar sem o mapa exato. No XZenPress Premium tem o guia visual completo."
"""
        return ""

# Execução Principal
radar = GlobalRadar()

if radar.get_chat_id():
    results = radar.scan_network("Networks")
    count = 0
    for post in results:
        analysis = radar.analyze_opportunity(post)
        if analysis['is_opportunity']:
            count += 1
            alert_msg = f"""
🌅 *RADAR MATINAL #{count}*
🌍 *Canal:* {post['source']}
📢 *Post:* "{post['title']}"
🔗 *Link:* {post['url']}

{radar.generate_ammo(post, analysis)}
"""
            print(f"📤 Enviando oportunidade matinal #{count}...")
            radar.send_telegram_alert(alert_msg)
    
    print("✅ Radar Matinal finalizado.")
else:
    print("❌ Bot não conectado.")
