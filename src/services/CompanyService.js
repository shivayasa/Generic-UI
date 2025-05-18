import BaseApiService from './baseApiService';

class CompanyService extends BaseApiService {
  constructor() {
    super('/companies');
  }

  async create(data) {
    return super.create(data, true); 
  }

  async update(id, data) {
    return super.update(id, data, true);
  }

  async deleteCompany(id) {
    return this.http.request({
      method: 'DELETE',
      url: `${this.endpoint}/${id}`
    });
  }

  async deleteSignature(id) {
    return this.http.request({
      method: 'DELETE',
      url: `${this.endpoint}/${id}/signature`
    });
  }

  async exportCompanies(filters = {}) {
    return this.http.request({
      method: 'GET',
      url: `${this.endpoint}/export`,
      params: filters,
      responseType: 'blob'
    });
  }
}

export default new CompanyService();