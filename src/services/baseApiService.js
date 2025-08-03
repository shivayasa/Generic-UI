import axios from 'axios';
import {jwtDecode} from 'jwt-decode';


class HttpClient {
  constructor(config = {}) {
    //const BASE_URL = 'https://generic-backend-eegp.onrender.com';
    const BASE_URL = 'http://localhost:3000'; // Change this to your actual base URL

    // Prevent baseURL from being overridden
    const { baseURL, ...restConfig } = config;

    this.client = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      timeout: config.timeout || 60000,
      headers: {
        ...config.headers,
      },
      ...restConfig
    });

    this._initializeInterceptors();
  }



_initializeInterceptors() {
  this.client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decoded = jwtDecode(token);
          const isExpired = decoded.exp * 1000 < Date.now();
          console.log("Token isExpired:", isExpired);
          if (isExpired) {
            localStorage.removeItem("token");
            localStorage.setItem("logout", Date.now().toString()); // cross-tab logout
            window.location.href = "/login"; // optional: redirect now
            return Promise.reject(new Error("Token expired"));
          }
          config.headers.Authorization = `Bearer ${token}`;
        } catch (err) {
          console.error("Invalid token:", err);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  this.client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      const customError = {
        message: error.response?.data?.message || error.response?.data || error.message,
        status: error.response?.status,
        code: error.response?.data?.code,
      };

      // Optionally log out on 401 Unauthorized
      if (customError.status === 401) {
        localStorage.removeItem("token");
        localStorage.setItem("logout", Date.now().toString());
        window.location.href = "/login";
      }
      return Promise.reject(customError);
    }
  );
}


  async request(config) {
    try {
      console.log("=== Axios Request Start ===");
      console.log("config:", config);   
      const response = await this.client.request(config);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("=== Axios Request Error ===");
      console.error("URL:", error.config?.url);
      console.error("Base URL (at error time):", this.client.defaults.baseURL);
      console.error("Full error object:", error);
      console.error("===========================");
      return {
        success: false,
        error: {
          message: error.message,
          status: error.status,
          code: error.code,
        },
      };
    }
  }
}

class BaseApiService {
  constructor(endpoint, config = {}) {
    this.endpoint = endpoint;
    this.http = new HttpClient(config);
  }

 _convertToFormData(data) {
  if (data instanceof FormData) {
    console.log('Data is already FormData:');
    for (let [key, value] of data.entries()) {
      if (value instanceof File) {
        console.log(`FormData entry: "${key}" = [File: ${value.name}, type: ${value.type}]`);
      } else {
        console.log(`FormData entry: "${key}" = "${value}"`);
      }
    }
    return data;
  }

  const formData = new FormData();
  console.log('Converting plain object to FormData:', data);

  Object.keys(data).forEach(key => {
    const value = data[key];
    console.log(`Processing key: "${key}", value:`, value);

    if (value instanceof File) {
      console.log(`Appending File: "${key}"`);
      formData.append(key, value);
    } else if (value !== null && value !== undefined) {
      console.log(`Appending value: "${key}" = "${value}"`);
      formData.append(key, value);
    } else {
      console.log(`Skipping key: "${key}" (null or undefined)`);
    }
  });

  return formData;
}



  async create(data, isFormData = false) {
    let payload = data;
    if (isFormData && !(data instanceof FormData)) {
      payload = this._convertToFormData(data);
    }

    if (payload instanceof FormData) {
      for (let pair of payload.entries()) {
        console.log("FormData entry:", pair[0], pair[1]);
      }
    } else {
      console.log("JSON payload:", payload);
    }

    const headers = isFormData ? {} : {};
    return this.http.request({
      method: 'POST',
      url: this.endpoint,
      data: payload,
      headers
    });
  }

  async update(id, data, isFormData = false) {
    const payload =  this._convertToFormData(data);
    // Do NOT set Content-Type for FormData, let browser/axios handle it
    const headers = isFormData ? {} : {};

    return this.http.request({
      method: 'PUT',
      url: `${this.endpoint}/${id}`,
      data: payload,
      headers
    });
  }

  async getById(id) {
    return this.http.request({
      method: 'GET',
      url: `${this.endpoint}/${id}`
    });
  }

  async getAll(params = {}) {
    return this.http.request({
      method: 'GET',
      url: this.endpoint,
      params
    });
  }

  async delete(id) {
    return this.http.request({
      method: 'DELETE',
      url: `${this.endpoint}/${id}`
    });
  }

  async bulkDelete(ids) {
    return this.http.request({
      method: 'POST',
      url: `${this.endpoint}/bulk-delete`,
      data: { ids }
    });
  }

  async updateStatus(id, status) {
    return this.http.request({
      method: 'PATCH',
      url: `${this.endpoint}/${id}/status`,
      data: { status }
    });
  }

  // ...existing code...
async downloadFile(fileId, filename = "downloaded-file") {
  try {
    const response = await this.http.request({
      method: 'GET',
      url: `${this.endpoint}/api/download/${fileId}`,
      responseType: 'blob',
    });

    // response.data is already a Blob
    const url = window.URL.createObjectURL(response.data);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("File download error:", error);
    return {
      success: false,
      error: {
        message: error.message,
        status: error.status,
        code: error.code,
      },
    };
  }
}

}




export default BaseApiService;