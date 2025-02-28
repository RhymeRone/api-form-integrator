import { APP_CONFIG } from '../config/default.config.js';
import FormManager from '../managers/FormManager.js';
import mergeDeep from '../utils/mergeDeep.js';
import ApiService from '../services/api.service.js';
import FormFactory from '../core/FormFactory.js';


export default class ApiFormIntegrator {
    static ApiService = ApiService;
    static FormFactory = FormFactory;
    static FormManager = FormManager;
    static MergeDeep = mergeDeep;
    
    constructor(config) {
        // Mevcut APP_CONFIG'i merge et veya override et
        if (config) {
            // Object.assign(APP_CONFIG, config);
            mergeDeep(APP_CONFIG, config); // Yeni: Derinlemesine merge yaparak mevcut konfigürasyonu güncelle
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