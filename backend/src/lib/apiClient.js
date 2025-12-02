// app/lib/apiClient.js

export const API_BASE_URL = "http://192.168.1.5:3001";

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken;
