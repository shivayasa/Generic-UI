import axios from 'axios';

class HttpClient {
  constructor(config = {}) {
     // Define base URL that shouldn't be overridden
    const BASE_URL = 'https://generic-backend-eegp.onrender.com';
   // const BASE_URL = 'http://localhost:3000'; // Change this to your actual base URL
    
    // Prevent baseURL from being overridden
    const { baseURL, ...restConfig } = config;
    
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: config.timeout || 60000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      ...restConfig
    });

    this._initializeInterceptors();
  }

  _initializeInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const customError = {
          message: error.response?.data?.message || 'Something went wrong',
          status: error.response?.status,
          code: error.response?.data?.code,
        };
        return Promise.reject(customError);
      }
    );
  }

  async request(config) {
    try {
      console.log("=== Axios Request Start ===");
    console.log("Method:", config.method);
    console.log("Relative URL:", config.url);
    console.log("Base URL (default):", this.client.defaults.baseURL);
    console.log("Final full URL (estimate):", this.client.defaults.baseURL + config.url);
    console.log("Headers:", config.headers);
    console.log("Data:", config.data);
    console.log("============================");

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
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return formData;
  }

  async create(data, isFormData = false) {
    const payload = isFormData ? this._convertToFormData(data) : data;
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {};

    return this.http.request({
      method: 'POST',
      url: this.endpoint,
      data: payload,
      headers
    });
  }

  async update(id, data, isFormData = false) {
    const payload = isFormData ? this._convertToFormData(data) : data;
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {};

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
}

export default BaseApiService;
