export type UserRole = "homeowner" | "pro" | "admin";
export type UserStatus = "active" | "banned" | "pending_clearance";

export interface BanAuditRecord {
  bannedAt: string;
  reason: string;
  bannedBy: string;
  unbannedAt?: string;
  unbannedBy?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  phone: string;
  location: string;
  joinedDate: string;
  lastActive: string;
  totalJobs: number;
  totalSpentOrEarned: number;
  subscriptionPlan?: string;
  banReason?: string;
  bannedAt?: string;
  banHistory?: BanAuditRecord[];
}

export interface ProClearance {
  id: string;
  proId: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  trade: string;
  licenseNumber: string;
  licenseState: string;
  licenseStatus: "verified" | "pending" | "expired" | "rejected";
  licenseDocumentUrl: string;
  insurancePolicyNumber: string;
  insuranceCoverageAmount: string;
  insuranceStatus: "verified" | "pending" | "rejected";
  checkrStatus: "clear" | "pending" | "consider" | "not_started";
  checkrReportUrl?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  decisionNotes?: string;
  clearanceLevel: "cleared" | "pending" | "action_required" | "rejected";
}

export interface Dispute {
  id: string;
  jobId: string;
  jobTitle: string;
  homeownerId: string;
  homeownerName: string;
  homeownerEmail: string;
  proId: string;
  proName: string;
  proBusiness: string;
  amount: number;
  status: "open" | "under_review" | "resolved_refund" | "resolved_payout" | "resolved_split" | "closed";
  reason: string;
  description: string;
  homeownerClaim: string;
  proRebuttal: string;
  photos: string[];
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  resolutionType?: "full_refund" | "full_release" | "partial_split" | "dismissed" | "custom";
}

export interface Order {
  id: string;
  jobTitle: string;
  category: string;
  homeownerId: string;
  homeownerName: string;
  homeownerEmail: string;
  homeownerPhone: string;
  proId: string;
  proName: string;
  proBusiness: string;
  amount: number;
  platformFee: number;
  paymentMethod?: string;
  paymentStatus: "paid_direct" | "direct_pending" | "paid" | "refunded" | "disputed";
  fulfillmentStatus:
    | "scheduled"
    | "on_the_way"
    | "in_progress"
    | "awaiting_confirm"
    | "completed"
    | "disputed"
    | "cancelled";
  orderDate: string;
  completedDate?: string;
  transactionId?: string;
  address: string;
  description: string;
  notes?: string;
  photos?: string[];
  budgetRange?: string;
  urgency?: JobUrgency;
  propertyType?: PropertyType;
  proRating?: number;
  proAvatar?: string;
  quotes?: JobQuote[];
}

export interface Transaction {
  id: string;
  orderId?: string;
  type: "pro_subscription" | "direct_job_payout";
  title: string;
  amount: number;
  feeAmount: number;
  status: "settled" | "refunded" | "processing";
  user: string;
  userRole: UserRole;
  customerEmail?: string;
  date: string;
  invoiceId: string;
  paymentMethod: string;
  providerReference?: string;
  refundStatus?: "none" | "pending" | "refunded" | "partially_refunded";
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  billingInterval: "monthly" | "annually" | "free";
  features: string[];
  isActive: boolean;
  isPopular?: boolean;
  subscriberCount: number;
  trialDays: number;
  badge?: string;
  leadLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  entityType: "user" | "order" | "transaction" | "subscription" | "clearance" | "cms" | "dispute" | "ticket";
  entityId: string;
  entityTitle: string;
  executedBy: string;
  details: string;
  timestamp: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  audience: "homeowner" | "pro" | "general";
  category: string;
  order: number;
  isPublished: boolean;
}

export interface SliderBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  order: number;
}

export interface SiteBrandingConfig {
  siteName: string;
  siteLogoUrl: string;
  siteFooterLogoUrl?: string;
  siteFaviconUrl: string;
  supportEmail: string;
  contactPhone: string;
  physicalAddress: string;
  serviceArea?: string;
  supportHours?: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
    youtube: string;
  };
  sliderBanners: SliderBanner[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface AboutPillar {
  id: string;
  title: string;
  description: string;
  iconName?: "Wrench" | "DollarSign" | "Zap" | "ShieldCheck" | "Clock" | "Award";
}

export interface AboutPageContent {
  // Page Banner & Header
  pageTitle: string;
  pageSubtitle: string;
  bannerImage?: string;

  // Hero / Who We Are Showcase
  whoWeAreEyebrow?: string;
  missionHeading: string;
  missionDescription: string;
  heroImage?: string;

  // Platform Approach / Mission & Vision
  approachEyebrow?: string;
  solutionHeading: string;
  solutionDescription: string;
  visionDescription?: string;
  checklist?: string[];
  storyImage?: string;

  // Why Choose Us
  whyChooseEyebrow?: string;
  whyChooseHeading: string;
  whyChooseSubtitle: string;
  craftsmanImage?: string;
  pillars: AboutPillar[];

  // Call to Action Section
  ctaEyebrow?: string;
  ctaHeading?: string;
  ctaDescription?: string;
  ctaPrimaryText?: string;
  ctaSecondaryText?: string;
}

export interface LegalContent {
  termsAndConditions: string;
  privacyPolicy: string;
  paymentGuaranteeRules: string;
  disputePolicy: string;
  lastUpdated: string;
}

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "numeric_counter"
  | "text_input";

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  iconName?: string;
  priceModifier?: string;
}

export interface CategoryQuestion {
  id: string;
  stepNumber: number;
  title: string;
  subtitle?: string;
  type: QuestionType;
  isRequired: boolean;
  placeholder?: string;
  options: QuestionOption[];
  minNumeric?: number;
  maxNumeric?: number;
  unitLabel?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  coverImage: string;
  baseStartingPrice: number;
  priceUnit: "hourly" | "fixed_estimate" | "per_sqft" | "custom_quote";
  isActive: boolean;
  isPopular: boolean;
  activeProsCount: number;
  completedJobsCount: number;
  questions: CategoryQuestion[];
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory =
  | "billing"
  | "account"
  | "job_issue"
  | "technical"
  | "pro_verification"
  | "general";

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "admin" | "homeowner" | "pro";
  message: string;
  createdAt: string;
  attachments?: string[];
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: "homeowner" | "pro";
  assignedTo?: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface MarqueeItem {
  id: string;
  label: string;
  href: string;
  isActive: boolean;
  order: number;
}

export interface MarqueeConfig {
  isEnabled: boolean;
  speed: "slow" | "normal" | "fast";
  items: MarqueeItem[];
}

export type ReviewStatus = "published" | "pending_moderation" | "flagged" | "hidden";

export interface ReviewReply {
  text: string;
  createdAt: string;
  proName: string;
  isModerated?: boolean;
}

export interface Review {
  id: string;
  jobId: string;
  jobTitle: string;
  category: string;
  homeownerId: string;
  homeownerName: string;
  homeownerAvatar?: string;
  homeownerLocation: string;
  proId: string;
  proName: string;
  proBusiness: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedHire: boolean;
  status: ReviewStatus;
  flagReason?: string;
  helpfulCount: number;
  createdAt: string;
  reply?: ReviewReply;
  moderationNotes?: string;
  photos?: string[];
}

export type JobUrgency = "emergency_asap" | "this_week" | "flexible";
export type PropertyType = "single_family" | "condo_apartment" | "commercial" | "townhouse";
export type JobStatus = 
  | "getting_quotes" 
  | "quotes_in" 
  | "hired" 
  | "scheduled" 
  | "en_route" 
  | "in_progress" 
  | "awaiting_confirm" 
  | "completed" 
  | "disputed" 
  | "cancelled";

export interface JobQuote {
  id: string;
  jobId: string;
  proId: string;
  proName: string;
  proBusiness: string;
  proRating: number;
  proAvatar?: string;
  amount: number;
  estimatedDuration: string;
  earliestAvailability: string;
  message: string;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  createdAt: string;
}

export interface JobLead {
  id: string;
  title: string;
  category: string;
  subCategory?: string;
  description: string;
  homeownerId: string;
  homeownerName: string;
  homeownerPhone: string;
  homeownerEmail: string;
  zipCode: string;
  city: string;
  state: string;
  address?: string;
  urgency: JobUrgency;
  propertyType: PropertyType;
  budgetRange: string;
  status: JobStatus;
  postedAt: string;
  scheduledDate?: string;
  completedDate?: string;
  quotesCount: number;
  quotes: JobQuote[];
  selectedQuoteId?: string;
  hiredProId?: string;
  photos: string[];
  answers?: Record<string, any>;
  invitedProIds?: string[];
}
