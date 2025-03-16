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
        this.originalValues = {}; // Orijinal değerleri sakla

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

        if (formConfig.getData && formConfig.getData.autoFill) {
            // DOM yüklendikten sonra veri yükleme işlemini başlat
            setTimeout(() => {
                this.loadFormData();
            }, 100);
        }

        if (this.form) {
            this.initializeInputs();
            this.bindEvents();
        }
    }

    initializeInputs() {
        this.form.querySelectorAll('input, select, textarea').forEach(input => {
            this.inputs[input.name] = input;
            input.originalValue = input.value; // orjinal değeri sakla

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
                    this.handleInputChange(input);
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

    handleInputChange(input) {
        // Değer değişmemişse işlem yapma
        if (input.value === input.originalValue) {
            input.classList.remove(this.successClass);
            input.classList.remove(this.errorClass);
            return;
        }

        // Değer değişmişse validasyon yap
        this.validateField(input.name);
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

            return new FormData(this.form);
            /*
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
            return formData;*/
        }
        // Normal JSON nesnesi (mevcut davranış)
        /*
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
        }*/

        else {
            // Form elementlerinden JSON nesnesi oluştur
            const data = {};
            const formElements = this.form.elements;

            // Tüm form elementlerini döngüye al
            for (let i = 0; i < formElements.length; i++) {
                const element = formElements[i];

                // Name attribute'u olmayan elementleri atla
                if (!element.name) continue;

                // Radio butonları sadece checked olanları ekle
                if (element.type === 'radio' && !element.checked) continue;

                // Checkbox'ları sadece checked olanları ekle
                if (element.type === 'checkbox' && !element.checked) continue;

                // Diğer tüm element tiplerini ekle
                data[element.name] = element.value.trim();
            }

            return data;
        }
    }

    setRules(rules) {
        this.rules = rules;
    }

    async validateField(fieldName) {
        const input = this.inputs[fieldName];

        if (!input || input.value === input.originalValue) { // Orijinal değer kontrolü
            if (input) {
                input.classList.remove(this.successClass);
                input.classList.remove(this.errorClass);
            }
            return true;
        }

        // Radio veya checkbox kontrol et
        const isCheckboxOrRadio = input.type === 'checkbox' || input.type === 'radio';
        const isInFormCheckGroup = input.closest('.form-check') !== null;

        // Önce error class'ı temizle ama popup'ı kaldırma
        input.classList.remove(this.errorClass);
        input.classList.remove(this.successClass);
        input.classList.remove('api-form-validation-error');

        // Sadece inline mod için mesaj elementini kaldır
        if (this.errorDisplayMode !== 'pop') {
            // İnput-group içinde mi kontrol et
            const inputGroup = input.closest('.input-group');
            if (inputGroup) {
                // Input-group içindeki tüm invalid-feedback sınıfına sahip elementleri kaldır
                const errorElements = inputGroup.querySelectorAll('.invalid-feedback');
                errorElements.forEach(el => el.remove());
            } else {
                // Normal davranış - input'un hemen yanındaki elementi kontrol et
                const nextElement = input.nextElementSibling;
                if (nextElement && nextElement.className === 'invalid-feedback') {
                    nextElement.remove();
                }
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

        // İnput-group içinde mi kontrol et
        const inputGroup = input.closest('.input-group');
        if (inputGroup) {
            // Input-group'un sonuna ekle
            inputGroup.appendChild(errorElement);
        } else {
            // Normal akış - input'un hemen yanına ekle
            input.parentNode.insertBefore(errorElement, input.nextElementSibling);
        }
    }

    async validateForm() {
        this.validationErrors = {};

        // Tüm inputları temizleyelim
        const allInputs = Object.values(this.inputs);
        allInputs.forEach(input => {
            if (!input) return;

            // Tüm sınıfları kaldır
            input.classList.remove(this.errorClass);
            input.classList.remove(this.successClass);
            input.classList.remove('api-form-validation-error');

            // Inline moddaki hata mesajlarını kaldır
            if (this.errorDisplayMode !== 'pop') {
                // İnput-group içinde mi kontrol et
                const inputGroup = input.closest('.input-group');
                if (inputGroup) {
                    // Input-group içindeki tüm invalid-feedback elementlerini kaldır
                    const errorElements = inputGroup.querySelectorAll('.invalid-feedback');
                    errorElements.forEach(el => el.remove());
                } else {
                    // Normal davranış - input'un yanındaki elementi kontrol et
                    const nextElement = input.nextElementSibling;
                    if (nextElement && nextElement.className === 'invalid-feedback') {
                        nextElement.remove();
                    }
                }
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
        // Boş değer kontrolü - hem normal input hem dosya input için
        if (value === '' || value === null || value === undefined ||
            (this.inputs[fieldName]?.type === 'file' &&
                (!this.inputs[fieldName].files || this.inputs[fieldName].files.length === 0))) {

            if (rule.type === 'nullable') return true;
            if (this.rules[fieldName] && this.rules[fieldName].some(r => r.type === 'nullable')) return true;
            if (rule.type === 'required') return false;
            return true; // Zorunlu değilse ve boşsa diğer kuralları kontrol etme
        }

        switch (rule.type) {
            case 'required':
                // Dosya input kontrolü
                if (this.inputs[fieldName]?.type === 'file') {
                    console.log(`Dosya doğrulama: ${fieldName}`, {
                        files: this.inputs[fieldName].files,
                        filesLength: this.inputs[fieldName].files?.length,
                        value: value
                    });
                    return this.inputs[fieldName].files && this.inputs[fieldName].files.length > 0;
                }
                // Normal değerler için uzunluk kontrolü
                console.log(`Değer doğrulama: ${fieldName}`, {
                    value: value,
                    length: value.length,
                    type: typeof value
                });
                return value.length > 0;
            case 'string':
                // String tipinde olup olmadığını kontrol et
                return typeof value === 'string';
            case 'integer':
                // Tam sayı tipinde olup olmadığını kontrol et
                return Number.isInteger(Number(value));
            case 'size':
                // Değerin tam olarak belirtilen uzunluğa sahip olması gerekir
                return String(value).length === Number(rule.value);
            case 'starts_with':
                // Değerin belirtilen önekle başlayıp başlamadığını kontrol et
                return String(value).startsWith(rule.value);
            case 'between':
                // Değerin belirli aralıkta olup olmadığını kontrol et
                // between:min,max formatında olmalı
                try {
                    const [min, max] = String(rule.value).split(',').map(Number);

                    // Sayısal alan mı yoksa metin alanı mı kontrol et
                    const fieldRules = this.rules[fieldName] || [];
                    const isNumericField = fieldRules.some(r => r.type === 'numeric');

                    if (isNumericField) {
                        const numValue = Number(value);
                        return numValue >= min && numValue <= max;
                    } else {
                        const strLength = String(value).length;
                        return strLength >= min && strLength <= max;
                    }
                } catch (e) {
                    console.error('Between validation error:', e);
                    return false;
                }

            case 'in':
                // Değerin belirtilen değerler arasında olup olmadığını kontrol et
                // in:value1,value2,value3 formatında olmalı
                try {
                    const allowedValues = String(rule.value).split(',');
                    return allowedValues.includes(String(value));
                } catch (e) {
                    console.error('In validation error:', e);
                    return false;
                }

            case 'not_in':
                // Değerin belirtilen değerler arasında olmamasını kontrol et
                // not_in:value1,value2,value3 formatında olmalı
                try {
                    const forbiddenValues = String(rule.value).split(',');
                    return !forbiddenValues.includes(String(value));
                } catch (e) {
                    console.error('Not in validation error:', e);
                    return false;
                }

            case 'same':
                // Değerin başka bir alanla aynı olup olmadığını kontrol et
                try {
                    const otherField = this.inputs[rule.value];
                    if (!otherField) return false;
                    return String(value) === String(otherField.value);
                } catch (e) {
                    console.error('Same validation error:', e);
                    return false;
                }

            case 'different':
                // Değerin başka bir alanla farklı olup olmadığını kontrol et
                try {
                    const otherField = this.inputs[rule.value];
                    if (!otherField) return true; // Diğer alan yoksa farklı kabul et
                    return String(value) !== String(otherField.value);
                } catch (e) {
                    console.error('Different validation error:', e);
                    return false;
                }

            case 'accepted':
                // Değerin kabul edilebilir olup olmadığını kontrol et
                // true, 'yes', 'on', 1 gibi değerler kabul edilir
                return [true, 'true', 'yes', 'on', 1, '1'].includes(value);

            case 'not_accepted':
                // Değerin reddedilmiş olup olmadığını kontrol et (accepted'ın tersi)
                return ![true, 'true', 'yes', 'on', 1, '1'].includes(value);
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

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
            case 'after':
                try {
                    let compareDate;

                    // 1. Başka bir alan değerine referans ise
                    if (this.inputs[rule.value]) {
                        // Eğer referans alınan input boşsa, validasyonu geçerli say
                        if (!this.inputs[rule.value].value.trim()) {
                            return true;
                        }
                        compareDate = new Date(this.inputs[rule.value].value);

                        // Eğer geçersiz bir tarih ise, validasyonu geçerli say
                        if (isNaN(compareDate.getTime())) {
                            return true;
                        }
                    }
                    // 2. "today" ise bugünün tarihi
                    else if (rule.value === 'today') {
                        compareDate = new Date();
                    }
                    // 3. Göreceli tarih ifadesi ise (+1 year, -3 months gibi)
                    else if (rule.value.startsWith('+') || rule.value.startsWith('-')) {
                        const now = new Date();
                        const match = rule.value.match(/([+-])(\d+)\s*(\w+)/);

                        if (match) {
                            const [, sign, amount, unit] = match;
                            const numAmount = parseInt(amount) * (sign === '+' ? 1 : -1);

                            switch (unit.toLowerCase()) {
                                case 'day':
                                case 'days':
                                    now.setDate(now.getDate() + numAmount);
                                    break;
                                case 'month':
                                case 'months':
                                    now.setMonth(now.getMonth() + numAmount);
                                    break;
                                case 'year':
                                case 'years':
                                    now.setFullYear(now.getFullYear() + numAmount);
                                    break;
                            }

                            compareDate = now;
                        } else {
                            compareDate = new Date(rule.value);
                        }
                    }
                    // 4. Normal tarih ifadesi
                    else {
                        compareDate = new Date(rule.value);
                    }

                    const dateValue = new Date(value);

                    // Eğer girilen değer geçersiz bir tarih ise, validasyonu başarısız say
                    if (isNaN(dateValue.getTime())) {
                        return false;
                    }

                    if (rule.type === 'before') {
                        return dateValue < compareDate;
                    } else { // after
                        return dateValue > compareDate;
                    }
                } catch (e) {
                    console.error('Tarih validasyon hatası:', e);
                    return false;
                }

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

            case 'array':
                // Input değeri bir <input type="file" multiple> ise files koleksiyonunu kontrol et
                if (this.inputs[fieldName]?.type === 'file' && this.inputs[fieldName].multiple) {
                    return this.inputs[fieldName].files && this.inputs[fieldName].files.length > 0;
                }
                // Normal veri için Array.isArray kontrolü yap
                return Array.isArray(value) ||
                    (value && typeof value === 'object' && value[Symbol.iterator]) ||
                    (value && typeof value === 'string' && value.startsWith('[') && value.endsWith(']'));

            case 'file':
                // Dosya input kontrolü
                const fileInput = this.inputs[fieldName];
                if (!fileInput || fileInput.type !== 'file') {
                    return false;
                }

                // FileList veya seçilen dosya kontrolü
                return fileInput.files && fileInput.files.length > 0;

            case 'image':
                // Görsel dosya kontrolü
                const imageInput = this.inputs[fieldName];
                if (!imageInput || imageInput.type !== 'file' || !imageInput.files || imageInput.files.length === 0) {
                    return false;
                }

                // Her dosya için mime type kontrolü
                for (let i = 0; i < imageInput.files.length; i++) {
                    const file = imageInput.files[i];
                    const mimeType = file.type;

                    // Kabul edilen görsel mime tipleri
                    const acceptedImageTypes = [
                        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
                        'image/svg+xml', 'image/webp', 'image/bmp', 'image/tiff'
                    ];

                    if (!acceptedImageTypes.includes(mimeType)) {
                        return false;
                    }
                }

                return true;

            case 'mimes':
                // Dosya uzantıları kontrolü
                const mimesInput = this.inputs[fieldName];
                if (!mimesInput || mimesInput.type !== 'file' || !mimesInput.files || mimesInput.files.length === 0) {
                    return false;
                }

                // İzin verilen uzantılar
                const allowedExtensions = rule.value.split(',').map(ext => ext.trim().toLowerCase());

                // Her dosya için uzantı kontrolü
                for (let i = 0; i < mimesInput.files.length; i++) {
                    const file = mimesInput.files[i];
                    const fileName = file.name;
                    const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

                    // MIME tipi kontrolü
                    const fileMimeType = file.type.toLowerCase();
                    const mimeMatch = allowedExtensions.some(ext => {
                        // Doğrudan MIME tipi eşleşmesi
                        if (fileMimeType === ext || fileMimeType === `image/${ext}` || fileMimeType === `application/${ext}`) {
                            return true;
                        }
                        // Uzantı kontrolü
                        return fileExt === ext;
                    });

                    if (!mimeMatch) {
                        return false;
                    }
                }

                return true;

            case 'dimensions':
                // Görsel boyut kontrolü
                const dimensionsInput = this.inputs[fieldName];
                if (!dimensionsInput || dimensionsInput.type !== 'file' || !dimensionsInput.files || dimensionsInput.files.length === 0) {
                    return false;
                }

                // Boyut kurallarını parse et
                // Örnek: min_width=100,max_width=1000,min_height=100,max_height=1000,width=500,height=300,ratio=16/9
                const dimensionRules = {};
                rule.value.split(',').forEach(dimension => {
                    const [key, value] = dimension.split('=');
                    if (key && value) {
                        dimensionRules[key.trim()] = value.trim();
                    }
                });

                // Görsel dosyası için boyut kontrolü
                const file = dimensionsInput.files[0]; // İlk dosyayı kontrol et

                // Görsel boyutlarını kontrol etmek için bir Promise döndür
                // Not: Burada senkron bir fonksiyon içinde asenkron işlem yapıyoruz
                // Bu nedenle kontrol daha karmaşık, gerçek uygulamalarda bir çözüm bulmak gerekir
                return new Promise((resolve) => {
                    const img = new Image();
                    const objectURL = URL.createObjectURL(file);

                    img.onload = function () {
                        URL.revokeObjectURL(objectURL);

                        const width = img.width;
                        const height = img.height;
                        let valid = true;

                        // Minimum genişlik
                        if (dimensionRules.min_width && width < parseInt(dimensionRules.min_width)) {
                            valid = false;
                        }

                        // Maksimum genişlik
                        if (dimensionRules.max_width && width > parseInt(dimensionRules.max_width)) {
                            valid = false;
                        }

                        // Minimum yükseklik
                        if (dimensionRules.min_height && height < parseInt(dimensionRules.min_height)) {
                            valid = false;
                        }

                        // Maksimum yükseklik
                        if (dimensionRules.max_height && height > parseInt(dimensionRules.max_height)) {
                            valid = false;
                        }

                        // Tam genişlik
                        if (dimensionRules.width && width !== parseInt(dimensionRules.width)) {
                            valid = false;
                        }

                        // Tam yükseklik
                        if (dimensionRules.height && height !== parseInt(dimensionRules.height)) {
                            valid = false;
                        }

                        // Oran
                        if (dimensionRules.ratio) {
                            const [ratioWidth, ratioHeight] = dimensionRules.ratio.split('/').map(Number);
                            const imageRatio = width / height;
                            const targetRatio = ratioWidth / ratioHeight;

                            // Küçük bir tolerans değeri (0.01) kullan
                            if (Math.abs(imageRatio - targetRatio) > 0.01) {
                                valid = false;
                            }
                        }

                        resolve(valid);
                    };

                    img.onerror = function () {
                        URL.revokeObjectURL(objectURL);
                        resolve(false);
                    };

                    img.src = objectURL;
                });

            // min case'ini güncelleyin (array desteği için)
            case 'min':
                // Array tipinde mi kontrol et
                const minFieldRules = this.rules[fieldName] || [];
                const isArrayField = minFieldRules.some(r => r.type === 'array');
                const isNumericField = minFieldRules.some(r => r.type === 'numeric');

                if (isArrayField) {
                    // Dosya input için
                    if (this.inputs[fieldName]?.type === 'file') {
                        return this.inputs[fieldName].files && this.inputs[fieldName].files.length >= Number(rule.value);
                    }
                    // Normal array için
                    if (Array.isArray(value)) {
                        return value.length >= Number(rule.value);
                    }
                    // JSON string olarak array
                    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
                        try {
                            const arr = JSON.parse(value);
                            return Array.isArray(arr) && arr.length >= Number(rule.value);
                        } catch {
                            return false;
                        }
                    }
                    return false;
                } else if (isNumericField) {
                    return Number(value) >= Number(rule.value);
                } else {
                    return String(value).length >= Number(rule.value);
                }

            // max case'ini de güncelleyelim (array desteği için)
            case 'max':
                // Array tipinde mi kontrol et
                const maxFieldRules = this.rules[fieldName] || [];
                const isMaxArrayField = maxFieldRules.some(r => r.type === 'array');
                const isMaxNumericField = maxFieldRules.some(r => r.type === 'numeric');

                if (isMaxArrayField) {
                    // Dosya input için
                    if (this.inputs[fieldName]?.type === 'file') {
                        return this.inputs[fieldName].files && this.inputs[fieldName].files.length <= Number(rule.value);
                    }
                    // Normal array için
                    if (Array.isArray(value)) {
                        return value.length <= Number(rule.value);
                    }
                    // JSON string olarak array
                    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
                        try {
                            const arr = JSON.parse(value);
                            return Array.isArray(arr) && arr.length <= Number(rule.value);
                        } catch {
                            return false;
                        }
                    }
                    return false;
                } else if (isMaxNumericField) {
                    return Number(value) <= Number(rule.value);
                } else {
                    return String(value).length <= Number(rule.value);
                }

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

    /****************************** getData için ******************************/
    /**
   * API'den veri yükleyerek form alanlarını doldurur
   * @param {Object} options - İsteğe bağlı parametreler
   * @returns {Promise}
   */
    async loadFormData(options = {}) {
        // getData yapılandırması kontrolü
        const dataConfig = this.formConfig.getData;
        if (!dataConfig) {
            console.warn('Bu form için getData yapılandırması bulunamadı');
            return Promise.reject(new Error('getData yapılandırması bulunamadı'));
        }

        try {
            // Endpoint ve parametreleri işle
            let endpoint = options.endpoint || dataConfig.endpoint;

            // URL parametrelerini değiştir ({id} gibi)
            if (options.params || dataConfig.params) {
                const allParams = { ...(dataConfig.params || {}), ...(options.params || {}) };
                Object.entries(allParams).forEach(([key, value]) => {
                    endpoint = endpoint.replace(new RegExp(`{${key}}`, 'g'), value);
                });
            }

            // API isteği gönder
            const apiService = this.apiService || window.apiService;
            if (!apiService) {
                throw new Error('API servisi bulunamadı');
            }

            const response = await apiService.request({
                url: endpoint,
                method: dataConfig.method || 'GET',
                headers: dataConfig.headers || {},
                params: options.params || dataConfig.params || {},
                disableNotifications: true
            });

            // Yanıt verisini al
            const data = response.data.data || response.data;

            // Verileri form alanlarına doldur
            if (data) {
                this._fillFormWithData(data, dataConfig.mapping || {});
                // 1. Önce options içinde callback'i kontrol et (öncelikli)
                // 2. Yoksa getData yapılandırmasında callback'i kontrol et
                const onSuccessCallback = options.onLoadSuccess || dataConfig.onLoadSuccess;

                if (typeof onSuccessCallback === 'function') {
                    onSuccessCallback(data, this);
                }
            }

            return data;
        } catch (error) {
            console.error('Form verileri yüklenirken hata:', error);
            // Hata callback'ini benzer şekilde kontrol et
            const onErrorCallback = options.onLoadError || dataConfig.onLoadError;

            if (typeof onErrorCallback === 'function') {
                onErrorCallback(error, this);
            }
            throw error;
        }
    }

    /**
     * Form verilerini yükleyip inputlara dağıtır
     * @private
     */
    _fillFormWithData(data, mapping) {

        const useAllFields = mapping['*'] !== undefined;

        // Önce mapping'leri işle
        Object.entries(mapping).forEach(([dataPath, target]) => {
            if (dataPath === '*') return; // Özel anahtar, atla

            const value = this._getNestedValue(data, dataPath);

            // Hedefin bir dizi olup olmadığını kontrol et
            if (Array.isArray(target)) {
                // Dizi elemanlarını tek tek işle
                target.forEach(targetItem => {
                    if (typeof targetItem === 'string') {
                        // String ise (input adı)
                        const input = this.inputs[targetItem];
                        if (input && value !== undefined) {
                            this._setInputValue(input, value);
                        }
                    } else if (typeof targetItem === 'object' && targetItem !== null) {
                        // Obje ise (element konfigürasyonu)
                        this._setElementAttribute(targetItem, value);
                    }
                });
            }
            // Tek bir hedef ise
            else if (typeof target === 'string') {
                const input = this.inputs[target];
                if (input && value !== undefined) {
                    this._setInputValue(input, value);
                }
            } else if (typeof target === 'object' && target !== null) {
                this._setElementAttribute(target, value);
            }
        });

        // * ile otomatik eşleştirme
        if (useAllFields) {
            Object.entries(this.inputs).forEach(([inputName, input]) => {
                // Zaten mapping ile doldurulmamışsa ve submit butonu değilse
                if (!Object.values(mapping).filter(m => typeof m === 'string').includes(inputName) && inputName !== 'submit') {
                    const value = this._getNestedValue(data, inputName);
                    if (value !== undefined) {
                        this._setInputValue(input, value);
                    }
                }
            });
        }

        // Orijinal değerleri güncelle
        this.resetOriginalValues();

        // İlk yükleme için hata ve success mesajlarını kaldır
        Object.values(this.inputs).forEach(input => {
            if (input) {
                input.classList.remove(this.successClass);
                input.classList.remove(this.errorClass);
            }
        });
    }

    /**
     * Element özelliklerini ayarlar
     * @private
     */
    _setElementAttribute(config, value) {
        // Config parametrelerini al
        const { selector, attribute, transform, callback } = config;

        // Değer tanımsızsa işlem yapma
        if (value === undefined) return;

        try {
            // Önce form içinde ara
            let elements = Array.from(this.form.querySelectorAll(selector));

            // Form içinde element bulunamadıysa document genelinde ara
            if (elements.length === 0) {
                elements = Array.from(document.querySelectorAll(selector));
            }

            if (elements.length === 0) {
                console.warn(`Selector ile element bulunamadı: ${selector}`);
                return;
            }

            // Her bulunan element için işlem yap
            elements.forEach(element => {
                // Dönüştürme fonksiyonu varsa kullan
                let finalValue = value;
                if (typeof transform === 'function') {
                    finalValue = transform(value, element);
                }

                // HTML attribute'u ayarla
                if (attribute) {
                    // Özel durumlar
                    if (attribute === 'innerText') {
                        element.innerText = finalValue;
                    } else if (attribute === 'innerHTML') {
                        element.innerHTML = finalValue;
                    } else if (attribute === 'value' && element.tagName === 'INPUT') {
                        element.value = finalValue;
                        // Change event trigger
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                    } else {
                        // Diğer tüm özellikler
                        element.setAttribute(attribute, finalValue);
                    }
                }

                // Ek işlemler için callback fonksiyonu
                if (typeof callback === 'function') {
                    callback(element, value, this.form);
                }
            });
        } catch (error) {
            console.error(`Element özelliği ayarlanırken hata: ${selector}/${attribute}`, error);
        }
    }

    /**
     * Input'un değerini atar
     * @private
     */
    _setInputValue(input, value) {
        if (!input) return;

        // Mevcut değeri sakla
        const oldValue = input.value;
        switch (input.type) {
            case 'checkbox':
                input.checked = Boolean(value);
                break;
            case 'radio':
                // Radio grubu için değer ataması
                const form = input.closest('form');
                if (form) {
                    const radioGroup = form.querySelectorAll(`input[type="radio"][name="${input.name}"]`);
                    radioGroup.forEach(radio => {
                        radio.checked = (radio.value == value);
                    });
                }
                break;
            case 'select-multiple':
                if (Array.isArray(value)) {
                    Array.from(input.options).forEach(option => {
                        option.selected = value.includes(option.value);
                    });
                }
                break;
            case 'file':
                // Dosya inputları için değer ataması yapma
                break;
            default:
                input.value = value !== null && value !== undefined ? value : '';
        }

        // Input değişikliği olayını tetikle

        // Önce orijinal değeri güncelle, sonra event tetikle
        // Bu sayede validateField içindeki kontrol doğru çalışacak
        input.originalValue = input.value;

        // Değer gerçekten değiştiyse change event'i tetikle
        if (oldValue !== input.value) {
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }

    }

    /**
     * Nested obje yolundaki değeri getirir
     * @private
     */
    _getNestedValue(obj, path) {
        return path.split('.').reduce((prev, curr) => {
            // Array indeksi desteği: categories[0].name
            if (curr.includes('[') && curr.includes(']')) {
                const propName = curr.substring(0, curr.indexOf('['));
                const index = parseInt(curr.substring(curr.indexOf('[') + 1, curr.indexOf(']')));
                return prev && prev[propName] && prev[propName][index] !== undefined ?
                    prev[propName][index] : undefined;
            }
            return prev && prev[curr] !== undefined ? prev[curr] : undefined;
        }, obj);
    }

    /**
     * Form alanlarının orijinal değerlerini günceller
     * @returns {this}
     */
    resetOriginalValues() {
        Object.values(this.inputs).forEach(input => {
            if (input) {
                input.originalValue = input.value;
            }
        });
        return this;
    }
    /****************************** getData için ******************************/
}

export default BaseForm; 