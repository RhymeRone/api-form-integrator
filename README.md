# API Form Integrator

**API Form Integrator**, modern web projelerinde form yönetimi ve API entegrasyonunu kolaylaştıran, validasyon, hata yönetimi ve UI bildirimleri gibi ek özelliklerle güçlendirilen kapsamlı bir JavaScript kütüphanesidir.

## 📑 İçindekiler
- [Özellikler](#özellikler)
- [Kurulum](#kurulum)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Dual Package Desteği](#dual-package-desteği)
- [Detaylı Kullanım](#detaylı-kullanım)
- [Konfigürasyon](#konfigürasyon)
- [Validasyon Mesajları](#validasyon-mesajları)
- [API Entegrasyonu](#api-entegrasyonu)
- [Hata Yönetimi](#hata-yonetimi)
- [Yeni Özellikler](#yeni-özellikler)
- [Örnekler](#örnekler)
- [SSS](#sss)
- [Sorun Giderme](#sorun-giderme)
- [Test](#test)
- [Lisans](#lisans)
- [Katkıda Bulunma](#katkıda-bulunma)
- [Wiki](https://github.com/RhymeRone/api-form-integrator/wiki)

## 🚀 Özellikler

### Form Yönetimi
- 📝 Otomatik form yakalama ve yönetim
- ⚙️ Kolay konfigürasyon ve event yönetimi 
- 🔄 Form verilerinin işlenmesi, callback desteği ve dinamik validasyon

### Validasyon
- ✅ Yerleşik validasyon kuralları (required, email, min, max, pattern)
- 💬 Global ve özelleştirilebilir hata mesajları
- 🔍 Gerçek zamanlı validasyon desteği

### API Entegrasyonu
- 🌐 Otomatik API istekleri (Axios tabanlı)
- 🔒 JWT token yönetimi, CSRF desteği ve timeout ayarları
- 🛡️ Global hata yönetimi, rate limiting stratejileri ve güvenlik header'ları

### UI Özellikleri
- 🔔 SweetAlert2 entegrasyonu ile bildirimler
- 🔄 Yükleme animasyonları ve form durumu göstergeleri

### Ek Özellikler
- **CLI Aracı:** `npx create-integrator` komutu ile proje konfigürasyonu oluşturma
- **Dual Package Desteği:** Node.js (CommonJS, ES Modules) ve tarayıcı (CDN/UMD) uyumlu
- **Doğrudan API Çağrıları:** ApiService üzerinden gelişmiş API özelliklerinden yararlanma imkanı
- **Derinlemesine Konfigürasyon Merge:** `mergeDeep` fonksiyonu ile mevcut ayarların esnek biçimde güncellenmesi

## 📦 Kurulum

### NPM ile Kurulum
```bash
  npm install api-form-integrator
```

### Bağımlılıklar
```bash
  npm install sweetalert2 axios
```

### CDN ile Kullanım
Paketi doğrudan tarayıcınızda kullanmak için:

```html
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script> 
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="https://cdn.jsdelivr.net/npm/api-form-integrator@latest/dist/integrator.cdn.js"></script>
```

> **Not:** Axios ve SweetAlert2 bağımlılıklarının yüklenmesi gerekiyor.

## 🚀 Hızlı Başlangıç

1. Paketi yükleyin:
```bash
  npm install api-form-integrator
```

2. CLI ile konfigürasyon dosyasını oluşturun:
```bash
  npx create-integrator
```

3. Konfigürasyon dosyasını projenize import edip çalıştırın:
```javascript
  import ApiFormIntegrator from 'api-form-integrator';
  // Örneğin, resources/js/app.js içinden:
  import integratorConfig from './config/integrator.config';

  // Opsiyonel: SweetAlert2 varsayılan ayarlarının uygulanması
  Swal.defaultOptions = integratorConfig.UI.notifications;

  document.addEventListener('DOMContentLoaded', () => {
    const integrator = new ApiFormIntegrator(integratorConfig);
    integrator.initialize();
  });
```

### Açıklamalar

1. **`npx create-integrator`**  
   Bu komut, projeniz için temel bir konfigürasyon dosyası (`integrator.config.js`) oluşturur. Bu dosya, formlarınızın, API ayarlarınızın ve UI ayarlarınızın yapılandırılmasını sağlar.

2. **SweetAlert Ayarları**  
   `Swal.defaultOptions` ile SweetAlert2'nin varsayılan ayarlarını özelleştirebilirsiniz. Bu adım **isteğe bağlıdır** ve kullanıcılar kendi bildirim ayarlarını yapılandırabilir.

3. **`integrator.initialize()`**  
   Bu metod, `integrator.config.js` dosyasında tanımlanan tüm formları otomatik olarak başlatır ve API entegrasyonunu sağlar.

4. **`import integratorConfig from './config/integrator';`**  
    Bu ifade, entegratör konfigürasyon dosyanızın varsayılan olarak `resources/js/config/integrator.config.js` konumunda bulunduğunu ve `resources/js/app.js` içinden bu şekilde erişilebileceğini belirtir. Eğer entegratör dosyanızı farklı bir dizine taşıdıysanız, lütfen import yolunu dosyanızın bulunduğu yeni konuma göre güncelleyin.

## 📦 Dual Package Desteği

Paket, hem Node.js hem de tarayıcı ortamında farklı modül sistemleriyle kullanılabilir:

### CommonJS
```javascript
  const ApiFormIntegrator = require('api-form-integrator');
  const integratorConfig = require('./config/integrator.config');
  
  const integrator = new ApiFormIntegrator(integratorConfig);
  integrator.initialize();
```

### ES Modules
```javascript
  import ApiFormIntegrator from 'api-form-integrator';
  import integratorConfig from './config/integrator.config';
  
  const integrator = new ApiFormIntegrator(integratorConfig);
  integrator.initialize();
```

## 📚 Detaylı Kullanım

### Form Tipleri

#### 1. Basit Form
Temel veri gönderimi için:
```javascript
  APP_CONFIG.FORMS.SIMPLE = {
    selector: '#simpleForm',
    endpoint: '/api/data',
    method: 'POST'
  };
```

#### 2. Validasyonlu Form
Veri doğrulama kuralları ile:
```javascript
  APP_CONFIG.FORMS.VALIDATED = {
    selector: '#validatedForm',
    endpoint: '/api/data',
    method: 'POST',
    // Axios ayarları da buradan yapılabilir. (headers, timeout, etc.)
    fields: {
      name: { rules: ['required', 'min:3'] },
      email: { rules: ['required', 'email'] }
    }
  };
```

#### 3. Callback Kullanımı
Özel callback fonksiyonları:
- **onSubmit:** Form gönderilmeden önce veriyi manipüle eder.
```javascript
  onSubmit: (formData, config) => {
    config.endpoint = config.endpoint.replace('{id}', formData.id);
  }
```
- **onSuccess:** API başarılı yanıt verdiğinde çalışır.
```javascript
  onSuccess: () => { /* Default işlemler */ }
```
- **onError:** API hata döndürdüğünde hata yönetimini sağlar.
```javascript
  onError: (error) => { alert('Hata!'); return false; }
```

## ⚙️ Konfigürasyon

### Form Konfigürasyonu (APP_CONFIG.FORMS)
```javascript
  {
    selector: '#formId',       // Form elementinin CSS seçicisi (zorunlu)
    endpoint: '/api/path',     // API endpoint'i (zorunlu)
    method: 'POST',            // HTTP metodu (GET, POST, PUT, DELETE, PATCH)
    useFormData: true,         // Form verilerini FormData olarak göndermeye zorlar. (varsayılan true'dur. false yapılırsa JSON formatında gönderir.)
    // Axios ayarları da buradan yapılabilir. (headers, timeout, etc.)
    validation: true,          // Validasyon kontrolü
    validationOptions: {
      showErrors: true,         // Hata mesajlarını gösterir
      errorClass: 'is-invalid', // Hata sınıfı
      successClass: 'is-valid', // Başarı sınıfı
      errorDisplayMode: 'pop', // Hata mesajlarını popup olarak gösterir (inline, pop)
      errorColor: '#dc3545',    // Hata mesajlarının rengi
    },
    preventRedirect: true,     // Otomatik yönlendirmeyi engeller
    sweetalert2: true,        // SweetAlert2 kullanımı (false yaparsanız Console.log ile yanıt alırsınız)
    tokenName: 'data.auth.access_token', // tokenin adı
    tokenKey: 'data.auth.access_token', // tokenin key'i
    clearToken: true, // token temizleme
    fields: {
      fieldName: { rules: ['required', 'email', 'min:6'] }
    },
    actions: {
      onSubmit: (formData, config) => {
        // isteğe bağlı verileri işleme
        formData.email = formData.email.toLowerCase();
        config.endpoint = '/api/users';
        config.method = 'POST';
      },
      onSuccess: (response) => {
        // Başarılı isteklerde çalışacak fonksiyon
        console.log("Başarılı!", response);
      },
      onError: (error) => {
        // Hata durumunda çalışacak fonksiyon
        console.error("Hata!", error);
      },
      success: {
        redirect: '/path',     // Yönlendirme URL'si
        message: 'Başarılı!',  // Başarı mesajı
      },
      errors: {
        message: 'Bir hata oluştu',
        redirect: '/path',
        400: { message: 'Hata mesajı', redirect: '/path' }
      }
    }
  }
```

### API Konfigürasyonu (APP_CONFIG.API)
```javascript
  {
    baseURL: '/api',          // API'nin temel URL'i
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 30000,           // İstek zaman aşımı (ms)
    sweetalert2: true,        // SweetAlert2 kullanımı
    preventRedirect: true,     // Otomatik yönlendirmeyi engeller
    tokenName: 'token', // tokenin adı (localStorage'da kullanılır)
    tokenKey: 'token', // tokenin key'i (doğrudan header'da kullanılır)
    clearToken: true, // token temizleme (tokenName varsa localStorage'da silinir)
    errors: {
      redirect: '/login', 
      401: { message: 'Yetkisiz işlem', redirect: '/login' },
      500: { message: 'Sistem hatası oluştu' }
    },
    success: {
      redirect: '/dashboard',
      message: 'İşlem başarılı'
    },
    // Güvenlik ayarları: Ek güvenlik header'ları otomatik olarak eklenir
    security: {
      enableSecurityHeaders: true,
      headers: {
        'X-XSS-Protection': '1; mode=block',
        'Content-Security-Policy': "default-src 'self'",
        'X-Content-Type-Options': 'nosniff'
      }
    },
    // CSRF Token yönetimi ayarları
    csrf: {
      autoDetect: true,
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN',
      refreshOnSubmit: true
    },
    // Rate limiting konfigürasyonu
    rateLimiting: {
      enabled: false, // Varsayılan kapalı; isteğe bağlı açılabilir
      strategy: 'token-bucket', // Alternatif: 'fixed-window'
      limits: {
        perMinute: 60,
        perHour: 1000
      },
      headers: {
        show: true,
        limit: 'X-RateLimit-Limit',
        remaining: 'X-RateLimit-Remaining',
        reset: 'X-RateLimit-Reset'
      }
    }
  }
```

### UI Konfigürasyonu (APP_CONFIG.UI)
```javascript
  {
    notifications: {
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false
    },
    validation: {
      showErrors: true,
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      errorDisplayMode: 'pop',  // 'inline' (default) veya 'pop'
      errorColor: '#dc3545',    // Hata metninin ve popup'ın rengi
      messages: {
        required: (field) => {
          const messages = {
            email: 'Email adresi zorunludur',
            password: 'Şifre zorunludur',
            name: 'İsim alanı zorunludur',
            message: 'Mesaj alanı zorunludur',
            phone: 'Telefon numarası zorunludur'
          };
          return messages[field] || `${field} alanı zorunludur`;
        },
        email: 'Geçerli bir email adresi giriniz',
        min: (field, value) => `${field} alanı en az ${value} karakter olmalıdır`,
        max: (field, value) => `${field} alanı en fazla ${value} karakter olmalıdır`,
        pattern: 'Geçerli bir format giriniz'
      }
    }
  }
```

### Validasyon Mesajları Konfigürasyonu (APP_CONFIG.UI.VALIDATION.MESSAGES) - ✨ Yeni Özellik 

API Form Integrator artık her alan için özel validasyon mesajları tanımlamanıza olanak sağlıyor. Bu özellik sayesinde formlarınızdaki validasyon hatalarını daha açıklayıcı ve kullanıcı dostu şekilde gösterebilirsiniz.

#### Kullanım

`integrator.config.js` dosyanızda, form alanları için `rules` tanımının yanına `messages` ekleyebilirsiniz:

  ```javascript
  fields: {
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
    }
  }
  ```

#### Regex Örnekleri

Yaygın kullanılan regex örnekleri:

  ```javascript
  // Sadece harfler ve boşluk
  'regex:/^[a-zA-ZğüşıöçĞÜŞİÖÇ\\s]+$/'
  
  // Sadece sayılar
  'regex:/^[0-9]+$/'
  
  // E-posta adresi
  'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/'
  
  // URL
  'regex:/^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([\\/\\w .-]*)*\\/?$/'
  
  // Türkiye telefon numarası (5XX XXX XX XX)
  'regex:/^5[0-9]{2}[0-9]{3}[0-9]{2}[0-9]{2}$/'
  ```

#### Desteklenen Validasyon Kuralları

API Form Integrator aşağıdaki validasyon kurallarını destekler ve her biri için özel mesajlar tanımlayabilirsiniz:

- `required`: Alan zorunlu
- `email`: Geçerli bir e-posta adresi olmalı
- `min:x`: Minimum karakter sayısı veya sayısal değer
- `max:x`: Maksimum karakter sayısı veya sayısal değer
- `numeric`: Sadece sayısal değer
- `boolean`: Boolean değer
- `url`: Geçerli bir URL
- `date`: Geçerli bir tarih
- `before:date`: Belirtilen tarihten önce
- `after:date`: Belirtilen tarihten sonra
- `regex:/pattern/`: Düzenli ifade kontrolü
- `nullable`: Boş bırakılabilir
- `file`: Dosya tipi kontrolü
- `image`: Resim dosyası kontrolü
- `mimes:ext1,ext2`: Belirli dosya uzantıları
- `dimensions:params`: Resim boyutları kontrolü

### Hata Mesajı Gösterim Modları - ✨ Yeni Özellik

Form doğrulama hatalarının gösterim şeklini özelleştirmek için `errorDisplayMode` seçeneği eklenmiştir. Bu seçenek, hata mesajlarının nasıl gösterileceğini belirleyerek kullanıcı deneyimini iyileştirir.

#### Kullanılabilir Modlar

- `inline`: Hata mesajları form elemanlarının altında gösterilir (geleneksel yöntem). Ayrıca başarılı validasyon durumunda form elemanlarına yeşil kenarlık ve onay işareti ekler.
- `pop`: Hata mesajları, form elemanlarına hover olunduğunda veya odaklanıldığında popup olarak gösterilir. Pop modu sayfa düzenini bozmadan kullanıcıya görsel geri bildirim sağlar.

#### Kullanım Örneği

```javascript
const LoginForm = new FormFactory().createForm('LOGIN', {
    selector: '#loginForm',
    endpoint: '/login',
    method: 'POST',
    validationOptions: {
        errorDisplayMode: 'pop',  // 'inline' (default) veya 'pop'
        errorClass: 'is-invalid', // Hata sınıfı
        successClass: 'is-valid', // Başarı sınıfı
        errorColor: '#dc3545',    // Hata metninin ve popup'ın rengi
        showErrors: true
    },
    fields: {
        email: { 
          rules: ['required', 'email'],
          messages: {
            required: 'Email alanı zorunludur.',
            email: 'Geçerli bir email adresi giriniz.'
          }
         },
        password: { 
          rules: ['required', 'min:6'],
          messages: {
            required: 'Şifre alanı zorunludur.',
            min: 'Şifre en az 6 karakter olmalıdır.'
          }
        }
    }
});
```

#### Global Ayar

Tüm formlar için varsayılan gösterim modunu ve diğer validasyon ayarlarını değiştirmek için `integrator.config.js` içinde validation bölümünde `showErrors`, `errorClass`, `successClass`, `errorDisplayMode` ve `errorColor` ayarlarını değiştiriniz. Bu ayarlar tüm formlar için geçerlidir.

```javascript
   UI: {
        validation: {
            showErrors: true,
            errorClass: 'is-invalid',
            successClass: 'is-valid',
            errorDisplayMode: 'inline', // 'inline' veya 'pop'
            errorColor: '#dc3545',
        }
    }
```
>**Not:** Eğer form içerisinde `validationOptions` objesi ile validasyon ayarları tanımlanmışsa, bu ayarlar form için geçerli olur ve global ayarlar göz ardı edilir.

#### Pop Modu Özellikleri

Pop modu, form alanlarının üzerinde beliren animasyonlu bildirimler sunar:

- **Etkileşimli Gösterim**: Hata mesajları kullanıcı form alanının üzerine geldiğinde veya odaklandığında görünür
- **Sayfa Düzenini Koruma**: Popup şeklinde gösterildiği için sayfa akışını ve hizalamayı bozmaz
- **Estetik Tasarım**: Yumuşak gölgeler ve animasyonlarla modern bir görünüm sağlar
- **Mobil Uyumluluk**: Dokunmatik cihazlarda da sorunsuz çalışır
- **Responsive Davranış**: Ekran boyutu değiştiğinde popup konumları otomatik olarak güncellenir
- **UI Uyumluluğu**: SweetAlert2 bildirimleriyle çakışmayı önler, modal pencereler açıldığında otomatik gizlenir
- **Minimal Görsel Etki**: Form elemanlarının görsel stillerini bozmadan hata durumunu belirtir

#### Pop Modu Nasıl Çalışır?

Pop modu, hata durumlarını göstermek için DOM'a geçici baloncuk elementleri ekler:

1. Hata tespit edildiğinde, ilgili form alanı için bir popup baloncuğu oluşturulur
2. Kullanıcı form alanına hover olduğunda veya odaklandığında, hata mesajı görünür hale gelir
3. Kullanıcı ayrıldığında veya odağı kaybettiğinde, hata mesajı gizlenir
4. Form alanları doğru şekilde doldurulduğunda, popup elementleri otomatik olarak kaldırılır
5. Ekran boyutu değiştiğinde, popup konumları otomatik olarak güncellenir
6. SweetAlert2 bildirimleri gösterildiğinde popup'lar otomatik olarak gizlenir

Bu yaklaşım, sayfa akışını ve hizalamasını bozmadan kullanıcıya görsel geri bildirim sağlar. Özellikle sıkışık form düzenlerinde, yerleşim düzeni sorunlarını önlemek için idealdir.

### Helper Fonksiyonlar
```javascript
  // Form konfigürasyonunu alır
  getFormConfig(formKey: string) => object
  
  // API konfigürasyonunu alır
  getApiConfig() => object
  
  // UI konfigürasyonunu alır
  getUiConfig() => object
  
  // Validasyon mesajını alır
  getValidationMessage(rule: string) => string|function
  
  // API hata konfigürasyonunu alır
  getApiErrorConfig(status: number) => object
```

## 🔧 Hata Yönetimi

Global hata yönetimi, API isteklerinde otomatik olarak uygulanır:
- Belirli HTTP status kodlarına göre (örn: 401, 422, 500) hata mesajları, yönlendirme ve token temizleme işlemleri gerçekleştirilir.
- Örnek hata konfigürasyonu:
```javascript
  actions: {
    errors: {
      401: { message: 'Oturum süreniz doldu', redirect: '/login' },
      422: { message: 'Validasyon hatası' }
    }
  }
```

## 💡 Yeni Özellikler

- **Doğrudan API Çağrıları:**  
  Form bazlı kullanımın dışında, sayfa yüklendiğinde veya özel durumlarda API isteği gerçekleştirmek için doğrudan ApiService üzerinden istek yapabilirsiniz. Bu sayede global hata yönetimi, CSRF koruması ve güvenlik header'ları otomatik olarak uygulanır.
  
- **Derin Merge İşlemi:**  
  Konfigürasyon güncellemelerinde `mergeDeep` fonksiyonu sayesinde mevcut ayarlar esnek biçimde güncellenebilir.
  
- **CLI Aracı:**  
  `npx create-integrator` komutu, proje dizininizde otomatik olarak `integrator.config.js` şablonunu oluşturur. Böylece formlar, API ve UI ayarlarınızı kolayca yapılandırabilirsiniz.
  
- **Güvenlik Ayarları:**  
  API isteklerinde ek güvenlik sağlamak amacıyla, `security` altında tanımlı header'lar otomatik olarak eklenir.
  
- **CSRF Token Yönetimi:**  
  Form gönderimleri sırasında, `csrf` ayarları sayesinde otomatik CSRF token tespiti ve güncelleme yapılır.
  
- **Rate Limiting:**  
  API isteklerinin sıklığını kontrol etmek için, `rateLimiting` konfigürasyonu ile token-bucket veya fixed-window stratejileri uygulanabilir. İsteğe bağlı olarak limit bilgileri header'lar üzerinden de iletilebilir.

- **Doğrulama Mesajları:**  
  Validasyon kurallarına özel mesajlar tanımlanabilir.

- **Doğrulama Ayarları:**  
  - `showErrors`: Hata mesajlarının görünümünü belirler.
  - `errorClass`: Hata sınıfını belirler.
  - `successClass`: Başarı sınıfını belirler.
  - `errorDisplayMode`: Hata mesajlarının görünümünü belirler.
  - `errorColor`: Hata mesajlarının rengini belirler.

- **useFormData parametresi:**  
  Form verilerini FormData olarak göndermeye zorlar. (varsayılan true'dur. false yapılırsa JSON formatında gönderir.)

## 🔍 Örnekler

### Doğrudan API Çağrısı Örneği

ApiService ile doğrudan API çağrıları yapabilir, global hata yönetimi ve güvenlik özelliklerinden faydalanabilirsiniz. 

```javascript
  import { ApiService } from 'api-form-integrator';

  const apiService = new ApiService({baseURL: 'https://custom-api-adresi.com'});

  async function fetchDashboardData() {
      const response = await ApiService.request({
        url: '/dashboard/data',
        method: 'GET',
        actions: {
          success: {
            message: 'İşlem başarılı',
          },
          errors: {
            message: 'Bir hata oluştu',
          },
          onSuccess: (response) => {
            console.log('Dashboard verisi:', response.data);
          },
          onError: (error) => {
            console.error('Hata:', error);
          }
        }
      });

  fetchDashboardData();
```

#### Custom API Konfigürasyonu Örneği

Aşağıdaki örnekte, `ApiService`'in custom konfigürasyonu kullanılarak özel olarak yapılandırılabilmesi gösterilmiştir.

```javascript
import { ApiService } from 'api-form-integrator';

// API hatalarının SweetAlert ile gösterilmemesi için custom konfigürasyon örneği:
const customApiConfig = {
  // Hatalar için özel yapılandırma:
  errors: {
    401: {
      redirect: '/login',
      message: '', // Boş mesaj tanımlanarak, SweetAlert ile hata bildirimi engellenir.
      // İsteğe bağlı olarak yönlendirme (redirect) eklenebilir.
    },
    500: {
      message: '', // Hata mesajı boş bırakılarak, sunucu hatalarında SweetAlert gösterimi engellenir.
    }
    // Diğer hata durumları için de benzer yapılandırma uygulanabilir.
  },
  baseURL: 'https://custom-api-adresi.com',
  headers: {
    'X-Custom-Header': 'custom-value'
  },
  timeout: 60000,
  sweetalert2: false, // SweetAlert2 kullanımını etkinleştirir false ile console hataları gösterir.(varsayılan true)
  // Diğer API ayarları da custom konfig içinde tanımlanabilir.
};

// Custom konfigürasyon ile yeni ApiService örneği oluşturuluyor.
const apiService = new ApiService(customApiConfig);

// Örnek API isteği:
async function fetchData() {
    const response = await apiService.request({
      url: '/data',
      method: 'GET'
    });
    console.log('Veri:', response.data);
}

fetchData();
```
>**Daha detaylı temel bilgiler için [Api Service Kullanım Kılavuzu](https://github.com/RhymeRone/api-form-integrator/wiki/Api-Service-Kullanım-Klavuzu) 'nu ziyaret ediniz.**

### Form Tabanlı API Entegrasyonu Örneği

FormFactory, kullanıcıya form key'e göre tanımlı konfigürasyonu veya
hızlı konfig ayarlarını (quick config) merge edip dinamik olarak form sınıfı üretme yeteneği sağlar.

```javascript
  import { FormFactory } from 'api-form-integrator';
  const customLoginConfig = {
     selector: '#loginForm',
     endpoint: '/login',
     method: 'POST',
     validation: true,
     preventRedirect: true,
     sweetalert2: true,
     tokenName: 'data.auth.access_token',
     fields: {
         email: { rules: ['required', 'email'],
          messages: {
            required: 'Email alanı zorunludur.',
            email: 'Geçerli bir email adresi giriniz.'
          }
         },
         password: { rules: ['required', 'min:6'],
          messages: {
            required: 'Şifre alanı zorunludur.',
            min: 'Şifre en az 6 karakter olmalıdır.' } }
     },
     actions: {
        onSubmit: (formData, config) => {
            // isteğe bağlı verileri işleme
            formData.email = formData.email.toLowerCase();
            config.method = 'POST'; // isteğe bağlı method değişimi
        },
        onSuccess: (response) => { console.log("Giriş başarılı!", response); }, // Başarılı isteklerde çalışacak fonksiyon
        onError: (error) => { console.error("Giriş hatası", error); }, // Hata durumunda çalışacak fonksiyon
        success: {
            redirect: '/dashboard', // Yönlendirme
            message: 'Giriş başarılı!' // Mesaj
        },
        errors: {
          redirect: '/login',
          message: 'Bir hata oluştu',
            401: { message: 'Yetkisiz işlem' } // Hata durumunda çalışacak durum kodu
        }
     }
  };

  document.addEventListener('DOMContentLoaded', () => {
       const LoginForm = new FormFactory().createForm('LOGIN', { baseURL: 'https://custom-api-adresi.com' }, customLoginConfig);
       const loginForm = new LoginForm();
  });

```
>**Daha detaylı temel bilgiler için [Form Factory Kullanım Kılavuzu](https://github.com/RhymeRone/api-form-integrator/wiki/Form-Factory-Kullan%C4%B1m-K%C4%B1lavuzu) 'nu ziyaret ediniz.**

### MergeDeep Özelliği

MergeDeep fonksiyonu, iç içe geçmiş objeleri derinlemesine birleştirme yeteneği sağlar. Özellikle konfigürasyon objelerinin birleştirilmesinde kullanışlıdır.

```javascript
import { MergeDeep } from 'api-form-integrator';
// Varsayılan konfigürasyon (örnek)
const defaultConfig = {
  forms: {
    LOGIN: {
      selector: '#defaultLogin',
      endpoint: '/default-login',
      method: 'POST',
      fields: {
        email: { rules: ['required', 'email'] },
        password: { rules: ['required', 'min:6'] }
      }
    }
  }
};

// Kullanıcının custom konfigürasyonu (örnek)
const customConfig = {
  forms: {
    LOGIN: {
      selector: '#customLogin',
      fields: {
        password: { rules: ['required', 'min:8'] }
      }
    }
  }
};

// MergeDeep ile derinlemesine birleştirme işlemi
// defaultConfig'i customConfig ile derinlemesine birleştirir ve defaultConfig'i günceller.
const mergedConfig = MergeDeep(defaultConfig, customConfig);

// mergedConfig şu şekilde olacaktır:
// {
//   forms: {
//     LOGIN: {
//       selector: '#customLogin',
//       endpoint: '/default-login',
//       method: 'POST',
//       fields: {
//         email: { rules: ['required', 'email'] },
//         password: { rules: ['required', 'min:8'] }
//       }
//     }
//   }
// }
console.log(mergedConfig);
```

>**Daha detaylı temel bilgiler için [Wiki](https://github.com/RhymeRone/api-form-integrator/wiki) 'yi ziyaret ediniz.**

## ❓ SSS

- **Soru:** Neden doğrudan ApiService üzerinden API isteği yapmalıyım?  
  **Cevap:** ApiService, Axios tabanlı altyapısı sayesinde global hata yönetimi, CSRF koruması, token ekleme ve diğer güvenlik özelliklerini otomatik olarak uygulayarak işlerinizi kolaylaştırır.

- **Soru:** CLI aracı ne işe yarar?  
  **Cevap:** `npx create-integrator` komutu, proje konfigürasyonunuzu (integrator.config.js) hızlıca oluşturmanızı sağlar.

- **Soru:** Rate limiting nasıl çalışır?  
  **Cevap:** API isteklerinin sıklığını kontrol etmek için token-bucket veya fixed-window stratejileri kullanılır. İstek limitleri aşıldığında otomatik olarak istekler engellenir.

- **Soru:** Validasyon kuralları nasıl tanımlanır?  
  **Cevap:** Form alanları için validasyon kuralları, fields objesi içinde rules array'i ile tanımlanır. Örneğin: `email: { rules: ['required', 'email'] }`

- **Soru:** CSRF token yönetimi nasıl çalışır?  
  **Cevap:** CSRF token'ları otomatik olarak cookie'den algılanır ve her API isteğine eklenir. Form gönderimlerinde token otomatik olarak yenilenir.

- **Soru:** Özel hata yönetimi nasıl yapılır?  
  **Cevap:** Her form için actions.error objesi altında HTTP durum kodlarına göre özel hata yönetimi tanımlanabilir. Örneğin: `401: { message: 'Oturum süreniz doldu', redirect: '/login' }`

- **Soru:** API entegrasyonunu nasıl özelleştirebilirim?  
  **Cevap:** Konfigürasyon dosyanızdaki ayarları düzenleyerek, callback fonksiyonları ve hata yönetimi seçeneklerini ihtiyaçlarınıza göre özelleştirebilirsiniz.

- **Soru:** Dual Package desteği ne anlama gelir?  
  **Cevap:** Paket, hem CommonJS hem de ES Modules formatında kullanılabilir. Böylece Node.js ve tarayıcı ortamlarında esnek kullanım imkanı sunar.


## 🔧 Sorun Giderme

### Form Bulunamadı Hatası
```javascript
  // Çözüm: Selector'ü kontrol edin
  APP_CONFIG.FORMS.EXAMPLE = {
    selector: '#dogruFormId'
  };
```

### Validasyon Çalışmıyor
```javascript
  // Çözüm: Field isimlerini doğru yazdığınızdan emin olun
  fields: {
    email: { rules: ['required', 'email'] }
  }
```

### API Hatası
```javascript
  // Çözüm: API ayarlarınızı gözden geçirin
  APP_CONFIG.API = {
    baseURL: 'https://dogru-api-adresi.com',
    timeout: 30000
  };
```

## 🧪 Test

```bash
  # Tüm testleri çalıştır
  npm test

  # Belirli bir test dosyasını çalıştır
  npm test -- FormManager.test.js

  # Coverage raporu
  npm run test:coverage
```

## 📄 Lisans

MIT

## 🤝 Katkıda Bulunma

1. Fork edin.
2. Yeni bir feature branch oluşturun (`git checkout -b feature/amazing`).
3. Değişikliklerinizi commit edin (`git commit -m 'feat: harika özellik'`).
4. Branch'inizi push edin (`git push origin feature/amazing`).
5. Pull Request oluşturun.