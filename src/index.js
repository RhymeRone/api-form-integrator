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

