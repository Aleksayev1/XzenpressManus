# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# XZenPress - Regras específicas para bem-estar holístico

# Manter classes do Capacitor
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }

# Manter classes de WebView
-keep class android.webkit.** { *; }
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String, android.graphics.Bitmap);
    public boolean *(android.webkit.WebView, java.lang.String);
}

# Manter JavaScript interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# EXPLICITAMENTE REMOVER qualquer código relacionado a publicidade
-assumenosideeffects class com.google.android.gms.ads.** { *; }
-assumenosideeffects class com.google.firebase.analytics.** { *; }

# Otimizações para PWA
-keep class androidx.webkit.** { *; }
-keep class org.chromium.** { *; }

# Manter classes de notificação (para funcionalidades futuras)
-keep class androidx.core.app.NotificationCompat** { *; }

# Configurações de segurança
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

# Remover logs em produção
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}