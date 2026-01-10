# 📱 Guia Completo: Build Android Local - XZenPress

## 🎯 **RESPOSTA PARA GOOGLE PLAY CONSOLE**

### **❌ NÃO USAMOS ID DE PUBLICIDADE**
O XZenPress é uma plataforma de **bem-estar holístico** focada em:
- Acupressão MTC
- Respiração 4-7-8  
- Cromoterapia
- Sons harmonizantes

**NÃO temos anúncios, tracking publicitário ou monetização via ads.**

---

## 🛠️ **PASSO A PASSO COMPLETO**

### **1. Preparar Ambiente Local**

#### **Instalar Android Studio:**
1. **Download:** https://developer.android.com/studio
2. **Instalar SDK Android:** API 33+ (Android 13)
3. **Configurar variáveis de ambiente:**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

#### **Instalar Node.js e Capacitor:**
```bash
# Verificar Node.js (versão 16+)
node --version

# Instalar Capacitor CLI globalmente
npm install -g @capacitor/cli
```

### **2. Preparar Projeto Local**

#### **Transferir Código:**
1. **Baixar/clonar** todo o código do XZenPress
2. **Instalar dependências:**
   ```bash
   cd xzenpress
   npm install
   ```

#### **Build do Projeto Web:**
```bash
# Gerar build de produção
npm run build

# Verificar se pasta 'dist' foi criada
ls -la dist/
```

### **3. Configurar Capacitor Android**

#### **Sincronizar Projeto:**
```bash
# Sincronizar web app com Android
npx cap sync android

# Verificar se pasta 'android' foi criada
ls -la android/
```

#### **Abrir no Android Studio:**
```bash
# Abrir projeto Android
npx cap open android
```

### **4. Configurações no Android Studio**

#### **Verificar Configurações:**
1. **File → Project Structure**
2. **Verificar:**
   - Compile SDK: 34 (Android 14)
   - Target SDK: 34
   - Min SDK: 22 (Android 5.1)

#### **Configurar ID de Publicidade:**
1. **Abrir:** `app/src/main/AndroidManifest.xml`
2. **Verificar** se contém:
   ```xml
   <!-- NÃO usamos ID de publicidade -->
   <uses-permission android:name="com.google.android.gms.permission.AD_ID" tools:node="remove" />
   ```

### **5. Gerar Keystore de Assinatura**

#### **Criar Keystore:**
```bash
# No terminal (dentro da pasta android/)
keytool -genkey -v -keystore xzenpress-release.keystore \
  -alias xzenpress \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

#### **Configurar build.gradle:**
```gradle
android {
    signingConfigs {
        release {
            storeFile file('xzenpress-release.keystore')
            storePassword 'SUA_SENHA_KEYSTORE'
            keyAlias 'xzenpress'
            keyPassword 'SUA_SENHA_KEY'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### **6. Build Final para Google Play**

#### **Gerar AAB (Android App Bundle):**
1. **Android Studio:** `Build → Generate Signed Bundle/APK`
2. **Selecionar:** `Android App Bundle (.aab)`
3. **Escolher keystore:** Criado no passo anterior
4. **Build type:** `release`
5. **Aguardar build** (5-10 minutos)

#### **Localizar AAB:**
```
android/app/release/app-release.aab
```

### **7. Upload no Google Play Console**

#### **Responder sobre ID de Publicidade:**
```
❌ NÃO, este app não usa ID de publicidade

Justificativa:
- App de bem-estar holístico
- Sem anúncios ou tracking publicitário  
- Foco em terapias naturais
- Monetização via assinatura Premium
```

#### **Upload do AAB:**
1. **Google Play Console → App → Production**
2. **Create new release**
3. **Upload** arquivo `.aab`
4. **Preencher** informações obrigatórias
5. **Submit for review**

---

## 🔍 **TROUBLESHOOTING**

### **Erro: "ID de publicidade não declarado"**
**Solução:** Verificar se `AndroidManifest.xml` contém:
```xml
<uses-permission android:name="com.google.android.gms.permission.AD_ID" tools:node="remove" />
```

### **Erro: "Conteúdo misto HTTPS"**
**Solução:** Verificar `network_security_config.xml`:
```xml
<base-config cleartextTrafficPermitted="false">
```

### **Erro: "Keystore não encontrado"**
**Solução:** Gerar novo keystore e configurar paths corretos no `build.gradle`

---

## 📋 **CHECKLIST FINAL**

### **Antes do Upload:**
- [ ] Build AAB gerado com sucesso
- [ ] Keystore configurado e assinatura válida
- [ ] AndroidManifest.xml declara NÃO uso de AD_ID
- [ ] Todas as permissões necessárias declaradas
- [ ] Network security config bloqueia HTTP
- [ ] Versão e códigos corretos

### **No Google Play Console:**
- [ ] Responder "NÃO" para ID de publicidade
- [ ] Upload do AAB realizado
- [ ] Screenshots adicionados (você precisa criar)
- [ ] Descrição preenchida
- [ ] Política de privacidade linkada
- [ ] Classificação etária definida

---

## 🎯 **PRÓXIMO PASSO**

**Execute no seu computador local:**
```bash
# 1. Instalar dependências
npm install

# 2. Build do projeto
npm run build

# 3. Sincronizar com Android
npx cap sync android

# 4. Abrir no Android Studio
npx cap open android
```

**No Google Play Console, responda:**
```
❌ NÃO, este app não coleta, compartilha ou usa ID de publicidade
```

**Precisa de ajuda com algum passo específico?** 🚀📱