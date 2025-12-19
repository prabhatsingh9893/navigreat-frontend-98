const isDev = import.meta.env.DEV;

export const API_BASE_URL = isDev
    ? "http://localhost:5000/api"
    : "https://navigreat-backend-98.onrender.com/api";
