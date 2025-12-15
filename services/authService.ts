const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
}

// Token management
const TOKEN_KEY = 'marinova_auth_token';

export const authService = {
  // Store token in localStorage
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Remove token
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Register new user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success && data.token) {
        this.setToken(data.token);
      }

      return data;
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success && data.token) {
        this.setToken(data.token);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Get current user
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No token found',
        };
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        // Token is invalid, remove it
        this.removeToken();
      }

      return data;
    } catch (error) {
      console.error('Get user error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  },

  // Logout
  logout(): void {
    this.removeToken();
  },
};
