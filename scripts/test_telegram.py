import requests
import sys

import os

# Função simples para carregar .env sem precisar instalar bibliotecas extras
def load_env():
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#') and '=' in line:
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value

load_env()

# Token deve ser configurado via variável de ambiente ou .env
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()

def test_bot():
    print("🤖 Testando conexão com o XZenRadar Bot...")
    
    # 1. Verificar se o Token é válido
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getMe"
    try:
        response = requests.get(url)
        data = response.json()
        
        if data["ok"]:
            bot_name = data["result"]["first_name"]
            username = data["result"]["username"]
            print(f"✅ Conexão SUCESSO! Bot encontrado: {bot_name} (@{username})")
            
            # 2. Instrução para o usuário
            print(f"\n⚠️ IMPORTANTE: Para receber mensagens, você precisa enviar '/start' para o bot @{username} no seu celular agora.")
            print("Assim que fizer isso, o sistema poderá te enviar alertas.")
            
        else:
            print(f"❌ Erro na conexão: {data['description']}")
            
    except Exception as e:
        print(f"❌ Falha de rede: {e}")

if __name__ == "__main__":
    test_bot()
