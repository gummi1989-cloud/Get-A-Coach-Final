import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, auth } from '../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import {
  signOut,
  deleteUser,
  onAuthStateChanged
} from 'firebase/auth';
import {
  User,
  CoachProfile,
  SessionSlot,
  Booking,
  UserAbo,
  UserVoucher,
  ChatMessage,
  NotificationItem,
  UserRole,
  CantonCode,
  WorkingHoursDay,
  BlockedTimeSlot,
  CustomRequest,
  PdfAttachment
} from '../types';
import {
  MOCK_CLIENT_USER,
  MOCK_COACH_USER,
  MOCK_ADMIN_USER,
  MOCK_COACH_PROFILE,
  INITIAL_COACHES,
  INITIAL_SESSIONS,
  INITIAL_BOOKINGS,
  INITIAL_MESSAGES
} from '../data/mockData';
import { roundCHF, calculateCoachPayout } from '../utils/financeUtils';
import { cleanForFirestore } from '../utils/firestoreUtils';

/**
 * Atomic evaluation helper to check if a 2-hour booking request has expired against current System Date
 */
export const isBookingRequestExpired = (requestedAt?: string, reservedUntil?: string | null): boolean => {
  if (!reservedUntil && !requestedAt) return false;
  const now = new Date();
  if (reservedUntil) {
    return now.getTime() > new Date(reservedUntil).getTime();
  }
  if (requestedAt) {
    return now.getTime() > new Date(requestedAt).getTime() + (2 * 60 * 60 * 1000);
  }
  return false;
};

interface AppContextType {
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
  switchRole: (role: UserRole) => void;
  coaches: CoachProfile[];
  sessions: SessionSlot[];
  bookings: Booking[];
  customRequests: CustomRequest[];
  userAbos: UserAbo[];
  userVouchers: UserVoucher[];
  chatMessages: ChatMessage[];
  notifications: NotificationItem[];
  // Favorite Coaches
  favoriteCoachIds: string[];
  toggleFavoriteCoach: (coachId: string) => void;
  isFavoriteCoach: (coachId: string) => boolean;
  // Filters
  selectedSport: string;
  setSelectedSport: (sport: string) => void;
  selectedLocations: string[];
  setSelectedLocations: React.Dispatch<React.SetStateAction<string[]>>;
  toggleLocation: (locationName: string) => void;
  clearLocations: () => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  selectedCanton?: CantonCode | 'ALL';
  setSelectedCanton?: (canton: CantonCode | 'ALL') => void;
  searchRadiusKm: number;
  setSearchRadiusKm: (radius: number) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  priceMax: number;
  setPriceMax: (price: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Core Actions
  bookSession: (
    session: SessionSlot,
    paymentMethod: 'TWINT' | 'Kreditkarte',
    usedAboId?: string,
    voucherCode?: string,
    pdfAttachment?: PdfAttachment
  ) => { success: boolean; bookingId?: string; message: string };
  acceptBookingRequest: (bookingId: string) => { success: boolean; message: string };
  rejectBookingRequest: (bookingId: string, reason?: string) => { success: boolean; message: string };
  retroactiveConfirmRequest: (bookingId: string) => { success: boolean; message: string };
  cancelBooking: (bookingId: string) => { success: boolean; message: string; refundPct: number };
  // Custom Requests & Offers
  sendCustomRequest: (
    requestData: Omit<CustomRequest, 'id' | 'status' | 'createdAt'>
  ) => { success: boolean; requestId: string };
  createCustomOffer: (
    requestId: string,
    offerDataOrPrice:
      | number
      | {
          price: number;
          date: string;
          time: string;
          message: string;
          pdfAttachment?: PdfAttachment;
        },
    sport?: string,
    date?: string,
    time?: string,
    message?: string,
    pdfAttachment?: PdfAttachment
  ) => { success: boolean; message: string };
  acceptAndPayCustomOffer: (
    requestId: string,
    paymentMethod: 'TWINT' | 'Kreditkarte'
  ) => { success: boolean; bookingId?: string; message: string };
  rejectCustomRequest: (requestId: string) => void;
  withdrawCustomRequest: (requestId: string) => void;
  // Attach PDF
  attachPdfToSession: (sessionId: string, pdf: PdfAttachment) => void;
  uploadCoachVerification: (docName: string) => void;
  rateBooking: (bookingId: string, stars: number, comment?: string) => void;
  joinWaitlist: (sessionId: string) => void;
  leaveWaitlist: (sessionId: string) => void;
  createSession: (newSessionData: Omit<SessionSlot, 'id' | 'currentParticipants' | 'status' | 'waitlist'>) => void;
  updateSession: (sessionId: string, updatedFields: Partial<SessionSlot>) => void;
  sendChatMessage: (
    receiverId: string,
    coachId: string,
    text: string,
    msgType?: 'text' | 'booking_request' | 'custom_offer' | 'system_notice',
    extra?: Partial<ChatMessage>
  ) => void;
  buyAbo: (sport: string, coachId: string | undefined, type: '5er' | '10er', price: number) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  simulate7DaysPassed: (bookingId: string) => void;
  triggerCancellationTestForWaitlist: (sessionId: string) => void;
  updateCoachProfile: (coachId: string, updatedFields: Partial<CoachProfile>) => void;
  updateWorkingHours: (workingHours: WorkingHoursDay[]) => void;
  addBlockedSlot: (slot: Omit<BlockedTimeSlot, 'id'>) => void;
  deleteBlockedSlot: (slotId: string) => void;
  acceptAgb: (version?: string) => void;
  acceptCoachTaxDeclaration: () => void;
  filterContactDetails: (text: string) => { cleanedText: string; containsContactInfo: boolean };
  // Admin Payout Actions
  markBookingsPaidOutUntilDate: (cutoffDate: string, coachId?: string) => { updatedCount: number; totalPaidAmount: number; message: string };
  toggleBookingPaidOut: (bookingId: string) => void;
  // User Profile & Avatar actions
  updateUserAvatar: (avatarUrl: string) => void;
  updateUserProfile: (updatedFields: Partial<User>) => void;
  // Auth state & actions
  isAuthenticated: boolean;
  login: (role: UserRole, emailInput?: string, passwordInput?: string) => { success: boolean; message?: string };
  registerCustomer: (data: { username: string; email: string; phone: string; password?: string; avatar?: string }) => { success: boolean; message: string };
  registerCoach: (data: { fullName: string; email: string; phone: string; password?: string; avatar?: string }) => { success: boolean; message: string };
  logout: () => void;
  deleteUserAccount: (targetUserId?: string) => Promise<{ success: boolean; message: string }>;
  authNotice: string | null;
  openAuthModalWithNotice: (notice?: string) => void;
  clearAuthNotice: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// LocalStorage helpers for deleted accounts blacklist & registered user caching
const getStoredDeletedEmails = (): string[] => {
  try {
    const raw = localStorage.getItem('getacoach_deleted_emails');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const storeDeletedEmail = (email: string) => {
  try {
    const list = getStoredDeletedEmails();
    const normalized = email.trim().toLowerCase();
    if (normalized && !list.includes(normalized)) {
      list.push(normalized);
      localStorage.setItem('getacoach_deleted_emails', JSON.stringify(list));
    }
  } catch (e) {
    console.warn('LocalStorage store deleted email warning:', e);
  }
};

const removeStoredDeletedEmail = (email: string) => {
  try {
    const list = getStoredDeletedEmails();
    const normalized = email.trim().toLowerCase();
    const filtered = list.filter(e => e.toLowerCase() !== normalized);
    localStorage.setItem('getacoach_deleted_emails', JSON.stringify(filtered));
  } catch (e) {
    console.warn('LocalStorage remove deleted email warning:', e);
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_CLIENT_USER);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Application Data States
  const [coaches, setCoaches] = useState<CoachProfile[]>(INITIAL_COACHES);
  const [sessions, setSessions] = useState<SessionSlot[]>(INITIAL_SESSIONS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [userAbos, setUserAbos] = useState<UserAbo[]>([]);
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [deletedEmails, setDeletedEmails] = useState<string[]>(getStoredDeletedEmails);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  // Seed test coach and test offers into Firestore for simulation and testing
  useEffect(() => {
    const seedTestCoachAndSessions = async () => {
      try {
        const coachDocRef = doc(db, 'coaches', MOCK_COACH_PROFILE.id);
        const coachSnap = await getDoc(coachDocRef);
        if (!coachSnap.exists()) {
          await setDoc(coachDocRef, cleanForFirestore(MOCK_COACH_PROFILE), { merge: true });
        }

        for (const session of INITIAL_SESSIONS) {
          const sessionDocRef = doc(db, 'sessions', session.id);
          const sessionSnap = await getDoc(sessionDocRef);
          if (!sessionSnap.exists()) {
            await setDoc(sessionDocRef, cleanForFirestore(session), { merge: true });
          }
        }
      } catch (err) {
        console.warn('Note on Firestore test seeding:', err);
      }
    };

    seedTestCoachAndSessions();
  }, []);

  // Firestore real-time listeners
  useEffect(() => {
    const unsubCoaches = onSnapshot(collection(db, 'coaches'), (snapshot) => {
      if (snapshot.empty) {
        setCoaches(INITIAL_COACHES);
      } else {
        const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CoachProfile));
        setCoaches(loaded.length > 0 ? loaded : INITIAL_COACHES);
      }
    }, (e) => {
      console.warn('Firestore coaches listener fallback:', e);
      setCoaches(INITIAL_COACHES);
    });

    const unsubSessions = onSnapshot(collection(db, 'sessions'), (snapshot) => {
      if (snapshot.empty) {
        setSessions(INITIAL_SESSIONS);
      } else {
        const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SessionSlot));
        setSessions(loaded.length > 0 ? loaded : INITIAL_SESSIONS);
      }
    }, (e) => {
      console.warn('Firestore sessions listener fallback:', e);
      setSessions(INITIAL_SESSIONS);
    });

    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      if (snapshot.empty) {
        setBookings([]);
      } else {
        const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
        setBookings(loaded);
      }
    }, (e) => console.warn('Firestore bookings listener fallback:', e));

    const unsubChat = onSnapshot(collection(db, 'chatMessages'), (snapshot) => {
      if (snapshot.empty) {
        setChatMessages([]);
      } else {
        const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
        setChatMessages(loaded);
      }
    }, (e) => console.warn('Firestore chat listener fallback:', e));

    const unsubRequests = onSnapshot(collection(db, 'customRequests'), (snapshot) => {
      if (snapshot.empty) {
        setCustomRequests([]);
      } else {
        const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CustomRequest));
        setCustomRequests(loaded);
      }
    }, (e) => console.warn('Firestore requests listener fallback:', e));

    const unsubDeleted = onSnapshot(collection(db, 'deletedAccounts'), (snapshot) => {
      if (!snapshot.empty) {
        const emailsFromDb = snapshot.docs.map(d => (d.data().email || d.id || '').toLowerCase()).filter(Boolean);
        setDeletedEmails(prev => Array.from(new Set([...prev, ...emailsFromDb])));
      }
    }, (e) => console.warn('Firestore deletedAccounts listener fallback:', e));

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      if (snapshot.empty) {
        setRegisteredUsers([]);
      } else {
        const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
        setRegisteredUsers(loaded);
      }
    }, (e) => console.warn('Firestore users listener fallback:', e));

    return () => {
      unsubCoaches();
      unsubSessions();
      unsubBookings();
      unsubChat();
      unsubRequests();
      unsubDeleted();
      unsubUsers();
    };
  }, []);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as User);
          }
        } catch (e) {
          console.error('Error fetching user profile from Firestore:', e);
        }
      }
    });
    return () => unsubAuth();
  }, []);

  const login = (role: UserRole, emailInput?: string, _passwordInput?: string): { success: boolean; message?: string } => {
    const normalizedEmail = (emailInput || '').trim().toLowerCase();

    // Check if account was deleted
    const isDeleted = (normalizedEmail && deletedEmails.includes(normalizedEmail)) || 
                      (normalizedEmail && getStoredDeletedEmails().includes(normalizedEmail));
    if (isDeleted) {
      return {
        success: false,
        message: 'Dieses Konto wurde dauerhaft aus dem System gelöscht. Eine Anmeldung ist nicht mehr möglich. Bitte registriere dich bei Bedarf neu.'
      };
    }

    if (role === 'admin') {
      setIsAuthenticated(true);
      setCurrentUser(MOCK_ADMIN_USER);
      setAuthNotice(null);
      return { success: true };
    }

    if (role === 'coach') {
      // Find matching coach by userId, id or name
      const existingCoach = coaches.find(c =>
        (c.userId && c.userId.toLowerCase() === normalizedEmail) ||
        (c.id && c.id.toLowerCase() === normalizedEmail) ||
        c.name.toLowerCase() === normalizedEmail
      );
      const userCoach = registeredUsers.find(u => u.role === 'coach' && u.email.toLowerCase() === normalizedEmail);

      // If neither coach profile nor coach user doc exists and email is not default demo
      if (!existingCoach && !userCoach && normalizedEmail !== 'coach@getacoach.ch' && normalizedEmail !== '') {
        return {
          success: false,
          message: 'Kein aktives Coach-Konto mit dieser E-Mail-Adresse gefunden. Falls du dein Konto gelöscht hast, ist keine Anmeldung mehr möglich. Bitte registriere dich bei Bedarf neu.'
        };
      }

      const coachUserId = existingCoach?.userId || userCoach?.id || 'user_coach_' + Date.now();
      let coachName = existingCoach?.name || userCoach?.name || 'Angemeldete/r Coach';
      if (!coachName || coachName === 'Angemeldete/r Coach') {
        if (emailInput && emailInput.includes('@')) {
          const prefix = emailInput.split('@')[0].replace(/[\._\-\+]/g, ' ');
          coachName = prefix.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
      }

      const activeCoach: User = {
        id: coachUserId,
        name: coachName,
        email: emailInput && emailInput.trim() ? emailInput.trim() : 'coach@getacoach.ch',
        role: 'coach',
        avatar: existingCoach?.avatar || userCoach?.avatar || '',
        phone: userCoach?.phone || '+41 79 123 45 67',
        city: existingCoach?.locationName || userCoach?.city || 'Zürich',
        canton: existingCoach?.canton || userCoach?.canton || 'ZH',
        isVerified: existingCoach?.isVerified ?? false,
        verificationStatus: existingCoach?.isVerified ? 'verifiziert' : 'ausstehend',
        agb_accepted_at: userCoach?.agb_accepted_at || new Date().toISOString(),
        agb_version: '1.0',
        coach_tax_declaration_accepted_at: new Date().toISOString()
      };

      setIsAuthenticated(true);
      setCurrentUser(activeCoach);
      setAuthNotice(null);
      return { success: true };
    }

    // Role: 'kunde'
    const existingCust = registeredUsers.find(u => u.role === 'kunde' && u.email.toLowerCase() === normalizedEmail);
    const userEmail = emailInput && emailInput.trim() ? emailInput.trim() : 'kunde@getacoach.ch';

    let userName = existingCust?.name || 'Angemeldete/r Kund:in';
    if (!existingCust && emailInput && emailInput.includes('@')) {
      const prefix = emailInput.split('@')[0].replace(/[\._\-\+]/g, ' ');
      userName = prefix.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    const activeCust: User = {
      id: existingCust?.id || ('user_cust_' + Date.now()),
      name: userName || 'Angemeldete/r Kund:in',
      email: userEmail,
      role: 'kunde',
      avatar: existingCust?.avatar || '',
      phone: existingCust?.phone || '+41 79 123 45 67',
      city: existingCust?.city || 'Zürich',
      canton: existingCust?.canton || 'ZH',
      agb_accepted_at: existingCust?.agb_accepted_at || new Date().toISOString(),
      agb_version: '1.0'
    };

    if (!existingCust && userEmail) {
      setDoc(doc(db, 'users', activeCust.id), activeCust).catch(() => {});
    }

    setIsAuthenticated(true);
    setCurrentUser(activeCust);
    setAuthNotice(null);
    return { success: true };
  };

  const registerCustomer = (data: { username: string; email: string; phone: string; password?: string; avatar?: string }) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    // Unblock from deleted blacklist if registering afresh
    removeStoredDeletedEmail(normalizedEmail);
    setDeletedEmails(prev => prev.filter(e => e.toLowerCase() !== normalizedEmail));
    const sanitizedKey = normalizedEmail.replace(/[\/\.#$\[\]]/g, '_');
    deleteDoc(doc(db, 'deletedAccounts', sanitizedKey)).catch(() => {});

    const formattedPhone = data.phone.trim().startsWith('+') ? data.phone.trim() : `+41 ${data.phone.trim().replace(/^0/, '')}`;
    const newUser: User = {
      id: 'user_cust_' + Date.now(),
      name: data.username.trim(),
      email: data.email.trim(),
      phone: formattedPhone,
      city: 'Zürich',
      canton: 'ZH',
      role: 'kunde',
      avatar: data.avatar || '',
      agb_accepted_at: new Date().toISOString(),
      agb_version: '1.0'
    };
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setAuthNotice(null);

    // Save user to Firestore asynchronously
    setDoc(doc(db, 'users', newUser.id), cleanForFirestore(newUser)).catch(err => console.error('Error saving user to Firestore:', err));

    return { success: true, message: 'Erfolgreich als Kunde registriert!' };
  };

  const registerCoach = (data: { fullName: string; email: string; phone: string; password?: string; avatar?: string }) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    // Unblock from deleted blacklist if registering afresh
    removeStoredDeletedEmail(normalizedEmail);
    setDeletedEmails(prev => prev.filter(e => e.toLowerCase() !== normalizedEmail));
    const sanitizedKey = normalizedEmail.replace(/[\/\.#$\[\]]/g, '_');
    deleteDoc(doc(db, 'deletedAccounts', sanitizedKey)).catch(() => {});

    const coachUserId = 'user_coach_' + Date.now();
    const formattedPhone = data.phone.trim().startsWith('+') ? data.phone.trim() : `+41 ${data.phone.trim().replace(/^0/, '')}`;
    const newUser: User = {
      id: coachUserId,
      name: data.fullName.trim(),
      email: data.email.trim(),
      phone: formattedPhone,
      city: 'Zürich',
      canton: 'ZH',
      role: 'coach',
      isVerified: false,
      avatar: data.avatar || '',
      agb_accepted_at: new Date().toISOString(),
      agb_version: '1.0',
      coach_tax_declaration_accepted_at: new Date().toISOString()
    };

    const newCoachProfile: CoachProfile = {
      id: 'coach_' + Date.now(),
      userId: coachUserId,
      name: data.fullName.trim(),
      avatar: newUser.avatar,
      locationName: 'Zürich',
      canton: 'ZH',
      coordinates: { lat: 47.3769, lng: 8.5417 },
      hourlyRate: 100,
      groupRate: 45,
      fiveSessionDiscount: 0,
      tenSessionDiscount: 0,
      rating: 5.0,
      reviewCount: 0,
      sports: ['Tennis', 'Padel Tennis'],
      bio: 'Neues Coach-Profil. Vervollständige nun deine Angaben in Stufe 2.',
      achievements: [],
      certificates: [],
      isVerified: false,
      languages: ['Deutsch'],
      slogan: 'Dein persönlicher Coach in der Schweiz',
      isProfileActive: false,
      featured: false
    };

    setCoaches(prev => [newCoachProfile, ...prev]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setAuthNotice(null);

    // Save user and coach profile to Firestore
    setDoc(doc(db, 'users', newUser.id), cleanForFirestore(newUser)).catch(err => console.error('Error saving coach user to Firestore:', err));
    setDoc(doc(db, 'coaches', newCoachProfile.id), cleanForFirestore(newCoachProfile)).catch(err => console.error('Error saving coach profile to Firestore:', err));

    return { success: true, message: 'Stufe 1 Account-Erstellung erfolgreich!' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(MOCK_CLIENT_USER);
    setAuthNotice(null);
    signOut(auth).catch(() => {});
  };

  const openAuthModalWithNotice = (notice?: string) => {
    setAuthNotice(notice || "Bitte melde dich an oder registriere dich, um diesen Termin anzufragen.");
  };

  const clearAuthNotice = () => {
    setAuthNotice(null);
  };

  // Contact details filter for internal messaging protection (Anti-Evasion Filter)
  const filterContactDetails = (text: string) => {
    if (!text) return { cleanedText: text, containsContactInfo: false };

    // 1. Convert written number words (German & English) to digits in normalized copy
    const numberWordsMap: Record<string, string> = {
      'null': '0', 'eins': '1', 'ein': '1', 'zwei': '2', 'drei': '3', 'vier': '4', 'fünf': '5', 'funf': '5',
      'sechs': '6', 'sieben': '7', 'acht': '8', 'neun': '9', 'zehn': '10',
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
      'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
    };

    let wordNormalizedText = text.toLowerCase();
    Object.keys(numberWordsMap).forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      wordNormalizedText = wordNormalizedText.replace(regex, numberWordsMap[word]);
    });

    // 2. Email Regex (Standard + Obfuscated)
    const standardEmailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
    const obfuscatedEmailRegex = /[a-zA-Z0-9._%+-]+\s*(?:\[at\]|\(at\)|@|\bat\b)\s*[a-zA-Z0-9.-]+\s*(?:\[dot\]|\(dot\)|\.|\bdot\b)\s*[a-zA-Z]{2,}/gi;

    // 3. Phone Regex (Standard + stripped separator check)
    const standardPhoneRegex = /(\+41|0041|07[5-9]|04[1-9])[\s./-]*\d[\s./-]*\d[\s./-]*\d[\s./-]*\d[\s./-]*\d[\s./-]*\d/gi;
    
    // Strip separators to check for hidden phone sequences (e.g. 0 7 9 1 2 3 4 5 6 7)
    const digitsOnlyText = wordNormalizedText.replace(/[\s./\\()\-–_]/g, '');
    const hiddenPhoneRegex = /(?:\+41|0041|07[5-9]|04[1-9]|03[1-9]|02[1-9])\d{7,9}|\b\d{8,13}\b/;

    const hasStandardEmail = standardEmailRegex.test(text);
    const hasObfuscatedEmail = obfuscatedEmailRegex.test(text) || obfuscatedEmailRegex.test(wordNormalizedText);
    const hasStandardPhone = standardPhoneRegex.test(text) || standardPhoneRegex.test(wordNormalizedText);
    const hasHiddenPhone = hiddenPhoneRegex.test(digitsOnlyText);

    const containsContactInfo = hasStandardEmail || hasObfuscatedEmail || hasStandardPhone || hasHiddenPhone;

    if (containsContactInfo) {
      let cleanedText = text
        .replace(standardEmailRegex, '[Kontaktdaten geschützt – Bitte nutze den sicheren Plattform-Chat]')
        .replace(obfuscatedEmailRegex, '[Kontaktdaten geschützt – Bitte nutze den sicheren Plattform-Chat]')
        .replace(standardPhoneRegex, '[Kontaktdaten geschützt – Bitte nutze den sicheren Plattform-Chat]');

      if (!cleanedText.includes('[Kontaktdaten geschützt – Bitte nutze den sicheren Plattform-Chat]')) {
        cleanedText = '[Kontaktdaten geschützt – Bitte nutze den sicheren Plattform-Chat]';
      }

      return { cleanedText, containsContactInfo: true };
    }

    return { cleanedText: text, containsContactInfo: false };
  };

  // Chat message send with optional type and extra fields
  const sendChatMessage = (
    receiverId: string,
    coachId: string,
    text: string,
    msgType: 'text' | 'booking_request' | 'custom_offer' | 'system_notice' = 'text',
    extra?: Partial<ChatMessage>
  ) => {
    const { cleanedText, containsContactInfo } = filterContactDetails(text);
    const finalMsg = containsContactInfo
      ? `${cleanedText}\n\n🔒 [Sicherheitshinweis: Kontaktdaten wurden zum Schutz des Käuferschutzes automatisch geschützt.]`
      : cleanedText;

    if (containsContactInfo) {
      setNotifications(prev => [
        {
          id: 'notif_security_' + Date.now(),
          title: '⚠️ Sicherheits-Alert: Kontaktdaten gefiltert',
          message: `In einer Nachricht von ${currentUser.name} wurden Kontaktdaten oder Kontaktdaten-Muster automatisch gefiltert.`,
          timestamp: new Date().toISOString(),
          type: 'request_expired',
          read: false
        },
        ...prev
      ]);
    }

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId,
      coachId,
      userId: currentUser.role === 'kunde' ? currentUser.id : receiverId,
      message: finalMsg,
      timestamp: new Date().toISOString(),
      type: msgType,
      ...extra
    };
    setChatMessages(prev => [...prev, newMsg]);
    setDoc(doc(db, 'chatMessages', newMsg.id), cleanForFirestore(newMsg)).catch(e => console.error('Error saving chat message:', e));
  };

  // Periodically check and auto-expire pending 2-hour booking requests
  useEffect(() => {
    const checkExpirationInterval = setInterval(() => {
      const now = new Date();
      setBookings(prevBookings => {
        let changed = false;
        const updated = prevBookings.map(b => {
          if (
            b.requestStatus === 'anfrage_ausstehend' &&
            b.reservedUntil &&
            new Date(b.reservedUntil) < now
          ) {
            changed = true;
            // Free session reservation
            setSessions(prevSessions =>
              prevSessions.map(s =>
                s.id === b.sessionId
                  ? { ...s, reservedUntil: null, reservedByUserId: null, status: 'verfuegbar' }
                  : s
              )
            );
            return {
              ...b,
              requestStatus: 'abgelaufen' as const
            };
          }
          return b;
        });

        if (changed) {
          setNotifications(prevNotifs => [
            {
              id: 'notif_exp_' + Date.now(),
              title: 'Anfrage Abgelaufen (2-Stunden-Sperre)',
              message: 'Eine Buchungsanfrage ist nach 2 Stunden ohne Rückmeldung abgelaufen. Der Slot ist wieder freigeschaltet.',
              timestamp: now.toISOString(),
              type: 'request_expired',
              read: false
            },
            ...prevNotifs
          ]);
        }
        return updated;
      });
    }, 15000); // Check every 15 seconds

    return () => clearInterval(checkExpirationInterval);
  }, []);

  // Send Booking Request for Standard Slot (2-Hour Reservation)
  const bookSession = (
    session: SessionSlot,
    paymentMethod: 'TWINT' | 'Kreditkarte',
    _usedAboId?: string,
    _voucherCode?: string,
    pdfAttachment?: PdfAttachment
  ) => {
    if (session.currentParticipants >= session.maxParticipants) {
      return { success: false, message: 'Dieser Slot ist bereits ausgebucht.' };
    }

    if (
      session.reservedUntil &&
      new Date(session.reservedUntil) > new Date() &&
      session.reservedByUserId !== currentUser.id
    ) {
      return { success: false, message: 'Dieser Slot ist aktuell für eine andere Anfrage reserviert.' };
    }

    let finalPrice = session.price;

    const twintRef = paymentMethod === 'TWINT' ? `TWNT-${Math.floor(10000 + Math.random() * 90000)}-CH` : undefined;

    const requestedAt = new Date().toISOString();
    const reservedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 Hours

    const newBooking: Booking = {
      id: 'booking_' + Date.now(),
      sessionId: session.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userPhone: currentUser.phone || '',
      coachId: session.coachId,
      coachName: session.coachName,
      coachAvatar: session.coachAvatar || '',
      sport: session.sport,
      sessionTitle: session.title,
      date: session.date,
      time: `${session.startTime} - ${session.endTime}`,
      locationName: session.locationName,
      canton: session.canton,
      pricePaid: finalPrice,
      paymentMethod,
      twintRefId: twintRef || undefined,
      paymentStatus: 'Bezahlt',
      bookingDate: requestedAt,
      status: 'bestaetigt',
      requestStatus: 'anfrage_ausstehend',
      requestedAt,
      reservedUntil,
      pdfAttachment: pdfAttachment || session.pdfAttachment || undefined,
      clientRated: false,
      coachRated: false,
      blindRatingStatus: 'ausstehend'
    };

    setBookings(prev => [newBooking, ...prev]);
    setDoc(doc(db, 'bookings', newBooking.id), cleanForFirestore(newBooking)).catch(e => console.error('Error saving booking to Firestore:', e));

    // Update Session reservation timer
    setSessions(prev =>
      prev.map(s => {
        if (s.id === session.id) {
          return {
            ...s,
            reservedUntil,
            reservedByUserId: currentUser.id
          };
        }
        return s;
      })
    );

    const targetCoach = coaches.find(c => c.id === session.coachId);
    const coachUserId = targetCoach?.userId || 'user_coach_1';

    sendChatMessage(
      coachUserId,
      session.coachId,
      `📩 Neue Buchungsanfrage von ${currentUser.name} für "${session.title}" am ${session.date} (${session.startTime} - ${session.endTime} Uhr).\n\n⏱️ Dieser Slot ist für 2 Stunden reserviert. Bitte bestätige oder lehne ab.`,
      'booking_request',
      {
        bookingRequestId: newBooking.id,
        offerPrice: finalPrice,
        offerDetails: {
          sport: session.sport,
          date: session.date,
          time: `${session.startTime} - ${session.endTime}`,
          location: session.locationName,
          pdfAttachment: newBooking.pdfAttachment
        }
      }
    );

    setNotifications(prev => [
      {
        id: 'notif_' + Date.now(),
        title: 'Buchungsanfrage Gesendet!',
        message: `Deine Anfrage für "${session.title}" wurde gesendet. Der Slot ist für 2 Stunden reserviert.`,
        timestamp: requestedAt,
        type: 'booking_request',
        read: false
      },
      ...prev
    ]);

    return {
      success: true,
      bookingId: newBooking.id,
      message: 'Buchungsanfrage erfolgreich gesendet! Der Slot ist für 2 Stunden reserviert.'
    };
  };

  // Coach accepts pending booking request
  const acceptBookingRequest = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Anfrage nicht gefunden.' };

    // Atomic evaluation against System Date
    if (booking.requestStatus === 'abgelaufen' || isBookingRequestExpired(booking.requestedAt, booking.reservedUntil)) {
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, requestStatus: 'abgelaufen' } : b))
      );
      setSessions(prev =>
        prev.map(s =>
          s.id === booking.sessionId
            ? { ...s, reservedUntil: null, reservedByUserId: null, status: 'verfuegbar' }
            : s
        )
      );
      return { success: false, message: 'Diese Anfrage ist vor mehr als 2 Stunden abgelaufen' };
    }

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, requestStatus: 'bestaetigt', status: 'bestaetigt' } : b))
    );

    setSessions(prev =>
      prev.map(s => {
        if (s.id === booking.sessionId) {
          const nextCount = s.currentParticipants + 1;
          return {
            ...s,
            currentParticipants: nextCount,
            reservedUntil: null,
            reservedByUserId: null,
            status: nextCount >= s.maxParticipants ? 'ausgebucht' : 'verfuegbar'
          };
        }
        return s;
      })
    );

    sendChatMessage(
      booking.userId,
      booking.coachId,
      `✅ Deine Buchungsanfrage für "${booking.sessionTitle}" am ${booking.date} (${booking.time}) wurde von Coach ${booking.coachName} bestätigt! Viel Erfolg beim Training.`,
      'system_notice'
    );

    setNotifications(prev => [
      {
        id: 'notif_' + Date.now(),
        title: 'Buchungsanfrage Bestätigt!',
        message: `Coach ${booking.coachName} hat deine Anfrage für "${booking.sessionTitle}" am ${booking.date} angenommen.`,
        timestamp: new Date().toISOString(),
        type: 'booking_confirmed',
        read: false
      },
      ...prev
    ]);

    return { success: true, message: 'Buchungsanfrage erfolgreich bestätigt!' };
  };

  // Coach rejects pending booking request
  const rejectBookingRequest = (bookingId: string, reason?: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Anfrage nicht gefunden.' };

    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, requestStatus: 'abgelehnt', status: 'storniert_gt24h', paymentStatus: 'Rückerstattet 100%' }
          : b
      )
    );

    setSessions(prev =>
      prev.map(s =>
        s.id === booking.sessionId
          ? { ...s, reservedUntil: null, reservedByUserId: null, status: 'verfuegbar' }
          : s
      )
    );

    sendChatMessage(
      booking.userId,
      booking.coachId,
      `❌ Deine Buchungsanfrage für "${booking.sessionTitle}" konnte von Coach ${booking.coachName} leider nicht angenommen werden.${
        reason ? ` Grund: ${reason}` : ''
      } Beträge wurden automatisch zurückerstattet.`,
      'system_notice'
    );

    return { success: true, message: 'Anfrage abgelehnt.' };
  };

  // Coach retroactively confirms an expired request
  const retroactiveConfirmRequest = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Anfrage nicht gefunden.' };

    const targetSession = sessions.find(s => s.id === booking.sessionId);
    if (targetSession && targetSession.currentParticipants >= targetSession.maxParticipants) {
      return { success: false, message: 'Der Slot ist inzwischen leider ausgebucht.' };
    }

    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, requestStatus: 'bestaetigt', status: 'bestaetigt' } : b))
    );

    setSessions(prev =>
      prev.map(s => {
        if (s.id === booking.sessionId) {
          const nextCount = s.currentParticipants + 1;
          return {
            ...s,
            currentParticipants: nextCount,
            reservedUntil: null,
            reservedByUserId: null,
            status: nextCount >= s.maxParticipants ? 'ausgebucht' : 'verfuegbar'
          };
        }
        return s;
      })
    );

    sendChatMessage(
      booking.userId,
      booking.coachId,
      `🎉 Gute Nachrichten! Coach ${booking.coachName} hat deine zuvor abgelaufene Anfrage für "${booking.sessionTitle}" am ${booking.date} nachträglich bestätigt!`,
      'system_notice'
    );

    return { success: true, message: 'Anfrage nachträglich erfolgreich bestätigt!' };
  };

  // Custom Request Handling
  const sendCustomRequest = (
    requestData: Omit<CustomRequest, 'id' | 'status' | 'createdAt'>
  ) => {
    const newReq: CustomRequest = {
      ...requestData,
      id: 'req_' + Date.now(),
      status: 'ausstehend',
      createdAt: new Date().toISOString()
    };

    setCustomRequests(prev => [newReq, ...prev]);
    setDoc(doc(db, 'customRequests', newReq.id), cleanForFirestore(newReq)).catch(e => console.error('Error saving custom request to Firestore:', e));

    const targetCoach = coaches.find(c => c.id === requestData.coachId);
    const coachUserId = targetCoach?.userId || 'user_coach_1';

    sendChatMessage(
      coachUserId,
      requestData.coachId,
      `📋 Neue individuelle Anfrage von ${requestData.userName} für ${requestData.sport}:\n• Personen: ${requestData.participantsCount}\n• Wunschdatum: ${requestData.preferredDate} (${
        requestData.preferredTimeWindow || 'Flexibel'
      })\n• Nachricht: "${requestData.description}"\n\nDu kannst direkt im Dashboard ein persönliches Angebot mit Preis (CHF) erstellen.`,
      'custom_offer',
      {
        customRequestId: newReq.id
      }
    );

    setNotifications(prev => [
      {
        id: 'notif_' + Date.now(),
        title: 'Individuelle Anfrage Gesendet',
        message: `Deine Spezial-Anfrage an Coach ${requestData.coachName} wurde übermittelt.`,
        timestamp: new Date().toISOString(),
        type: 'custom_offer',
        read: false
      },
      ...prev
    ]);

    return { success: true, requestId: newReq.id };
  };

  const createCustomOffer = (
    requestId: string,
    offerDataOrPrice:
      | number
      | {
          price: number;
          date: string;
          time: string;
          message: string;
          pdfAttachment?: PdfAttachment;
        },
    _sportOrDate?: string,
    _dateOrTime?: string,
    _timeOrDesc?: string,
    _descOrPdf?: string | PdfAttachment,
    _pdf?: PdfAttachment
  ) => {
    let price: number;
    let date: string;
    let time: string;
    let message: string;
    let pdfAttachment: PdfAttachment | undefined;

    if (typeof offerDataOrPrice === 'object') {
      price = offerDataOrPrice.price;
      date = offerDataOrPrice.date;
      time = offerDataOrPrice.time;
      message = offerDataOrPrice.message;
      pdfAttachment = offerDataOrPrice.pdfAttachment;
    } else {
      price = offerDataOrPrice;
      date = _dateOrTime || 'Nach Vereinbarung';
      time = _timeOrDesc || 'Flexibel';
      if (typeof _descOrPdf === 'string') {
        message = _descOrPdf;
        pdfAttachment = _pdf;
      } else {
        message = 'Individuelles Coaching-Angebot';
        pdfAttachment = _descOrPdf;
      }
    }

    const targetReq = customRequests.find(r => r.id === requestId);

    setCustomRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'angebot_erstellt',
              offerPrice: price,
              offerDate: date,
              offerTime: time,
              offerMessage: message,
              pdfAttachment: pdfAttachment,
              offerCreatedAt: new Date().toISOString()
            }
          : r
      )
    );

    if (targetReq) {
      sendChatMessage(
        targetReq.userId,
        targetReq.coachId,
        `💼 Persönliches Angebot von Coach ${targetReq.coachName}:\n• Datum: ${date} (${time})\n• Preis: CHF ${price.toFixed(
          2
        )}\n• Hinweis: "${message}"${
          pdfAttachment ? `\n• PDF Anhang: ${pdfAttachment.name}` : ''
        }\n\nKlicke auf 'Angebot annehmen', um die Buchung abzuschliessen.`,
        'custom_offer',
        {
          customRequestId: requestId,
          offerPrice: price,
          offerStatus: 'ausstehend',
          offerDetails: {
            sport: targetReq.sport,
            date,
            time,
            participants: targetReq.participantsCount,
            pdfAttachment: pdfAttachment
          }
        }
      );
    }

    return { success: true, message: 'Persönliches Angebot erfolgreich gesendet!' };
  };

  const acceptAndPayCustomOffer = (
    requestId: string,
    paymentMethod: 'TWINT' | 'Kreditkarte'
  ) => {
    const targetReq = customRequests.find(r => r.id === requestId);
    if (!targetReq || !targetReq.offerPrice) {
      return { success: false, message: 'Angebot ungültig oder abgelaufen.' };
    }

    setCustomRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'angenommen' } : r))
    );

    const twintRef = paymentMethod === 'TWINT' ? `TWNT-${Math.floor(10000 + Math.random() * 90000)}-CH` : undefined;

    const newBooking: Booking = {
      id: 'booking_custom_' + Date.now(),
      sessionId: 'session_custom_' + Date.now(),
      userId: targetReq.userId,
      userName: targetReq.userName,
      userEmail: targetReq.userEmail,
      userPhone: targetReq.userPhone,
      coachId: targetReq.coachId,
      coachName: targetReq.coachName,
      coachAvatar: coaches.find(c => c.id === targetReq.coachId)?.avatar || '',
      sport: targetReq.sport,
      sessionTitle: `Individuelles Coaching (${targetReq.participantsCount} Pers.)`,
      date: targetReq.offerDate || 'Nach Vereinbarung',
      time: targetReq.offerTime || 'Flexibel',
      locationName: 'Individueller Treffpunkt nach Absprache',
      canton: 'ZH',
      pricePaid: targetReq.offerPrice,
      paymentMethod,
      twintRefId: twintRef || undefined,
      paymentStatus: 'Bezahlt',
      bookingDate: new Date().toISOString(),
      status: 'bestaetigt',
      requestStatus: 'bestaetigt',
      isCustomOffer: true,
      customRequestId: requestId,
      pdfAttachment: targetReq.pdfAttachment || undefined,
      clientRated: false,
      coachRated: false,
      blindRatingStatus: 'ausstehend'
    };

    setBookings(prev => [newBooking, ...prev]);
    setDoc(doc(db, 'bookings', newBooking.id), cleanForFirestore(newBooking)).catch(e => console.error('Error saving custom booking to Firestore:', e));

    const targetCoach = coaches.find(c => c.id === targetReq.coachId);
    const coachUserId = targetCoach?.userId || 'user_coach_1';

    sendChatMessage(
      coachUserId,
      targetReq.coachId,
      `🎉 Das individuelle Angebot für ${targetReq.userName} (CHF ${targetReq.offerPrice.toFixed(
        2
      )}) wurde erfolgreich angenommen und bezahlt!`,
      'system_notice'
    );

    return {
      success: true,
      bookingId: newBooking.id,
      message: 'Individuelles Angebot erfolgreich gebucht und bezahlt!'
    };
  };

  const rejectCustomRequest = (requestId: string) => {
    setCustomRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'abgelehnt' } : r))
    );
  };

  const withdrawCustomRequest = (requestId: string) => {
    const targetReq = customRequests.find(r => r.id === requestId);
    setCustomRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'zurueckgezogen' } : r))
    );
    if (targetReq) {
      const targetCoach = coaches.find(c => c.id === targetReq.coachId);
      const coachUserId = targetCoach?.userId || targetReq.coachId;
      sendChatMessage(
        coachUserId,
        targetReq.coachId,
        `ℹ️ Die Anfrage von ${targetReq.userName} für ${targetReq.sport} wurde vom Kunden zurückgezogen.`,
        'system_notice'
      );
      setNotifications(prev => [
        {
          id: 'notif_' + Date.now(),
          title: 'Anfrage zurückgezogen',
          message: `Deine Anfrage für ${targetReq.sport} an Coach ${targetReq.coachName} wurde erfolgreich zurückgezogen.`,
          timestamp: new Date().toISOString(),
          type: 'cancellation_refund',
          read: false
        },
        ...prev
      ]);
    }
  };

  const attachPdfToSession = (sessionId: string, pdf: PdfAttachment) => {
    setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, pdfAttachment: pdf } : s)));
  };

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      title: 'Erinnerung: Blind-Rating',
      message: 'Bitte bewerte deine Lektion vom 25.07.2026 mit Elena Rossi.',
      timestamp: '2026-07-26T09:00:00Z',
      type: 'booking_confirmed',
      read: false
    }
  ]);

  // Favorite Coaches State (tennis ball toggle)
  const [favoriteCoachIds, setFavoriteCoachIds] = useState<string[]>(['coach_1', 'coach_2']);

  const toggleFavoriteCoach = (coachId: string) => {
    setFavoriteCoachIds(prev =>
      prev.includes(coachId) ? prev.filter(id => id !== coachId) : [...prev, coachId]
    );
  };

  const isFavoriteCoach = (coachId: string) => favoriteCoachIds.includes(coachId);

  // Search filter state
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(20);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [priceMax, setPriceMax] = useState<number>(200);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleLocation = (locationName: string) => {
    setSelectedLocations(prev =>
      prev.includes(locationName)
        ? prev.filter(l => l !== locationName)
        : [...prev, locationName]
    );
  };

  const clearLocations = () => {
    setSelectedLocations([]);
  };

  const selectedLocation = selectedLocations.join(', ');
  const setSelectedLocation = (location: string) => {
    if (!location.trim()) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations([location]);
    }
  };

  // Accept AGB function for backend tracking
  const acceptAgb = (version: string = '1.0') => {
    const timestamp = new Date().toISOString();
    setCurrentUser(prev => ({
      ...prev,
      agb_accepted_at: timestamp,
      agb_version: version
    }));
  };

  // Accept Coach Tax Declaration function for backend tracking
  const acceptCoachTaxDeclaration = () => {
    const timestamp = new Date().toISOString();
    setCurrentUser(prev => ({
      ...prev,
      coach_tax_declaration_accepted_at: timestamp
    }));
  };

  // Switch role between Kunde, Coach and Admin
  const switchRole = (role: UserRole) => {
    setIsAuthenticated(true);
    if (role === 'kunde') {
      setCurrentUser(MOCK_CLIENT_USER);
    } else if (role === 'admin') {
      setCurrentUser(MOCK_ADMIN_USER);
    } else {
      const existingCoach = coaches.find(c => c.userId === currentUser.id);
      const coachUserId = existingCoach?.userId || (currentUser.role === 'coach' ? currentUser.id : 'user_coach_' + Date.now());
      setCurrentUser({
        id: coachUserId,
        name: existingCoach?.name || (currentUser.role === 'coach' ? currentUser.name : 'Coach'),
        email: currentUser.email || 'coach@getacoach.ch',
        role: 'coach',
        phone: currentUser.phone || '+41 79 123 45 67',
        avatar: existingCoach?.avatar || currentUser.avatar || '',
        city: existingCoach?.locationName || currentUser.city || 'Zürich',
        canton: existingCoach?.canton || (currentUser.canton as CantonCode) || 'ZH',
        isVerified: existingCoach?.isVerified || false,
        verificationStatus: existingCoach?.isVerified ? 'verifiziert' : 'ausstehend',
        agb_accepted_at: new Date().toISOString(),
        agb_version: '1.0',
        coach_tax_declaration_accepted_at: new Date().toISOString()
      });
    }
  };

  // Internal Calendar Management Actions
  const updateWorkingHours = (workingHours: WorkingHoursDay[]) => {
    setCoaches(prevCoaches =>
      prevCoaches.map(c => {
        if (c.userId === currentUser.id) {
          const currentSettings = c.calendarSettings || {
            iCalToken: `ical_feed_${c.id}`,
            iCalFeedUrl: `webcal://getacoach.ch/ical/coach_${c.id}_feed.ics`,
            workingHours: [],
            blockedSlots: [],
            autoSyncExternal: true
          };
          return {
            ...c,
            calendarSettings: {
              ...currentSettings,
              workingHours
            }
          };
        }
        return c;
      })
    );

    setCurrentUser(prev => ({
      ...prev,
      calendarSettings: {
        ...(prev.calendarSettings || {
          iCalToken: `ical_feed_${prev.id}`,
          iCalFeedUrl: `webcal://getacoach.ch/ical/coach_${prev.id}_feed.ics`,
          workingHours: [],
          blockedSlots: [],
          autoSyncExternal: true
        }),
        workingHours
      }
    }));
  };

  const addBlockedSlot = (slotData: Omit<BlockedTimeSlot, 'id'>) => {
    const newSlot: BlockedTimeSlot = {
      ...slotData,
      id: 'block_' + Date.now(),
      coachId: currentUser.id
    };

    setCoaches(prevCoaches =>
      prevCoaches.map(c => {
        if (c.userId === currentUser.id) {
          const currentSettings = c.calendarSettings || {
            iCalToken: `ical_feed_${c.id}`,
            iCalFeedUrl: `webcal://getacoach.ch/ical/coach_${c.id}_feed.ics`,
            workingHours: [],
            blockedSlots: [],
            autoSyncExternal: true
          };
          return {
            ...c,
            calendarSettings: {
              ...currentSettings,
              blockedSlots: [...currentSettings.blockedSlots, newSlot]
            }
          };
        }
        return c;
      })
    );
  };

  const deleteBlockedSlot = (slotId: string) => {
    setCoaches(prevCoaches =>
      prevCoaches.map(c => {
        if (c.userId === currentUser.id && c.calendarSettings) {
          return {
            ...c,
            calendarSettings: {
              ...c.calendarSettings,
              blockedSlots: c.calendarSettings.blockedSlots.filter(s => s.id !== slotId)
            }
          };
        }
        return c;
      })
    );
  };

  // Upload ID document verification for Coach
  const uploadCoachVerification = (docName: string) => {
    setCurrentUser(prev => ({
      ...prev,
      isVerified: true,
      verificationStatus: 'verifiziert',
      verificationDocName: docName
    }));

    setCoaches(prevCoaches =>
      prevCoaches.map(c => (c.userId === currentUser.id ? { ...c, isVerified: true } : c))
    );

    setNotifications(prev => [
      {
        id: 'notif_' + Date.now(),
        title: 'Ausweis-Check Verifiziert!',
        message: 'Dein Ausweisdokument wurde erfolgreich verifiziert. Das grüne Haken-Symbol ist jetzt auf deinem Profil sichtbar.',
        timestamp: new Date().toISOString(),
        type: 'booking_confirmed',
        read: false
      },
      ...prev
    ]);
  };



  // Cancel Booking Policy Handling
  // > 24h: 100% Refund to Client, free slot in calendar, notify Waitlist!
  // < 24h: 50% Refund to Client, 50% Compensation to Coach, free slot in calendar, notify Waitlist!
  const cancelBooking = (bookingId: string) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (!targetBooking) return { success: false, message: 'Buchung nicht gefunden.', refundPct: 0 };

    // Calculate hours until session
    const sessionDate = new Date(`${targetBooking.date}T${targetBooking.time.split(' - ')[0] || '10:00'}:00`);
    const now = new Date();
    const diffHours = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    const isGreaterThan24h = diffHours >= 24;
    const refundPct = isGreaterThan24h ? 100 : 50;
    const refundAmount = (targetBooking.pricePaid * refundPct) / 100;
    const coachComp = isGreaterThan24h ? 0 : (targetBooking.pricePaid * 50) / 100;

    // Update booking record
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: isGreaterThan24h ? 'storniert_gt24h' : 'storniert_lt24h',
            requestStatus: b.requestStatus ? 'zurueckgezogen' : undefined,
            cancellationDate: new Date().toISOString(),
            paymentStatus: isGreaterThan24h ? 'Rückerstattet 100%' : 'Rückerstattet 50%',
            refundAmount,
            coachCompensation: coachComp
          };
        }
        return b;
      })
    );

    if (targetBooking.customRequestId) {
      setCustomRequests(prev =>
        prev.map(r => (r.id === targetBooking.customRequestId ? { ...r, status: 'zurueckgezogen' } : r))
      );
    }

    // Notify coach via chat
    const targetCoach = coaches.find(c => c.id === targetBooking.coachId || c.userId === targetBooking.coachId);
    const coachUserId = targetCoach?.userId || targetBooking.coachId;
    if (coachUserId) {
      sendChatMessage(
        coachUserId,
        targetBooking.coachId,
        `ℹ️ Buchung/Anfrage für "${targetBooking.sessionTitle}" (${targetBooking.date}, ${targetBooking.time}) wurde von Kunde ${targetBooking.userName} storniert.`,
        'system_notice'
      );
    }

    // Free the slot in session & check waitlist
    let waitlistTriggeredName = '';
    setSessions(prev =>
      prev.map(s => {
        if (s.id === targetBooking.sessionId) {
          const wasConfirmed = targetBooking.requestStatus === 'bestaetigt' || !targetBooking.requestStatus;
          const nextCount = wasConfirmed ? Math.max(0, s.currentParticipants - 1) : s.currentParticipants;
          const hasWaitlist = s.waitlist.length > 0;
          if (hasWaitlist && wasConfirmed) {
            waitlistTriggeredName = s.waitlist[0].userName;
          }
          return {
            ...s,
            currentParticipants: nextCount,
            reservedUntil: null,
            reservedByUserId: null,
            status: 'verfuegbar'
          };
        }
        return s;
      })
    );

    // Add Notification
    setNotifications(prev => [
      {
        id: 'notif_' + Date.now(),
        title: `Stornierung Erfolgt (${refundPct}% Rückerstattung)`,
        message: isGreaterThan24h
          ? `Stornierung > 24h vor Termin: CHF ${refundAmount.toFixed(2)} direkt auf dein ${targetBooking.paymentMethod} rückerstattet.`
          : `Stornierung < 24h vor Termin: CHF ${refundAmount.toFixed(2)} (50%) an dich rückerstattet. CHF ${coachComp.toFixed(2)} (50%) als Entschädigung an Coach ${targetBooking.coachName}.`,
        timestamp: new Date().toISOString(),
        type: 'cancellation_refund',
        read: false
      },
      ...prev
    ]);

    if (waitlistTriggeredName) {
      setNotifications(prev => [
        {
          id: 'notif_wl_' + Date.now(),
          title: 'Warteliste Benachrichtigt!',
          message: `Ein Platz für "${targetBooking.sessionTitle}" wurde frei! ${waitlistTriggeredName} wurde per E-Mail & Push informiert.`,
          timestamp: new Date().toISOString(),
          type: 'waitlist_available',
          read: false
        },
        ...prev
      ]);
    }

    return {
      success: true,
      refundPct,
      message: `Erfolgreich storniert. Rückerstattung von CHF ${refundAmount.toFixed(2)} (${refundPct}%) auf dein ${targetBooking.paymentMethod} veranlasst.`
    };
  };

  // Trigger test cancellation to show waitlist notification system
  const triggerCancellationTestForWaitlist = (sessionId: string) => {
    const targetSession = sessions.find(s => s.id === sessionId);
    if (!targetSession || targetSession.waitlist.length === 0) return;

    const firstWaitlistedUser = targetSession.waitlist[0];

    // Remove first user from waitlist and set slot free
    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            currentParticipants: Math.max(0, s.currentParticipants - 1),
            status: 'verfuegbar',
            waitlist: s.waitlist.slice(1)
          };
        }
        return s;
      })
    );

    setNotifications(prev => [
      {
        id: 'notif_' + Date.now(),
        title: '🔔 Wartelisten-Alarm: Slot Freigeschaltet!',
        message: `Ein Teilnehmer hat die Lektion "${targetSession.title}" storniert! Slot wurde für ${firstWaitlistedUser.userName} (${firstWaitlistedUser.userEmail}) freigeschaltet.`,
        timestamp: new Date().toISOString(),
        type: 'waitlist_available',
        read: false
      },
      ...prev
    ]);
  };

  // Customer Rating System (Customer rates Coach directly)
  const rateBooking = (bookingId: string, stars: number, comment?: string) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          const clientRating = { stars, comment, ratedAt: new Date().toISOString() };

          // Also update coach average rating in coaches state
          setCoaches(prevCoaches =>
            prevCoaches.map(c => {
              if (c.id === b.coachId) {
                const currentCount = c.reviewCount || 0;
                const currentRating = c.rating || 5.0;
                const newCount = currentCount + 1;
                const newAvg = ((currentRating * currentCount) + stars) / newCount;
                return {
                  ...c,
                  rating: Number(newAvg.toFixed(2)),
                  reviewCount: newCount
                };
              }
              return c;
            })
          );

          return {
            ...b,
            clientRated: true,
            clientRating,
            blindRatingStatus: 'beidseitig_bewertet'
          };
        }
        return b;
      })
    );
  };

  // Simulate 7-day auto-unblind timer
  const simulate7DaysPassed = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            blindRatingStatus: 'automatisch_freigeschaltet'
          };
        }
        return b;
      })
    );
    setNotifications(prev => [
      {
        id: 'notif_' + Date.now(),
        title: 'Blind-Rating Freigeschaltet (7 Tage)',
        message: 'Die 7-Tage-Frist ist abgelaufen. Das Blind-Rating ist nun für beide Parteien sichtbar.',
        timestamp: new Date().toISOString(),
        type: 'booking_confirmed',
        read: false
      },
      ...prev
    ]);
  };

  // Waitlist actions
  const joinWaitlist = (sessionId: string) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          const alreadyOnList = s.waitlist.some(w => w.userId === currentUser.id);
          if (alreadyOnList) return s;
          return {
            ...s,
            waitlist: [
              ...s.waitlist,
              {
                userId: currentUser.id,
                userName: currentUser.name,
                userEmail: currentUser.email,
                joinedAt: new Date().toISOString()
              }
            ]
          };
        }
        return s;
      })
    );

    setNotifications(prev => [
      {
        id: 'notif_' + Date.now(),
        title: 'Auf Warteliste eingetragen',
        message: 'Du wirst sofort per Push & E-Mail informiert, sobald ein Platz frei wird.',
        timestamp: new Date().toISOString(),
        type: 'waitlist_available',
        read: false
      },
      ...prev
    ]);
  };

  const leaveWaitlist = (sessionId: string) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            waitlist: s.waitlist.filter(w => w.userId !== currentUser.id)
          };
        }
        return s;
      })
    );
  };

  // Create new session slot by Coach
  const createSession = (
    newSessionData: Omit<SessionSlot, 'id' | 'currentParticipants' | 'status' | 'waitlist'>
  ) => {
    const newSession: SessionSlot = {
      ...newSessionData,
      id: 'session_' + Date.now(),
      currentParticipants: 0,
      status: 'verfuegbar',
      waitlist: []
    };

    setSessions(prev => [newSession, ...prev]);
    setDoc(doc(db, 'sessions', newSession.id), cleanForFirestore(newSession)).catch(e => console.error('Error creating session in Firestore:', e));
  };

  // Update existing session by Coach
  const updateSession = (sessionId: string, updatedFields: Partial<SessionSlot>) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          const nextMax = updatedFields.maxParticipants ?? s.maxParticipants;
          const nextParticipants = s.currentParticipants;
          const newStatus: 'verfuegbar' | 'storniert' | 'ausgebucht' = nextParticipants >= nextMax ? 'ausgebucht' : 'verfuegbar';
          const updated = {
            ...s,
            ...updatedFields,
            maxParticipants: nextMax,
            status: newStatus
          };
          updateDoc(doc(db, 'sessions', sessionId), updatedFields).catch(e => console.error('Error updating session in Firestore:', e));
          return updated;
        }
        return s;
      })
    );
  };



  // Buy 5er or 10er Abo
  const buyAbo = (sport: string, coachId: string | undefined, type: '5er' | '10er', price: number) => {
    const targetCoach = coachId ? coaches.find(c => c.id === coachId) : undefined;
    const totalSess = type === '5er' ? 5 : 10;
    const newAbo: UserAbo = {
      id: 'abo_' + Date.now(),
      sport,
      coachId,
      coachName: targetCoach?.name,
      type,
      totalSessions: totalSess,
      remainingSessions: totalSess,
      pricePaid: price,
      purchasedAt: new Date().toISOString().split('T')[0]
    };
    setUserAbos(prev => [newAbo, ...prev]);

    setNotifications(prev => [
      {
        id: 'notif_' + Date.now(),
        title: `${type}-Abo gekauft!`,
        message: `Dein ${type}-Abo für ${sport} (${totalSess} Lektionen) ist jetzt im Konto aktiv.`,
        timestamp: new Date().toISOString(),
        type: 'booking_confirmed',
        read: false
      },
      ...prev
    ]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updateUserAvatar = (avatarUrl: string) => {
    setCurrentUser(prev => {
      const updated = { ...prev, avatar: avatarUrl };
      if (updated.id) {
        updateDoc(doc(db, 'users', updated.id), { avatar: avatarUrl }).catch(e =>
          console.warn('Error updating user avatar in Firestore:', e)
        );
      }
      return updated;
    });

    // If logged in user is a coach, also sync their CoachProfile avatar
    if (currentUser.role === 'coach') {
      const targetCoach = coaches.find(c => c.userId === currentUser.id || c.id === currentUser.id);
      if (targetCoach) {
        updateCoachProfile(targetCoach.id, { avatar: avatarUrl });
      }
    }
  };

  const updateUserProfile = (updatedFields: Partial<User>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...updatedFields };
      if (updated.id) {
        updateDoc(doc(db, 'users', updated.id), updatedFields).catch(e =>
          console.warn('Error updating user profile in Firestore:', e)
        );
      }
      return updated;
    });
  };

  const updateCoachProfile = (coachId: string, updatedFields: Partial<CoachProfile>) => {
    setCoaches(prev =>
      prev.map(c => (c.id === coachId ? { ...c, ...updatedFields } : c))
    );
    updateDoc(doc(db, 'coaches', coachId), updatedFields).catch(e => console.error('Error updating coach profile in Firestore:', e));
    setNotifications(prev => [
      {
        id: 'notif_prof_' + Date.now(),
        title: 'Coach-Profil aktualisiert!',
        message: 'Deine Profiländerungen und Angebote wurden auf der Plattform gespeichert.',
        timestamp: new Date().toISOString(),
        type: 'booking_confirmed',
        read: false
      },
      ...prev
    ]);
  };

  const markBookingsPaidOutUntilDate = (cutoffDate: string, coachId?: string) => {
    if (currentUser.role !== 'admin') {
      return {
        updatedCount: 0,
        totalPaidAmount: 0,
        message: 'Zugriff verweigert: Nur Administratoren sind berechtigt, Auszahlungen durchzuführen.'
      };
    }

    let updatedCount = 0;
    let totalPaidAmount = 0;
    const nowIso = new Date().toISOString().split('T')[0];
    const updatedBookingIds: string[] = [];

    setBookings(prevBookings => {
      return prevBookings.map(b => {
        const isEligibleStatus = b.status === 'abgeschlossen' || b.status === 'bestaetigt';
        const matchesCoach = !coachId || b.coachId === coachId;
        if (isEligibleStatus && !b.isPaidOut && b.date <= cutoffDate && matchesCoach) {
          updatedCount++;
          const netAmount = b.coachCompensation ?? calculateCoachPayout(b.pricePaid);
          totalPaidAmount += netAmount;
          updatedBookingIds.push(b.id);
          return {
            ...b,
            status: 'abgeschlossen',
            isPaidOut: true,
            paidOutAt: nowIso
          };
        }
        return b;
      });
    });

    // Sync Firestore records
    updatedBookingIds.forEach(id => {
      updateDoc(doc(db, 'bookings', id), {
        status: 'abgeschlossen',
        isPaidOut: true,
        paidOutAt: nowIso
      }).catch(e => console.warn('Firestore booking payout update warning:', e));
    });

    const roundedTotal = roundCHF(totalPaidAmount);

    return {
      updatedCount,
      totalPaidAmount: roundedTotal,
      message: updatedCount > 0
        ? `${updatedCount} Lektion(en) bis zum Stichtag ${cutoffDate} wurden erfolgreich als "Ausbezahlt" markiert (Total: CHF ${roundedTotal.toFixed(2)}).`
        : `Keine unbezahlten absolvierten Lektionen bis zum Stichtag ${cutoffDate} gefunden.`
    };
  };

  const toggleBookingPaidOut = (bookingId: string) => {
    if (currentUser.role !== 'admin') {
      alert('Zugriff verweigert: Nur Administratoren dürfen Auszahlungsstati ändern.');
      return;
    }

    const nowIso = new Date().toISOString().split('T')[0];
    let nextPaidState = false;
    setBookings(prevBookings =>
      prevBookings.map(b => {
        if (b.id === bookingId) {
          nextPaidState = !b.isPaidOut;
          return {
            ...b,
            isPaidOut: nextPaidState,
            paidOutAt: nextPaidState ? nowIso : undefined
          };
        }
        return b;
      })
    );

    updateDoc(doc(db, 'bookings', bookingId), {
      isPaidOut: nextPaidState,
      paidOutAt: nextPaidState ? nowIso : null
    }).catch(e => console.warn('Firestore toggle booking payout update warning:', e));
  };

  const deleteUserAccount = async (targetUserId?: string): Promise<{ success: boolean; message: string }> => {
    const userIdToDelete = targetUserId || currentUser.id;
    const targetEmail = (currentUser.email || '').trim().toLowerCase();
    const userRole = currentUser.role;
    const isCoach = userRole === 'coach' || coaches.some(c => c.userId === userIdToDelete || c.id === userIdToDelete);

    try {
      // 1. Mark account as permanently deleted in LocalStorage and Firestore
      if (targetEmail) {
        storeDeletedEmail(targetEmail);
        setDeletedEmails(prev => Array.from(new Set([...prev, targetEmail])));
        const sanitizedKey = targetEmail.replace(/[\/\.#$\[\]]/g, '_');
        await setDoc(doc(db, 'deletedAccounts', sanitizedKey), {
          id: sanitizedKey,
          email: targetEmail,
          userId: userIdToDelete,
          role: userRole,
          deletedAt: new Date().toISOString()
        }).catch(e => console.warn('Firestore deletedAccounts record error:', e));
      }

      // 2. Delete user from 'users' collection in Firestore
      if (userIdToDelete) {
        await deleteDoc(doc(db, 'users', userIdToDelete)).catch(e => console.warn('User doc delete warning:', e));
      }
      setRegisteredUsers(prev => prev.filter(u => u.id !== userIdToDelete && u.email.toLowerCase() !== targetEmail));

      if (isCoach) {
        // Find all coach profiles matching this user or email
        const coachProfilesToDelete = coaches.filter(
          c => c.userId === userIdToDelete || c.id === userIdToDelete || (c.userId && c.userId.toLowerCase() === targetEmail)
        );
        const coachProfileIds = coachProfilesToDelete.map(c => c.id);

        // Delete coach documents from Firestore
        for (const cp of coachProfilesToDelete) {
          await deleteDoc(doc(db, 'coaches', cp.id)).catch(e => console.warn('Coach doc delete warning:', e));
        }

        // Delete all sessions for these coaches
        const sessionsToDelete = sessions.filter(s => coachProfileIds.includes(s.coachId));
        for (const s of sessionsToDelete) {
          await deleteDoc(doc(db, 'sessions', s.id)).catch(e => console.warn('Session delete warning:', e));
        }

        // Delete all bookings for these coaches or user
        const bookingsToDelete = bookings.filter(b => coachProfileIds.includes(b.coachId) || b.userId === userIdToDelete);
        for (const b of bookingsToDelete) {
          await deleteDoc(doc(db, 'bookings', b.id)).catch(e => console.warn('Booking delete warning:', e));
        }

        // Delete all custom requests for these coaches or user
        const requestsToDelete = customRequests.filter(r => coachProfileIds.includes(r.coachId) || r.userId === userIdToDelete);
        for (const r of requestsToDelete) {
          await deleteDoc(doc(db, 'customRequests', r.id)).catch(e => console.warn('Request delete warning:', e));
        }

        // Delete all chat messages involving this coach
        const chatMessagesToDelete = chatMessages.filter(
          m => coachProfileIds.includes(m.coachId) || m.senderId === userIdToDelete || m.receiverId === userIdToDelete || m.userId === userIdToDelete
        );
        for (const m of chatMessagesToDelete) {
          await deleteDoc(doc(db, 'chatMessages', m.id)).catch(e => console.warn('Chat delete warning:', e));
        }

        // Update in-memory local state
        setCoaches(prev => prev.filter(c => !coachProfileIds.includes(c.id) && c.userId !== userIdToDelete && c.userId?.toLowerCase() !== targetEmail));
        setSessions(prev => prev.filter(s => !coachProfileIds.includes(s.coachId)));
        setBookings(prev => prev.filter(b => !coachProfileIds.includes(b.coachId) && b.userId !== userIdToDelete));
        setCustomRequests(prev => prev.filter(r => !coachProfileIds.includes(r.coachId) && r.userId !== userIdToDelete));
        setChatMessages(prev => prev.filter(m => !coachProfileIds.includes(m.coachId) && m.senderId !== userIdToDelete && m.receiverId !== userIdToDelete && m.userId !== userIdToDelete));

      } else {
        // Customer Account Deletion
        // Delete all customer bookings
        const bookingsToDelete = bookings.filter(b => b.userId === userIdToDelete);
        for (const b of bookingsToDelete) {
          await deleteDoc(doc(db, 'bookings', b.id)).catch(e => console.warn('Booking delete warning:', e));
        }

        // Delete all customer custom requests
        const requestsToDelete = customRequests.filter(r => r.userId === userIdToDelete);
        for (const r of requestsToDelete) {
          await deleteDoc(doc(db, 'customRequests', r.id)).catch(e => console.warn('Request delete warning:', e));
        }

        // Delete all chat messages involving this customer
        const chatMessagesToDelete = chatMessages.filter(
          m => m.userId === userIdToDelete || m.senderId === userIdToDelete || m.receiverId === userIdToDelete
        );
        for (const m of chatMessagesToDelete) {
          await deleteDoc(doc(db, 'chatMessages', m.id)).catch(e => console.warn('Chat delete warning:', e));
        }

        // Remove from session waitlists
        setSessions(prev =>
          prev.map(s => ({
            ...s,
            waitlist: s.waitlist.filter(w => w.userId !== userIdToDelete)
          }))
        );

        // Update in-memory local state
        setBookings(prev => prev.filter(b => b.userId !== userIdToDelete));
        setCustomRequests(prev => prev.filter(r => r.userId !== userIdToDelete));
        setChatMessages(prev => prev.filter(m => m.userId !== userIdToDelete && m.senderId !== userIdToDelete && m.receiverId !== userIdToDelete));
        setUserAbos([]);
        setUserVouchers([]);
      }

      // Delete or sign out Firebase Auth user
      if (auth.currentUser) {
        try {
          await deleteUser(auth.currentUser);
        } catch (authErr) {
          console.warn('Firebase Auth deleteUser (fallback to signOut):', authErr);
          await signOut(auth).catch(() => {});
        }
      }

      // Reset authentication & current user
      setIsAuthenticated(false);
      setCurrentUser(MOCK_CLIENT_USER);
      setAuthNotice(null);

      return {
        success: true,
        message: 'Dein Konto und alle zugehörigen Daten wurden erfolgreich und unwiderruflich aus dem System gelöscht.'
      };
    } catch (error: any) {
      console.error('Error during full account deletion:', error);
      return {
        success: false,
        message: error?.message || 'Fehler beim Löschen des Kontos. Bitte versuche es erneut.'
      };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        coaches,
        sessions,
        bookings,
        customRequests,
        userAbos,
        userVouchers,
        chatMessages,
        notifications,
        favoriteCoachIds,
        toggleFavoriteCoach,
        isFavoriteCoach,
        selectedSport,
        setSelectedSport,
        selectedLocations,
        setSelectedLocations,
        toggleLocation,
        clearLocations,
        selectedLocation,
        setSelectedLocation,
        searchRadiusKm,
        setSearchRadiusKm,
        selectedDate,
        setSelectedDate,
        priceMax,
        setPriceMax,
        searchQuery,
        setSearchQuery,
        bookSession,
        acceptBookingRequest,
        rejectBookingRequest,
        retroactiveConfirmRequest,
        cancelBooking,
        sendCustomRequest,
        createCustomOffer,
        acceptAndPayCustomOffer,
        rejectCustomRequest,
        withdrawCustomRequest,
        attachPdfToSession,
        filterContactDetails,
        uploadCoachVerification,
        rateBooking,
        joinWaitlist,
        leaveWaitlist,
        createSession,
        updateSession,
        sendChatMessage,
        buyAbo,
        markNotificationRead,
        clearNotifications,
        simulate7DaysPassed,
        triggerCancellationTestForWaitlist,
        updateCoachProfile,
        updateWorkingHours,
        addBlockedSlot,
        deleteBlockedSlot,
        acceptAgb,
        acceptCoachTaxDeclaration,
        markBookingsPaidOutUntilDate,
        toggleBookingPaidOut,
        updateUserAvatar,
        updateUserProfile,
        isAuthenticated,
        login,
        registerCustomer,
        registerCoach,
        logout,
        deleteUserAccount,
        authNotice,
        openAuthModalWithNotice,
        clearAuthNotice
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
