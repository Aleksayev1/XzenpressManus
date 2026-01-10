# 📱 Instruções para Build Android

## 🚀 **Próximos Passos (No seu computador local):**

### **1. Instalar Android Studio:**
- Download: https://developer.android.com/studio
- Instalar SDK Android (API 33+)
- Configurar variáveis de ambiente

### **2. Sincronizar Projeto:**
```bash
npx cap sync android
```

### **3. Abrir no Android Studio:**
```bash
npx cap open android
```

### **4. Configurar Assinatura:**
```bash
# Gerar keystore
keytool -genkey -v -keystore xzenpress-release.keystore -alias xzenpress -keyalg RSA -keysize 2048 -validity 10000

# Configurar em android/app/build.gradle
```

### **5. Build para Produção:**
```bash
# No Android Studio:
Build → Generate Signed Bundle/APK → Android App Bundle
```

## 📋 **Arquivos Necessários:**
- ✅ `capacitor.config.ts` - Configurado
- ✅ `android/` - Projeto Android gerado
- ⏳ Keystore de assinatura (você deve criar)
- ⏳ Ícones adaptivos (opcional)

## 🎯 **Resultado:**
- **APK:** Para testes e distribuição direta
- **AAB:** Para Google Play Store (recomendado)
- **Tamanho:** ~15-25 MB
- **Funcionalidades:** Todas mantidas do PWA

## ⚠️ **Importante:**
Este processo requer **Android Studio** instalado localmente, pois o WebContainer não suporta builds Android nativos.