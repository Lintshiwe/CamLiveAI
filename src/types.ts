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

export type DetectMode = 'single' | 'live' | 'batch';
export type MobileTab = 'camera' | 'feed' | 'user';
