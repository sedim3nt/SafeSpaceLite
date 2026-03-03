// Issue and severity types
export type IssueType =
  | 'mold'
  | 'radon'
  | 'carbon-monoxide'
  | 'heating'
  | 'electrical'
  | 'plumbing'
  | 'structural'
  | 'pests'
  | 'other';

export type Severity = 'emergency_24h' | 'urgent_72h' | 'standard';

export type ReportStatus = 'reported' | 'in_progress' | 'resolved' | 'ignored';

export type CommentCategory =
  | 'mold'
  | 'radon'
  | 'landlord_response'
  | 'air_quality'
  | 'general_health';

export type VoteType = 'helpful' | 'unhelpful';

export type ViolationStatus = 'Resolved' | 'Pending' | 'Unresolved';

export type LicenseStatus = 'Active' | 'Expired' | 'Revoked' | 'None';

// Domain models

export interface Violation {
  date: string;
  type: string;
  status: ViolationStatus;
  description: string;
}

export interface Property {
  address: string;
  landlord?: string;
  licenseStatus?: LicenseStatus;
  violations: Violation[];
  comments: PropertyComment[];
}

export interface PropertyComment {
  id: string;
  text: string;
  date: string;
  helpful: number;
  anonymous: boolean;
}

export interface HealthReport {
  propertyAddress: string;
  issueType: string;
  description: string;
  dateOccurred: string;
  landlordNotified: boolean;
  dateNotified: string;
  anonymous: boolean;
  contactEmail?: string;
}

export interface TrackedIssue {
  id: string;
  propertyAddress: string;
  issueType: string;
  dateReported: string;
  deadline: string;
  status: 'pending' | 'resolved' | 'overdue';
  landlordResponse?: string;
  notes: string;
}

// Emergency guide types

export interface DecisionNode {
  id: string;
  question: string;
  description?: string;
  options?: DecisionOption[];
  result?: DecisionResult;
}

export interface DecisionOption {
  label: string;
  nextId: string | null;
  urgency?: '24hr' | '72hr' | 'standard';
}

export interface DecisionResult {
  urgency: '24hr' | '72hr' | 'standard';
  title: string;
  description: string;
  steps: string[];
  legalNotice?: string;
}

// Emergency contacts

export interface EmergencyContact {
  name: string;
  phone: string;
  description: string;
  hours?: string;
  emergency?: boolean;
}
