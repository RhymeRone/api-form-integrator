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
      // Ayrıca tüm axios ayarlarını (url, timeout, headers, vs.) buraya da ekleyebilirsiniz 
      useFormData: true, // Form verilerini FormData olarak göndermeye zorlar.
      preventRedirect: true, // Başarılı istekten sonra yönlendirmeyi engeller
      sweetalert2: true, // SweetAlert2 kullanımını etkinleştirir false ile console hataları gösterir.
   // tokenKey: 'token', // Token anahtarı (header'da token değeri), tokenName'e göre önceliklidir.
   // tokenName: 'token', // Token adı (localStorage'da token adı, dot notation desteği bulunmaktadır örneğin data.token.tokenName. tokenKey değeri girilirse bu alan gerekli değildir.)
      // -> tokenName ne işe yarar? 
      // -> tokenName değeri girildiğinde, token değeri localStorage'da data.token.tokenName şeklinde saklanır.
      // -> tokenName değeri api yanıtında token ismidir. Yanıtta token ismi verilmişse bu değeri giriniz. 
      // -> Örnek: {"data.token": "1234567890"} şeklinde bir yanıt aldığınızda tokenName değerini "data.token" olarak giriniz.
      // -> tokenKey değeri girildiğinde, token değeri header'da Authorization: Bearer tokenKey değeri şeklinde saklanır.
   // clearToken: true, // İstek sonrası token temizleme, eğer true ise tokenName değeri varsa localStorage'da silinir.
      validation: true, // validasyon kontrolünü aktifleştir
      validationOptions: { // Input alanları için validasyon görünümü ayarları
        showErrors: true, // Hata mesajlarının aktif edilmesi.
        errorClass: 'is-invalid', // Hata sınıfını belirler.
        successClass: 'is-valid', // Başarı sınıfını belirler.
        errorDisplayMode: 'inline', // Hata mesajlarının görünümünü belirler. (inline, pop)
        errorColor: 'red', // Hata mesajlarının rengini belirler.
      },
      fields: {
        email: {
          rules: ['required', 'email'],
          messages: {
            required: 'Email adresi zorunludur',
            email: 'Geçerli bir email adresi giriniz'
          }
        },
        password: {
          rules: ['required', 'min:6'],
          messages: {
            required: 'Şifre zorunludur',
            min: 'Şifre en az 6 karakter olmalıdır'
          }
        },
      },
      /*
            fields: {
        // Kişisel Bilgiler
        name: {
          rules: [
            'required',
            'min:2',
            'max:100',
            'regex:/^[a-zA-ZğüşıöçĞÜŞİÖÇ\\s]+$/'
          ],
          messages: {
            required: 'İsim alanı zorunludur.',
            min: 'İsim en az 2 karakter olmalıdır.',
            max: 'İsim en fazla 100 karakter olmalıdır.',
            regex: 'İsim sadece harflerden oluşmalıdır.'
          }
        },
        position: {
          rules: [
            'required',
            'min:3',
            'max:100',
            'regex:/^[a-zA-ZğüşıöçĞÜŞİÖÇ\\s]+$/'
          ],
          messages: {
            required: 'Pozisyon alanı zorunludur.',
            min: 'Pozisyon en az 3 karakter olmalıdır.',
            max: 'Pozisyon en fazla 100 karakter olmalıdır.',
            regex: 'Pozisyon sadece harflerden oluşmalıdır.'
          }
        },
        slogan: {
          rules: [
            'required',
            'max:255'
          ],
          messages: {
            required: 'Slogan alanı zorunludur.',
            max: 'Slogan en fazla 255 karakter olmalıdır.'
          }
        },
        birthday: {
          rules: [
            'required',
            'date',
            'before:today',
            'after:1900-01-01'
          ],
          messages: {
            required: 'Doğum tarihi alanı zorunludur.',
            date: 'Geçerli bir doğum tarihi giriniz.',
            before: 'Doğum tarihi bugünden önce olmalıdır.',
            after: 'Doğum tarihi 1900 yılından sonra olmalıdır.'
          }
        },
        degree: {
          rules: [
            'required',
            'max:100'
          ],
          messages: {
            required: 'Derece alanı zorunludur.',
            max: 'Derece en fazla 100 karakter olmalıdır.'
          }
        },
        email: {
          rules: [
            'required',
            'email',
            'max:255',
            'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/'
          ],
          messages: {
            required: 'E-posta alanı zorunludur.',
            email: 'Geçerli bir e-posta adresi giriniz.',
            max: 'E-posta en fazla 255 karakter olmalıdır.',
            regex: 'Geçerli bir e-posta formatı giriniz.'
          }
        },
        phone: {
          rules: [
            'required',
            'min:10',
            'max:15',
            'regex:/^[0-9]+$/'
          ],
          messages: {
            required: 'Telefon alanı zorunludur.',
            min: 'Telefon numarası en az 10 karakter olmalıdır.',
            max: 'Telefon numarası en fazla 15 karakter olmalıdır.',
            regex: 'Telefon numarası sadece rakamlardan oluşmalıdır.'
          }
        },
        address: {
          rules: [
            'required',
            'max:255'
          ],
          messages: {
            required: 'Adres alanı zorunludur.',
            max: 'Adres en fazla 255 karakter olmalıdır.'
          }
        },
      
        // Profesyonel Bilgiler
        experience: {
          rules: [
            'required',
            'numeric',
            'min:0',
            'max:100'
          ],
          messages: {
            required: 'Tecrübe alanı zorunludur.',
            numeric: 'Tecrübe sayısal bir değer olmalıdır.',
            min: 'Tecrübe 0 veya daha büyük olmalıdır.',
            max: 'Tecrübe 100 yıldan fazla olamaz.'
          }
        },
        projects: {
          rules: [
            'required',
            'numeric',
            'min:0',
            'max:10000'
          ],
          messages: {
            required: 'Proje sayısı alanı zorunludur.',
            numeric: 'Proje sayısı sayısal bir değer olmalıdır.',
            min: 'Proje sayısı 0 veya daha büyük olmalıdır.',
            max: 'Proje sayısı 10000\'den fazla olamaz.'
          }
        },
        clients: {
          rules: [
            'required',
            'numeric',
            'min:0',
            'max:10000'
          ],
          messages: {
            required: 'Müşteri sayısı alanı zorunludur.',
            numeric: 'Müşteri sayısı sayısal bir değer olmalıdır.',
            min: 'Müşteri sayısı 0 veya daha büyük olmalıdır.',
            max: 'Müşteri sayısı 10000\'den fazla olamaz.'
          }
        },
        freelance: {
          rules: [
            'required',
            'boolean'
          ],
          messages: {
            required: 'Freelance durumu alanı zorunludur.',
            boolean: 'Freelance durumu geçerli bir değer olmalıdır.'
          }
        },
      
        // Sosyal Medya Bağlantıları
        linkedin: {
          rules: [
            'required',
            'url',
            'regex:/^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/'
          ],
          messages: {
            required: 'LinkedIn alanı zorunludur.',
            url: 'Geçerli bir LinkedIn URL\'si giriniz.',
            regex: 'Geçerli bir LinkedIn profil bağlantısı giriniz.'
          }
        },
        github: {
          rules: [
            'required',
            'url',
            'regex:/^(https?:\/\/)?(www\.)?github\.com\/.*$/'
          ],
          messages: {
            required: 'GitHub alanı zorunludur.',
            url: 'Geçerli bir GitHub URL\'si giriniz.',
            regex: 'Geçerli bir GitHub profil bağlantısı giriniz.'
          }
        },
        twitter: {
          rules: [
            'required',
            'url',
            'regex:/^(https?:\/\/)?(www\.)?(twitter|x)\.com\/.*$/'
          ],
          messages: {
            required: 'Twitter alanı zorunludur.',
            url: 'Geçerli bir Twitter URL\'si giriniz.',
            regex: 'Geçerli bir Twitter profil bağlantısı giriniz.'
          }
        },
        facebook: {
          rules: [
            'required',
            'url',
            'regex:/^(https?:\/\/)?(www\.)?facebook\.com\/.*$/'
          ],
          messages: {
            required: 'Facebook alanı zorunludur.',
            url: 'Geçerli bir Facebook URL\'si giriniz.',
            regex: 'Geçerli bir Facebook profil bağlantısı giriniz.'
          }
        },
        instagram: {
          rules: [
            'required',
            'url',
            'regex:/^(https?:\/\/)?(www\.)?instagram\.com\/.*$/'
          ],
          messages: {
            required: 'Instagram alanı zorunludur.',
            url: 'Geçerli bir Instagram URL\'si giriniz.',
            regex: 'Geçerli bir Instagram profil bağlantısı giriniz.'
          }
        },
        website: {
          rules: [
            'required',
            'url',
            'regex:/^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}.*$/'
          ],
          messages: {
            required: 'Website alanı zorunludur.',
            url: 'Geçerli bir website URL\'si giriniz.',
            regex: 'Geçerli bir website adresi giriniz.'
          }
        },
      
        // Dosya Alanları
        image: {
          rules: [
            'required',
            'file',
            'image',
            'mimes:jpeg,png,jpg,gif',
            'max:2048', // 2MB
            'dimensions:min_width=100,min_height=100,max_width=2000,max_height=2000'
          ],
          messages: {
            required: 'Profil resmi alanı zorunludur.',
            file: 'Profil resmi bir dosya olmalıdır.',
            image: 'Yüklenen dosya bir resim olmalıdır.',
            mimes: 'Resim JPEG, PNG, JPG veya GIF formatında olmalıdır.',
            max: 'Resim boyutu en fazla 2MB olmalıdır.',
            dimensions: 'Resim boyutları en az 100x100px, en fazla 2000x2000px olmalıdır.'
          }
        },
        cv_file: {
          rules: [
            'required',
            'file',
            'mimes:pdf,doc,docx',
            'max:5120' // 5MB
          ],
          messages: {
            required: 'CV dosyası alanı zorunludur.',
            file: 'CV bir dosya olmalıdır.',
            mimes: 'CV dosyası PDF, DOC veya DOCX formatında olmalıdır.',
            max: 'CV dosyası boyutu en fazla 5MB olmalıdır.'
          }
        }
      },*/
      actions: {
        // onSubmit callback desteği: Form gönderilmeden önce çalışır.
        onSubmit: (formData) => { console.log(formData) }, // Form verilerini konsola yazdır
        // onSuccess callback desteği: API başarılı yanıt verdiğinde çalışır.
        onSuccess: (response) => { console.log(response); return true }, // true döndürürse default işlemler çalışır.
        // onError callback desteği: API hata döndürdüğünde çalışır.
        onError: (error) => { console.log(error); return true }, // false döndürürse default hata işlemleri çalışmaz.
        success: {
          preventRedirect: false, // Başarı durumunda yönlendirme engelleme
          redirect: '/dashboard', // Yönlendirme yapılacak sayfa
          message: 'Giriş başarılı!', // Başarı mesajı
        },
        errors: {
          preventRedirect: false, // Hata durumunda yönlendirme engelleme
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
        preventRedirect: false, // Hata durumunda yönlendirme engelleme
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
         preventRedirect: false, // Başarı durumunda yönlendirme engelleme
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
      showErrors: true, // Hata mesajlarının aktif edilmesi.
      errorClass: 'is-invalid', // Hata sınıfını belirler.
      successClass: 'is-valid', // Başarı sınıfını belirler.
      errorDisplayMode: 'inline', // Hata mesajlarının görünümünü belirler. (inline, pop)
      errorColor: 'red', // Hata mesajlarının rengini belirler.
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