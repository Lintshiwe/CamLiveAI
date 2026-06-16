export interface Detection {
  id: string;
  bbox: number[];        // [x, y, w, h] in video pixel space
  class_name: string;
  confidence: number;
  class_id?: number;
  grade?: string;
  mask?: number[][];     // [[x,y], [x,y], ...] polygon points in video pixel space
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
