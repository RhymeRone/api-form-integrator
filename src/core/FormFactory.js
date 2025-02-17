import { APP_CONFIG, getApiErrorConfig } from '../config/default.config';
import BaseForm from '../core/BaseForm';
import ApiService from '../services/api.service';

export default class FormFactory {
    createForm(formKey) {
        const config = APP_CONFIG.FORMS[formKey];
        
        return class DynamicForm extends BaseForm {
            constructor() {
                super(config.selector);
                this.formKey = formKey;
                this.config = config;
                this.setRules(this.prepareRules());
            }

            prepareRules() {
                const rules = {};
                Object.entries(this.config.fields).forEach(([field, fieldConfig]) => {
                    rules[field] = fieldConfig.rules.map(rule => {
                        const [type, value] = rule.includes(':') ? rule.split(':') : [rule, null];
                        
                        return {
                            type,
                            value,
                            message: typeof APP_CONFIG.UI.validation.messages[type] === 'function' 
                                ? APP_CONFIG.UI.validation.messages[type](field, value)
                                : APP_CONFIG.UI.validation.messages[type]
                        };
                    });
                });
                return rules;
            }

            async handleSubmit(e) {
                e.preventDefault();
                try {
                    const formData = this.getFormData();
                    
                    const response = await ApiService.request({
                        url: this.config.endpoint,
                        method: this.config.method,
                        data: formData,
                        preventRedirect: this.config.preventRedirect
                    });

                    // Success actions
                    if (this.config.actions?.success) {
                        const { saveToken, redirect, message } = this.config.actions.success;
                        
                        if (saveToken && response.data.token) {
                            localStorage.setItem('token', response.data.token);
                        }

                        if (message) {
                            Swal.fire({
                                icon: 'success',
                                text: message,
                                ...APP_CONFIG.UI.notifications
                            });
                        }

                        if (redirect) {
                            window.location.href = redirect;
                        }
                    }

                    return response;
                } catch (error) {
                    // Error actions
                    const status = error.response?.status;
                    const errorConfig = this.config.actions?.error?.[status] || getApiErrorConfig(status);

                    if (errorConfig) {
                        if (errorConfig.message) {
                            Swal.fire({
                                icon: 'error',
                                text: errorConfig.message,
                                ...APP_CONFIG.UI.notifications
                            });
                        }

                        if (errorConfig.showValidation && error.response?.data?.errors) {
                            this.showValidationErrors(error.response.data.errors);
                        }

                        if (errorConfig.clearToken) {
                            localStorage.removeItem('token');
                        }

                        if (errorConfig.redirect) {
                            window.location.href = errorConfig.redirect;
                        }
                    }

                    throw error;
                }
            }

            showValidationErrors(errors) {
                Object.entries(errors).forEach(([field, messages]) => {
                    const input = this.inputs[field];
                    if (input) {
                        input.classList.add(APP_CONFIG.UI.validation.errorClass);
                        
                        Swal.fire({
                            icon: 'error',
                            text: messages[0],
                            ...APP_CONFIG.UI.notifications
                        });
                    }
                });
            }
        }
    }
} 