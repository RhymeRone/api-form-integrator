// Core modules
import FormManager from './managers/FormManager';
import { 
    APP_CONFIG,
    getFormConfig,
    getApiConfig,
    getUiConfig,
    getValidationMessage,
    getApiErrorConfig
} from './config/default.config';

class ApiFormIntegrator {
    constructor(config) {
        // Mevcut APP_CONFIG'i merge et veya override et
        if (config) {
            Object.assign(APP_CONFIG, config);
        }
        this.formManager = new FormManager();
    }

    initialize() {
        return this.formManager.initialize();
    }

    getForm(formKey) {
        return this.formManager.getForm(formKey);
    }
}

// Mevcut singleton instance'ı koru
const defaultInstance = new ApiFormIntegrator();

// Main exports
export {
    FormManager,
    APP_CONFIG,
    getFormConfig,
    getApiConfig,
    getUiConfig,
    getValidationMessage,
    getApiErrorConfig
};

export default defaultInstance;
export { ApiFormIntegrator };

/*
KULLANIM ÖRNEĞİ:

1. HTML'de formunuzu tanımlayın:
---------------------------------
<form id="loginForm">
    <input type="email" name="email" />
    <input type="password" name="password" />
    <button type="submit">Giriş Yap</button>
</form>

2. JavaScript'te konfigürasyonu yapın:
-------------------------------------
import { FormManager, APP_CONFIG } from 'api-form-integrator';

// Form konfigürasyonlarını tanımlayın
APP_CONFIG.FORMS.LOGIN = {
    selector: '#loginForm',
    endpoint: '/api/login',
    method: 'POST',
    fields: {
        email: {
            rules: ['required', 'email']
        },
        password: {
            rules: ['required', 'min:6']
        }
    },
    actions: {
        success: {
            saveToken: true,
            redirect: '/dashboard'
        }
    }
};

// FormManager'ı başlatın - Tüm formlar otomatik olarak yönetilecek
FormManager.initialize();

// Bu kadar! Artık formunuz:
// - Otomatik validasyon
// - API entegrasyonu
// - Hata yönetimi
// - Token yönetimi
// özelliklerine sahip!
*/