import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchFilterBar } from './components/CustomerView/SearchFilterBar';
import { CoachCard } from './components/CustomerView/CoachCard';
import { CoachDetailModal } from './components/CustomerView/CoachDetailModal';
import { BookingModal } from './components/CustomerView/BookingModal';
import { MyBookingsTab } from './components/CustomerView/MyBookingsTab';
import { WaitlistFavoritesTab } from './components/CustomerView/WaitlistFavoritesTab';
import { MyRequestsTab } from './components/CustomerView/MyRequestsTab';
import { CoachesBySportPage } from './components/CustomerView/CoachesBySportPage';
import { CustomerDashboard } from './components/CustomerView/CustomerDashboard';
import { CoachDashboard } from './components/CoachView/CoachDashboard';
import { CoachRequestsTab } from './components/CoachView/CoachRequestsTab';
import { CalendarSyncAndExportCard } from './components/CoachView/CalendarSyncAndExportCard';
import { IDVerificationCard } from './components/CoachView/IDVerificationCard';
import { SessionManagement } from './components/CoachView/SessionManagement';
import { BlindRatingsCoachTab } from './components/CoachView/BlindRatingsCoachTab';
import { CoachProfilePage } from './components/CoachView/CoachProfilePage';
import { CoachPricingAndFeesTab } from './components/CoachView/CoachPricingAndFeesTab';
import { InteractiveMap } from './components/InteractiveMap';
import { ChatDrawer } from './components/ChatDrawer';
import { AuthModal } from './components/AuthModal';
import { AgbPage } from './components/AgbPage';
import { ImpressumPage } from './components/ImpressumPage';
import { CoachTaxInfoPage } from './components/CoachView/CoachTaxInfoPage';
import { CustomerRegisterPage } from './components/CustomerRegisterPage';
import { CoachRegisterPage } from './components/CoachRegisterPage';
import { AdminLoginPage } from './components/AdminView/AdminLoginPage';
import { AdminDashboard } from './components/AdminView/AdminDashboard';
import { CoachProfile, SessionSlot } from './types';
import { Sparkles, Trophy, MapPin, Search, Zap } from 'lucide-react';
import { calculateDistanceKm, getCityCoordsForLocation, CityCoords } from './utils/geoUtils';
import { coachMatchesSportFilter } from './utils/sportMatcher';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Logo } from './components/Logo';

const MainApp: React.FC = () => {
  const {
    currentUser,
    coaches,
    sessions,
    selectedSport,
    selectedLocations,
    searchRadiusKm,
    searchQuery,
    selectedDate,
    isAuthenticated,
    authNotice
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('search');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [logoPosition, setLogoPosition] = useState<{ top: number; height: number } | null>(null);

  // Dynamic precise measurement: Center logo exactly between blue header bottom and search field top
  useEffect(() => {
    const updatePosition = () => {
      if (spacerRef.current) {
        const rect = spacerRef.current.getBoundingClientRect();
        // The un-scrolled viewport top coordinate is rect.top + window.scrollY
        const top = rect.top + window.scrollY;
        const height = rect.height;
        if (top > 0 && height > 0) {
          setLogoPosition({ top, height });
        }
      }
    };

    // Run measurement immediately and on next animation frame for font/DOM settlement
    updatePosition();
    const rafId = requestAnimationFrame(updatePosition);
    const timeoutId = setTimeout(updatePosition, 100);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && spacerRef.current) {
      observer = new ResizeObserver(() => updatePosition());
      observer.observe(spacerRef.current);
      if (spacerRef.current.parentElement) {
        observer.observe(spacerRef.current.parentElement);
      }
    }

    window.addEventListener('resize', updatePosition);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePosition);
      if (observer) observer.disconnect();
    };
  }, [activeTab]);

  // Auto-open Auth modal when an auth notice is triggered
  useEffect(() => {
    if (authNotice) {
      setShowAuthModal(true);
    }
  }, [authNotice]);

  // Protect private tabs when unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      const publicTabs = [
        'search',
        'coaches_by_sport',
        'sports_overview',
        'pricing',
        'coach_pricing',
        'agb',
        'impressum',
        'coach_tax_info',
        'register_customer',
        'register_coach',
        'admin_login',
        'admin_dashboard',
        'admin_payouts'
      ];
      if (!publicTabs.includes(activeTab)) {
        setActiveTab('search');
      }
    }
  }, [isAuthenticated, activeTab]);

  // Detect routes or hashes on mount/location
  useEffect(() => {
    if (window.location.pathname === '/admin/login' || window.location.hash === '#admin/login' || window.location.hash === '#admin_login') {
      setActiveTab('admin_login');
    } else if (window.location.pathname === '/admin/payouts' || window.location.hash === '#admin/payouts' || window.location.hash === '#admin_payouts') {
      setActiveTab('admin_payouts');
    } else if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      setActiveTab('admin_dashboard');
    } else if (window.location.pathname === '/agb' || window.location.hash === '#agb') {
      setActiveTab('agb');
    } else if (window.location.pathname === '/impressum' || window.location.hash === '#impressum') {
      setActiveTab('impressum');
    } else if (window.location.pathname === '/coach-info/steuern' || window.location.hash === '#coach_tax_info') {
      setActiveTab('coach_tax_info');
    } else if (window.location.pathname === '/register/customer' || window.location.hash === '#register/customer' || window.location.hash === '#register_customer') {
      setActiveTab('register_customer');
    } else if (window.location.pathname === '/register/coach' || window.location.hash === '#register/coach' || window.location.hash === '#register_coach') {
      setActiveTab('register_coach');
    }
  }, []);

  // Auto-sync activeTab when switching roles to prevent empty white views
  useEffect(() => {
    const isAdminDashboardTab = activeTab === 'admin_dashboard' || activeTab === 'admin_payouts' || activeTab === 'admin';
    const isCoachTab = activeTab.startsWith('coach_');
    const isPublicPage = activeTab === 'admin_login' || activeTab === 'coach_pricing' || activeTab === 'pricing' || activeTab === 'agb' || activeTab === 'impressum' || activeTab === 'coach_tax_info' || activeTab === 'register_customer' || activeTab === 'register_coach' || activeTab === 'search' || activeTab === 'sports_overview' || activeTab === 'coaches_by_sport';
    
    if (isPublicPage) return;

    if (currentUser.role === 'admin' && !isAdminDashboardTab && activeTab !== 'search') {
      setActiveTab('admin_dashboard');
    } else if (currentUser.role === 'coach' && !isCoachTab) {
      setActiveTab('coach_dashboard');
    } else if (currentUser.role === 'kunde' && (isCoachTab || isAdminDashboardTab) && activeTab !== 'coach_profile_offerings') {
      setActiveTab('search');
    }
  }, [currentUser.role, activeTab]);

  const [showMap, setShowMap] = useState<boolean>(true);
  const [selectedCoachForDetail, setSelectedCoachForDetail] = useState<CoachProfile | null>(null);
  const [selectedSessionForBooking, setSelectedSessionForBooking] = useState<SessionSlot | null>(null);
  const [showChatDrawer, setShowChatDrawer] = useState<boolean>(false);
  const [chatTargetCoachId, setChatTargetCoachId] = useState<string>('coach_1');

  // Filter coaches for Customer View
  // IMPORTANT REQUIREMENT: Any coach with isProfileActive === false is HIDDEN from customers!
  const filteredCoaches = coaches.filter(c => {
    if (!c.isProfileActive) return false; // Mandatory Profile-Lock filter!

    if (selectedSport !== 'ALL' && !coachMatchesSportFilter(c.sports, selectedSport)) return false;

    // Multi-location and radius filtering
    if (selectedLocations.length > 0) {
      const selectedCityCoords = selectedLocations
        .map(getCityCoordsForLocation)
        .filter((city): city is CityCoords => city !== null);

      let isWithinRadius = false;

      if (selectedCityCoords.length > 0 && c.coordinates && c.coordinates.lat && c.coordinates.lng) {
        // Calculate Haversine distance in km from coach coordinates to any selected location center
        for (const city of selectedCityCoords) {
          const dist = calculateDistanceKm(c.coordinates.lat, c.coordinates.lng, city.lat, city.lng);
          if (dist <= searchRadiusKm) {
            isWithinRadius = true;
            break;
          }
        }
      } else {
        // Fallback to text matching if coordinates are missing or city object wasn't found
        const locLower = c.locationName.toLowerCase();
        const cantonLower = c.canton.toLowerCase();
        isWithinRadius = selectedLocations.some(selectedLoc => {
          const cityName = selectedLoc.replace(/\s+und\s+Umgebung/i, '').replace(/[\(\)]/g, '').toLowerCase().trim();
          const terms = cityName.split(/[\/\s]+/).filter(t => t.length >= 2);
          if (locLower.includes(cityName) || cantonLower.includes(cityName)) return true;
          return terms.some(t => locLower.includes(t) || cantonLower.includes(t));
        });
      }

      if (!isWithinRadius) return false;
    }

    // Optional date filter: if a specific date is selected, filter coaches that have slots on that date
    if (selectedDate) {
      const hasSlotOnDate = sessions.some(
        s => s.coachId === c.id && s.date === selectedDate && s.status === 'verfuegbar'
      );
      if (!hasSlotOnDate) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = c.name.toLowerCase().includes(q);
      const sportMatch = c.sports.some(s => s.toLowerCase().includes(q));
      const locMatch = c.locationName.toLowerCase().includes(q) || c.canton.toLowerCase().includes(q);

      // Check if searchQuery resolves to a location/Ortschaft and check 20km radius
      let radiusMatch = false;
      if (q.length >= 2) {
        const cityCoords = getCityCoordsForLocation(q);
        if (cityCoords && c.coordinates && c.coordinates.lat && c.coordinates.lng) {
          const dist = calculateDistanceKm(c.coordinates.lat, c.coordinates.lng, cityCoords.lat, cityCoords.lng);
          if (dist <= 20) {
            radiusMatch = true;
          }
        }
      }

      if (!nameMatch && !sportMatch && !locMatch && !radiusMatch) return false;
    }

    return true;
  });

  const openChatWithCoach = (coach: CoachProfile) => {
    setChatTargetCoachId(coach.id);
    setShowChatDrawer(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1A265A] relative">
      
      {/* Fixed Background Watermark Logo - Dynamically and precisely centered between bottom of blue header and top of search field */}
      <div 
        aria-hidden="true" 
        style={logoPosition ? {
          top: `${logoPosition.top}px`,
          height: `${logoPosition.height}px`
        } : undefined}
        className={`fixed inset-x-0 pointer-events-none z-0 flex items-center justify-center select-none px-4 ${
          !logoPosition ? 'top-[330px] h-36' : ''
        }`}
      >
        <div className="w-full max-w-[85vw] sm:max-w-md md:max-w-lg lg:max-w-xl h-full flex items-center justify-center opacity-25 select-none transition-all">
          <Logo
            className="w-auto max-h-[82%] max-w-full object-contain select-none"
            alt=""
          />
        </div>
      </div>
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenChat={() => setShowChatDrawer(true)}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* AGB PAGE VIEW (Accessible across all roles) */}
        {activeTab === 'agb' && (
          <AgbPage onBack={() => setActiveTab(currentUser.role === 'kunde' ? 'search' : 'coach_dashboard')} />
        )}

        {/* IMPRESSUM PAGE VIEW (Accessible across all roles) */}
        {activeTab === 'impressum' && (
          <ImpressumPage onBack={() => setActiveTab(currentUser.role === 'kunde' ? 'search' : 'coach_dashboard')} />
        )}

        {/* COACH TAX & LEGAL INFO PAGE VIEW (Accessible across all roles) */}
        {activeTab === 'coach_tax_info' && (
          <CoachTaxInfoPage onBack={() => setActiveTab(currentUser.role === 'kunde' ? 'search' : 'coach_dashboard')} />
        )}

        {/* CUSTOMER REGISTRATION PAGE VIEW */}
        {activeTab === 'register_customer' && (
          <CustomerRegisterPage
            onSuccess={() => {
              setActiveTab('search');
              window.history.pushState(null, '', '/');
            }}
            onOpenAgb={() => setActiveTab('agb')}
            onSwitchToLogin={() => setShowAuthModal(true)}
            onSwitchToCoachRegister={() => {
              setActiveTab('register_coach');
              window.history.pushState(null, '', '/register/coach');
            }}
          />
        )}

        {/* COACH REGISTRATION STAGE 1 PAGE VIEW */}
        {activeTab === 'register_coach' && (
          <CoachRegisterPage
            onSuccess={() => {
              setActiveTab('coach_profile');
              window.history.pushState(null, '', '/coach/profile');
            }}
            onOpenAgb={() => setActiveTab('agb')}
            onSwitchToLogin={() => setShowAuthModal(true)}
            onSwitchToCustomerRegister={() => {
              setActiveTab('register_customer');
              window.history.pushState(null, '', '/register/customer');
            }}
          />
        )}

        {/* ADMIN VIEWS */}
        {activeTab === 'admin_login' ? (
          <AdminLoginPage
            onSuccess={() => {
              setActiveTab('admin_payouts');
              window.history.pushState(null, '', '/admin/payouts');
            }}
            onBackToApp={() => {
              setActiveTab(currentUser.role === 'coach' ? 'coach_dashboard' : 'search');
              window.history.pushState(null, '', '/');
            }}
          />
        ) : (activeTab === 'admin_dashboard' || activeTab === 'admin_payouts' || activeTab === 'admin') && (
          currentUser.role === 'admin' ? (
            <AdminDashboard
              initialSubTab={activeTab === 'admin_payouts' ? 'payouts' : 'overview'}
              onBackToApp={() => {
                setActiveTab('search');
                window.history.pushState(null, '', '/');
              }}
            />
          ) : (
            <AdminLoginPage
              onSuccess={() => {
                setActiveTab('admin_payouts');
                window.history.pushState(null, '', '/admin/payouts');
              }}
              onBackToApp={() => {
                setActiveTab(currentUser.role === 'coach' ? 'coach_dashboard' : 'search');
                window.history.pushState(null, '', '/');
              }}
            />
          )
        )}

        {/* CUSTOMER & ADMIN CATALOG VIEWS */}
        {(!isAuthenticated || currentUser.role === 'kunde' || currentUser.role === 'admin') && (
          <>
            {activeTab === 'search' && (
              <div className="space-y-6">
                
                {/* Hero Header Banner */}
                <div className="bg-gradient-to-r from-[#1A265A] via-[#263773] to-[#50A5B1] text-white rounded-3xl p-5 sm:p-8 shadow-sm border border-[#50A5B1]/30 relative overflow-hidden flex flex-col justify-center">
                  <div className="relative z-10 max-w-3xl space-y-2">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white flex items-center gap-3 font-oswald font-medium uppercase tracking-wide">
                      <Search className="w-8 h-8 sm:w-10 sm:h-10 text-white bg-white/10 p-2 rounded-2xl shrink-0" />
                      <span>Coaches und Angebote suchen</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed pt-1">
                      Die Schweizer Plattform GET A COACH.ch für verifizierte Sport-, Fitness- & Wellbeing-Coaches · Echtzeit-Kalender-Sync · Bargeldlos (TWINT/Kreditkarte).
                    </p>
                  </div>
                </div>

                {/* Clear Spacer Window between Blue Header and Search Field (Dynamically measured reference area) */}
                <div 
                  ref={spacerRef}
                  className="h-24 sm:h-32 md:h-40 lg:h-44 w-full pointer-events-none" 
                  aria-hidden="true"
                />

                {/* Search & Filter Bar */}
                <SearchFilterBar showMap={showMap} setShowMap={setShowMap} />

                {/* Interactive Map View */}
                {showMap && (
                  <div className="animate-in fade-in duration-200">
                    <InteractiveMap
                      coaches={filteredCoaches}
                      sessions={sessions}
                      radiusKm={searchRadiusKm}
                      selectedLocations={selectedLocations}
                      onSelectCoach={coach => setSelectedCoachForDetail(coach)}
                    />
                  </div>
                )}

                {/* Coach List Grid Header */}
                <div id="coach-results-section" className="flex items-center justify-between">
                  <h2 className="text-xl text-[#1A265A] flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#F1600D]" />
                    Verfügbare Coaches ({filteredCoaches.length})
                  </h2>
                  <span className="text-xs font-semibold text-[#50A5B1]">
                    Verifizierte Coaches ✓
                  </span>
                </div>

                {/* Coaches Grid */}
                {filteredCoaches.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#50A5B1]/30 shadow-md space-y-4 max-w-2xl mx-auto my-6">
                    <div className="w-14 h-14 bg-slate-50 text-[#F1600D] rounded-2xl flex items-center justify-center mx-auto border border-[#50A5B1]/20 shadow-xs">
                      <Search className="w-7 h-7 text-[#50A5B1]" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-[#1A265A] text-base sm:text-lg">
                        Aktuell sind in dieser Region noch keine Coaches online.
                      </h3>
                      <p className="text-xs sm:text-sm text-[#1A265A]/70 max-w-md mx-auto leading-relaxed">
                        Bist du Trainer oder Coach? Registriere dich jetzt und schalte als einer der ersten Coaches in deiner Region deine Sport-, Fitness- & Wellbeing-Angebote frei!
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setActiveTab('register_coach');
                          window.history.pushState(null, '', '/register/coach');
                        }}
                        className="px-6 py-3 bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer inline-flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4 text-white" />
                        <span>Jetzt als Coach registrieren</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCoaches.map(coach => (
                      <CoachCard
                        key={coach.id}
                        coach={coach}
                        sessions={sessions}
                        onSelectCoach={c => setSelectedCoachForDetail(c)}
                        onBookSession={s => setSelectedSessionForBooking(s)}
                        onOpenChatWithCoach={c => openChatWithCoach(c)}
                      />
                    ))}
                  </div>
                )}

              </div>
            )}

            {activeTab === 'customer_dashboard' && (
              <CustomerDashboard
                setActiveTab={setActiveTab}
                onSelectCoach={c => setSelectedCoachForDetail(c)}
                onOpenChatWithCoach={c => openChatWithCoach(c)}
              />
            )}
            {(activeTab === 'sports_overview' || activeTab === 'coaches_by_sport') && (
              <CoachesBySportPage
                onSelectCoach={c => setSelectedCoachForDetail(c)}
                onBookSession={s => setSelectedSessionForBooking(s)}
                onOpenChatWithCoach={c => openChatWithCoach(c)}
              />
            )}
            {activeTab === 'my_requests' && <MyRequestsTab />}
            {activeTab === 'my_bookings' && <MyBookingsTab />}
            {activeTab === 'waitlist' && (
              <WaitlistFavoritesTab
                onSelectCoach={c => setSelectedCoachForDetail(c)}
                onBookSession={s => setSelectedSessionForBooking(s)}
                onOpenChatWithCoach={c => openChatWithCoach(c)}
              />
            )}
            {(activeTab === 'coach_pricing' || activeTab === 'pricing') && (
              <CoachPricingAndFeesTab onOpenTaxInfo={() => setActiveTab('coach_tax_info')} />
            )}
          </>
        )}

        {/* COACH VIEWS */}
        {isAuthenticated && currentUser.role === 'coach' && (
          <>
            {(activeTab === 'coach_dashboard' ||
              activeTab === 'coach_calendar' ||
              activeTab === 'coach_confirmed' ||
              activeTab === 'coach_accounting' ||
              activeTab === 'coach_ms_sync' ||
              ['search', 'sports_overview', 'coaches_by_sport', 'my_bookings', 'waitlist'].includes(activeTab)) && (
              <CoachDashboard
                activeSubTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenTaxInfo={() => setActiveTab('coach_tax_info')}
                onOpenChat={() => setShowChatDrawer(true)}
              />
            )}
            {activeTab === 'coach_requests' && <CoachRequestsTab />}
            {(activeTab === 'coach_profile' || activeTab === 'coach_profile_offerings') && (
              <CoachProfilePage initialSubTab="profile" onOpenTaxInfo={() => setActiveTab('coach_tax_info')} />
            )}
            {activeTab === 'coach_sessions' && (
              <CoachProfilePage initialSubTab="sessions" onOpenTaxInfo={() => setActiveTab('coach_tax_info')} />
            )}
            {activeTab === 'coach_verification' && (
              <CoachProfilePage initialSubTab="verification" onOpenTaxInfo={() => setActiveTab('coach_tax_info')} />
            )}
            {(activeTab === 'coach_pricing' || activeTab === 'pricing') && (
              <CoachProfilePage initialSubTab="pricing" onOpenTaxInfo={() => setActiveTab('coach_tax_info')} />
            )}
            {activeTab === 'coach_reviews' && (
              <CoachProfilePage initialSubTab="reviews" onOpenTaxInfo={() => setActiveTab('coach_tax_info')} />
            )}
          </>
        )}

        {/* LOCKED COACH VIEW FOR CUSTOMERS */}
        {currentUser.role === 'kunde' && activeTab === 'coach_profile_offerings' && (
          <CoachProfilePage />
        )}

      </main>

      {/* Footer */}
      <Footer onSelectTab={setActiveTab} />

      {/* Modals & Drawers */}
      {selectedCoachForDetail && (
        <CoachDetailModal
          coach={selectedCoachForDetail}
          onClose={() => setSelectedCoachForDetail(null)}
          onBookSession={s => setSelectedSessionForBooking(s)}
          onOpenChatWithCoach={c => openChatWithCoach(c)}
        />
      )}

      {selectedSessionForBooking && (
        <BookingModal
          session={selectedSessionForBooking}
          onClose={() => setSelectedSessionForBooking(null)}
          onOpenAgb={() => setActiveTab('agb')}
          onSuccess={bookingId => {
            setSelectedSessionForBooking(null);
            setActiveTab('my_bookings');
          }}
        />
      )}

      {showChatDrawer && (
        <ChatDrawer
          onClose={() => setShowChatDrawer(false)}
          targetCoachId={chatTargetCoachId}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onOpenAgb={() => setActiveTab('agb')}
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </ErrorBoundary>
  );
}
