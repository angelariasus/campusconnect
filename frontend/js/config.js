export const DEFAULT_API_BASE = "https://campusconnect-rwzz.onrender.com/api";

export const getApiBase = () => {
  const saved = localStorage.getItem("cc_api_base");
  return saved || DEFAULT_API_BASE;
};

export const setApiBase = (value) => {
  if (value) {
    localStorage.setItem("cc_api_base", value);
  }
};
