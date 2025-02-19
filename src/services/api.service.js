import { APP_CONFIG } from '../config/default.config.js';
import Swal from 'sweetalert2';
import axios from 'axios';

const TOKEN_KEY = 'auth_token';

class ApiService {
    constructor() {
        this.axios = axios.create({
            baseURL: APP_CONFIG.API.baseURL,
            headers: APP_CONFIG.API.headers,
            timeout: APP_CONFIG.API.timeout
        });

        this.setupInterceptors();
    }

    setupInterceptors() {
        this.axios.interceptors.request.use(config => {
            const token = localStorage.getItem(TOKEN_KEY);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        this.axios.interceptors.response.use(
            response => response,
            error => {
                const status = error.response?.status;
                const errorConfig = APP_CONFIG.API.errors[status];
                const requestConfig = error.config; // İstek config'ini al

                if (errorConfig) {
                    if (errorConfig.clearToken) {
                        localStorage.removeItem(TOKEN_KEY);
                    }

                    if (errorConfig.message) {
                        Swal.fire({
                            icon: 'error',
                            text: errorConfig.message,
                            ...APP_CONFIG.UI.notifications
                        });
                    }

                    if (errorConfig.redirect && !requestConfig.preventRedirect) {
                        window.location.href = errorConfig.redirect;
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    async request(config) {
        try {
            // preventRedirect varsayılan olarak true
            const requestConfig = {
                ...config,
                preventRedirect: config.preventRedirect ?? true  // Nullish coalescing operator
            };
            
            return await this.axios(requestConfig);
        } catch (error) {
            throw error;
        }
    }

    handleSuccess(response) {
        const { message, token } = response.data;

        // Token gelirse kaydet
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        }

        // Başarı mesajı varsa göster
        if (message) {
            this.showSuccess(message);
        }

        return response;
    }

    handleError(error) {
        const { status, data } = error.response;

        switch (status) {
            case 400:
                this.showWarning(data.message);
                break;
                
            case 401:
                // Token süresi dolmuş veya geçersiz
                localStorage.removeItem(TOKEN_KEY);
                this.showError(data.message || 'Oturum süresi doldu');
                break;

            case 403:
                this.showError(data.message || 'Bu işlem için yetkiniz yok');
                break;

            case 422:
                this.showValidationErrors(data.errors);
                break;

            case 429:
                this.showWarning('Çok fazla istek gönderildi. Lütfen bekleyin.');
                break;

            case 500:
                this.showError('Sunucu hatası oluştu');
                break;

            default:
                this.showError('Bir hata oluştu');
        }

        return Promise.reject(error);
    }

    handleConfigSuccess(config, data) {
        if (config.saveToken && data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
        }

        if (config.clearToken) {
            localStorage.removeItem(TOKEN_KEY);
        }

        if (config.redirect) {
            window.location.href = config.redirect;
        }
    }

    handleConfigError(config, error) {
        if (config.redirect) {
            window.location.href = config.redirect;
        }

        if (config.showValidation) {
            this.showValidationErrors(error.response.data.errors);
        }
    }

    // Utility methods
    showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Başarılı!',
            text: message,
            timer: 2000,
            showConfirmButton: false
        });
    }

    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Hata!',
            text: message
        });
    }

    showWarning(message) {
        Swal.fire({
            icon: 'warning',
            title: 'Uyarı!',
            text: message
        });
    }

    showValidationErrors(errors) {
        // Tüm validasyon hatalarını tek bir SweetAlert'te göster
        const errorMessages = Object.values(errors).flat();
        
        Swal.fire({
            icon: 'error',
            title: 'Validasyon Hatası',
            html: errorMessages.join('<br>')
        });

        // Form alanlarını da işaretle
        Object.keys(errors).forEach(field => {
            const input = document.querySelector(`input[name="${field}"]`);
            if (input) {
                const wrapper = input.closest('.wrap-input100');
                if (wrapper) {
                    wrapper.classList.add('alert-validate');
                }
            }
        });
    }
}

export default new ApiService(); 