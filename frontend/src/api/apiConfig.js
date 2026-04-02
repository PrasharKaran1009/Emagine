const API_BASE_URL = import.meta.env.VITE_API_URL || "https://emagine.onrender.com";

export const API_ENDPOINTS = {
  PROCESS: `${API_BASE_URL}/process`,
  PROCESS_STREAM: `${API_BASE_URL}/process_stream`,
  ENCODE: `${API_BASE_URL}/encode`,
  DECODE: `${API_BASE_URL}/decode`,
  OUTPUT: (filename) => `${API_BASE_URL}/output/${filename}`,
};

export default API_BASE_URL;
