const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isLocal
    ? "/api" // Use Proxy in Dev
    : "https://navigreat-backend-98.onrender.com/api";
