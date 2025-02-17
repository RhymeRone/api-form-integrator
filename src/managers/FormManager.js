import { APP_CONFIG } from '../config/default.config';
import FormFactory from '../core/FormFactory';

class FormManager {
    constructor() {
        this.forms = new Map();
    }

    initialize() {
        Object.keys(APP_CONFIG.FORMS).forEach(formKey => {
            const config = APP_CONFIG.FORMS[formKey];
            if (document.querySelector(config.selector)) {
                const DynamicForm = FormFactory.createForm(formKey);
                this.forms.set(formKey.toLowerCase(), new DynamicForm());
            }
        });
    }

    getForm(formKey) {
        return this.forms.get(formKey.toLowerCase());
    }
}

export default new FormManager();