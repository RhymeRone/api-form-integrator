import { getUiConfig, getFormConfig } from '../config/default.config.js';

class BaseForm {
    constructor(formSelector, formConfig = {}) {
        this.form = document.querySelector(formSelector);
        this.formConfig = formConfig;
        this.inputs = {};
        this.rules = {};
        this.validationErrors = {};
        this.uiConfig = getUiConfig();
        this.fileInputsLastFiles = new Map(); // Dosya inputları için son seçilen dosyaları sakla

        // Form bazında showErrors kontrolü
        this.showErrors = this.formConfig?.validationOptions?.showErrors ?? this.uiConfig?.validation?.showErrors ?? true;
        //console.log(this.showErrors, 'ShowErrors BaseForm constructor');

        // Özel CSS sınıflarını ve renklerini tanımla
        this.errorClass = this.formConfig?.validationOptions?.errorClass ?? this.uiConfig.validation.errorClass;
        this.successClass = this.formConfig?.validationOptions?.successClass ?? this.uiConfig.validation.successClass;
        this.errorColor = this.formConfig?.validationOptions?.errorColor ?? this.uiConfig.validation.errorColor;
        this.errorDisplayMode = this.formConfig?.validationOptions?.errorDisplayMode ?? this.uiConfig.validation.errorDisplayMode ?? 'inline';

        // Pop modu için CSS ve gereken stiller - eskisini sil
        if (this.errorDisplayMode === 'pop') {
            // Global stil ekle (sadece ortak stiller için)
            if (!document.getElementById('api-form-pop-base-style')) {
                const styleElement = document.createElement('style');
                styleElement.id = 'api-form-pop-base-style';

                // errorColor kullanarak popup rengini belirle
                const popupBgColor = this.errorColor || '#dc3545';

                styleElement.textContent = `
                    .api-form-error-popup {
                        position: absolute;
                        background-color: ${popupBgColor};
                        color: white;
                        padding: 8px 12px;
                        border-radius: 4px;
                        font-size: 13px;
                        line-height: 1.2;
                        z-index: 999; /* SweetAlert'ın z-index'inden daha düşük */
                        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                        max-width: 250px;
                        width: auto;
                        text-align: left;
                        pointer-events: none;
                        opacity: 0;
                        visibility: hidden;
                        transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
                        transform: translateY(10px);
                    }
                    
                    .api-form-error-popup.show {
                        opacity: 1;
                        visibility: visible;
                        transform: translateY(0);
                    }
                    
                    .api-form-error-popup::after {
                        content: '';
                        position: absolute;
                        bottom: -6px;
                        left: 10px;
                        border-left: 6px solid transparent;
                        border-right: 6px solid transparent;
                        border-top: 6px solid ${popupBgColor};
                    }
                    
                    /* Hata ve başarı sınıfları için özel stillemeler */
                    .${this.errorClass} {
                        /* ErrorClass'ın pop modunda nasıl görüneceği */
                        border-color: ${popupBgColor} !important;
                    }
                    
                    /* api-form-validation-error sınıfı artık hata durumlarında kullanılabilir */
                    .api-form-validation-error {
                        /* İhtiyaca göre burada ekstra stil eklenebilir */
                    }
                `;
                document.head.appendChild(styleElement);

                // Ekran boyutu değiştiğinde popup pozisyonlarını güncelle
                window.addEventListener('resize', () => {
                    // Tüm mevcut popup'ları bul
                    const popups = document.querySelectorAll('.api-form-error-popup');

                    // Her popup için ilgili input'u bul ve konumu güncelle
                    popups.forEach(popup => {
                        // Popup ID'sinden alan adını çıkar (error-popup-{fieldName})
                        const fieldName = popup.id.replace('error-popup-', '');
                        const input = document.querySelector(`[name="${fieldName}"]`);

                        if (input) {
                            // Input pozisyonunu al ve popup'u konumlandır
                            const inputRect = input.getBoundingClientRect();
                            popup.style.position = 'fixed';
                            popup.style.top = (inputRect.top - popup.offsetHeight - 10) + 'px';
                            popup.style.left = inputRect.left + 'px';
                        }
                    });
                });
            }
        }

        // Global success stili ekle (hem pop hem inline modlar için)
        if (!document.getElementById('api-form-success-style')) {
            const successStyleElement = document.createElement('style');
            successStyleElement.id = 'api-form-success-style';
            successStyleElement.textContent = `
                .${this.successClass} {
                    border-color: #28a745 !important;
                    padding-right: calc(1.5em + 0.75rem) !important;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e") !important;
                    background-repeat: no-repeat !important;
                    background-position: right calc(0.375em + 0.1875rem) center !important;
                    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem) !important;
                }
                
                .${this.successClass}:focus {
                    border-color: #28a745 !important;
                    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25) !important;
                }
                
                /* Checkbox ve radio butonların hiçbir zaman success veya error class almamasını sağla */
                input[type="checkbox"].${this.successClass},
                input[type="radio"].${this.successClass},
                input[type="checkbox"].${this.errorClass},
                input[type="radio"].${this.errorClass} {
                    border-color: inherit !important;
                    background-image: none !important;
                    padding-right: inherit !important;
                    box-shadow: none !important;
                    background-color: transparent !important;
                }
                
                /* Form-check sınıfı içindeki inputlara özel stil */
                .form-check input.${this.successClass},
                .form-check input.${this.errorClass} {
                    border-color: inherit !important;
                    background-image: none !important;
                    padding-right: inherit !important;
                    box-shadow: none !important;
                    background-color: transparent !important;
                }
            `;
            document.head.appendChild(successStyleElement);
        }

        if (this.form) {
            this.initializeInputs();
            this.bindEvents();
        }
    }

    initializeInputs() {
        this.form.querySelectorAll('input, select, textarea').forEach(input => {
            this.inputs[input.name] = input;

            // Dosya inputları için özel işlem
            if (input.type === 'file') {
                // Dosya inputu için son seçilen dosyaları saklamak için bir Map kullan
                this.fileInputsLastFiles.set(input.name, null);

                input.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        // Yeni dosya(lar) seçildi, bunları sakla
                        const fileList = Array.from(e.target.files);
                        this.fileInputsLastFiles.set(input.name, fileList);
                    } else {
                        // Dosya seçimi iptal edildi, önceki dosyaları geri yükle
                        const lastFiles = this.fileInputsLastFiles.get(input.name);

                        if (lastFiles && lastFiles.length > 0) {
                            try {
                                // DataTransfer API kullanarak yeni bir FileList oluştur
                                const dt = new DataTransfer();
                                lastFiles.forEach(file => dt.items.add(file));

                                // FileList'i input'a ata
                                e.target.files = dt.files;

                                // Değişikliği bildirmek için bir event tetikle
                                const event = new Event('change', { bubbles: true });
                                e.target.dispatchEvent(event);
                            } catch (error) {
                                console.warn('Dosya geri yükleme hatası:', error);
                            }
                        }
                    }

                    // Normal validasyon işlemini çağır
                    this.validateField(input.name);
                });
            } else {
                // Diğer input tipleri için normal event listener'lar
                input.addEventListener('input', () => {
                    this.validateField(input.name);
                });

                // Ayrıca change ve blur olaylarını da dinleyelim
                input.addEventListener('change', () => {
                    this.validateField(input.name);
                });

                input.addEventListener('blur', () => {
                    this.validateField(input.name);
                });
            }
        });
    }
    bindEvents() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            this.handleSubmit(e);
        });
        this.form.addEventListener('reset', () => {
            // Tüm dosya inputları için saklanan dosyaları temizle
            this.fileInputsLastFiles.clear();
        });
    }

    // getFormData() {
    //     const data = {};
    //     Object.entries(this.inputs).forEach(([name, input]) => {
    //         data[name] = input.value.trim();
    //     });
    //     return data;
    // }
    /**
 * Form verilerini toplar ve döndürür
 * @param {boolean} useFormData - Dosya yüklemesi için FormData kullanılsın mı?
 * @return {Object|FormData} - Form verileri
 */
    getFormData(useFormData) {

        if (Object.keys(this.inputs).length === 0) {
            return useFormData ? new FormData() : {};
        }
        // Form içinde dosya alanı var mı kontrol et
        const hasFileInputs = Object.values(this.inputs).some(input =>
            input.type === 'file' && input.files && input.files.length > 0
        );

        // Dosya varsa veya açıkça isteniyorsa FormData kullan
        if (hasFileInputs || useFormData === true) {
            const formData = new FormData();

            Object.entries(this.inputs).forEach(([name, input]) => {
                // Dosya input'ları için
                if (input.type === 'file' && input.files && input.files.length > 0) {
                    formData.append(name, input.files[0]);
                }
                // Checkbox ve radio için
                else if ((input.type === 'checkbox' || input.type === 'radio') && !input.checked) {
                    // Seçili olmayan checkbox/radio için değer ekleme
                    return;
                }
                // Diğer tüm input tipleri için
                else {
                    formData.append(name, input.value.trim());
                }
            });

            return formData;
        }
        // Normal JSON nesnesi (mevcut davranış)
        else {
            const data = {};
            Object.entries(this.inputs).forEach(([name, input]) => {
                // Checkbox ve radio kontrolü
                if ((input.type === 'checkbox' || input.type === 'radio') && !input.checked) {
                    return;
                }
                data[name] = input.value.trim();
            });
            return data;
        }
    }

    setRules(rules) {
        this.rules = rules;
    }

    async validateField(fieldName) {
        const input = this.inputs[fieldName];
        if (!input) return true;

        // Radio veya checkbox kontrol et
        const isCheckboxOrRadio = input.type === 'checkbox' || input.type === 'radio';
        const isInFormCheckGroup = input.closest('.form-check') !== null;

        // Önce error class'ı temizle ama popup'ı kaldırma
        input.classList.remove(this.errorClass);
        input.classList.remove(this.successClass);
        input.classList.remove('api-form-validation-error');

        // Sadece inline mod için mesaj elementini kaldır
        if (this.errorDisplayMode !== 'pop') {
            const nextElement = input.nextElementSibling;
            if (nextElement && nextElement.className === 'invalid-feedback') {
                nextElement.remove();
            }
        }

        const value = input.value !== undefined ? input.value.trim() : '';
        const rules = this.rules[fieldName];
        if (!rules) return true;

        // Required kuralını kontrol et
        const requiredRule = rules.find(rule => rule.type === 'required');
        if (requiredRule && (value === '' || value === null || value === undefined)) {
            this.validationErrors[fieldName] = requiredRule.message;

            // Hata sınıfını ekle (eğer showErrors true ise ve checkbox/radio değilse)
            if (this.showErrors && this.errorClass && !isCheckboxOrRadio) {
                input.classList.add(this.errorClass);

                // Pop modunda hata gösterimi
                if (this.errorDisplayMode === 'pop') {
                    input.classList.add('api-form-validation-error');
                    this._showPopupError(input, fieldName, requiredRule.message);
                } else {
                    // Inline modda hata mesajı ekleme
                    this._showInlineError(input, requiredRule.message);
                }
            }

            return false;
        }

        // Nullable kontrolü
        const isNullable = rules.some(rule => rule.type === 'nullable');
        if (isNullable && (value === '' || value === null || value === undefined)) {
            delete this.validationErrors[fieldName];
            return true;
        }

        // Boş değilse diğer kuralları kontrol et
        if (value !== '' && value !== null && value !== undefined) {
            // Regex kuralını önce kontrol et
            const regexRule = rules.find(rule => rule.type === 'regex');
            if (regexRule) {
                try {
                    let regex;
                    if (typeof regexRule.value === 'string' && regexRule.value.startsWith('/')) {
                        const regexParts = regexRule.value.match(/^\/(.*?)\/([gimsuy]*)$/);
                        if (regexParts) {
                            const [, pattern, flags] = regexParts;
                            regex = new RegExp(pattern, flags);
                        }
                    }

                    if (regex && !regex.test(value)) {
                        this.validationErrors[fieldName] = regexRule.message;

                        // Hata sınıfını ekle (eğer showErrors true ise ve checkbox/radio değilse)
                        if (this.showErrors && this.errorClass && !isCheckboxOrRadio) {
                            input.classList.add(this.errorClass);

                            if (this.errorDisplayMode === 'pop') {
                                input.classList.add('api-form-validation-error');
                                this._showPopupError(input, fieldName, regexRule.message);
                            } else {
                                // Inline mod
                                this._showInlineError(input, regexRule.message);
                            }
                        }

                        return false;
                    }
                } catch (e) {
                    console.error('Regex validation error:', e);
                }
            }

            // Diğer kuralları kontrol et
            for (const rule of rules) {
                if (rule.type !== 'required' && rule.type !== 'nullable' && rule.type !== 'regex') {
                    if (!await this.validateRule(rule, value, fieldName)) {
                        this.validationErrors[fieldName] = rule.message;

                        // Hata sınıfını ekle (eğer showErrors true ise ve checkbox/radio değilse)
                        if (this.showErrors && this.errorClass && !isCheckboxOrRadio) {
                            input.classList.add(this.errorClass);

                            if (this.errorDisplayMode === 'pop') {
                                input.classList.add('api-form-validation-error');
                                this._showPopupError(input, fieldName, rule.message);
                            } else {
                                // Inline mod
                                this._showInlineError(input, rule.message);
                            }
                        }

                        return false;
                    }
                }
            }
        }

        // Validasyon başarılı, gerekirse success sınıfını ekle
        delete this.validationErrors[fieldName];

        // Pop modunda success class'ı ekleme, inline modda ekle
        // Ayrıca checkbox ve radio butonlar için de ekleme
        if (this.showErrors && this.successClass && this.errorDisplayMode !== 'pop' && !isCheckboxOrRadio && !isInFormCheckGroup) {
            input.classList.add(this.successClass);
        }

        // Validasyon başarılı olunca popup'ı tamamen DOM'dan kaldır
        if (this.errorDisplayMode === 'pop') {
            const popup = document.getElementById(`error-popup-${fieldName}`);
            if (popup) {
                popup.remove(); // DOM'dan tamamen kaldır
            }
        }

        return true;
    }

    // Popup hata mesajı gösterme için yardımcı metod
    _showPopupError(input, fieldName, message) {
        // Mevcut popup'ı kontrol et
        let popup = document.getElementById(`error-popup-${fieldName}`);

        if (!popup) {
            // Popup yoksa yeni oluştur
            popup = document.createElement('div');
            popup.id = `error-popup-${fieldName}`;
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

            // Event listener'ları ekle
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

        // İlk gösterim için kısa gecikme
        setTimeout(() => {
            if (!document.querySelector('.swal2-container') && input.classList.contains(this.errorClass)) {
                popup.classList.add('show');
            }
        }, 100);
    }

    // Inline hata mesajı gösterme için yardımcı metod
    _showInlineError(input, message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback';
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        if (this.errorColor) {
            errorElement.style.color = this.errorColor;
        }

        input.parentNode.insertBefore(errorElement, input.nextElementSibling);
    }

    async validateForm() {
        this.validationErrors = {};

        // Tüm inputları temizleyelim
        const allInputs = Object.values(this.inputs);
        allInputs.forEach(input => {
            if (!input) return;

            // Radio veya checkbox kontrol et
            const isCheckboxOrRadio = input.type === 'checkbox' || input.type === 'radio';

            // Tüm sınıfları kaldır
            input.classList.remove(this.errorClass);
            input.classList.remove(this.successClass);
            input.classList.remove('api-form-validation-error');

            // Inline moddaki hata mesajlarını kaldır
            const errorElement = input.nextElementSibling;
            if (errorElement && errorElement.className === 'invalid-feedback') {
                errorElement.remove();
            }

            // Pop modundaki popup'ları tamamen kaldır
            if (this.errorDisplayMode === 'pop' && input.name) {
                const popup = document.getElementById(`error-popup-${input.name}`);
                if (popup) {
                    popup.remove(); // DOM'dan tamamen kaldır
                }
            }
        });

        // Tüm alanları kontrol et
        for (const fieldName of Object.keys(this.rules)) {
            const input = this.inputs[fieldName];
            if (!input) continue;

            // Radio veya checkbox kontrol et
            const isCheckboxOrRadio = input.type === 'checkbox' || input.type === 'radio';
            const isInFormCheckGroup = input.closest('.form-check') !== null;

            const value = input.value !== undefined ? input.value.trim() : '';
            const rules = this.rules[fieldName];

            // Required kuralını kontrol et
            const requiredRule = rules.find(rule => rule.type === 'required');
            if (requiredRule && (value === '' || value === null || value === undefined)) {
                this.validationErrors[fieldName] = requiredRule.message;

                // Hata sınıfını ekle (eğer showErrors true ise ve checkbox/radio değilse)
                if (this.showErrors && this.errorClass && !isCheckboxOrRadio) {
                    input.classList.add(this.errorClass);

                    // Pop modunda hata gösterimi
                    if (this.errorDisplayMode === 'pop') {
                        input.classList.add('api-form-validation-error');
                        this._showPopupError(input, fieldName, requiredRule.message);
                    } else {
                        // Inline modda hata mesajı ekleme
                        this._showInlineError(input, requiredRule.message);
                    }
                }

                continue; // Diğer kuralları kontrol etme
            }

            // Nullable kontrolü
            const isNullable = rules.some(rule => rule.type === 'nullable');
            if (isNullable && (value === '' || value === null || value === undefined)) {
                continue; // Diğer kuralları kontrol etme
            }

            // Boş değilse diğer kuralları kontrol et
            if (value !== '' && value !== null && value !== undefined) {
                // Regex kuralını önce kontrol et
                const regexRule = rules.find(rule => rule.type === 'regex');
                if (regexRule) {
                    try {
                        let regex;
                        if (typeof regexRule.value === 'string' && regexRule.value.startsWith('/')) {
                            const regexParts = regexRule.value.match(/^\/(.*?)\/([gimsuy]*)$/);
                            if (regexParts) {
                                const [, pattern, flags] = regexParts;
                                regex = new RegExp(pattern, flags);
                            }
                        }

                        if (regex && !regex.test(value)) {
                            this.validationErrors[fieldName] = regexRule.message;

                            // Hata gösterimi (checkbox/radio kontrolü ekle)
                            if (this.showErrors && this.errorClass && !isCheckboxOrRadio) {
                                input.classList.add(this.errorClass);

                                if (this.errorDisplayMode === 'pop') {
                                    input.classList.add('api-form-validation-error');
                                    this._showPopupError(input, fieldName, regexRule.message);
                                } else {
                                    // Inline mod
                                    this._showInlineError(input, regexRule.message);
                                }
                            }

                            continue; // Diğer kuralları kontrol etme
                        }
                    } catch (e) {
                        console.error('Regex validation error:', e);
                    }
                }

                // Diğer kuralları kontrol et
                for (const rule of rules) {
                    if (rule.type !== 'required' && rule.type !== 'nullable' && rule.type !== 'regex') {
                        if (!await this.validateRule(rule, value, fieldName)) {
                            this.validationErrors[fieldName] = rule.message;

                            // Hata gösterimi (checkbox/radio kontrolü ekle)
                            if (this.showErrors && this.errorClass && !isCheckboxOrRadio) {
                                input.classList.add(this.errorClass);

                                if (this.errorDisplayMode === 'pop') {
                                    input.classList.add('api-form-validation-error');
                                    this._showPopupError(input, fieldName, rule.message);
                                } else {
                                    // Inline mod
                                    this._showInlineError(input, rule.message);
                                }
                            }

                            break; // Bu alan için diğer kuralları kontrol etme
                        }
                    }
                }
            }
        }

        // Başarılı alanları işaretle - success class için kontrolü güçlendir
        for (const fieldName of Object.keys(this.rules)) {
            const input = this.inputs[fieldName];
            if (!input) continue;

            // Radio veya checkbox kontrol et
            const isCheckboxOrRadio = input.type === 'checkbox' || input.type === 'radio';
            const isInFormCheckGroup = input.closest('.form-check') !== null;

            // Eğer bu alan için hata yoksa ve success class ekleme koşulları sağlanıyorsa
            if (!this.validationErrors[fieldName] && this.showErrors && this.successClass) {
                // Hem pop modunda hem de radio/checkbox için success class ekleme
                if (this.errorDisplayMode !== 'pop' && !isCheckboxOrRadio && !isInFormCheckGroup) {
                    input.classList.add(this.successClass);
                }
            }
        }

        return Object.keys(this.validationErrors).length > 0 ? this.validationErrors : null;
    }

    async validateRule(rule, value, fieldName) {
        // Boş değer kontrolü
        if (value === '' || value === null || value === undefined) {
            if (rule.type === 'nullable') return true;
            if (this.rules[fieldName] && this.rules[fieldName].some(r => r.type === 'nullable')) return true;
            if (rule.type === 'required') return false;
            return true; // Zorunlu değilse ve boşsa diğer kuralları kontrol etme
        }

        switch (rule.type) {
            case 'required':
                return value.length > 0;

            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

            case 'min':
                // Sayısal alan mı yoksa metin alanı mı kontrol et
                const fieldRules = this.rules[fieldName] || [];
                const isNumericField = fieldRules.some(r => r.type === 'numeric');

                if (isNumericField) {
                    return Number(value) >= Number(rule.value);
                } else {
                    return String(value).length >= Number(rule.value);
                }

            case 'max':
                // Sayısal alan mı yoksa metin alanı mı kontrol et
                const maxFieldRules = this.rules[fieldName] || [];
                const isMaxNumericField = maxFieldRules.some(r => r.type === 'numeric');

                if (isMaxNumericField) {
                    return Number(value) <= Number(rule.value);
                } else {
                    return String(value).length <= Number(rule.value);
                }

            case 'numeric':
                return /^[0-9]+$/.test(value);

            case 'boolean':
                return value === true || value === false || value === 'true' || value === 'false' || value === 1 || value === 0 || value === '1' || value === '0';

            case 'url':
                try {
                    new URL(value.startsWith('http') ? value : `http://${value}`);
                    return true;
                } catch (e) {
                    return false;
                }

            case 'date':
                return !isNaN(Date.parse(value));

            case 'before':
                const beforeDate = rule.value === 'today' ? new Date() : new Date(rule.value);
                return new Date(value) < beforeDate;

            case 'after':
                const afterDate = rule.value === 'today' ? new Date() : new Date(rule.value);
                return new Date(value) > afterDate;

            case 'regex':
                try {
                    // Regex formatını kontrol et: /pattern/flags
                    let regex;
                    if (typeof rule.value === 'string' && rule.value.startsWith('/')) {
                        const regexParts = rule.value.match(/^\/(.*?)\/([gimsuy]*)$/);
                        if (regexParts) {
                            const [, pattern, flags] = regexParts;
                            regex = new RegExp(pattern, flags);
                        } else {
                            console.error('Invalid regex format:', rule.value);
                            return false;
                        }
                    } else if (rule.value instanceof RegExp) {
                        regex = rule.value;
                    } else {
                        console.error('Invalid regex value:', rule.value);
                        return false;
                    }

                    return regex.test(value);
                } catch (e) {
                    console.error('Regex validation error:', e);
                    return false;
                }

            case 'nullable':
                return true;

            case 'file':
            case 'image':
            case 'mimes':
            case 'dimensions':
                // Dosya validasyonları için şimdilik true döndür
                // Gerçek uygulamada bu kurallar için özel kontroller yapılmalı
                return true;

            default:
                return true;
        }
    }

    reset() {
        this.form.reset();
        this.validationErrors = {};
    }

    async handleSubmit(e) {
        e.preventDefault();
        // Alt sınıflar bu metodu override edecek
    }
}

export default BaseForm; 