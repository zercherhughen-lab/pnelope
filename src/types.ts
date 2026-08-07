export interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}

export interface Service {
  id: string;
  user_id: string;
  name: string;
  prefix?: string;
  description?: string;
  api_key: string;
  secret_id: string;
  created_at: string;
  licenses_count?: number;
  ranks_count?: number;
}

export interface License {
  id: string;
  service_id: string;
  key: string;
  username?: string;
  duration?: string;
  expires_at?: string | null;
  status: 'active' | 'paused' | 'banned' | 'expired';
  rank?: string;
  hwid?: string | null;
  notes?: string;
  created_at: string;
  last_used_at?: string | null;
}

export interface Rank {
  id: string;
  service_id: string;
  name: string;
  color?: string;
  created_at: string;
}

export interface Stats {
  services: number;
  licenses: number;
  active_licenses: number;
  paused_licenses?: number;
  banned_licenses?: number;
  expired_licenses?: number;
  users: number;
  total_verifications?: number;
  successful_verifications?: number;
  failed_verifications?: number;
  service_breakdown?: Array<{
    id: string;
    name: string;
    total_licenses: number;
    active_licenses: number;
    verifications_count: number;
  }>;
  recent_verifications?: Array<{
    id: string;
    key: string;
    service_name: string;
    status: string;
    timestamp: string;
    ip?: string;
  }>;
}

export interface SecretRevealData {
  title?: string;
  api_key?: string;
  secret_id?: string;
}
