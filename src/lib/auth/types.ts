export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}
