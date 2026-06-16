export interface Detection {
  id: string;
  bbox: number[];        // [x, y, w, h] from API
  class_name: string;
  confidence: number;
  class_id?: number;
  grade?: string;
}

export interface PairingConfig {
  token: string;
  tenantType: string;
  tenantSlug: string;
  cameraId: string;
  apiUrl: string;
}

export interface QRData {
  token: string;
  tenantType: string;
  tenantSlug: string;
  cameraId: string;
  apiUrl: string;
}

export interface MockUser {
  id: string;
  name: string;
  role: string;
  tenant: string;
  tenantType: string;
  active: boolean;
  avatar?: string;
}

export interface SessionInfo {
  user: MockUser;
  domain: string;
  activeModel: string;
  connectionTime: Date;
  cameraId: string;
}

export type DetectMode = 'single' | 'live' | 'batch';
export type DomainFilter = 'all' | 'agriculture' | 'waste' | 'warehouse';
export type MobileTab = 'camera' | 'feed' | 'qr' | 'user';
