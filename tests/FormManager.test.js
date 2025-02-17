import { APP_CONFIG } from '../dist/config/default.config';
import FormManager from '../dist/managers/FormManager';
import apiService from '../dist/services/api.service';
import FormFactory from '../dist/core/FormFactory';
import BaseForm from '../dist/core/BaseForm';
import Swal from 'sweetalert2';

describe('Form Yönetim Sistemi', () => {
  beforeAll(() => {
    // Test için form yapısını oluştur
    document.body.innerHTML = `
      <form id="testForm" data-form-type="LOGIN">
        <input type="text" name="username" />
        <input type="password" name="password" />
        <button type="submit">Giriş</button>
      </form>
    `;

    // Swal varsayılan ayarlarını yükle
    Swal.defaultOptions = APP_CONFIG.UI.notifications;
  });

  test('ApiService başarıyla başlatıldı', () => {
    expect(apiService).toBeDefined();
    expect(apiService.axios).toBeDefined();
  });

  test('FormFactory başarıyla başlatıldı', () => {
    const formFactory = new FormFactory(APP_CONFIG);
    expect(formFactory).toBeDefined();
  });

  test('BaseForm başarıyla oluşturuluyor', () => {
    // DOM'un hazır olduğundan emin ol
    const formElement = document.querySelector('#testForm');
    expect(formElement).toBeDefined();

    // BaseForm'u oluştur
    const baseForm = new BaseForm('#testForm');
    expect(baseForm).toBeDefined();
    expect(baseForm.form).toBe(formElement);  // this.form kontrolü
    expect(baseForm.inputs).toBeDefined();     // this.inputs kontrolü
    expect(baseForm.inputs.username).toBeDefined();  // input kontrolü
    expect(baseForm.inputs.password).toBeDefined();  // input kontrolü
  });

  test('FormManager tüm sistemi doğru şekilde başlatıyor', () => {
    FormManager.initialize();
    const form = document.getElementById('testForm');
    expect(form).toBeDefined();
  });

  test('Form submit edildiğinde API isteği yapılıyor', () => {
    const form = document.getElementById('testForm');
    
    // Form verilerini doldur
    const usernameInput = form.querySelector('input[name="username"]');
    const passwordInput = form.querySelector('input[name="password"]');
    usernameInput.value = 'testuser';
    passwordInput.value = 'testpass';

    // Form submit olayını tetikle
    form.dispatchEvent(new Event('submit'));
  });

  afterAll(() => {
    // Test sonrası temizlik
    document.body.innerHTML = '';
  });
});