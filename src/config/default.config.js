export const APP_CONFIG = {
    FORMS: {
        // LOGIN: {
        //     selector: '#loginForm', // form seçicisi
        //     endpoint: '/login', // endpoint
        //     method: 'POST', // method tipi
        //     preventRedirect: true, // varsayılan olarak true
        //     fields: {
        //         email: {
        //             rules: ['required', 'email']
        //         },
        //         password: {
        //             rules: ['required', 'min:6']
        //         }
        //     },
        //     actions: {
        //         success: {
        //             saveToken: true,
        //             redirect: '/dashboard',
        //             message: 'Giriş başarılı!'
        //         },
        //         error: {
        //             400: {
        //                 message: 'Zaten giriş yapılmış',
        //                 redirect: '/dashboard'
        //             },
        //             401: {
        //                 message: 'Email veya şifre hatalı!',
        //             },
        //             422: {
        //                 message: 'Lütfen tüm alanları doldurun',
        //                 showValidation: true
        //             }
        //         }
        //     }
        // }
    },

    API: {
        baseURL: '/api',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        timeout: 30000,
        errors: {
            401: {
                redirect: '/login',
                clearToken: true
            },
            500: {
                message: 'Sistem hatası oluştu'
            }
        }
    },

    UI: {
        notifications: {
            position: 'top-end',
            timer: 3000,
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

// Yeni helper fonksiyonlar
export const getValidationMessage = (rule) => APP_CONFIG.UI.validation.messages[rule];
export const getApiErrorConfig = (status) => APP_CONFIG.API.errors[status]; 