const path = require('path');
const fs = require('fs');

// Proje kök dizininin alınması
const rootPath = process.cwd();

// Hedef dizin ve dosya yolu
const destinationDir = path.join(rootPath, 'resources', 'js', 'config');
const destinationFile = path.join(destinationDir, 'integrator.config.js');

// Konfigürasyon şablonunun tanımlanması (UTF-8 kodlamasıyla)
const configTemplate = `// API Form Integrator Konfigürasyonu @ts-check
export const integratorConfig = {
  FORMS: {
    LOGIN: {
      selector: '#loginForm', // Formun DOM'daki seçicisi (ID, class, vs.)
      endpoint: '/login', // API endpoint'i
      method: 'POST', // HTTP methodu (GET, POST, PUT, DELETE, vs.)
      preventRedirect: true, // Başarılı istekten sonra yönlendirmeyi engeller
      validation: true, // validasyon kontrolünü aktifleştir
      sweetalert2: true, // SweetAlert2 kullanımını etkinleştirir false ile console hataları gösterir.
   // tokenKey: 'token', // Token anahtarı (header'da token değeri), tokenName'e göre önceliklidir.
   // tokenName: 'token', // Token adı (localStorage'da token adı, dot notation desteği bulunmaktadır örneğin data.token.tokenName. tokenKey değeri girilirse bu alan gerekli değildir.)
      // -> tokenName ne işe yarar? 
      // -> tokenName değeri girildiğinde, token değeri localStorage'da data.token.tokenName şeklinde saklanır.
      // -> tokenName değeri api yanıtında token ismidir. Yanıtta token ismi verilmişse bu değeri giriniz. 
      // -> Örnek: {"data.token": "1234567890"} şeklinde bir yanıt aldığınızda tokenName değerini "data.token" olarak giriniz.
      // -> tokenKey değeri girildiğinde, token değeri header'da Authorization: Bearer tokenKey değeri şeklinde saklanır.
   // clearToken: true, // İstek sonrası token temizleme, eğer true ise tokenName değeri varsa localStorage'da silinir.
      fields: {
        email: {
          rules: ['required', 'email'], // Validasyon kuralları
        },
        password: {
          rules: ['required', 'min:6'], // Şifre için en az 6 karakter kuralı
        },
      },
      actions: {
        // onSubmit callback desteği: Form gönderilmeden önce çalışır.
        onSubmit: (formData) => { console.log(formData) }, // Form verilerini konsola yazdır
        // onSuccess callback desteği: API başarılı yanıt verdiğinde çalışır.
        onSuccess: (response) => { console.log(response); return true }, // true döndürürse default işlemler çalışır.
        // onError callback desteği: API hata döndürdüğünde çalışır.
        onError: (error) => { console.log(error); return true }, // false döndürürse default hata işlemleri çalışmaz.
        success: {
          redirect: '/dashboard', // Yönlendirme yapılacak sayfa
          message: 'Giriş başarılı!', // Başarı mesajı
        },
        errors: {
          // redirect: '/login',
          message: 'Bir hata oluştu',     
          400: {
            redirect: '/dashboard',
            message: 'Zaten giriş yapılmış', // 400 hatası için mesaj
          },
          401: {
            message: 'Email veya şifre hatalı!', // 401 hatası için mesaj
          },
          422: {
            message: 'Lütfen tüm alanları doldurun', // 422 hatası için mesaj
          },
        },
      },
    },
  },
  API: {
    baseURL: '/api', // API'nin temel URL'i
    headers: {
      'Content-Type': 'application/json', // İçerik tipi
      'Accept': 'application/json', // Kabul edilen içerik tipi
      'X-CSRF-TOKEN': typeof document !== 'undefined' 
       ? document.querySelector('meta[name="csrf-token"]')?.content
       : process.env.CSRF_TOKEN // CSRF token'ının otomatik algılanması
    },
    timeout: 30000, // İstek zaman aşımı (ms)
    sweetalert2: true, // Sweetalert2 kullanımı
    preventRedirect: false, // Yönlendirme engelleme
    // tokenKey: 'token', // Token anahtarı (header'da token değeri), tokenName'e göre önceliklidir.
    tokenName: 'token', // Token adı (localStorage'da token adı, dot notation desteği bulunmaktadır örneğin data.token.tokenName. tokenKey değeri girilirse bu alan gerekli değildir.)
    // tokenName ne işe yarar? 
    // tokenName değeri girildiğinde, token değeri localStorage'da data.token.tokenName şeklinde saklanır.
    // tokenName değeri api yanıtında token ismidir. Yanıtta token ismi verilmişse bu değeri giriniz. 
    // Örnek: {"data.token": "1234567890"} şeklinde bir yanıt aldığınızda tokenName değerini "data.token" olarak giriniz.
    // tokenKey değeri girildiğinde, token değeri header'da Authorization: Bearer tokenKey değeri şeklinde saklanır.
    errors: { // Hata durumları
        // redirect: '/', // Hata durumunda yönlendirme
        message: 'Bir hata oluştu', // Hata durumunda mesaj
        401: {
           redirect: '/login',
           message: 'Yetkisiz erişim',
        },
        500: {
           message: 'Sistem hatası oluştu'
        }
    },
    success: {
      // redirect: '/', // Başarı durumunda yönlendirme
         message: 'İşlem başarılı!' // Başarı durumunda mesaj
    },
    // Yeni: Güvenlik header'ları ayarları
     security: { 
      enableSecurityHeaders: true, // Güvenlik header'larını etkinleştir
      headers: {
                'X-XSS-Protection': '1; mode=block', // XSS saldırılarını engellemek için
                'Content-Security-Policy': "default-src 'self'", // CSP ayarları
                'X-Content-Type-Options': 'nosniff' // MIME türü kontrolünü engellemek için
            }
        },

        // Yeni: CSRF Token otomatik yönetimi ayarları
      csrf: {
            autoDetect: true, // CSRF token'ını otomatik olarak algılamak için
            cookieName: 'XSRF-TOKEN', // CSRF token'ının adı
            headerName: 'X-XSRF-TOKEN', // CSRF token'ının header adı
            refreshOnSubmit: true // Form gönderiminde CSRF token'ını yenilemek için
        },

        // Yeni: Rate limiting konfigürasyonu
      rateLimiting: {
            enabled: false, // Varsayılan kapalı; isteğe bağlı açılabilir
            strategy: 'token-bucket', // Alternatif: 'fixed-window'
            limits: {
                perMinute: 60, // Her dakika 60 istek
                perHour: 1000 // Her saat 1000 istek
            },
            headers: {
                show: true, // Rate limit bilgilerini header'larda göstermek için
                limit: 'X-RateLimit-Limit', // Maksimum istek sayısı
                remaining: 'X-RateLimit-Remaining', // Kalan istek sayısı
                reset: 'X-RateLimit-Reset' // Sıfırdan başlama zamanı
            }
        }
  },
  UI: {
    notifications: {
      position: 'center', // Bildirimin konumu
      timer: 2000, // Bildirimin gösterim süresi (ms)
      showConfirmButton: false,
    },
    validation: {
      showErrors: true,
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      messages: {
        required: (field) => {
          const messages = {  // Mesajların tanımlanması
            email: 'Email adresi zorunludur', // Email alanı için mesaj
            password: 'Şifre zorunludur', // Şifre alanı için mesaj
            name: 'İsim alanı zorunludur', // İsim alanı için mesaj
            message: 'Mesaj alanı zorunludur', // Mesaj alanı için mesaj
            phone: 'Telefon numarası zorunludur', // Telefon numarası alanı için mesaj
          };
          return messages[field] || \`\${field} alanı zorunludur\`;
        },
        email: 'Geçerli bir email adresi giriniz', // Email alanı için mesaj
        min: (field, value) => \`\${field} alanı en az \${value} karakter olmalıdır\`, // Minumum karakter sayısı için mesaj
        max: (field, value) => \`\${field} alanı en fazla \${value} karakter olmalıdır\`, // Maksimum karakter sayısı için mesaj
        pattern: 'Geçerli bir format giriniz', // Format için mesaj
      },
    },
  },
};

export default integratorConfig;
export const getFormConfig = (formKey) => integratorConfig.FORMS[formKey];
export const getApiConfig = () => integratorConfig.API;
export const getUiConfig = () => integratorConfig.UI;
export const getValidationMessage = (rule) => integratorConfig.UI.validation.messages[rule];
export const getApiErrorConfig = (status) => integratorConfig.API.errors[status];
`;

// CLI işlemini gerçekleştiren fonksiyon
function createIntegrator() {
  try {
    // Hedef dizin mevcut değilse oluştur
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }
    // Yazma izni kontrolü
    fs.accessSync(destinationDir, fs.constants.W_OK);

    // Konfigürasyon dosyasını oluştur (varsa üzerine yazar)
    fs.writeFileSync(destinationFile, configTemplate, { encoding: 'utf8' });
    console.log(`✅ integrator.config.js dosyası başarıyla oluşturuldu: ${destinationFile}`);
  } catch (error) {
    console.error('❌ Dosya oluşturulurken bir hata oluştu:', error.message);
    process.exit(1);
  }
}

// Modül olarak hem fonksiyonları hem de şablonu dışa aktarıyoruz
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createIntegrator, configTemplate };
}

// Eğer bu dosya doğrudan çalıştırılmışsa CLI fonksiyonunu çağır
if (process.argv[1] && process.argv[1].includes('create-integrator.cjs')) {
  console.log("process.argv kontrolü geçti, CLI çalıştırılıyor.");
  createIntegrator();
}