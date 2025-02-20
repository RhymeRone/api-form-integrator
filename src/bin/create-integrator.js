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
          saveToken: true, // Token'ı kaydet
          redirect: '/dashboard', // Yönlendirme yapılacak sayfa
          message: 'Giriş başarılı!', // Başarı mesajı
        },
        error: {
          400: {
            message: 'Zaten giriş yapılmış', // 400 hatası için mesaj
            redirect: '/dashboard',
          },
          401: {
            message: 'Email veya şifre hatalı!', // 401 hatası için mesaj
          },
          422: {
            message: 'Lütfen tüm alanları doldurun', // 422 hatası için mesaj
            showValidation: true,
          },
        },
      },
    },
  },
  API: {
    baseURL: '/api', // API'nin temel URL'i
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-TOKEN': typeof document !== 'undefined'
       ? document.querySelector('meta[name="csrf-token"]')?.content
       : process.env.CSRF_TOKEN
    },
    timeout: 30000, // İstek zaman aşımı (ms)
    errors: {
      401: {
        redirect: '/login',
        clearToken: true,
      },
      500: {
        message: 'Sistem hatası oluştu',
      },
    },
  },
  UI: {
    notifications: {
      position: 'top-end', // Bildirimin konumu
      timer: 3000, // Bildirimin gösterim süresi (ms)
      showConfirmButton: false,
    },
    validation: {
      showErrors: true,
      errorClass: 'is-invalid',
      successClass: 'is-valid',
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
        email: 'Geçerli bir email adresi giriniz',
        min: (field, value) => \`\${field} alanı en az \${value} karakter olmalıdır\`,
        max: (field, value) => \`\${field} alanı en fazla \${value} karakter olmalıdır\`,
        pattern: 'Geçerli bir format giriniz',
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