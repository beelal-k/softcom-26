/**
 * API Client Utility
 * Handles authenticated API requests with proper error handling
 */

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Get authentication token from cookies or localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first (token might be stored here)
  const localToken = localStorage.getItem('token');
  if (localToken) {
    return localToken;
  }

  // Try getting from user object in localStorage
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.token) {
        return user.token;
      }
    } catch (error) {
      console.error('Failed to parse user data:', error);
    }
  }
  
  // Try cookies with various possible names
  const cookies = document.cookie.split(';');
  const possibleNames = ['token', 'authToken', 'auth_token', 'jwt', 'access_token'];
  
  for (const name of possibleNames) {
    const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
    if (cookie) {
      return cookie.split('=')[1];
    }
  }
  
  return null;
}

/**
 * Make authenticated API request
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'An error occurred',
        message: data.message
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message
    };
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * API Client
 */
export const apiClient = {
  // Organizations
  organizations: {
    getAll: (userId?: string) => {
      const params = userId ? `?owner=${userId}` : '';
      return apiRequest(`/api/organizations${params}`);
    },
    
    getById: (id: string) => {
      return apiRequest(`/api/organizations/${id}`);
    },
    
    create: (data: { name: string; description?: string; industry?: string; size?: string; website?: string }) => {
      return apiRequest('/api/organizations', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    
    update: (id: string, data: { name?: string; description?: string; industry?: string; size?: string; website?: string }) => {
      return apiRequest(`/api/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    
    delete: (id: string) => {
      return apiRequest(`/api/organizations/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // Teams
  teams: {
    getByOrganization: (organizationId: string) => {
      return apiRequest(`/api/teams?organizationId=${organizationId}`);
    },
    
    getById: (id: string) => {
      return apiRequest(`/api/teams/${id}`);
    },
    
    getMembers: async (teamId: string) => {
      // Get team details which includes members array
      const response = await apiRequest(`/api/teams/${teamId}`);
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.members || []
        };
      }
      return response;
    },
    
    create: (data: { name: string; description?: string; organizationId: string; permissions?: string[] }) => {
      return apiRequest('/api/teams', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    
    update: (id: string, data: { name?: string; description?: string; permissions?: string[] }) => {
      return apiRequest(`/api/teams/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    
    delete: (id: string) => {
      return apiRequest(`/api/teams/${id}`, {
        method: 'DELETE'
      });
    },
    
    // Team Members
    addMember: (teamId: string, data: { userId: string; role: string }) => {
      return apiRequest(`/api/teams/${teamId}/members`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    
    updateMember: (teamId: string, data: { userId: string; role: string }) => {
      return apiRequest(`/api/teams/${teamId}/members`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    
    removeMember: (teamId: string, userId: string) => {
      return apiRequest(`/api/teams/${teamId}/members?userId=${userId}`, {
        method: 'DELETE'
      });
    }
  },

  // Users
  users: {
    search: (query: string, limit: number = 10) => {
      return apiRequest(`/api/users?search=${query}&limit=${limit}`);
    },
    
    getById: (id: string) => {
      return apiRequest(`/api/users/${id}`);
    },
    
    update: (id: string, data: { name?: string; email?: string; profile?: any }) => {
      return apiRequest(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    
    delete: (id: string) => {
      return apiRequest(`/api/users/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // Invitations
  invitations: {
    send: (data: { email: string; teamId: string; organizationId: string; role: string }) => {
      return apiRequest('/api/invitations', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    
    getByEmail: (email: string) => {
      return apiRequest(`/api/invitations?email=${email}`);
    },
    
    getByTeam: (teamId: string) => {
      return apiRequest(`/api/invitations?teamId=${teamId}`);
    },
    
    getByToken: (token: string) => {
      return apiRequest(`/api/invitations/${token}`);
    },
    
    accept: (token: string) => {
      return apiRequest(`/api/invitations/${token}/accept`, {
        method: 'POST'
      });
    },
    
    reject: (token: string) => {
      return apiRequest(`/api/invitations/${token}/reject`, {
        method: 'POST'
      });
    }
  }
};
