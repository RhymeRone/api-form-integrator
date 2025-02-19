import { APP_CONFIG } from '../config/default.config.js';
import FormManager from '../managers/FormManager.js';

export default class ApiFormIntegrator {
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
export const defaultInstance = new ApiFormIntegrator(); 