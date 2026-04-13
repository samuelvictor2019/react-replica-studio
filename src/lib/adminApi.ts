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
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
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
): Promise<T> {
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

  return handleResponse<T>(response);
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
    // Handle network errors (including CORS)
    if (error.name === 'TypeError' && error.message.includes('CORS')) {
      throw new Error('CORS_ERROR: Backend server does not allow requests from this origin. Try demo login instead.');
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('NETWORK_ERROR: Unable to connect to backend server. Try demo login instead.');
    }
    throw error;
  });

  if (!response.ok) {
    const error = await response.text();
    let errorMessage = error || 'Login failed';

    // Handle specific HTTP status codes
    if (response.status === 502) {
      errorMessage = 'BACKEND_ERROR: Backend server is currently unavailable (502 Bad Gateway). Try demo login instead.';
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

export async function demoLogin() {
  // Create a demo token for offline/development use
  const demoToken = 'demo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const demoRefreshToken = 'refresh_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  setAdminToken(demoToken);
  setRefreshToken(demoRefreshToken);

  // Store demo mode flag
  localStorage.setItem('demo_mode', 'true');
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
