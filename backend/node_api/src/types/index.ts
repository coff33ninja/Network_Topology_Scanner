// Device types
export interface Device {
  id: number;
  mac_address: string;
  ip_address: string;
  hostname: string;
  device_type: string;
  location_id: number;
  status: 'online' | 'offline' | 'waking';
  last_seen: string;
  services: Service[];
}

export interface Service {
  id: number;
  device_id: number;
  port: number;
  protocol: string;
  service_name: string;
  is_active: boolean;
  last_checked: string;
}

export interface DeviceFilter {
  type: string;
  status: string;
  location: string;
}

// Network types
export interface NetworkNode {
  id: number;
  label: string;
  type: string;
  status: string;
  x?: number;
  y?: number;
  ip_address: string;
  mac_address: string;
  services: Service[];
}

export interface NetworkLink {
  id: number;
  source: number;
  target: number;
  type: string;
  bandwidth?: number;
  latency?: number;
}

export interface NetworkTopology {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

// Scan types
export interface ScanOptions {
  type: 'quick' | 'full' | 'custom';
  target_network?: string;
  location_id?: number;
  port_range?: string;
  service_detection?: boolean;
}

export interface ScanResult {
  id: string;
  start_time: string;
  end_time?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  devices_found: number;
  error?: string;
  details: {
    new_devices: Device[];
    changed_devices: Device[];
    offline_devices: Device[];
  };
}

// Location types
export interface Location {
  id: number;
  name: string;
  description?: string;
  network_range: string;
  created_at: string;
  updated_at: string;
  device_count?: number;
}

// Alert types
export interface Alert {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  device_id?: number;
  location_id?: number;
  timestamp: string;
  acknowledged: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  last_login?: string;
  created_at: string;
}

// Dashboard types
export interface DashboardData {
  deviceCount: number;
  alertCount: number;
  averageSpeed: number;
  networkLoad: number;
  networkActivity: NetworkActivityPoint[];
  recentAlerts: Alert[];
  topDevices: {
    device: Device;
    usage: number;
  }[];
}

export interface NetworkActivityPoint {
  time: string;
  value: number;
  type: string;
}

// Settings types
export interface Settings {
  scanInterval: number;
  retentionDays: number;
  alertThresholds: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  emailNotifications: boolean;
  autoWakeOnLan: boolean;
}

// Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface DeviceStatusUpdate {
  device_id: number;
  status: Device['status'];
  last_seen: string;
  services: Service[];
}

// Error types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Chart types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }[];
}

// Form types
export interface DeviceFormData extends Partial<Device> {
  location_name?: string;
  tags?: string[];
}

export interface LocationFormData extends Partial<Location> {
  parent_location_id?: number;
}

export interface ScanFormData extends ScanOptions {
  schedule?: {
    enabled: boolean;
    interval: number;
    start_time?: string;
    end_time?: string;
  };
}