// Core modules
import ApiFormIntegrator from './core/ApiFormIntegrator.js';
import FormManager from './managers/FormManager.js';
import configManager from './config/default.config.js';

// Singleton instance
let instance = null;
function getIntegrator(config) { // <-- export keyword kaldırıldı
    if (!instance) {
        instance = new ApiFormIntegrator(config);
    }
    return instance;
}

// Config destructuring
const { 
    APP_CONFIG,
    getFormConfig,
    getApiConfig,
    getUiConfig,
    getValidationMessage,
    getApiErrorConfig
} = configManager;

// Tekil export bloğu
export {
    ApiFormIntegrator,
    FormManager,
    getIntegrator, // <-- sadece burada export ediliyor
    APP_CONFIG,
    getFormConfig,
    getApiConfig,
    getUiConfig,
    getValidationMessage,
    getApiErrorConfig
};