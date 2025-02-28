import { APP_CONFIG } from '../config/default.config.js';
import BaseForm from '../core/BaseForm.js';
import ApiService from '../services/api.service.js';
import Swal from 'sweetalert2';
import MergeDeep from '../utils/mergeDeep.js';

/**
 * FormFactory, kullanıcıya form key'e göre tanımlı konfigürasyonu veya
 * hızlı konfig ayarlarını (quick config) merge edip dinamik olarak form sınıfı üretme yeteneği sağlar.
 *
 * Örnek Kullanım:
 *   import FormFactory from 'api-form-integrator';
 *
 *   const LoginForm = new FormFactory().createForm('LOGIN', {
 *      selector: '#loginForm',
 *      endpoint: '/login',
 *      method: 'POST',
 *      fields: {
 *          email: { rules: ['required', 'email'] },
 *          password: { rules: ['required', 'min:6'] }
 *      },
 *      actions: {
 *          onSubmit: (formData) => {
 *              // isteğe bağlı verileri işleme
 *              return formData;
 *          },
 *          onSuccess: (response) => { console.log("Giriş başarılı!", response); },
 *          onError: (error) => { console.error("Giriş hatası", error); },
 *          success: {
 *              saveToken: true,
 *              redirect: '/dashboard',
 *              message: 'Giriş başarılı!'
 *          },
 *          error: {
 *              401: { message: 'Yetkisiz işlem', redirect: '/login', clearToken: true }
 *          }
 *      }
 *   });
 *
 *   document.addEventListener('DOMContentLoaded', () => {
 *       const loginForm = new LoginForm();
 *       loginForm.init();
 *   });
 */

export default class FormFactory {
    /**
     * Form sınıfı oluşturur
     * @param {string} formKey - Form anahtarı (örn: 'LOGIN')
     * @param {Object} apiConfig - API servis konfigürasyonu
     * @param {Object} customConfig - Özel form konfigürasyonu
     * @returns {Class} - Oluşturulan form sınıfı
     * @throws {Error} - Form konfigürasyonu bulunamazsa hata fırlatır
     * 
     * @example
     * // Form oluşturma örneği:
     * const LoginForm = new FormFactory().createForm('LOGIN', {
     *   selector: '#loginForm',
     *   endpoint: '/login',
     *   method: 'POST'
     * });
     */
    createForm(formKey, apiConfig = {}, customConfig = {}) {
        // BASE CONFIG'i doğru şekilde APP_CONFIG'den al
        const baseConfig = (APP_CONFIG.FORMS && APP_CONFIG.FORMS[formKey]) || {};

        // MergeDeep ile config'leri birleştir
        const config = MergeDeep(baseConfig, customConfig);

        if (!config.selector) {
            throw new Error(`Form key "${formKey}" için geçerli bir konfigürasyon bulunamadı. Lütfen gerekli ayarları girin (örneğin, selector, endpoint vs.).`);
        }

        return class DynamicForm extends BaseForm {
            constructor() {
                // BaseForm'a sadece selector'ü gönder
                super(config.selector);
                this.formKey = formKey;
                this.config = config;
                this.apiConfig = apiConfig;
                this.setRules(this.prepareRules());
            }

            // prepareRules() {
            //     const rules = {};
            //     if (this.config.fields) {
            //         Object.entries(this.config.fields).forEach(([field, fieldConfig]) => {
            //             rules[field] = fieldConfig.rules.map(rule => {
            //                 const [type, value] = rule.includes(':') ? rule.split(':') : [rule, null];
            //                 return {
            //                     type,
            //                     value,
            //                     message: typeof APP_CONFIG.UI.validation.messages[type] === 'function'
            //                         ? APP_CONFIG.UI.validation.messages[type](field, value)
            //                         : APP_CONFIG.UI.validation.messages[type] || `${field} alanı için ${type} kuralı uygulanamadı.`
            //                 };
            //             });
            //         });
            //     }
            //     return rules;
            // }
            prepareRules() {
                const rules = {};
                if (this.config.fields) {
                    Object.entries(this.config.fields).forEach(([field, fieldConfig]) => {
                        if (!fieldConfig.rules || !Array.isArray(fieldConfig.rules)) {
                            return; // Kurallar tanımlanmamışsa atla
                        }

                        rules[field] = fieldConfig.rules.map(rule => {
                            // Kural formatını parse et (örn: 'min:3', 'required', 'regex:/pattern/')
                            let type, value;

                            if (rule.includes(':')) {
                                const parts = rule.split(':');
                                type = parts[0];
                                value = parts.slice(1).join(':'); // regex için : karakteri içerebilir
                            } else {
                                type = rule;
                                value = null;
                            }

                            // Alan bazlı özel mesajları kontrol et
                            let message;

                            // 1. Önce alan için özel tanımlanmış mesajları kontrol et
                            if (fieldConfig.messages && fieldConfig.messages[type]) {
                                message = fieldConfig.messages[type];
                            }
                            // 2. Genel validasyon mesajlarını kontrol et
                            else if (typeof APP_CONFIG.UI.validation.messages[type] === 'function') {
                                message = APP_CONFIG.UI.validation.messages[type](field, value);
                            }
                            // 3. Sabit mesajları kontrol et
                            else {
                                message = APP_CONFIG.UI.validation.messages[type] || `${field} alanı için ${type} kuralı uygulanamadı.`;
                            }

                            return {
                                type,
                                value,
                                message
                            };
                        });
                    });
                }
                return rules;
            }


            async handleSubmit(e) {
                e.preventDefault();

                // Form verisi al
                const formData = this.getFormData();

                // Validasyon kontrolü
                if (this.config.validation ?? true) {
                    const validationErrors = await this.validateForm();
                    if (validationErrors) {
                        this.showValidationErrors(validationErrors);
                        return false;
                    }
                }

                // onSubmit callback
                if (this.config.actions?.onSubmit && typeof this.config.actions.onSubmit === 'function') {
                    let modifiedData = this.config.actions.onSubmit(formData);
                    if (modifiedData !== undefined) {
                        formData = modifiedData;
                    }
                }

                try {
                    // Endpoint ve method varsa isteği gönder
                    if (this.config.endpoint && this.config.method) {
                        const apiService = new ApiService(this.apiConfig);

                        // config'i isteğe ekle
                        await apiService.request({
                            url: this.config.endpoint,
                            method: this.config.method,
                            data: formData,
                            ...this.config
                        });
                    }
                } catch (error) {
                    throw error;
                }
            }
            /*
                        showValidationErrors(errors) {
                            Object.entries(errors).forEach(([field, messages]) => {
                                const input = this.inputs && this.inputs[field];
                                if (input) {
                                    input.classList.add(APP_CONFIG.UI.validation.errorClass);
            
                                    if ((this.config.sweetalert2 ?? APP_CONFIG.API.sweetalert2 ?? true) === false) {
                                        console.error(`Validation Hata [${field}]:`, messages[0]);
                                    } else {
                                        Swal.fire({
                                            icon: 'error',
                                            text: messages[0],
                                            ...APP_CONFIG.UI.notifications
                                        });
                                    }
                                }
                            });
                        }*/

            showValidationErrors(errors) {
                if (!errors || Object.keys(errors).length === 0) return false;

                // Hata mesajlarını topla
                const errorMessages = [];

                Object.entries(errors).forEach(([field, message]) => {
                    // Sadece mesajı ekle, alan adını ekleme
                    errorMessages.push(message);

                    // Form alanına hata sınıfı ekle
                    const input = document.querySelector(`[name="${field}"]`);
                    if (input) {
                        input.classList.add(APP_CONFIG.UI.validation.errorClass || 'is-invalid');

                        // Hata mesajını göster (opsiyonel)
                        const errorElement = document.createElement('div');
                        errorElement.className = 'invalid-feedback';
                        errorElement.textContent = message;

                        // Eğer zaten bir hata mesajı varsa, onu güncelle
                        const existingError = input.nextElementSibling;
                        if (existingError && existingError.className === 'invalid-feedback') {
                            existingError.textContent = message;
                        } else {
                            input.parentNode.insertBefore(errorElement, input.nextElementSibling);
                        }
                    }
                });

                // SweetAlert2 ile hataları göster
                if ((this.config.sweetalert2 ?? APP_CONFIG.API.sweetalert2 ?? true) !== false) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Form Hataları',
                        html: errorMessages.join('<br>'),
                        ...APP_CONFIG.UI.notifications
                    });
                } else {
                    console.error('Validasyon Hataları:', errors);
                }

                return true;
            }
        }
    }
} 