// Core modules
import ApiFormIntegrator from './core/ApiFormIntegrator.js';
import FormManager from './managers/FormManager.js';
import configManager from './config/default.config.js';
import ApiService from './services/api.service.js';
import FormFactory from './core/FormFactory.js';
import MergeDeep from './utils/mergeDeep.js';

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
    getIntegrator,
    APP_CONFIG,
    getFormConfig,
    getApiConfig,
    getUiConfig,
    getValidationMessage,
    getApiErrorConfig,
    ApiService,
    FormFactory,
    MergeDeep
};
export default ApiFormIntegrator;