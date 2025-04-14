export type UserRole = 'superadmin' | 'publisher' | 'moderator' | 'user';

export interface Data {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  firstName: string;
  permissions: string[];
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  data: Data;
  token: string;
}

export interface AuthState {
  user: Data | null;
  isAuthenticated: boolean;
  isLoading: boolean;
} 