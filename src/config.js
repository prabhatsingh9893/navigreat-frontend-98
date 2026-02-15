const isLocal = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.');

export const API_BASE_URL = isLocal
    ? "/api" // Use Proxy in Dev
    : "https://navigreat-backend-98.onrender.com/api";
