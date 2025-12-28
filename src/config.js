const isDev = import.meta.env.MODE === 'development';

export const API_BASE_URL = isDev
    ? "/api"
    : "https://navigreat-backend-98.onrender.com/api";
