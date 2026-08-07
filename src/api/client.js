import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function apiRequest(endpoint, options = {}) {
  const { method = "GET", body, headers } = options;

  try {
    const res = await apiClient.request({
      url: endpoint,
      method,
      data: body !== undefined ? JSON.parse(body) : undefined,
      headers,
    });

    if (res.status === 204) return null;

    return res.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`خطأ في الاتصال: ${error.response.statusText}`, { cause: error });
    }
    throw error;
  }
}

export default apiClient;
