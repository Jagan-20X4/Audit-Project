import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../../utils';

const client = axios.create({
  baseURL: config.apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    // Axios types use AxiosHeaders; set via plain object merge.
    cfg.headers = { ...(cfg.headers as any), Authorization: `Bearer ${token}` };
  }
  return cfg;
});

const request = <T = unknown>(
  cfg: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  return client.request<T>(cfg);
};

export default request;
