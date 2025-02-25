/*export function mergeDeep(source, target) {
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            if (
                source[key] && typeof source[key] === 'object' &&
                !Array.isArray(source[key])
            ) {
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {};
                }
                mergeDeep(source[key], target[key]);
            } else if (target[key] === undefined) { // Sadece target'ta tanımlı değilse kopyala.
                target[key] = source[key];
            }
        }
    }
    return target;
}
export default mergeDeep;*/

export function mergeDeep(target, source) {
    // Kaynak yoksa veya hedef (target) değiştirilemezse, hedefi döndür
    if (!source || typeof target !== 'object' || typeof source !== 'object') {
        return target;
    }
    
    // Kaynak nesnenin her özelliği için
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            // Kaynak özelliği bir nesne ise (array değilse)
            if (
                source[key] && typeof source[key] === 'object' &&
                !Array.isArray(source[key])
            ) {
                // Hedefte aynı key yoksa oluştur
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {};
                }
                
                // Özyinelemeli olarak alt nesneleri birleştir
                // Burada kaynak ve hedef doğru sırada verilmeli!
                target[key] = mergeDeep(target[key], source[key]);
            } 
            // Değer bir nesne değilse, doğrudan kopyala
            else {
                target[key] = source[key];
            }
        }
    }
    
    return target;
}

export default mergeDeep;