declare module 'api-form-integrator' {
  // ESM exports
  export class ApiFormIntegrator {
    constructor(config?: object);
    initialize(): void;
    getForm(formKey: string): object;
  }
  
  // CommonJS compatibility
  export = {
    ApiFormIntegrator: typeof ApiFormIntegrator,
    default: typeof ApiFormIntegrator,
    getIntegrator: (config?: object) => ApiFormIntegrator,
    APP_CONFIG: any,
    getFormConfig: (formKey: string) => any,
    getApiConfig: () => any,
    getUiConfig: () => any,
    getValidationMessage: (rule: string) => string|Function,
    getApiErrorConfig: (status: number) => any
  };
}