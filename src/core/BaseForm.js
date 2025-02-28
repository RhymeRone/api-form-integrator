import { getUiConfig } from '../config/default.config.js';

class BaseForm {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        this.inputs = {};
        this.rules = {};
        this.validationErrors = {};
        this.uiConfig = getUiConfig();
        this.fileInputsLastFiles = new Map(); // Dosya inputları için son seçilen dosyaları sakla
        
        if (this.form) {
            this.initializeInputs();
            this.bindEvents();
        }
    }

    // initializeInputs() {
    //     this.form.querySelectorAll('input, select, textarea').forEach(input => {
    //         this.inputs[input.name] = input;

    //         input.addEventListener('input', () => {
    //             this.validateField(input.name);
    //         });
    //     });
    // }
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
                // Diğer input tipleri için normal event listener
                input.addEventListener('input', () => {
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

    getFormData() {
        const data = {};
        Object.entries(this.inputs).forEach(([name, input]) => {
            data[name] = input.value.trim();
        });
        return data;
    }

    setRules(rules) {
        this.rules = rules;
    }

    async validateField(fieldName) {
        const input = this.inputs[fieldName];
        if (!input) return true; // Alan bulunamadıysa geç

        const value = input.value.trim();
        const rules = this.rules[fieldName];

        if (!rules || !Array.isArray(rules) || rules.length === 0) return true;

        // Önce nullable kontrolü yap
        const isNullable = rules.some(rule => rule.type === 'nullable');
        if (isNullable && (value === '' || value === null || value === undefined)) {
            delete this.validationErrors[fieldName];
            return true;
        }

        // Tüm kuralları kontrol et
        for (const rule of rules) {
            if (!await this.validateRule(rule, value, fieldName)) {
                this.validationErrors[fieldName] = rule.message;

                // Hata sınıfını ekle
                if (this.uiConfig.validation.errorClass) {
                    input.classList.add(this.uiConfig.validation.errorClass);
                }

                return false;
            }
        }

        // Başarılı validasyon
        delete this.validationErrors[fieldName];

        // Başarı sınıfını ekle
        if (this.uiConfig.validation.successClass) {
            input.classList.add(this.uiConfig.validation.successClass);
        }

        // Hata sınıfını kaldır
        if (this.uiConfig.validation.errorClass) {
            input.classList.remove(this.uiConfig.validation.errorClass);
        }

        return true;
    }
    // async validateForm() {
    //     this.validationErrors = {};
        
    //     // Tüm alanları kontrol et
    //     for (const fieldName of Object.keys(this.rules)) {
    //         // Her alan için validateField metodunu çağır
    //         await this.validateField(fieldName);
    //     }
        
    //     // Validasyon hatası yoksa null döndür, varsa hataları döndür
    //     return Object.keys(this.validationErrors).length > 0 ? this.validationErrors : null;
    // }
    async validateForm() {
        this.validationErrors = {};

        // Tüm alanları kontrol et
        for (const fieldName of Object.keys(this.rules)) {
            const input = this.inputs[fieldName];
            if (!input) continue;

            const value = input.value !== undefined ? input.value.trim() : '';
            const rules = this.rules[fieldName];

            // Required kuralını kontrol et
            const requiredRule = rules.find(rule => rule.type === 'required');
            if (requiredRule && (value === '' || value === null || value === undefined)) {
                this.validationErrors[fieldName] = requiredRule.message;

                // Hata sınıfını ekle
                if (this.uiConfig.validation.errorClass) {
                    input.classList.add(this.uiConfig.validation.errorClass);
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

                            // Hata sınıfını ekle
                            if (this.uiConfig.validation.errorClass) {
                                input.classList.add(this.uiConfig.validation.errorClass);
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

                            // Hata sınıfını ekle
                            if (this.uiConfig.validation.errorClass) {
                                input.classList.add(this.uiConfig.validation.errorClass);
                            }

                            break; // Bu alan için diğer kuralları kontrol etme
                        }
                    }
                }
            }
        }

        // Validasyon hatası yoksa null döndür, varsa hataları döndür
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