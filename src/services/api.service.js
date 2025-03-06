"use strict";
import { APP_CONFIG } from '../config/default.config.js';
import MergeDeep from '../utils/mergeDeep.js';
import Swal from 'sweetalert2';
import axios from 'axios';
import TokenManager from '../managers/TokenManager.js';


export default class ApiService {
    constructor(customConfig = {}) {
        // Varsayılan API konfigürasyonu ile customConfig'i derinlemesine birleştiriyoruz.
        this.apiConfig = MergeDeep(APP_CONFIG.API, customConfig);

        this.axios = axios.create({
            baseURL: this.apiConfig.baseURL,
            headers: this.apiConfig.headers,
            timeout: this.apiConfig.timeout
        });

        this.setupInterceptors();
    }

    setupInterceptors() {
        // İstek Öncesi İşlemler
        this.axios.interceptors.request.use(
            (config) => {
                // Token ekle
                TokenManager.addAuthHeader(config);
                // Rate limiting kontrolü
                if (this.apiConfig.rateLimiting && this.apiConfig.rateLimiting.enabled) {
                    if (!this.checkRateLimit()) {
                        return Promise.reject({ message: 'Rate limit aşıldı' });
                    }
                }
                // Güvenlik header'larını ekle
                if (this.apiConfig.security && this.apiConfig.security.enableSecurityHeaders) {
                    config.headers = { ...this.apiConfig.security.headers, ...config.headers };
                }
                // CSRF token otomatik algılama ve ekleme
                if (this.apiConfig.csrf && this.apiConfig.csrf.autoDetect) {
                    const csrfToken = this.getCookie(this.apiConfig.csrf.cookieName);
                    if (csrfToken) {
                        config.headers[this.apiConfig.csrf.headerName] = csrfToken;
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Yanıt İşlemleri
        this.axios.interceptors.response.use(
            (response) => {
                // Başarı durumunda, başarı yönetimi işlemlerini yapar.
                this.handleSuccess(response);
                return response;
            },
            (error) => {
                // Hata durumunda, hata yönetimi işlemlerini yapar.
                this.handleError(error);
                return Promise.reject(error);
            }
        );
    }

    /**
     * İstekleri gerçekleştiren metottur.
     * Ekstra parametreler (preventRedirect, tokenKey, tokenName, clearToken, setTokenKey, setTokenName) 
     * istek konfigürasyonuna dahil edilir.
     *
     * @param {object} config Axios istek konfigürasyonu
     * @returns {Promise} Axios isteğinin Promise nesnesi
     */
    async request(config) {
        try {
            const requestConfig = {
                ...config,
                // tokenKey: config.tokenKey ?? false,
                // tokenName: config.tokenName ?? false,
                // clearToken: config.clearToken ?? false,
            };
            return await this.axios(requestConfig);
        } catch (error) {
            throw error;
        }
    }

    handleSuccess(response) {

        // onSuccess callback'ini çağırıyoruz. Dönüş değeri false değilse default işlemler yürütülür.
        let onSuccessResult = true;

        if(typeof response.config.actions?.onSuccess === 'function'){
            const result = response.config.actions.onSuccess(response);
            onSuccessResult = result === false ? false : true;
        }

        // Eğer istek konfigürasyonunda onSuccess callback tanımlıysa, çağırıyoruz.
        if (onSuccessResult !== false) {
            TokenManager.processTokenResponse(response.config, response.data);

            // Güvenli erişim için optional chaining kullanıyoruz.
            // Eğer response.data.message tanımlı ise onu, değilse response.config.success?.message kullanılır.
            const successMessage = response.data.message ??
                response.config.actions?.success?.message ??
                this.apiConfig.success?.message ??
                "İstek başarılı bir şekilde gerçekleştirildi.";

            if (successMessage) {
                if ((response.config.sweetalert2 ?? this.apiConfig.sweetalert2 ?? true) === false) {
                    console.log(successMessage);
                } else {
                    this.showSuccess(successMessage);
                }
            }

            let preventRedirect = response.config.actions?.success?.preventRedirect ?? response.config.preventRedirect 
            ?? this.apiConfig.actions?.success?.preventRedirect ?? this.apiConfig.preventRedirect ?? false;
            let redirect = response.config.actions?.success?.redirect ?? this.apiConfig.success?.redirect ?? false;
            // Eğer başarı durumunda yönlendirme (redirect) tanımlıysa ve istek redirect'i engellenmemişse yönlendiriyoruz.
            if (redirect && !preventRedirect) {
                setTimeout(() => {
                    window.location.href = redirect;
                }, APP_CONFIG.UI?.notifications?.timer ?? 2000);
            }
        }

        return response;
    }

    /**
     * Global hata yönetimi:
     * default.config.js'teki APP_CONFIG.API.errors tanımlamalarını kullanarak
     * hata durumunda token temizleme, mesaj gösterme ve yönlendirme işlemlerini gerçekleştirir.
     */
    handleError(error) {

        // Hata durumunda, hata yönetimi işlemlerini yapar.
        const { status, data } = error.response || {};
        const errorConfig = this.apiConfig.errors?.[status] || {};
        const requestConfig = error.response?.config || {};

        // onError callback'ini çağırıyoruz. Dönüş değeri false değilse default işlemler yürütülür.
        let onErrorResult = true;

        if(typeof requestConfig.actions?.onError === 'function'){
            const result = requestConfig.actions.onError(error);
            onErrorResult = result === false ? false : true;
        }

        if (onErrorResult !== false) {

            // Yanıt geldiğinde, token kaydetme veya temizleme işlemini yapar.
            if (requestConfig) {
                TokenManager.processTokenResponse(requestConfig, data);
            }

            // Konfigürasyonda tanımlı hata mesajı varsa onu kullanıyoruz.
            const errorMessage = requestConfig.actions?.errors?.[status]?.message ??
                requestConfig.actions?.errors?.message ??
                errorConfig?.message ??
                this.apiConfig.errors?.message;
            const errorStatus = error.response?.status;

            // Eğer sweetalert2 kullanılmıyorsa konsola loglama yapılıyor; aksi halde uyarı gösteriliyor.
            if ((requestConfig.sweetalert2 ?? this.apiConfig.sweetalert2 ?? true) === false) {
                if (errorMessage) {
                    console.log(errorMessage + ' ' + errorStatus);
                } else {
                    switch (status) {
                        case 400:
                            console.warn(data?.message || 'Bad Request ' + errorStatus);
                            break;
                        case 401:
                            localStorage.removeItem(this.apiConfig.tokenName);
                            console.error(data?.message || 'Oturum süresi doldu ' + errorStatus);
                            break;
                        case 403:
                            console.error(data?.message || 'Bu işlem için yetkiniz yok ' + errorStatus);
                            break;
                        case 422:
                            console.error('Validasyon Hataları: ' + errorStatus);
                            if (data?.errors) {
                                console.group('Alan Bazlı Hatalar:');
                                // Her bir alanın adını ve hata mesajlarını düzenli şekilde göster
                                Object.entries(data.errors).forEach(([field, messages]) => {
                                    console.error(`🔴 ${field} alanı:`);
                                    if (Array.isArray(messages)) {
                                        messages.forEach(message => {
                                            console.error(`   → ${message}`);
                                        });
                                    } else {
                                        console.error(`   → ${messages}`);
                                    }
                                });
                                console.groupEnd();
                            }
                            break;
                        case 429:
                            console.warn('Çok fazla istek gönderildi. Lütfen bekleyin. ' + errorStatus);
                            break;
                        case 500:
                            console.error('Sunucu hatası oluştu ' + errorStatus);
                            break;
                        default:
                            console.error('Bir hata oluştu');
                    }
                }
            } else {
                if (errorMessage) {
                    Swal.fire({
                        icon: 'error',
                        title: errorStatus,
                        text: errorMessage,
                        ...APP_CONFIG.UI?.notifications ?? {}
                    });
                } else {
                    switch (status) {
                        case 400:
                            this.showWarning(data?.message || 'Bad Request ' + errorStatus);
                            break;
                        case 401:
                            localStorage.removeItem(this.apiConfig.tokenName);
                            this.showError(data?.message || 'Oturum süresi doldu ' + errorStatus);
                            break;
                        case 403:
                            this.showError(data?.message || 'Bu işlem için yetkiniz yok ' + errorStatus);
                            break;
                        case 422:
                            this.showValidationErrors(data?.errors);
                            break;
                        case 429:
                            this.showWarning('Çok fazla istek gönderildi. Lütfen bekleyin.');
                            break;
                        case 500:
                            this.showError('Sunucu hatası oluştu ' + errorStatus);
                            break;
                        default:
                            this.showError('Bir hata oluştu ' + errorStatus);
                    }
                }
            }

            let preventRedirect = requestConfig.actions?.errors?.preventRedirect ?? requestConfig.preventRedirect ?? 
            this.apiConfig.actions?.errors?.preventRedirect ?? this.apiConfig.preventRedirect ?? false; 
            let redirect = requestConfig.actions?.errors?.[status]?.redirect ?? requestConfig.actions?.errors?.redirect 
            ?? this.apiConfig.errors?.[status]?.redirect ?? this.apiConfig.errors?.redirect ?? false;
            
            // Eğer hata durumunda yönlendirme (redirect) tanımlıysa ve istek redirect'i engellenmemişse yönlendiriyoruz.
            if (redirect && !preventRedirect) {
                setTimeout(() => {
                    window.location.href = redirect;
                }, APP_CONFIG.UI?.notifications?.timer ?? 2000);
            } 
        }

        return error;
    }


    getCookie(name) {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    /**
     * Rate limiting kontrolü:
     * Eğer APP_CONFIG.API.rateLimiting.enabled true ise,
     * stratejiye göre; 'token-bucket' veya 'fixed-window' algoritmasını uygular.
     */
    checkRateLimit() {
        if (this.apiConfig.rateLimiting && this.apiConfig.rateLimiting.enabled) {
            if (this.apiConfig.rateLimiting.strategy === 'token-bucket') {
                if (!this.tokenBucket) {
                    this.tokenBucket = {
                        tokens: this.apiConfig.rateLimiting.limits.perMinute,
                        lastRefill: Date.now()
                    };
                }
                const now = Date.now();
                const refillInterval = 60000; // 1 dakika
                const elapsed = now - this.tokenBucket.lastRefill;
                if (elapsed > refillInterval) {
                    this.tokenBucket.tokens = this.apiConfig.rateLimiting.limits.perMinute;
                    this.tokenBucket.lastRefill = now;
                }
                if (this.tokenBucket.tokens > 0) {
                    this.tokenBucket.tokens--;
                    return true;
                }
                return false;
            } else if (this.apiConfig.rateLimiting.strategy === 'fixed-window') {
                if (!this.fixedWindow) {
                    this.fixedWindow = {
                        count: 0,
                        windowStart: Date.now()
                    };
                }
                const now = Date.now();
                const fixedWindowDuration = 60000; // 1 dakika
                if (now - this.fixedWindow.windowStart > fixedWindowDuration) {
                    this.fixedWindow.count = 0;
                    this.fixedWindow.windowStart = now;
                }
                if (this.fixedWindow.count < this.apiConfig.rateLimiting.limits.perMinute) {
                    this.fixedWindow.count++;
                    return true;
                }
                return false;
            }
            return true;
        }
        return true;
    }

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
        const errorMessages = Object.values(errors || {}).flat();
        Swal.fire({
            icon: 'error',
            title: 'Validasyon Hatası',
            html: errorMessages.join('<br>')
        });

        Object.keys(errors || {}).forEach(field => {
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