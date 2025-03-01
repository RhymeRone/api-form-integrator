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
                super(config.selector, config);
                this.formKey = formKey;
                this.config = config;
                this.apiConfig = apiConfig;
                this.setRules(this.prepareRules());
            }
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

            showValidationErrors(errors) {
                if (!errors || Object.keys(errors).length === 0) return false;
                // Hata mesajlarını topla - bu her zaman yapılacak
                const errorMessages = [];
                
                // Tüm hata mesajlarını topla (showErrors değerinden bağımsız)
                Object.entries(errors).forEach(([field, message]) => {
                    // Hata mesajlarını her zaman topla
                    errorMessages.push(message);
                });

                // Hata gösterim modunu al
                const errorDisplayMode = this.config?.validationOptions?.errorDisplayMode ?? APP_CONFIG.UI.validation.errorDisplayMode ?? 'inline';
                
                // DOM manipülasyonu sadece this.showErrors true ise yapılacak
                // Not: this.showErrors değişkeni BaseForm'dan gelir ve form konfigürasyonuna göre belirlenir
                if (this.showErrors) {
                    // Tüm input alanlarını bul
                    const allInputs = Object.values(this.inputs);
                    
                    // Önce tüm hata ve başarı sınıflarını temizle
                    allInputs.forEach(input => {
                        if (input) {
                            input.classList.remove(this.errorClass);
                            input.classList.remove(this.successClass);
                            
                            // Inputun yanındaki hata mesajı elementini kaldır (inline mod kullanıldıysa)
                            const errorElement = input.nextElementSibling;
                            if (errorElement && errorElement.className === 'invalid-feedback') {
                                errorElement.remove();
                            }
                        }
                    });
                    
                    // DOM'a hata göstergelerini ekle (showErrors true ise)
                    Object.entries(errors).forEach(([field, message]) => {
                        // Form alanına hata sınıfı ekle
                        const input = document.querySelector(`[name="${field}"]`);
                        if (input) {
                            // Radio veya checkbox kontrol et
                            const isCheckboxOrRadio = input.type === 'checkbox' || input.type === 'radio';
                            
                            // Hata sınıfını ekle (checkbox/radio değilse)
                            if (!isCheckboxOrRadio) {
                                input.classList.add(this.errorClass);
                            }
                            
                            // Hata gösterim moduna göre işlem yap
                            if (errorDisplayMode === 'pop') {
                                // Önce mevcut hata göstergesini temizle
                                const existingError = input.nextElementSibling;
                                if (existingError && existingError.className === 'invalid-feedback') {
                                    existingError.remove();
                                }
                                
                                if (!isCheckboxOrRadio) {
                                    // DOM tabanlı popup yaklaşımı - sadece checkbox/radio değilse
                                    input.classList.add('api-form-validation-error');
                                    
                                    // Mevcut popup'ı kontrol et
                                    let popup = document.getElementById(`error-popup-${field}`);
                                    if (!popup) {
                                        // Popup yoksa yeni oluştur
                                        popup = document.createElement('div');
                                        popup.id = `error-popup-${field}`;
                                        popup.className = 'api-form-error-popup';
                                        document.body.appendChild(popup);
                                        
                                        // Event listener'ları ekle
                                        const hidePopup = () => popup.classList.remove('show');
                                        const showPopup = () => {
                                            // SweetAlert açıksa görünme
                                            if (document.querySelector('.swal2-container')) {
                                                return;
                                            }
                                            // Eğer input valid ise popup'ı gösterme
                                            if (!input.classList.contains(this.errorClass)) {
                                                return;
                                            }
                                            popup.classList.add('show');
                                        };
                                        
                                        // Sadece gerekli event'leri ekle
                                        input.addEventListener('mouseenter', showPopup);
                                        input.addEventListener('mouseleave', hidePopup);
                                        input.addEventListener('focus', showPopup);
                                        input.addEventListener('blur', hidePopup);
                                    }
                                    
                                    // Popup içeriğini ve konumunu güncelle
                                    popup.textContent = message;
                                    
                                    // errorColor kullanarak popup rengini güncelle
                                    if (this.errorColor) {
                                        popup.style.backgroundColor = this.errorColor;
                                        // Ok rengini de güncelle
                                        const afterStyle = `
                                            #${popup.id}::after {
                                                border-top-color: ${this.errorColor} !important;
                                            }
                                        `;
                                        // Mevcut stil varsa güncelle, yoksa ekle
                                        let styleEl = document.getElementById(`${popup.id}-style`);
                                        if (!styleEl) {
                                            styleEl = document.createElement('style');
                                            styleEl.id = `${popup.id}-style`;
                                            document.head.appendChild(styleEl);
                                        }
                                        styleEl.textContent = afterStyle;
                                    }
                                    
                                    const inputRect = input.getBoundingClientRect();
                                    popup.style.position = 'fixed';
                                    popup.style.top = (inputRect.top - popup.offsetHeight - 10) + 'px';
                                    popup.style.left = inputRect.left + 'px';
                                    
                                    // Popup'ı göster (SweetAlert yoksa)
                                    if (!document.querySelector('.swal2-container')) {
                                        setTimeout(() => popup.classList.add('show'), 200);
                                    }
                                    
                                    // Hata durumunda inputa hafif bir animasyon ekle
                                    input.animate([
                                        { transform: 'translateX(-3px)' },
                                        { transform: 'translateX(3px)' },
                                        { transform: 'translateX(-3px)' },
                                        { transform: 'translateX(0)' }
                                    ], {
                                        duration: 200,
                                        iterations: 1
                                    });
                                }
                            } else {
                                // Inline modda - DOM'a hata mesajı elementi ekle
                                const errorElement = document.createElement('div');
                                errorElement.className = 'invalid-feedback';
                                errorElement.textContent = message;
                                errorElement.style.display = 'block'; // Görünürlüğü güvence altına al
                                
                                // Metin rengini ayarla
                                if (this.errorColor) {
                                    errorElement.style.color = this.errorColor;
                                }
                                
                                input.parentNode.insertBefore(errorElement, input.nextElementSibling);
                            }
                        }
                    });
                    
                    // Başarılı alanlar için başarı sınıfını ekle
                    allInputs.forEach(input => {
                        if (input && input.name && !errors[input.name]) {
                            // Checkbox veya radio butonlarını kontrol et
                            const isCheckboxOrRadio = input.type === 'checkbox' || input.type === 'radio';
                            const isInFormCheckGroup = input.closest('.form-check') !== null;
                            
                            // Hata sınıfını kaldır
                            input.classList.remove(this.errorClass);
                            
                            // Success class'ı sadece pop modunda değilse ve checkbox/radio değilse ekle
                            if (errorDisplayMode !== 'pop' && !isCheckboxOrRadio && !isInFormCheckGroup) {
                                input.classList.add(this.successClass);
                            }
                        }
                    });
                }

                // SweetAlert2 ile hataları göster (showErrors değerine bakılmaksızın)
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