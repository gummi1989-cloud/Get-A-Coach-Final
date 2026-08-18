export type UserRole = 'kunde' | 'coach' | 'admin';

export type CantonCode = 
  | 'ZH' | 'BE' | 'LU' | 'UR' | 'SZ' | 'OW' | 'NW' | 'GL' 
  | 'ZG' | 'FR' | 'SO' | 'BS' | 'BL' | 'SH' | 'AR' | 'AI' 
  | 'SG' | 'GR' | 'AG' | 'TG' | 'TI' | 'VD' | 'VS' | 'NE' 
  | 'GE' | 'JU';

export interface LocationCoords {
  lat: number;
  lng: number;
}

export interface UserAbo {
  id: string;
  sport: string;
  coachId?: string;
  coachName?: string;
  type: '5er' | '10er';
  totalSessions: number;
  remainingSessions: number;
  pricePaid: number;
  purchasedAt: string;
}

export interface UserVoucher {
  code: string;
  discountAmount?: number;
  discountPercent?: number;
  description: string;
  isUsed: boolean;
}

export interface WorkingHoursDay {
  dayOfWeek: number; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  dayName: string; // "Montag", "Dienstag", etc.
  isWorking: boolean;
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "18:00"
  breakStartTime?: string; // e.g. "12:00"
  breakEndTime?: string; // e.g. "13:00"
}

export interface BlockedTimeSlot {
  id: string;
  coachId: string;
  title: string; // e.g. "Mittagspause", "Privater Termin", "Sommerferien"
  type: 'pause' | 'ferien' | 'blockierung';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
}

export interface CoachCalendarSettings {
  iCalToken: string;
  iCalFeedUrl: string;
  workingHours: WorkingHoursDay[];
  blockedSlots: BlockedTimeSlot[];
  autoSyncExternal: boolean;
  externalCalendarType?: 'apple' | 'google' | 'outlook' | 'none';
  lastICalExportAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone: string;
  city: string;
  canton: CantonCode;
  // AGB & Tax Declaration Acceptance
  agb_accepted_at?: string;
  agb_version?: string;
  coach_tax_declaration_accepted_at?: string;
  // Coach specific fields
  isVerified?: boolean;
  verificationStatus?: 'ausstehend' | 'verifiziert' | 'nicht_eingereicht';
  verificationDocName?: string;
  calendarSettings?: CoachCalendarSettings;
}

export interface CertificateItem {
  id: string;
  title: string;
  year: string;
}

export interface CoachProfile {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  sports: string[];
  slogan?: string; // Max. 100 Zeichen
  bio: string; // Bio & Trainingsphilosophie
  achievements?: string[]; // Erfolge & Highlights
  certificates?: CertificateItem[]; // Diplome & Zertifikate
  hourlyRate: number; // CHF
  groupRate: number; // CHF per person
  locationName: string;
  canton: CantonCode;
  coordinates: LocationCoords;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isProfileActive: boolean; // Independent active toggle
  profileStatus?: 'draft' | 'pending_completion' | 'active'; // Status draft/pending/active
  accountHolder?: string; // Name des Kontoinhabers
  iban?: string; // Schweizer IBAN CH...
  bankName?: string; // Name der Bank (optional)
  calendarSettings?: CoachCalendarSettings;
  fiveSessionDiscount: number; // percentage, e.g. 10
  tenSessionDiscount: number; // percentage, e.g. 15
  languages: string[];
  featured: boolean;
}

export interface SportCategory {
  id: string;
  name: string;
  iconName: string;
  description: string;
  popularInCantons: CantonCode[];
}

export interface WaitlistEntry {
  userId: string;
  userName: string;
  userEmail: string;
  joinedAt: string;
}

export interface PdfAttachment {
  id?: string;
  name: string;
  url: string;
  size?: string;
  sizeKb?: number;
  uploadedAt?: string;
}

export interface SessionSlot {
  id: string;
  coachId: string;
  coachName: string;
  coachAvatar: string;
  sport: string;
  title: string;
  description?: string; // z.B. "Mietmaterial nicht im Preis enthalten"
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  locationName: string;
  canton: CantonCode;
  coordinates: LocationCoords;
  type: 'einzel' | 'gruppe';
  minParticipants?: number;
  maxParticipants: number;
  currentParticipants: number;
  price: number; // CHF
  status: 'verfuegbar' | 'ausgebucht' | 'storniert';
  waitlist: WaitlistEntry[];
  // Reservation timer for pending booking requests
  reservedUntil?: string | null; // ISO string when reservation expires
  reservedByUserId?: string | null;
  pdfAttachment?: PdfAttachment;
}

export interface RatingDetail {
  stars: number;
  comment?: string;
  ratedAt: string;
}

export interface Booking {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  coachId: string;
  coachName: string;
  coachAvatar: string;
  sport: string;
  sessionTitle: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 - 11:00"
  locationName: string;
  canton: CantonCode;
  pricePaid: number; // CHF
  paymentMethod: 'TWINT' | 'Kreditkarte';
  twintRefId?: string;
  paymentStatus: 'Bezahlt' | 'Rückerstattet 100%' | 'Rückerstattet 50%' | 'paid' | string;
  bookingDate: string; // ISO string
  status: 'bestaetigt' | 'storniert_gt24h' | 'storniert_lt24h' | 'abgeschlossen' | 'confirmed' | string;
  cancellationDate?: string;
  refundAmount?: number;
  coachCompensation?: number;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paidAt?: any;
  // Request & Reservation tracking (2-hour lock)
  requestStatus?: 'anfrage_ausstehend' | 'bestaetigt' | 'abgelaufen' | 'abgelehnt' | 'zurueckgezogen';
  requestedAt?: string; // ISO timestamp
  reservedUntil?: string; // ISO timestamp (requestedAt + 2h)
  // Custom request linkage & PDF attachment
  isCustomOffer?: boolean;
  customRequestId?: string;
  pdfAttachment?: PdfAttachment;
  // Blind rating tracking
  clientRated: boolean;
  coachRated: boolean;
  clientRating?: RatingDetail;
  coachRating?: RatingDetail;
  blindRatingStatus: 'ausstehend' | 'beidseitig_bewertet' | 'automatisch_freigeschaltet';
  // Admin Payout tracking
  isPaidOut?: boolean;
  paidOutAt?: string;
}

export interface CustomRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  coachId: string;
  coachName: string;
  sport: string;
  participantsCount: number;
  preferredDate: string; // e.g. "2026-08-05" or "Wochenende"
  preferredTimeWindow?: string; // e.g. "14:00 - 16:00"
  description: string;
  status: 'ausstehend' | 'offen' | 'angebot_erstellt' | 'angebot_gesendet' | 'angenommen' | 'akzeptiert' | 'abgelehnt' | 'zurueckgezogen';
  createdAt: string;
  // Offer data from Coach
  offerPrice?: number; // CHF
  offerDate?: string;
  offerTime?: string;
  offerMessage?: string;
  pdfAttachment?: PdfAttachment;
  offerPdfAttachment?: PdfAttachment;
  offerCreatedAt?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  coachId: string;
  userId: string;
  message: string;
  timestamp: string;
  type?: 'text' | 'booking_request' | 'custom_offer' | 'system_notice';
  bookingRequestId?: string;
  customRequestId?: string;
  offerPrice?: number;
  pdfAttachment?: PdfAttachment;
  bookingDetails?: {
    bookingId?: string;
    sessionTitle?: string;
    sport?: string;
    date?: string;
    time?: string;
    location?: string;
    price?: number;
    status?: string;
    pdfAttachment?: PdfAttachment;
  };
  offerDetails?: {
    sport?: string;
    date?: string;
    time?: string;
    participants?: number;
    location?: string;
    price?: number;
    description?: string;
    status?: string;
    offerId?: string;
    pdfAttachment?: PdfAttachment;
  };
  attachment?: PdfAttachment;
  offerStatus?: 'ausstehend' | 'angenommen' | 'abgelaufen' | 'abgelehnt';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'waitlist_available' | 'booking_confirmed' | 'cancellation_refund' | 'ms_bookings' | 'booking_request' | 'custom_offer' | 'request_expired';
  read: boolean;
  actionUrl?: string;
}
