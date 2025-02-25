import { APP_CONFIG } from '../config/default.config.js';

export default class TokenManager {
    /**
     * İstek yapılmadan önce, localStorage'dan token'ı çekip Authorization header'ına ekler.
     * Kullanıcı, tokenKey veya tokenName üzerinden anahtar bilgisini belirtebilir.
     *
     * @param {object} config İstek konfigürasyonu
     * @returns {object} Güncellenmiş config
     */
    static addAuthHeader(config) {
        config.headers = config.headers || {};
        let tokenKey = config.tokenKey ?? APP_CONFIG.API.tokenKey;
        let tokenName = config.tokenName ?? APP_CONFIG.API.tokenName;
        if (tokenKey) {
            // Kullanıcı doğrudan token değeri girmişse, bu değeri header'a ekle.
            config.headers.Authorization = `Bearer ${tokenKey}`;
        } else if (tokenName) {
            // Eğer doğrudan token değeri girilmemişse, tokenName üzerinden localStorage'den token cek.
            const token = localStorage.getItem(tokenName);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    }

    /**
     * Yanıt geldiğinde, token kaydetme veya temizleme işlemini yapar.
     * - Eğer clearToken true ise ilgili token silinir.
     * Dot notation desteği bulunmaktadır.
     *
     * @param {object} config Yanıt gelen isteğin konfigürasyonu
     * @param {object} data Yanıt verisi (response.data)
     */
    static processTokenResponse(config, data) {
        let tokenName = config.tokenName ?? APP_CONFIG.API.tokenName;
        // Öncelikle, token temizleme kontrolleri...
        if (config.clearToken) {
            if (tokenName) {
                localStorage.removeItem(tokenName);
            }
            return;
        }
        if (data && tokenName) {
            const tokenValue = TokenManager.getNestedValue(data, tokenName);
            if (tokenValue) {
                localStorage.setItem(tokenName, tokenValue);
            }
        }
    }

    /**
     * Dot notation ile iç içe nesnelerden değer çekmek için.
     *
     * @param {object} obj
     * @param {string} path Nokta ile ayrılmış alan yolu (örneğin: "data.auth.access_token")
     * @returns {any} İstenen değer veya null
     */
    static getNestedValue(obj, path) {
        if (!obj || !path) return null;
        if (path.indexOf('.') !== -1) {
            return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : null, obj);
        }
        return obj[path];
    }
}