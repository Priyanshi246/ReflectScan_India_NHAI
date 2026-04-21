export interface Road {
  id: string;
  name: string;
  highway_code: string;
  zone: string;
  length_km: number;
  state: string;
  created_at: string;
}

export interface Survey {
  id: string;
  road_id: string;
  inspector_name: string;
  inspector_zone: string;
  route_name: string;
  start_time: string;
  end_time: string | null;
  status: 'in_progress' | 'completed' | 'pending_review';
  total_assets: number;
  pass_count: number;
  fail_count: number;
  created_at: string;
  roads?: Road;
}

export type AssetType = 'road_sign' | 'lane_marking' | 'road_stud' | 'delineator';
export type AssetStatus = 'pass' | 'warning' | 'fail' | 'unknown';

export interface Asset {
  id: string;
  road_id: string;
  type: AssetType;
  latitude: number;
  longitude: number;
  location_description: string;
  installed_date: string;
  last_inspected: string | null;
  current_score: number;
  current_status: AssetStatus;
  created_at: string;
  roads?: Road;
}

export interface Inspection {
  id: string;
  asset_id: string;
  survey_id: string;
  score: number;
  status: 'pass' | 'warning' | 'fail';
  image_url: string | null;
  remarks: string;
  brightness: number;
  contrast: number;
  wear_level: 'low' | 'medium' | 'high';
  created_at: string;
  assets?: Asset;
  surveys?: Survey;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: string;
  asset_id: string;
  road_id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  assets?: Asset;
  roads?: Road;
}

export type Page = 'dashboard' | 'surveys' | 'assets' | 'map' | 'alerts' | 'reports';
