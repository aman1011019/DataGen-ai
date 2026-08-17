// Default API key for Google Gemini AI (decoupled from Firebase)
export const DEFAULT_GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY ||
  "AIzaSyCBDQSUSxOUDZNElLYrJ_DOz6pDCUdBhNE";

// Legacy alias for backwards compatibility
export const FIREBASE_GEMINI_API_KEY = DEFAULT_GEMINI_API_KEY;
