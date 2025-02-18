const fs = require('fs');
const path = require('path');

// Temel konfigürasyon örneği (default.config.js'ten alındı)
const configTemplate = `// API Form Integrator Konfigürasyonu
const integratorConfig = {
  FORMS: {
    LOGIN: {
      selector: '#loginForm', // Formun DOM'daki seçicisi (ID, class, vs.)
      endpoint: '/login', // API endpoint'i
      method: 'POST', // HTTP methodu (GET, POST, PUT, DELETE, vs.)
      preventRedirect: true, // Varsayılan olarak true, başarılı istekten sonra yönlendirmeyi engeller
      fields: {
        email: {
          rules: ['required', 'email'], // Validasyon kuralları
        },
        password: {
          rules: ['required', 'min:6'], // Şifre için en az 6 karakter kuralı
        },
      },
      actions: {
        success: {
          saveToken: true, // Başarılı istekten sonra token'ı localStorage'a kaydet
          redirect: '/dashboard', // Başarılı istekten sonra yönlendirilecek sayfa
          message: 'Giriş başarılı!', // Başarı mesajı
        },
        error: {
          400: {
            message: 'Zaten giriş yapılmış', // 400 hatası için özel mesaj
            redirect: '/dashboard', // 400 hatası sonrası yönlendirme
          },
          401: {
            message: 'Email veya şifre hatalı!', // 401 hatası için özel mesaj
          },
          422: {
            message: 'Lütfen tüm alanları doldurun', // 422 hatası için özel mesaj
            showValidation: true, // Validasyon hatalarını göster
          },
        },
      },
    },
  },
  API: {
    baseURL: '/api', // API'nin temel URL'i
    headers: {
      'Content-Type': 'application/json', // Varsayılan header'lar
      'Accept': 'application/json',
    },
    timeout: 30000, // İstek zaman aşımı (ms cinsinden)
    errors: {
      401: {
        redirect: '/login', // 401 hatası sonrası yönlendirme
        clearToken: true, // Token'ı temizle
      },
      500: {
        message: 'Sistem hatası oluştu', // 500 hatası için özel mesaj
      },
    },
  },
  UI: {
    notifications: {
      position: 'top-end', // Bildirimlerin konumu (top, bottom, start, end)
      timer: 3000, // Bildirimlerin gösterim süresi (ms cinsinden)
      showConfirmButton: false, // Onay butonunu gizle
    },
    validation: {
      showErrors: true, // Validasyon hatalarını göster
      errorClass: 'is-invalid', // Hata durumunda eklenen CSS class'ı
      successClass: 'is-valid', // Başarı durumunda eklenen CSS class'ı
      messages: {
                required: (field) => {
          const messages = {
            email: 'Email adresi zorunludur',
            password: 'Şifre zorunludur',
            name: 'İsim alanı zorunludur',
            message: 'Mesaj alanı zorunludur',
            phone: 'Telefon numarası zorunludur',
          };
          
          return messages[field] || \`\${field} alanı zorunludur\`;
        },
        email: 'Geçerli bir email adresi giriniz', // Email validasyonu mesajı
        min: (field, value) => \`\${field} alanı en az \${value} karakter olmalıdır\`, // Min karakter kuralı mesajı
        max: (field, value) => \`\${field} alanı en fazla \${value} karakter olmalıdır\`, // Max karakter kuralı mesajı
        pattern: 'Geçerli bir format giriniz', // Regex pattern kuralı mesajı
      },
    },
  },
};

// Helper fonksiyonlar
export const getFormConfig = (formKey) => config.FORMS[formKey]; // Form konfigürasyonunu getir
export const getApiConfig = () => config.API; // API konfigürasyonunu getir
export const getUiConfig = () => config.UI; // UI konfigürasyonunu getir
export const getValidationMessage = (rule) => config.UI.validation.messages[rule]; // Validasyon mesajını getir
export const getApiErrorConfig = (status) => config.API.errors[status]; // API hata konfigürasyonunu getir

export default integratorConfig;

/*
### Açıklamalar ve Öneriler

1. **Validasyon Kuralları (Rules):**
   - **required:** Alanın doldurulması zorunludur.
   - **email:** Geçerli bir email adresi olmalıdır.
   - **min: X:** En az X karakter olmalıdır (örneğin, min: 6).
   - **max: X:** En fazla X karakter olmalıdır (örneğin, max: 20).
   - **pattern:** Regex pattern'ine uygun olmalıdır (örneğin, pattern: /^[A-Za-z]+$/).

2. **API Hata Yönetimi:**
   - **401:** Yetkisiz erişim hatası (örneğin, token geçersiz).
   - **422:** Validasyon hatası (örneğin, eksik veya hatalı form verisi).
   - **500:** Sunucu hatası (örneğin, beklenmeyen bir hata oluştu).

3. **UI Bildirimleri:**
   - **position:** Bildirimlerin ekrandaki konumu (örneğin, top - end).
   - **timer:** Bildirimlerin ekranda kalma süresi (ms cinsinden).
   - **showConfirmButton:** Onay butonunun gösterilip gösterilmeyeceği.

4. **Özelleştirme Önerileri:**
   - **Yeni Validasyon Kuralları:** Özel regex pattern'leri veya özel validasyon fonksiyonları eklenebilir.
   - **Çoklu Dil Desteği:** Validasyon mesajları farklı dillerde gösterilebilir.
   - **Özel Hata Yönetimi:** API hatalarına özel yönlendirmeler veya işlemler eklenebilir.
*/
`;

// config.js dosyasını oluştur
const configPath = path.join(process.cwd(), 'integrator.js');
fs.writeFileSync(configPath, configTemplate);

console.log('integrator.js dosyası başarıyla oluşturuldu!'); 