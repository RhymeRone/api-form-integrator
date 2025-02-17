class BaseForm {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        this.inputs = {};
        this.rules = {};
        this.validationErrors = {};
        
        if (this.form) {
            this.initializeInputs();
            this.bindEvents();
        }
    }

    initializeInputs() {
        this.form.querySelectorAll('input, select, textarea').forEach(input => {
            this.inputs[input.name] = input;
            
            input.addEventListener('input', () => {
                this.validateField(input.name);
            });
        });
    }

    bindEvents() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (await this.validateForm()) {
                this.handleSubmit(e);
            }
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
        const value = input.value.trim();
        const rules = this.rules[fieldName];

        if (!rules) return true;

        for (const rule of rules) {
            if (!await this.validateRule(rule, value, fieldName)) {
                this.validationErrors[fieldName] = rule.message;
                return false;
            }
        }

        delete this.validationErrors[fieldName];
        return true;
    }

    async validateForm() {
        this.validationErrors = {};
        let isValid = true;
        
        for (const fieldName of Object.keys(this.rules)) {
            if (!await this.validateField(fieldName)) {
                isValid = false;
            }
        }

        if (!isValid) {
            const errorMessages = Object.values(this.validationErrors);
            Swal.fire({
                icon: 'error',
                title: 'Form Hataları',
                html: errorMessages.join('<br>')
            });
        }

        return isValid;
    }

    async validateRule(rule, value, fieldName) {
        switch (rule.type) {
            case 'required':
                return value.length > 0;
                
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                
            case 'minLength':
                return value.length >= rule.value;
                
            case 'maxLength':
                return value.length <= rule.value;
                
            case 'pattern':
                return rule.pattern.test(value);
                
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