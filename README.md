# API Form Integrator

Form yönetimi ve API entegrasyonunu kolaylaştıran, validasyon ve hata yönetimi özelliklerine sahip JavaScript kütüphanesi.

## 📑 İçindekiler
- [Özellikler](#-özellikler)
- [Kurulum](#-kurulum)
- [Hızlı Başlangıç](#-hızlı-başlangıç)
- [Detaylı Kullanım](#-detaylı-kullanım)
- [Konfigürasyon](#-konfigürasyon)
- [Validasyon](#-validasyon)
- [API Entegrasyonu](#-api-entegrasyonu)
- [Hata Yönetimi](#-hata-yönetimi)
- [Örnekler](#-örnekler)
- [SSS](#-sık-sorulan-sorular)
- [Sorun Giderme](#-sorun-giderme)

## 🚀 Özellikler

### Form Yönetimi
- 📝 Otomatik form yakalama ve yönetim
- ✨ Kolay konfigürasyon
- 🔄 Event yönetimi
- 📊 Form veri işleme

### Validasyon
- ✅ Yerleşik validasyon kuralları (required, email, min, max)
- 💬 Global özelleştirilebilir hata mesajları
- 🔍 Gerçek zamanlı validasyon

### API Entegrasyonu
- 🌐 Otomatik API istekleri
- 🔒 JWT token yönetimi
- ⏱️ Timeout yönetimi

### UI Özellikleri
- 🎨 SweetAlert2 entegrasyonu
- 💫 Yükleme animasyonları
- 🚦 Form durumu göstergeleri

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
<script src="https://cdn.jsdelivr.net/npm/api-form-integrator@latest/dist/index.js"></script>
```

## 🚀 Hızlı Başlangıç

### 1. Paketi yükleyin:
   ```bash
   npm install api-form-integrator
   ```

### 2. Konfigürasyon dosyasını oluşturun:
  ```bash
   npx create-integrator
   ```
### 3. `integrator.config.js` dosyasını projenize import edin:

  ```javascript
   import ApiFormIntegrator from 'api-form-integrator';
   // Örneğin, resources/js/app.js içinden:
   import integratorConfig from './config/integrator.config';

   // SweetAlert varsayılan ayarları (opsiyonel)
   Swal.defaultOptions = integratorConfig.UI.notifications;

   const integrator = new ApiFormIntegrator(integratorConfig);
   integrator.initialize();
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

## 📚 Detaylı Kullanım

### Form Tipleri

#### 1. Basit Form
Temel veri gönderimi için kullanılır.
  ```javascript
  APP_CONFIG.FORMS.SIMPLE = {
    selector: '#simpleForm',
    endpoint: '/api/data',
    method: 'POST'
  };
  ```

#### 2. Validasyonlu Form
Veri doğrulama kuralları ile kullanılır.
  ```javascript
  APP_CONFIG.FORMS.VALIDATED = {
    selector: '#validatedForm',
    endpoint: '/api/data',
    method: 'POST',
    fields: {
      name: {
        rules: ['required', 'min:3']
      },
      email: {
        rules: ['required', 'email']
      }
    }
  };
  ```

## ⚙️ Konfigürasyon Detayları

### API Konfigürasyonu
  ```javascript
  APP_CONFIG.API = {
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-TOKEN': 'token'
    },
    timeout: 30000
  };
  ```

### Validasyon Kuralları
  ```javascript
  fields: {
    username: {
      rules: [
        'required',
        'min:3'
      ]
    }
  }
  ```

## 🔧 Sorun Giderme

### Sık Karşılaşılan Hatalar

1. **Form Bulunamadı Hatası**
  ```javascript
  // Çözüm: Selector'ü kontrol edin
  APP_CONFIG.FORMS.EXAMPLE = {
    selector: '#dogruFormId' // Form ID'sini doğru yazdığınızdan emin olun
  };
  ```

2. **Validasyon Çalışmıyor**
  ```javascript
  // Çözüm: Field isimlerini kontrol edin
  fields: {
    email: { // input name="email" ile eşleşmeli
      rules: ['required', 'email']
    }
  }
  ```

3. **API Hatası**
  ```javascript
  // Çözüm: API ayarlarını kontrol edin
  APP_CONFIG.API = {
    baseURL: 'https://dogru-api-adresi.com',
    timeout: 30000
  };
  ```

## 📝 Best Practices

1. **Form İsimlendirmesi**
  ```javascript
  // İyi
  APP_CONFIG.FORMS.USER_REGISTER = { ... }

  // Kaçının
  APP_CONFIG.FORMS.form1 = { ... }
  ```

2. **Error Handling**
  ```javascript
  // İyi
  actions: {
    error: {
      401: { message: 'Oturum süreniz doldu' },
      422: { message: 'Validasyon hatası' }
    }
  }

  // Kaçının
  actions: {
    error: {
      all: { message: 'Bir hata oluştu' }
    }
  }
  ```

## 📖 Konfigürasyon Parametreleri Referansı

### Form Konfigürasyonu (APP_CONFIG.FORMS)
  ```javascript
  {
    selector: '#formId',       // Form elementinin CSS seçicisi (zorunlu)
    endpoint: '/api/path',     // API endpoint'i (zorunlu)
    method: 'POST',           // HTTP metodu (GET, POST, PUT, DELETE, PATCH)
    preventRedirect: true,    // Otomatik yönlendirmeyi engeller
    
    // Form alanları ve validasyon kuralları
    fields: {
      fieldName: {
        rules: ['required', 'email', 'min:6'] // Validasyon kuralları
      }
    },
    
    // Form aksiyonları
    actions: {
      // Başarılı işlem aksiyonları
      success: {
        saveToken: true,          // JWT token'ı localStorage'a kaydet
        redirect: '/path',        // 
        message: 'Başarılı!',     // Başarı mesajı
        callback: () => {}        // Özel callback fonksiyonu
      },
      
      // Hata durumu aksiyonları (HTTP status code'a göre)
      error: {
        400: {
          message: 'Hata mesajı',    // Hata mesajı
          redirect: '/path',         // Hata durumunda yönlendir
          showValidation: true       // Validasyon hatalarını göster
        }
      }
    }
  }
  ```

### API Konfigürasyonu (APP_CONFIG.API)
  ```javascript
  {
    baseURL: '/api',          // API'nin temel URL'i
    
    // Varsayılan HTTP başlıkları
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    
    timeout: 30000,          // İstek zaman aşımı (ms)
    
    // Genel API hata yönetimi
    errors: {
      401: {
        redirect: '/login',    // Yetkilendirme hatası yönlendirmesi
        clearToken: true       // Token'ı temizle
      },
      500: {
        message: 'Sistem hatası'  // Sunucu hatası mesajı
      }
    }
  }
  ```

### UI Konfigürasyonu (APP_CONFIG.UI)
  ```javascript
  {
    // SweetAlert2 bildirim ayarları
    notifications: {
      position: 'top-end',         // Bildirim pozisyonu
      timer: 3000,                 // Otomatik kapanma süresi (ms)
      showConfirmButton: false     // Onay butonu gösterimi
    },
    
    // Validasyon görünüm ayarları
    validation: {
      showErrors: true,            // Hata mesajlarını göster
      errorClass: 'is-invalid',    // Hata CSS sınıfı
      successClass: 'is-valid',    // Başarı CSS sınıfı
      
      // Validasyon mesajları
      messages: {
        // Zorunlu alan mesajları (field parametresi ile)
        required: (field) => {
          const messages = {
            email: 'Email adresi zorunludur',
            password: 'Şifre zorunludur',
            name: 'İsim alanı zorunludur',
            message: 'Mesaj alanı zorunludur',
            phone: 'Telefon numarası zorunludur',
          };
          
          return messages[field] || `${field} alanı zorunludur`;
        },
        
        // Diğer validasyon mesajları
        email: 'Geçerli bir email adresi giriniz',
        min: (field, value) => `${field} alanı en az ${value} karakter olmalıdır',
        max: (field, value) => `${field} alanı en fazla ${value} karakter olmalıdır'
      }
    }
  }
  ```

### Helper Fonksiyonlar
  ```javascript
  // Form konfigürasyonunu al
  getFormConfig(formKey: string) => object
  
  // API konfigürasyonunu al
  getApiConfig() => object
  
  // UI konfigürasyonunu al
  getUiConfig() => object
  
  // Validasyon mesajını al
  getValidationMessage(rule: string) => string|function
  
  // API hata konfigürasyonunu al
  getApiErrorConfig(status: number) => object
  ```

### Önemli Notlar

1. **Form Konfigürasyonu**
   - `selector` ve `endpoint` zorunlu alanlardır
   - `method` belirtilmezse varsayılan olarak 'POST' kullanılır
   - `preventRedirect` varsayılan olarak true'dur

2. **Validasyon Kuralları**
   - `required`: Zorunlu alan
   - `email`: Email format kontrolü
   - `min:value`: Minimum karakter/değer kontrolü
   - `max:value`: Maksimum karakter/değer kontrolü

3. **API Ayarları**
   - `baseURL` tüm isteklere otomatik eklenir
   - `timeout` tüm istekler için geçerlidir
   - `headers` her istekte gönderilir

4. **UI Ayarları**
   - SweetAlert2 entegrasyonu otomatiktir
   - Validasyon mesajları özelleştirilebilir
   - CSS sınıfları Bootstrap uyumludur

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

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: harika özellik'`)
4. Branch'inizi push edin (`git push origin feature/amazing`)
5. Pull Request oluşturun