import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach Bearer token and Branch ID to all requests if available
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("medlink_token");
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const branchId =
        localStorage.getItem("medlink_branch_id") ||
        localStorage.getItem("active_branch_id") ||
        "b1000000-1111-4111-8111-111111111111";
      if (branchId && !config.headers["X-Branch-Id"]) {
        config.headers["X-Branch-Id"] = branchId;
      }
    } catch (err) {
      void err;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh seamlessly on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints to prevent infinite loops
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/forgot-password") ||
      originalRequest?.url?.includes("/auth/reset-password") ||
      originalRequest?.url?.includes("/auth/bootstrap-owner");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentToken = localStorage.getItem("medlink_token");
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: currentToken ? `Bearer ${currentToken}` : undefined,
            },
          }
        );

        const newToken = res.data?.data?.accessToken || res.data?.data?.token || res.data?.token;
        if (newToken) {
          localStorage.setItem("medlink_token", newToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return apiClient(originalRequest);
        } else {
          processQueue(new Error("Failed to refresh token"), null);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export async function apiRequest(endpoint, options = {}) {
  const { method = "GET", body, headers } = options;

  try {
    const res = await apiClient.request({
      url: endpoint,
      method,
      data: body !== undefined ? (typeof body === "string" ? JSON.parse(body) : body) : undefined,
      headers,
    });

    if (res.status === 204) return null;

    const resData = res.data;
    if (resData && typeof resData === "object" && !Array.isArray(resData)) {
      if (resData.data && typeof resData.data === "object" && Array.isArray(resData.data.items)) {
        const items = [...resData.data.items];
        items.pagination = resData.data.pagination;
        items.meta = resData.meta;
        return items;
      }
      if (Array.isArray(resData.items)) {
        const items = [...resData.items];
        items.pagination = resData.pagination;
        items.meta = resData.meta;
        return items;
      }
    }

    return resData;
  } catch (error) {
    if (error.response) {
      const data = error.response.data;
      let message =
        data?.error?.message ||
        data?.message ||
        data?.detail ||
        (typeof data?.error === "string" ? data.error : null);

      if (!message) {
        if (error.response.status === 401) {
          message = "اسم المستخدم أو كلمة المرور غير صحيحة، أو انتهت صلاحية الجلسة";
        } else if (error.response.status === 403) {
          message = "ليس لديك الصلاحيات الكافية لتنفيذ هذا الإجراء";
        } else if (error.response.status === 404) {
          message = "المورد أو الخدمة المطلوبة غير موجودة";
        } else if (error.response.status === 422) {
          message = "البيانات المدخلة غير مكتملة أو غير صالحة";
        } else {
          message = `خطأ في الاتصال بالخادم (${error.response.status}: ${error.response.statusText || "خطأ غير متوقع"})`;
        }
      }

      const customError = new Error(message, { cause: error });
      customError.status = error.response.status;
      customError.response = error.response;
      customError.code = data?.error?.code;
      throw customError;
    }

    if (error.request) {
      const netError = new Error("تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت أو حالة الخادم", { cause: error });
      netError.status = 0;
      throw netError;
    }

    throw error;
  }
}

export default apiClient;

