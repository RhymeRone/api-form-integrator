// Core modules
import ApiFormIntegrator from './core/ApiFormIntegrator.js';
import FormManager from './managers/FormManager.js';
import config from './config/default.config.js';

// Named exports
export { ApiFormIntegrator, FormManager };
export const {
    APP_CONFIG,
    getFormConfig,
    getApiConfig,
    getUiConfig,
    getValidationMessage,
    getApiErrorConfig
} = config;

// Default export
export default {
    ApiFormIntegrator,
    FormManager,
    ...config
};