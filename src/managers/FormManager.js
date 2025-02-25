import { APP_CONFIG } from '../config/default.config.js';
import FormFactory from '../core/FormFactory.js';

export default class FormManager {
    
    constructor() {
        this.forms = new Map();
    }

    initialize() {
        const factoryInstance = new FormFactory();
        Object.keys(APP_CONFIG.FORMS).forEach(formKey => {
            const config = APP_CONFIG.FORMS[formKey];
            if (document.querySelector(config.selector)) {
                const DynamicForm = factoryInstance.createForm(formKey, {}, config);
                this.forms.set(formKey.toLowerCase(), new DynamicForm());
            }
        });
    }

    getForm(formKey) {
        return this.forms.get(formKey.toLowerCase());
    }
}

