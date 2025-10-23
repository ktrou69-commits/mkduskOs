/**
 * Утилиты для правильного кодирования UTF-8
 */

/**
 * Кодирует строку UTF-8 в Base64 правильно
 */
export const encodeUTF8ToBase64 = (str) => {
    try {
        // Используем TextEncoder для правильного кодирования UTF-8
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        
        // Конвертируем Uint8Array в строку для btoa
        let binary = '';
        for (let i = 0; i < data.length; i++) {
            binary += String.fromCharCode(data[i]);
        }
        
        return btoa(binary);
    } catch (error) {
        console.error('UTF-8 encoding error:', error);
        // Fallback к старому методу
        return btoa(unescape(encodeURIComponent(str)));
    }
};

/**
 * Декодирует Base64 в строку UTF-8 правильно
 */
export const decodeBase64ToUTF8 = (base64) => {
    try {
        // Декодируем Base64 в бинарную строку
        const binary = atob(base64);
        
        // Конвертируем бинарную строку в Uint8Array
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        
        // Используем TextDecoder для правильного декодирования UTF-8
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(bytes);
    } catch (error) {
        console.error('UTF-8 decoding error:', error);
        // Fallback к старому методу
        try {
            return decodeURIComponent(escape(atob(base64)));
        } catch (fallbackError) {
            console.error('Fallback decoding error:', fallbackError);
            return atob(base64); // Последний резерв
        }
    }
};
