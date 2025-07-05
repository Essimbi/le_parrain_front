export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  organisationId: string;
  organisation?: Organisation;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  permissions?: Permission[];
}

export type UserRole = 'admin' | 'barman' | 'serveur';

export interface Organisation {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  subscriptionPlan: SubscriptionPlan;
  isActive: boolean;
  createdAt: Date;
  settings?: OrganisationSettings;
}

export type SubscriptionPlan = 'free' | 'premium' | 'enterprise';

export interface OrganisationSettings {
  currency: string;
  timezone: string;
  language: string;
  features: {
    wifiVouchers: boolean;
    advancedReporting: boolean;
    multiLocation: boolean;
    inventoryTracking: boolean;
  };
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  lastActivity: Date | null;
}

export interface TokenPayload {
  userId: string;
  role: UserRole;
  organisationId: string;
  iat: number;
  exp: number;
  permissions?: string[];
}

// Types pour les erreurs d'authentification
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  USER_INACTIVE = 'USER_INACTIVE',
  ORGANISATION_INACTIVE = 'ORGANISATION_INACTIVE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: any;
}

// Interface pour la gestion des sessions
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile';
  os: string;
  browser: string;
  version: string;
}

// Types pour la validation
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Interface pour les logs d'authentification
export interface AuthLog {
  id: string;
  userId?: string;
  organisationId?: string;
  action: AuthAction;
  result: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  details?: any;
  createdAt: Date;
}

export enum AuthAction {
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED'
}

// Types pour la configuration de sécurité
export interface SecurityConfig {
  passwordPolicy: PasswordPolicy;
  sessionConfig: SessionConfig;
  lockoutPolicy: LockoutPolicy;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
  expirationDays?: number;
}

export interface SessionConfig {
  timeoutMinutes: number;
  maxConcurrentSessions: number;
  rememberMeDays: number;
  autoLogoutWarningMinutes: number;
}

export interface LockoutPolicy {
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  resetAfterSuccessfulLogin: boolean;
}

// Types pour les événements d'authentification
export interface AuthEvent {
  type: AuthEventType;
  user?: User;
  timestamp: Date;
  data?: any;
}

export enum AuthEventType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  PERMISSIONS_UPDATED = 'PERMISSIONS_UPDATED'
}

// Interface pour les préférences utilisateur
export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  orderUpdates: boolean;
  stockAlerts: boolean;
  systemNotifications: boolean;
}

export interface DashboardPreferences {
  defaultView: string;
  widgets: string[];
  refreshInterval: number;
  autoRefresh: boolean;
}

// Types pour l'authentification à deux facteurs (2FA)
export interface TwoFactorAuth {
  enabled: boolean;
  method: '2fa_app' | 'sms' | 'email';
  backupCodes: string[];
  lastUsed?: Date;
}

export interface TwoFactorSetupRequest {
  method: '2fa_app' | 'sms' | 'email';
  phoneNumber?: string;
  email?: string;
}

export interface TwoFactorVerifyRequest {
  token: string;
  code: string;
}

// Interface pour la récupération de mot de passe
export interface PasswordResetRequest {
  phone: string;
  email?: string;
}

export interface PasswordResetResponse {
  resetToken: string;
  expiresAt: Date;
  message: string;
}

export interface PasswordResetConfirm {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

// Types pour les statistiques d'authentification
export interface AuthStats {
  totalLogins: number;
  uniqueUsers: number;
  failedAttempts: number;
  averageSessionDuration: number;
  peakUsageTime: string;
  deviceBreakdown: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
}

// Interface pour la synchronisation hors ligne
export interface OfflineAuthData {
  user: User;
  permissions: Permission[];
  lastSync: Date;
  isValid: boolean;
}

// Types pour les webhooks d'authentification
export interface AuthWebhook {
  event: AuthEventType;
  userId: string;
  organisationId: string;
  timestamp: Date;
  data: any;
}

// Interface pour l'audit trail
export interface AuditTrail {
  id: string;
  userId: string;
  organisationId: string;
  action: string;
  resource: string;
  oldValue?: any;
  newValue?: any;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}