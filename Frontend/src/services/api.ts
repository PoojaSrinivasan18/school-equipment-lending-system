import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const BASE = (import.meta as any).env?.VITE_API_BASE_URL || ''

const instance: AxiosInstance = axios.create({
  baseURL: BASE || undefined,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10_000,
})

// Attach auth token from localStorage if present
instance.interceptors.request.use((config: any) => {
  try {
    const token = localStorage.getItem('auth_token')
    if (token && config) {
      // eslint-disable-next-line no-param-reassign
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch (e) {
    // ignore
  }
  return config
})

export default instance

export async function apiGet<T = any>(url: string, config?: AxiosRequestConfig) {
  const res = await instance.get<T>(url, config)
  return res.data as T
}

export async function apiPost<T = any, B = any>(url: string, body?: B, config?: AxiosRequestConfig) {
  const res = await instance.post<T>(url, body, config)
  return res.data as T
}

export async function apiPut<T = any, B = any>(url: string, body?: B, config?: AxiosRequestConfig) {
  const res = await instance.put<T>(url, body, config)
  return res.data as T
}

export async function apiDelete<T = any>(url: string, config?: AxiosRequestConfig) {
  const res = await instance.delete<T>(url, config)
  return res.data as T
}
