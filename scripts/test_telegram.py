import requests
import sys

# Token fornecido pelo usuário (extraído da imagem)
BOT_TOKEN = "8429414341:AAG3rqCYJuEGMcsN7S38fr524LxNvn5t-_g"

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
