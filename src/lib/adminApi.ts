import type { EventType } from '@/lib/api';
import { getStorageItem, removeStorageItem, setStorageItem } from '@/lib/storage';

export type Role = 'super_admin' | 'editor' | 'viewer' | 'admin' | 'user';
export type CanonicalRole = 'super_admin' | 'editor' | 'viewer';

export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const TOKEN_KEY = 'wgc_admin_token';
const REFRESH_TOKEN_KEY = 'wgc_refresh_token';
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export function getAdminToken() {
  return getStorageItem(TOKEN_KEY, 'session');
}

export function getRefreshToken() {
  return getStorageItem(REFRESH_TOKEN_KEY, 'session');
}

export function setAdminToken(token: string) {
  setStorageItem(TOKEN_KEY, token, 'session');
}

export function setRefreshToken(token: string) {
  setStorageItem(REFRESH_TOKEN_KEY, token, 'session');
}

export function clearAdminToken() {
  removeStorageItem(TOKEN_KEY, 'session');
  removeStorageItem(REFRESH_TOKEN_KEY, 'session');
}

export function normalizeRole(role?: string): CanonicalRole {
  const value = String(role || '').toLowerCase().trim();
  if (value === 'super_admin' || value === 'super admin' || value === 'admin') return 'super_admin';
  if (value === 'editor') return 'editor';
  return 'viewer';
}

export function getRoleLabel(role?: string): 'Super Admin' | 'Editor' | 'Viewer' {
  const normalized = normalizeRole(role);
  if (normalized === 'super_admin') return 'Super Admin';
  if (normalized === 'editor') return 'Editor';
  return 'Viewer';
}

export function hasPermission(user: AdminUser | null | undefined, permission: string) {
  // If no user, deny access
  if (!user) return false;

  const role = normalizeRole(user.role);
  if (role === 'super_admin') return true;

  const rolePermissions: Record<CanonicalRole, string[]> = {
    super_admin: ['*'],
    editor: [
      'content.read', 'content.create', 'content.update', 'content.delete',
      'events.*', 'uploads.*',
      'forms.read', 'forms.update', 'forms.delete',
      'dashboard.read',
      'users.read', 'users.update',
      'testimonies.read', 'testimonies.create', 'testimonies.update', 'testimonies.delete'
    ],
    viewer: ['content.read', 'forms.read', 'dashboard.read', 'users.read']
  };

  const userPermissions = rolePermissions[role] || [];
  return userPermissions.includes('*') || userPermissions.includes(permission) ||
         userPermissions.some(p => permission.startsWith(p.replace('.*', '.')));
}

export async function adminRequest<T = any>(
  path: string,
  options: RequestInit = {},
  withAuth = true,
  cacheDurationMs = 0
): Promise<T> {
  const method = options.method?.toUpperCase() || 'GET';
  
  if (method === 'GET' && cacheDurationMs > 0) {
    const cacheKey = `api_cache_${path}`;
    const cachedStr = getStorageItem(cacheKey, 'session');
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr);
        if (Date.now() - cached.timestamp < cacheDurationMs) {
          return cached.data as T;
        }
      } catch (error) {
        console.debug('Ignoring stale cache payload', error);
      }
    }
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (withAuth) {
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  }).catch(error => {
    // Handle network errors (including CORS)
    if (error.name === 'TypeError' && error.message.includes('CORS')) {
      throw new Error('CORS_ERROR: Backend server does not allow requests from this origin. Please check backend CORS configuration.');
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('NETWORK_ERROR: Unable to connect to backend server. Server may be down or unreachable.');
    }
    throw error;
  });

  if (response.status === 401 && withAuth) {
    // Token expired, try to refresh
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newAccessToken = refreshData.data?.accessToken || refreshData.accessToken;
          if (newAccessToken) {
            setAdminToken(newAccessToken);
            // Retry the original request
            headers.Authorization = `Bearer ${newAccessToken}`;
            const retryResponse = await fetch(`${API_BASE}${path}`, {
              ...options,
              headers,
            });
            return handleResponse<T>(retryResponse);
          }
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }
    // Clear tokens and redirect to login
    clearAdminToken();
    window.location.href = '/admin/login';
    throw new Error('Authentication expired');
  }

  const data = await handleResponse<T>(response);
  
  if (method === 'GET' && cacheDurationMs > 0) {
    const cacheKey = `api_cache_${path}`;
    setStorageItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      data
    }), 'session');
  }
  
  return data;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    let errorMessage = text || `Request failed: ${response.status}`;

    // Handle specific HTTP status codes
    if (response.status === 502) {
      errorMessage = 'BACKEND_ERROR: Backend server is currently unavailable (502 Bad Gateway). Using local data instead.';
    } else if (response.status === 404) {
      errorMessage = 'NOT_FOUND: The requested resource was not found on the server.';
    } else if (response.status === 403) {
      errorMessage = 'FORBIDDEN: You do not have permission to access this resource.';
    } else if (response.status === 500) {
      errorMessage = 'SERVER_ERROR: Internal server error occurred.';
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export async function adminLogin(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).catch(error => {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('NETWORK_ERROR: Unable to connect to backend server.');
    }
    throw error;
  });

  if (!response.ok) {
    const error = await response.text();
    let errorMessage = error || 'Login failed';

    // Handle specific HTTP status codes
    if (response.status === 502) {
      errorMessage = 'BACKEND_ERROR: Backend server is currently unavailable (502 Bad Gateway).';
    } else if (response.status === 401) {
      errorMessage = 'Invalid email or password.';
    } else if (response.status === 403) {
      errorMessage = 'Account is disabled or access denied.';
    }

    throw new Error(errorMessage);
  }

  const { data } = await response.json();
  setAdminToken(data.accessToken);
  setRefreshToken(data.refreshToken);
}



export async function adminMe(): Promise<{ admin: AdminUser }> {
  const response = await adminRequest('/auth/profile');
  return { admin: response.data };
}

export async function adminLogout() {
  try {
    await adminRequest('/auth/logout', { method: 'POST' });
  } finally {
    clearAdminToken();
  }
}

// ---------------------------------------------------------------------------
// Response / error helpers
// ---------------------------------------------------------------------------

/**
 * Normalises the various list envelopes the backend may return
 * (`[]`, `{ data: [] }`, `{ items: [] }`, `{ data: { items: [] } }`, `{ data: { data: [] } }`).
 */
export function extractList<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

/** Unwraps a single-resource envelope (`{ data }`, `{ item }` or the raw object). */
export function extractItem<T>(payload: any): T {
  return (payload?.data ?? payload?.item ?? payload) as T;
}

/** Maps errors thrown by `adminRequest` to short, human-readable messages. */
export function describeApiError(error: any, fallback: string): string {
  const message: string = error?.message || '';
  if (message.includes('CORS_ERROR')) return 'CORS error: the backend rejected this origin.';
  if (message.includes('NETWORK_ERROR')) return 'Network error: unable to reach the server.';
  if (message.includes('BACKEND_ERROR')) return 'The server is temporarily unavailable. Please try again.';
  if (message.includes('FORBIDDEN')) return 'You do not have permission to perform this action.';
  if (message.includes('NOT_FOUND')) return 'The requested resource no longer exists.';
  if (message.includes('SERVER_ERROR')) return 'The server encountered an error. Please try again.';

  // NestJS-style JSON error bodies: { message: string | string[] }
  try {
    const parsed = JSON.parse(message);
    const detail = Array.isArray(parsed?.message) ? parsed.message.join(', ') : parsed?.message;
    const validationErrors = Array.isArray(parsed?.errors)
      ? parsed.errors.filter((item: unknown): item is string => typeof item === 'string')
      : [];
    if (validationErrors.length > 0) {
      return `${detail || 'Validation failed'}: ${validationErrors.join('; ')}`;
    }
    if (detail) return String(detail);
  } catch {
    /* not JSON */
  }

  return message || fallback;
}

/**
 * Uploads an image (multipart) to `/uploads/image` and returns the public URL.
 * Kept separate from `adminRequest`, which forces a JSON Content-Type.
 */
export async function uploadAdminImage(file: File, opts: { title?: string; folder?: string } = {}): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  body.append('folder', opts.folder ?? 'wgc');
  if (opts.title?.trim()) body.append('title', opts.title.trim());

  const token = getAdminToken();
  const response = await fetch(`${API_BASE}/uploads/image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body,
  });

  if (response.status === 401) {
    clearAdminToken();
    window.location.href = '/admin/login';
    throw new Error('Authentication expired');
  }
  if (!response.ok) {
    throw new Error(describeApiError(new Error((await response.text()) || `Upload failed (${response.status})`), 'Upload failed'));
  }

  const payload: any = await response.json().catch(() => ({}));
  for (const layer of [payload, payload?.data, payload?.data?.data]) {
    const url = layer?.secure_url ?? layer?.secureUrl ?? layer?.url ?? layer?.publicUrl ?? layer?.location;
    if (typeof url === 'string' && url) return url;
  }
  throw new Error('Upload succeeded but the server returned no image URL.');
}

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

export type { EventType };

export type EventTypePayload = {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
};

export const eventTypesApi = {
  /** Includes inactive types so admins can review and re-enable them. */
  async list(): Promise<EventType[]> {
    const res = await adminRequest<any>('/event-types?activeOnly=false');
    return extractList<EventType>(res);
  },

  async get(id: string): Promise<EventType> {
    const res = await adminRequest<any>(`/event-types/${encodeURIComponent(id)}`);
    return extractItem<EventType>(res);
  },

  async create(payload: EventTypePayload): Promise<EventType> {
    const res = await adminRequest<any>('/event-types', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return extractItem<EventType>(res);
  },

  async update(id: string, payload: Partial<EventTypePayload>): Promise<EventType> {
    const res = await adminRequest<any>(`/event-types/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return extractItem<EventType>(res);
  },

  async remove(id: string): Promise<void> {
    await adminRequest(`/event-types/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};

export type FormStatus = 'new' | 'in_progress' | 'completed' | 'archived' | 'pending' | 'approved' | 'cancelled' | 'rejected';

export type FormType =
  | 'Volunteer'
  | 'Naming Ceremony'
  | 'New Comers'
  | 'Altar Call'
  | 'Pre-Marital Counselling'
  | 'Counselling'
  | 'Feedback'
  | 'Testimony'
  | 'Contact Us';

export type FormSubmission = {
  id: string;
  type: FormType;
  status: FormStatus;
  notes: string;
  fullName: string;
  email: string;
  phone?: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type FormSubmissionPage = {
  data: FormSubmission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type FormSubmissionUpdate = Partial<Pick<
  FormSubmission,
  'type' | 'status' | 'fullName' | 'email' | 'phone' | 'data'
>>;

type ListFormSubmissionsOptions = {
  page: number;
  limit: number;
  type?: FormType;
  statuses?: FormStatus[];
};

export async function listFormSubmissions({ page, limit, type, statuses }: ListFormSubmissionsOptions): Promise<FormSubmissionPage> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (type) params.set('type', type);
  const apiStatuses = [...new Set(statuses?.map((status) => {
    if (status === 'new' || status === 'in_progress') return 'pending';
    if (status === 'completed') return 'approved';
    if (status === 'archived') return 'cancelled';
    return status;
  }) ?? [])];
  apiStatuses.forEach((status) => params.append('status', status));

  const response = await adminRequest<any>(`/forms?${params.toString()}`);
  const listedSubmissions = extractList<FormSubmission>(response);
  const singleSubmission = response?.data && typeof response.data === 'object' && !Array.isArray(response.data)
    && typeof response.data.id === 'string'
    ? [response.data as FormSubmission]
    : [];
  const data = (listedSubmissions.length > 0 ? listedSubmissions : singleSubmission).map((submission) => ({
    ...submission,
    status: (typeof submission.status === 'string' ? submission.status : 'new') as FormStatus,
    data: submission.data && typeof submission.data === 'object' ? submission.data : {},
  }));
  const pagination = response?.pagination
    ?? response?.data?.pagination
    ?? response?.data?.data?.pagination
    ?? response?.data?.data?.data?.pagination;
  const total = Number(pagination?.total ?? data.length);

  return {
    data,
    pagination: {
      page: Number(pagination?.page ?? page),
      limit: Number(pagination?.limit ?? limit),
      total,
      totalPages: Number(pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit))),
    },
  };
}

export function updateFormSubmission(id: string, update: FormSubmissionUpdate) {
  return adminRequest<FormSubmission>(`/forms/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(update),
  });
}

export function updateFormSubmissionStatus(id: string, status: FormStatus) {
  return adminRequest<FormSubmission>(`/forms/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteFormSubmission(id: string) {
  return adminRequest<void>(`/forms/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
