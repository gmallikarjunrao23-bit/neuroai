export type UserRole = "owner" | "admin" | "member" | "viewer";

export type SubscriptionTier = "free" | "starter" | "professional" | "enterprise";

export type DocumentStatus = "draft" | "completed" | "archived";

export type DocumentType =
  | "rental-agreement"
  | "nda"
  | "legal-notice"
  | "employment-contract"
  | "partnership-deed"
  | "sale-deed"
  | "loan-agreement"
  | "service-contract"
  | "power-of-attorney"
  | "will"
  | "affidavit"
  | "other";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  organizationId: string;
  subscriptionTier: SubscriptionTier;
  createdAt: Date;
  phone?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: "active" | "past_due" | "canceled" | "trial";
  trialEndsAt?: Date;
  createdAt: Date;
  memberCount: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  isPremium: boolean;
  popular: boolean;
  language: string[];
  estimatedTime: string;
  price?: number;
}

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  content?: string;
  parties: Party[];
  createdAt: Date;
  updatedAt: Date;
  templateId?: string;
  organizationId: string;
  createdBy: string;
  signedAt?: Date;
  expiresAt?: Date;
}

export interface Party {
  id: string;
  name: string;
  type: "individual" | "organization";
  address?: string;
  email?: string;
  phone?: string;
  pan?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  highlighted: boolean;
  popular: boolean;
  maxDocuments: number;
  maxTeamMembers: number;
  aiCredits: number;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  disabled?: boolean;
  submenu?: NavItem[];
}

export interface Activity {
  id: string;
  type: "created" | "updated" | "signed" | "shared" | "deleted";
  description: string;
  documentId?: string;
  documentName?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
}

export interface AnalyticsMetric {
  label: string;
  value: string | number;
  change: number;
  changeType: "positive" | "negative" | "neutral";
  icon: string;
}
