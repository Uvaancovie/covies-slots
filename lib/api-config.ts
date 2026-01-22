// API Configuration
// In production (Vercel), point to Render backend
// In development, use local server
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://covies-slots.onrender.com'
  : '';
