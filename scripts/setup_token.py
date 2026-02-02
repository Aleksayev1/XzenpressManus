import os

def setup_token():
    print("🤖 --- CONFIGURAÇÃO FÁCIL DO TELEGRAM BOT ---")
    print("Este script vai salvar seu novo token no lugar certo.")
    print("\nPasso 1: Abra o Telegram e vá no @BotFather")
    print("Passo 2: Digite /token e selecione seu bot")
    print("Passo 3: Copie o token que começa com números (ex: 123456:ABC-...)")
    
    new_token = input("\n👉 Cole o NOVO token aqui e aperte Enter: ").strip()
    
    if not new_token:
        print("❌ Nenhum token informado. Cancelando.")
        return

    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    
    # Ler conteúdo atual
    content = ""
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            content = f.read()
    
    # Preparar nova linha
    new_line = f"TELEGRAM_BOT_TOKEN={new_token}"
    
    # Substituir ou adicionar
    if "TELEGRAM_BOT_TOKEN=" in content:
        lines = content.splitlines()
        new_lines = []
        found = False
        for line in lines:
            if line.startswith("TELEGRAM_BOT_TOKEN="):
                new_lines.append(new_line)
                found = True
            else:
                new_lines.append(line)
        if not found:
            new_lines.append(new_line)
        new_content = "\n".join(new_lines)
    else:
        new_content = content + "\n\n" + new_line
        
    # Salvar
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print(f"\n✅ SUCESSO! Token salvo em: {env_path}")
    print("Agora você pode rodar os scripts de teste novamente.")

if __name__ == "__main__":
    setup_token()
