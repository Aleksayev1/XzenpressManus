import json
import os

mpt_scripts = [
    {
        "id": "short_01_shenmen",
        "title": "Acupressão SOS - Shenmen & Nervo Vago",
        "video_subject": "Acupressão para ansiedade e alívio do estresse",
        "video_script": "Pressionar o ponto Shenmen por 15 segundos sinaliza diretamente ao nervo vago para desacelerar seus batimentos cardíacos. Teste agora mesmo a regulação fisiológica gratuita de 15 segundos no XZenPress. O link está fixado no primeiro comentário.",
        "voice_name": "pt-BR-AntonioNeural",
        "bgm_track": "ZenAudio_432Hz_Grounding.wav",
        "terms": ["acupuncture", "stress relief", "breathing", "calm ocean"],
        "utm_url": "https://xzenpress.com/?utm_source=shorts&utm_campaign=hero15s&utm_content=hook-shenmen-peito",
        "cta_comment": "Quer testar o som que respira com você em tempo real? Acesse a ferramenta gratuita de 15s: https://xzenpress.com/?utm_source=shorts&utm_campaign=hero15s&utm_content=hook-shenmen-peito"
    },
    {
        "id": "short_02_432hz",
        "title": "Frequência 432Hz e Sono Reparador",
        "video_subject": "Frequência sonora 432Hz para desacelerar a mente antes de dormir",
        "video_script": "Seu cérebro não consegue desligar para dormir? O tom de 432 Hertz com frequência de grounding em 174 Hertz desativa o modo sobrevivência do seu corpo. Experimente agora o player gratuito de 15 segundos no link do primeiro comentário.",
        "voice_name": "pt-BR-FranciscaNeural",
        "bgm_track": "ZenAudio_174Hz_Delta.wav",
        "terms": ["sleep", "meditation sound", "night sky", "relax"],
        "utm_url": "https://xzenpress.com/?utm_source=shorts&utm_campaign=hero15s&utm_content=hook-432hz-sono",
        "cta_comment": "Desacelere seus batimentos em 15 segundos no player gratuito: https://xzenpress.com/?utm_source=shorts&utm_campaign=hero15s&utm_content=hook-432hz-sono"
    },
    {
        "id": "short_03_nervovago",
        "title": "Neurociência do Nervo Vago",
        "video_subject": "Como desativar o estresse e recalibrar a VFC",
        "video_script": "A ansiedade constante não é fraqueza mental. É o seu sistema simpático hiperativo. Ao alinhar a respiração no ritmo de 5,5 segundos com o estímulo tátil de acupressão, você recalibra sua Variabilidade Cardíaca em minutos. Teste na plataforma XZenPress.",
        "voice_name": "pt-BR-AntonioNeural",
        "bgm_track": "ZenAudio_Qigong_5.5s.wav",
        "terms": ["brain neuroscience", "heartbeat", "meditation science"],
        "utm_url": "https://xzenpress.com/?utm_source=linkedin&utm_campaign=hero15s&utm_content=hook-nervovago-fisiologia",
        "cta_comment": "Recalibre seu sistema nervoso gratuitamente no XZenPress: https://xzenpress.com/?utm_source=linkedin&utm_campaign=hero15s&utm_content=hook-nervovago-fisiologia"
    },
    {
        "id": "short_04_campanha_vfc_doacao",
        "title": "Campanha do Apoio VFC Terra API - Ajude o XZenPress",
        "video_subject": "Campanha de doação e infraestrutura de saúde VFC XZenPress",
        "video_script": "O estresse e a ansiedade crônica travam o sistema nervoso em modo de sobrevivência. O XZenPress já ajuda milhares de pessoas a desativarem o estresse através de protocolos integrativos. Nosso próximo passo é integrar o monitoramento contínuo da Variabilidade da Frequência Cardíaca, a VFC. Medir e equilibrar a homeostase em tempo real otimiza o corpo humano em todas as áreas. Para integrar os maiores relógios do mundo via Terra API e manter essa ferramenta acessível, precisamos de uma infraestrutura de aproximadamente mil dólares mensais. Você pode fazer parte desta missão pela saúde humana. Faça sua doação e ajude a transformar vidas.",
        "voice_name": "pt-BR-AntonioNeural",
        "bgm_track": "ZenAudio_432Hz_Grounding.wav",
        "terms": ["heartbeat", "health technology", "pulse monitor", "meditation science"],
        "utm_url": "https://xzenpress.com/?utm_source=campanha&utm_campaign=doacao_vfc&utm_content=terra_api",
        "cta_comment": "Ajude nossa missão a democratizar o monitoramento da VFC! Apoie a infraestrutura do XZenPress no link do primeiro comentário ou via PIX."
    }
]

out_dirs = [
    r'C:\Users\Alexandre\.gemini\antigravity\scratch\XzenpressManus',
    r'C:\Users\Alexandre'
]

for out_dir in out_dirs:
    out_path = os.path.join(out_dir, 'mpt_queue.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(mpt_scripts, f, ensure_ascii=False, indent=2)

print("============================================================")
print("[OK] FILA DO MONEYPRINTERTURBO ATUALIZADA COM O VÍDEO DA CAMPANHA VFC!")
print(f"[STATS] Total de vídeos na fila: {len(mpt_scripts)}")
print("============================================================")
