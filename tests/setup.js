import { APP_CONFIG } from '../dist/config/default.config';
import FormManager from '../dist/managers/FormManager';
import Swal from 'sweetalert2';

// SweetAlert varsayılan ayarları
Swal.defaultOptions = APP_CONFIG.UI.notifications;


// Form manager'ı başlat
document.addEventListener('DOMContentLoaded', () => {
    FormManager.initialize();
});