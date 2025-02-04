import axios from 'axios';
import { Device, DeviceFilter } from '../../types/device';
import { NetworkTopology } from '../../types/network';
import { ScanResult, ScanOptions } from '../../types/scan';
import { Location } from '../../types/location';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Device API
export const deviceApi = {
  getDevices: (filters: DeviceFilter) =>
    api.get<Device[]>('/devices', { params: filters }),
  
  getDevice: (id: number) =>
    api.get<Device>(`/devices/${id}`),
  
  addDevice: (device: Partial<Device>) =>
    api.post<Device>('/devices', device),
  
  updateDevice: (id: number, data: Partial<Device>) =>
    api.put<Device>(`/devices/${id}`, data),
  
  deleteDevice: (id: number) =>
    api.delete(`/devices/${id}`),
  
  wakeDevice: (id: number) =>
    api.post(`/devices/${id}/wake`),
};

// Network API
export const networkApi = {
  getTopology: () =>
    api.get<NetworkTopology>('/network/topology'),
  
  updateLayout: (layout: string) =>
    api.put<NetworkTopology>('/network/layout', { layout }),
  
  getDeviceConnections: (deviceId: number) =>
    api.get(`/network/connections/${deviceId}`),
};

// Scan API
export const scanApi = {
  startScan: (options: ScanOptions) =>
    api.post<{ scanId: string }>('/scan/start', options),
  
  getScanStatus: (scanId: string) =>
    api.get<ScanResult>(`/scan/status/${scanId}`),
  
  getScanHistory: () =>
    api.get<ScanResult[]>('/scan/history'),
  
  cancelScan: (scanId: string) =>
    api.post(`/scan/cancel/${scanId}`),
};

// Location API
export const locationApi = {
  getLocations: () =>
    api.get<Location[]>('/locations'),
  
  getLocation: (id: number) =>
    api.get<Location>(`/locations/${id}`),
  
  addLocation: (location: Partial<Location>) =>
    api.post<Location>('/locations', location),
  
  updateLocation: (id: number, data: Partial<Location>) =>
    api.put<Location>(`/locations/${id}`, data),
  
  deleteLocation: (id: number) =>
    api.delete(`/locations/${id}`),
};

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;