package es.fijipalosreales.app;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Actualizaciones de la app desde la propia app: descarga el APK publicado y abre el instalador
 * de Android. Solo acepta descargas HTTPS. Android pide confirmación al usuario antes de instalar
 * y solo acepta el APK si está firmado con la misma clave que la app instalada.
 */
@CapacitorPlugin(name = "Actualizador")
public class ActualizadorPlugin extends Plugin {

    private static final String MIME_APK = "application/vnd.android.package-archive";

    @PluginMethod
    public void info(PluginCall call) {
        try {
            PackageInfo p = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            JSObject r = new JSObject();
            r.put("version", p.versionName);
            r.put("codigo", Build.VERSION.SDK_INT >= 28 ? p.getLongVersionCode() : p.versionCode);
            call.resolve(r);
        } catch (PackageManager.NameNotFoundException e) {
            call.reject("No se ha podido leer la versión instalada", e);
        }
    }

    /** ¿Puede esta app abrir el instalador? (Android 8+: permiso «Instalar apps desconocidas»). */
    @PluginMethod
    public void permisoInstalar(PluginCall call) {
        JSObject r = new JSObject();
        r.put("concedido", puedeInstalar());
        call.resolve(r);
    }

    @PluginMethod
    public void abrirAjustesPermiso(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 26) {
            Intent i = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:" + getContext().getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
        }
        call.resolve();
    }

    @PluginMethod
    public void descargarEInstalar(PluginCall call) {
        String url = call.getString("url");
        if (url == null || !url.startsWith("https://")) {
            call.reject("Dirección de descarga no válida");
            return;
        }
        if (!puedeInstalar()) {
            call.reject("Falta el permiso para instalar aplicaciones", "SIN_PERMISO");
            return;
        }
        new Thread(() -> {
            HttpURLConnection con = null;
            try {
                File carpeta = new File(getContext().getCacheDir(), "actualizaciones");
                if (!carpeta.exists() && !carpeta.mkdirs()) throw new Exception("No se puede crear la carpeta temporal");
                File apk = new File(carpeta, "actualizacion.apk");

                con = (HttpURLConnection) new URL(url).openConnection();
                con.setConnectTimeout(15000);
                con.setReadTimeout(30000);
                con.connect();
                if (con.getResponseCode() != 200) throw new Exception("Respuesta " + con.getResponseCode());
                long total = con.getContentLengthLong();
                long leidos = 0;
                int ultimo = -1;
                try (InputStream in = con.getInputStream(); OutputStream out = new FileOutputStream(apk)) {
                    byte[] buf = new byte[64 * 1024];
                    int n;
                    while ((n = in.read(buf)) != -1) {
                        out.write(buf, 0, n);
                        leidos += n;
                        if (total > 0) {
                            int pct = (int) (leidos * 100 / total);
                            if (pct != ultimo) {
                                ultimo = pct;
                                JSObject ev = new JSObject();
                                ev.put("porcentaje", pct);
                                notifyListeners("progreso", ev);
                            }
                        }
                    }
                }

                Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", apk);
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setDataAndType(uri, MIME_APK);
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(i);
                call.resolve();
            } catch (Exception e) {
                call.reject("No se ha podido descargar la actualización: " + e.getMessage(), e);
            } finally {
                if (con != null) con.disconnect();
            }
        }).start();
    }

    private boolean puedeInstalar() {
        return Build.VERSION.SDK_INT < 26 || getContext().getPackageManager().canRequestPackageInstalls();
    }
}
