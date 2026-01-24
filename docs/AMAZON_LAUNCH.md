# Guia de Lançamento - Amazon Appstore

Este guia detalha o processo para gerar e publicar o XZenPress na Amazon Appstore.

## 1. Informações Importantes

- **Nome do App:** XZenPress
- **Categoria:** Saúde e Condicionamento Físico (Health & Fitness)
- **ID de Classificação IARC:** `b6c5c34a-bf37-4e88-b41c-8caf9e662853`
  - Use este ID quando solicitado no portal da Amazon para importar sua classificação etária automaticamente.

## 2. Gerar o Build (APK/AAB)

Para a Amazon, precisamos gerar uma versão **sem o login do Google**, pois os dispositivos Fire OS não possuem Google Play Services.

### Passo 1: Configurar Variáveis
No seu terminal (Powershell), defina a variável para ocultar o login do Google e gere o build.

```powershell
# 1. Definir variável para ocultar Google Login e construir o pacote web (dist)
$env:VITE_HIDE_GOOGLE_LOGIN="true"; npm run build

# 2. Sincronizar com o projeto Android
npx cap sync android

# 3. Gerar o Bundle (AAB) ou APK
cd android
./gradlew bundleRelease
cd ..
```

> **Nota:** O comando acima gera um arquivo `.aab` (Android App Bundle). O arquivo final estará em:
> `android/app/build/outputs/bundle/release/app-release.aab`

## 3. Submissão no Portal Amazon Developer

1. Acesse: [developer.amazon.com](https://developer.amazon.com/)
2. Vá para **App List** > **Add a New App** > **Android**.
3. Preencha os detalhes:
    - **App title:** XZenPress
    - **App Category:** Health & Fitness
    - **Customer Support:** contato@xzenpress.com
4. **Availability & Pricing:**
    - Selecione os países (Brasil, etc).
    - Defina se é Gratuito ou Pago (Free).
5. **Description:**
    - Cole a descrição usada na Play Store.
6. **Images & Multimedia:**
    - Você precisará fazer upload do Ícone (512x512 ou 114x114) e Screenshots.
    - **Dica:** Use os mesmos screenshots da Play Store.
7. **Content Rating (Classificação):**
    - Selecione "Use my IARC Rating ID".
    - Cole o ID: `b6c5c34a-bf37-4e88-b41c-8caf9e662853`
8. **APK Files:**
    - Faça o upload do arquivo `app-release.aab` gerado no passo 2.
    - Se perguntarem sobre **Export Compliance**, confirme que o app usa criptografia padrão (HTTPS) (Geralmente "Yes" para criptografia, mas "Yes" para isenção padrão).
    - **Não marque** a opção de DRM se não for necessário.

## 4. Dicas Extras

- **Marca/Trademark:** Se você não possui o registro de marca oficial (INPI), e a Amazon perguntar se você é o "Brand Owner", responda com cuidado. Se você selecionar "Sim", eles podem pedir documentos. Se selecionar "Não", você ainda pode publicar como desenvolvedor independente sem problemas.
- **Login:** Lembre-se que nesta versão Amazon, os usuários devem entrar com **Email/Senha** ou **Magic Link**.

## 5. Voltar ao Normal (Build Google Play)

Quando for gerar atualização para o Google Play novamente, lembre-se de rodar o build SEM a variável de ambiente:

```powershell
# Build normal para Google Play (com Google Login)
$env:VITE_HIDE_GOOGLE_LOGIN=""; npm run build
npx cap sync android
```
