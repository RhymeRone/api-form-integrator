export const APP_CONFIG = {
    FORMS: {
        // LOGIN: {
        //     selector: '#loginForm', // form seçicisi
        //     endpoint: '/login', // endpoint
        //     method: 'POST', // method tipi
        //     preventRedirect: false, // varsayılan olarak true, yönlendirme engellenmez
        //     validation: true, // validasyon kontrolünü aktifleştir
        //     sweetalert2: true, // Sweetalert2 kullanımı
        // tokenKey: 'token', // Token anahtarı (header'da token değeri), tokenName'e göre önceliklidir.
        // tokenName: 'token', // Token adı (localStorage'da token adı, dot notation desteği bulunmaktadır örneğin data.token.tokenName. tokenKey değeri girilirse bu alan gerekli değildir.)
        // -> tokenName ne işe yarar? 
        // -> tokenName değeri girildiğinde, token değeri localStorage'da data.token.tokenName şeklinde saklanır.
        // -> tokenName değeri api yanıtında token ismidir. Yanıtta token ismi verilmişse bu değeri giriniz. 
        // -> Örnek: {"data.token": "1234567890"} şeklinde bir yanıt aldığınızda tokenName değerini "data.token" olarak giriniz.
        // -> tokenKey değeri girildiğinde, token değeri header'da Authorization: Bearer tokenKey değeri şeklinde saklanır.
        // clearToken: true, // İstek sonrası token temizleme, eğer true ise tokenName değeri varsa localStorage'da silinir.
        //     fields: {
        //         email: {
        //             rules: ['required', 'email']
        //         },
        //         password: {
        //             rules: ['required', 'min:6']
        //         }
        //     },
        //     actions: {
        //         onSubmit: (formData) => {
        //             console.log('Form verileri:', formData);
        //         },
        //         onSuccess: (response) => {
        //             console.log('Başarılı:', response);
        //         },
        //         onError: (error) => {
        //             console.log('Hata:', error);
        //         },
        //         success: {
        //             redirect: '/dashboard',
        //             message: 'Giriş başarılı!'
        //         },
        //         errors: {
        //             redirect: '/login',
        //             message: 'Bir hata oluştu',     
        //             400: {
        //                 redirect: '/dashboard',
        //                 message: 'Zaten giriş yapılmış',
        //             },
        //             401: {
        //                 message: 'Email veya şifre hatalı!',
        //             },
        //             422: {
        //                 message: 'Lütfen tüm alanları doldurun',
        //             }
        //         }
        //     }
        // }
    },

    API: {
        baseURL: '/api', // API temel URL'si
        headers: {
            'Content-Type': 'application/json', // İçerik tipi
            'Accept': 'application/json' // Kabul tipi
        },
        timeout: 30000, // Zaman aşımı süresi
        sweetalert2: true, // Sweetalert2 kullanımı
        preventRedirect: false, // Yönlendirme engelleme
     // tokenKey: 'token', // Token anahtarı (header'da token değeri), tokenName'e göre önceliklidir.
        tokenName: 'token', // Token adı (localStorage'da token adı, dot notation desteği bulunmaktadır örneğin data.token.tokenName. tokenKey değeri girilirse bu alan gerekli değildir.)
      // -> tokenName ne işe yarar? 
      // -> tokenName değeri girildiğinde, token değeri localStorage'da data.token.tokenName şeklinde saklanır.
      // -> tokenName değeri api yanıtında token ismidir. Yanıtta token ismi verilmişse bu değeri giriniz. 
      // -> Örnek: {"data.token": "1234567890"} şeklinde bir yanıt aldığınızda tokenName değerini "data.token" olarak giriniz.
      // -> tokenKey değeri girildiğinde, token değeri header'da Authorization: Bearer tokenKey değeri şeklinde saklanır.
        errors: { // Hata durumları
            // redirect: '/', // Hata durumunda yönlendirme
            message: 'Bir hata oluştu', // Hata durumunda mesaj
            401: {
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
        // Yeni: Güvenlik header’ları ayarları
        security: {
            enableSecurityHeaders: true,
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
            position: 'top-end',
            timer: 2000,
            showConfirmButton: false
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

                    return messages[field] || `${field} alanı zorunludur`;
                },
                email: 'Geçerli bir email adresi giriniz',
                min: (field, value) => `${field} alanı en az ${value} karakter olmalıdır`,
                max: (field, value) => `${field} alanı en fazla ${value} karakter olmalıdır`,
            }
        }
    }
};

// Helper fonksiyonlar
export const getFormConfig = (formKey) => APP_CONFIG.FORMS[formKey];
export const getApiConfig = () => APP_CONFIG.API;
export const getUiConfig = () => APP_CONFIG.UI;
export const getValidationMessage = (rule) => APP_CONFIG.UI.validation.messages[rule];
export const getApiErrorConfig = (status) => APP_CONFIG.API.errors[status];

// Default export ve CommonJS uyumluluğu
const configManager = {
    APP_CONFIG,
    getFormConfig,
    getApiConfig,
    getUiConfig,
    getValidationMessage,
    getApiErrorConfig
};

export default configManager;