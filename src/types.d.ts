declare module 'api-form-integrator' {
  export class ApiFormIntegrator {
    constructor(config?: object);
    initialize(): void;
    getForm(formKey: string): object;
  }
  export const defaultInstance: ApiFormIntegrator;
  export const APP_CONFIG: any;
  export function getFormConfig(formKey: string): any;
  export function getApiConfig(): any;
  export function getUiConfig(): any;
  export function getValidationMessage(rule: string): string|Function;
  export function getApiErrorConfig(status: number): any;
  
} 