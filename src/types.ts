export type UserRole = 'AGENCY_ADMIN' | 'BUSINESS_OWNER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessId?: string;
  avatarUrl?: string;
  password?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt?: string;
}

export interface AiGroundingConfig {
  id: string;
  businessId: string;
  teamSize: string;
  locationSetup: string;
  businessAge: string;
  targetAudience: string | string[];
  supportedLanguages: string[];
  toneEnthusiasm: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Business {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
  website?: string;
  googleReviewUrl?: string;
  description?: string;
  workingHours?: string;
  category: string;
  planId: string;
  planName: string;
  branchLimit: number;
  monthlyTokenLimit: number;
  tokensUsedThisMonth: number;
  remainingTokens?: number;
  lastTokenResetAt?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  createdAt: string;
  aiGrounding?: AiGroundingConfig;
}


export interface Branch {
  id: string;
  businessId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  googlePlaceId?: string;
  googleReviewUrl: string;
  qrCodeUrl?: string;
  qrConfig?: QrConfig;
  serviceTags: string[];
  negativeTags: string[];
  totalReviews: number;
  avgRating: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface TokenUsage {
  id: string;
  businessId: string;
  branchId?: string;
  reviewId?: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  requestStatus: 'SUCCESS' | 'EXCEEDED' | 'FAILED';
  createdAt: string;
  updatedAt?: string;
}

export interface AiModel {
  id: string;
  provider: string;
  model: string;
  inputCostPer1m: number;
  outputCostPer1m: number;
  active: boolean;
  createdAt?: string;
}

export interface Review {
  id: string;
  branchId: string;
  branchName: string;
  businessId: string;
  rating: number;
  serviceTags: string[];
  reviewText: string;
  customerName?: string;
  customerEmail?: string;
  aiGenerated: boolean;
  postedToGoogle: boolean;
  copiedToClipboard: boolean;
  tokensUsed: number;
  tokenUsageId?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  branchId: string;
  branchName: string;
  businessId: string;
  rating: number;
  category: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  comments: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  ownerNotes?: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxBranches: number;
  monthlyTokens: number;
  monthlyTokenLimit?: number;
  features: string[];
  isPopular?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Subscription {
  id: string;
  businessId: string;
  planId: string;
  planName: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  amount: number;
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE';
  startedAt?: string;
  expiresAt?: string;
  nextBillingDate: string;
  createdAt: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  bannerBgColor: string;
  bannerTextColor: string;
  ctaText: string;
  ctaLink: string;
  targetPlanId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  impressions: number;
  clicks: number;
  createdAt: string;
}

export interface ApiKeyConfig {
  geminiApiKey: string;
  primaryModel: string;
  promptTemplate: string;
  temperature: number;
  openaiApiKey?: string;
  isCustomKeyActive: boolean;
  updatedAt: string;
}

export interface SystemSettings {
  agencyName: string;
  supportEmail: string;
  googleRedirectDelayMs: number;
  minStarForGoogle: number;
  defaultPrompt: string;
  demoEnabled?: boolean;
  demoBusinessId?: string;
  demoBranchId?: string;
}

export interface QrConfig {
  dotStyle: 'square' | 'dots' | 'rounded' | 'circle';
  eyeShape: 'square' | 'circle' | 'rounded' | 'leaf';
  fgColor: string;
  bgColor: string;
  isTransparent: boolean;
  useGradient: boolean;
  gradientColor2?: string;
  eyeColor: string;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  // Logo configuration
  logoUrl?: string;
  logoSize: number; // percentage 15 - 30
  logoBorderWidth: number;
  logoBorderColor: string;
  logoBgColor: string;
  logoShape: 'rounded' | 'circle' | 'square';
  // Frame branding configuration
  frameStyle: 'table-tent' | 'standee' | 'minimal-badge' | 'sticker' | 'business-card';
  primaryColor: string;
  accentColor: string;
  frameTitle: string;
  frameSubtitle: string;
  showGoogleBadge: boolean;
  badgeRating: string;
  badgeReviewCount: string;
}

export interface QrTemplate {
  id: string;
  name: string;
  category: 'Minimal' | 'Modern' | 'Corporate' | 'Luxury' | 'Restaurant' | 'Healthcare' | 'Salon' | 'Retail' | 'Custom';
  description?: string;
  config: QrConfig;
  isPreset?: boolean;
  createdAt: string;
}

export interface QrScanTrack {
  id: string;
  branchId: string;
  businessId: string;
  deviceType: 'Mobile' | 'Desktop' | 'Tablet';
  browser: string;
  city?: string;
  country?: string;
  referrer?: string;
  createdAt: string;
}

export interface DemoSettings {
  enabled: boolean;
  demoBusinessId: string;
  demoBranchId: string;
  totalDemoScans: number;
  totalDemoReviews: number;
  avgRating: number;
  lastResetAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}


