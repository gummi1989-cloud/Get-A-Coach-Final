import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Calendar,
  CreditCard,
  Bell,
  MessageSquare,
  ShieldCheck,
  Zap,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Sparkles,
  ChevronDown,
  Clock,
  Check,
  Trophy,
  Coins,
  Star,
  Inbox,
  FileText,
  CalendarCheck,
  Receipt,
  LayoutDashboard,
  Users,
  BarChart3,
  Banknote
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  onOpenChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onOpenChat
}) => {
  const {
    isAuthenticated,
    currentUser,
    switchRole,
    logout,
    notifications,
    markNotificationRead,
    clearNotifications,
    coaches,
    bookings,
    customRequests
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const currentCoachProfile = coaches.find(c => c.userId === currentUser.id || c.id === currentUser.id) || coaches[0];
  const coachBookingsList = bookings ? bookings.filter(b => b.coachId === currentCoachProfile?.id) : [];
  const confirmedBookingsCount = coachBookingsList.filter(
    b => b.status === 'bestaetigt' || b.status === 'abgeschlossen' || b.requestStatus === 'bestaetigt'
  ).length;
  const pendingRequestsCount = coachBookingsList.filter(b => b.requestStatus === 'anfrage_ausstehend').length +
    (customRequests ? customRequests.filter(r => r.coachId === currentCoachProfile?.id && r.status === 'offen').length : 0);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#50A5B1]/20 shadow-xs">
      
      {/* Provisorischer Vorschau-Umschalter für Kunden und Coaches */}
      <div className="bg-[#1A265A] text-white py-1.5 px-3 border-b border-[#50A5B1]/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-[#F1600D] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              Provisorische Vorschau
            </span>
            <span className="hidden sm:inline text-white/90 text-[11px] font-semibold">Bereich wählen:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            <button
              onClick={() => {
                switchRole('kunde');
                setActiveTab('search');
              }}
              className={`px-3 py-1 rounded-lg font-extrabold text-[11px] transition flex items-center gap-1.5 cursor-pointer ${
                isAuthenticated && currentUser.role === 'kunde'
                  ? 'bg-[#50A5B1] text-white shadow-xs ring-1 ring-white/40'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
              title="Kunden-Bereich aktivieren"
            >
              <UserIcon className="w-3.5 h-3.5 text-sky-200" />
              <span>👤 Kunden-Bereich</span>
            </button>

            <button
              onClick={() => {
                switchRole('coach');
                setActiveTab('coach_dashboard');
              }}
              className={`px-3 py-1 rounded-lg font-extrabold text-[11px] transition flex items-center gap-1.5 cursor-pointer ${
                isAuthenticated && currentUser.role === 'coach'
                  ? 'bg-[#F1600D] text-white shadow-xs ring-1 ring-white/40'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
              title="Coach-Bereich aktivieren"
            >
              <Zap className="w-3.5 h-3.5 text-orange-200" />
              <span>⚡ Coach-Bereich</span>
            </button>

            <button
              onClick={() => {
                switchRole('admin');
                setActiveTab('admin_dashboard');
              }}
              className={`px-3 py-1 rounded-lg font-extrabold text-[11px] transition flex items-center gap-1.5 cursor-pointer ${
                isAuthenticated && currentUser.role === 'admin'
                  ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-white/40'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
              title="Admin-Bereich aktivieren"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>🛡️ Admin-Bereich</span>
            </button>

            <button
              onClick={() => {
                logout();
                setActiveTab('search');
              }}
              className={`px-3 py-1 rounded-lg font-extrabold text-[11px] transition flex items-center gap-1.5 cursor-pointer ${
                !isAuthenticated
                  ? 'bg-slate-700 text-white shadow-xs ring-1 ring-white/40'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
              title="Unangemeldet als Gast ansehen"
            >
              <Search className="w-3.5 h-3.5 text-slate-300" />
              <span>🌐 Gast (Öffentlich)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 lg:h-28 gap-2 sm:gap-4 overflow-hidden py-2">
          
          {/* Logo & Brand - Prominent Logo with White Background */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setActiveTab(isAuthenticated && currentUser.role === 'coach' ? 'coach_dashboard' : 'search')}
              className="flex items-center group text-left cursor-pointer border-0 outline-none bg-white p-1 rounded-xl shadow-2xs transition-transform hover:scale-102"
            >
              <img
                src="/getacoachlogo.png"
                alt="GET A COACH Logo"
                className="h-16 sm:h-20 md:h-22 lg:h-26 w-auto object-contain rounded-lg"
              />
            </button>
          </div>



          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* If NOT Authenticated: Prominent Register/Login Button */}
            {!isAuthenticated ? (
              <button
                onClick={onOpenAuthModal}
                className="bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs sm:text-sm px-4 py-2 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer border border-[#F1600D]"
              >
                <UserIcon className="w-4 h-4 stroke-[2.5]" />
                <span>Anmelden / Registrieren</span>
              </button>
            ) : (
              <>
                {/* Direct Chat Trigger */}
                <button
                  onClick={onOpenChat}
                  className="p-1.5 sm:p-2.5 rounded-xl text-[#1A265A] bg-[#FEF6ED] hover:bg-[#F1600D]/10 transition relative cursor-pointer border border-[#50A5B1]/20 flex items-center justify-center shrink-0"
                  title="Nachrichten & Chat"
                  aria-label="Nachrichten & Chat"
                >
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#50A5B1]" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F1600D] ring-2 ring-white"></span>
                </button>

                {/* Notification Bell Dropdown */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-1.5 sm:p-2.5 rounded-xl text-[#1A265A] bg-[#FEF6ED] hover:bg-[#F1600D]/10 transition relative cursor-pointer border border-[#50A5B1]/20 flex items-center justify-center shrink-0"
                    title="Benachrichtigungen & Warteliste"
                    aria-label="Benachrichtigungen"
                  >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#50A5B1]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#F1600D] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 ring-2 ring-white shadow-xs">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Popover */}
                  {showNotifications && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-black/10 sm:bg-transparent"
                        onClick={() => setShowNotifications(false)}
                      />
                      <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-[#50A5B1]/30 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-[#50A5B1]/20">
                          <h4 className="font-bold text-sm text-[#1A265A] flex items-center gap-1.5">
                            <Bell className="w-4 h-4 text-[#F1600D]" />
                            Benachrichtigungen
                          </h4>
                          {notifications.length > 0 && (
                            <button
                              onClick={clearNotifications}
                              className="text-[11px] font-semibold text-[#50A5B1] hover:text-[#1A265A]"
                            >
                              Alle löschen
                            </button>
                          )}
                        </div>

                        <div className="divide-y divide-[#50A5B1]/10 max-h-80 overflow-y-auto my-2">
                          {notifications.length === 0 ? (
                            <div className="py-6 text-center text-xs text-[#1A265A]/60">
                              Keine neuen Mitteilungen.
                            </div>
                          ) : (
                            notifications.map(n => (
                              <div
                                key={n.id}
                                onClick={() => markNotificationRead(n.id)}
                                className={`py-2.5 px-2 hover:bg-[#FEF6ED] rounded-lg cursor-pointer transition ${
                                  !n.read ? 'bg-[#FEF6ED] font-medium' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-bold text-xs text-[#1A265A]">{n.title}</span>
                                  <span className="text-[10px] text-[#1A265A]/60 shrink-0">
                                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-[#1A265A]/70 mt-0.5 leading-snug">{n.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Current User Badge & Profile */}
                <div className="flex items-center gap-1.5 sm:gap-2 sm:pl-2 sm:border-l sm:border-[#50A5B1]/20 shrink-0">
                  {currentUser.role !== 'admin' && (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-[#50A5B1]/40 shadow-xs"
                    />
                  )}
                  <div className="hidden lg:block text-left">
                    <div className="font-bold text-xs text-[#1A265A] flex items-center gap-1">
                      {currentUser.name}
                      {currentUser.role === 'coach' && currentUser.isVerified && (
                        <span className="text-[#F1600D] font-black text-xs" title="Ausweis Verifiziert">✓</span>
                      )}
                    </div>
                    <div className="text-[10px] font-medium text-[#50A5B1]">
                      {currentUser.role === 'admin' ? 'Plattform Host Admin' : currentUser.role === 'kunde' ? 'Kund:in · Angemeldet' : 'Coach · Verifiziert'}
                    </div>
                  </div>

                  {/* Logout button */}
                  <button
                    onClick={() => {
                      logout();
                      setActiveTab('search');
                    }}
                    className="p-1.5 rounded-lg text-[#1A265A]/60 hover:text-red-600 hover:bg-red-50 transition cursor-pointer ml-1"
                    title="Abmelden"
                    aria-label="Abmelden"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-2 text-xs font-semibold scrollbar-none border-t border-[#50A5B1]/10 pt-2">
          {!isAuthenticated ? (
            /* Unauthenticated Public Navigation */
            <>
              <button
                onClick={() => setActiveTab('search')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'search'
                    ? 'bg-[#1A265A] text-white font-bold shadow-xs'
                    : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
                }`}
              >
                <Search className="w-4 h-4 text-[#50A5B1]" />
                <span>Coaches & Angebote suchen</span>
              </button>

              <button
                onClick={() => setActiveTab('sports_overview')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'sports_overview' || activeTab === 'coaches_by_sport'
                    ? 'bg-[#1A265A] text-white font-bold shadow-xs'
                    : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
                }`}
              >
                <Users className="w-4 h-4 text-[#50A5B1]" />
                <span>Coaches</span>
              </button>

              <button
                onClick={() => setActiveTab('coach_pricing')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'coach_pricing'
                    ? 'bg-[#1A265A] text-white font-bold shadow-xs'
                    : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
                }`}
              >
                <Coins className="w-4 h-4 text-[#50A5B1]" />
                <span>Preise & Gebühren</span>
              </button>
            </>
          ) : currentUser.role === 'admin' ? (
            /* Authenticated Host Admin Navigation - cleaned per user request */
            null
          ) : currentUser.role === 'kunde' ? (
            /* Authenticated Customer Navigation */
            <>
              <button
                onClick={() => setActiveTab('search')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'search'
                    ? 'bg-[#1A265A] text-white font-bold shadow-xs'
                    : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
                }`}
              >
                <Search className="w-4 h-4 text-[#50A5B1]" />
                <span>Coaches suchen</span>
              </button>

              <button
                onClick={() => setActiveTab('sports_overview')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'sports_overview' || activeTab === 'coaches_by_sport'
                    ? 'bg-[#1A265A] text-white font-bold shadow-xs'
                    : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
                }`}
              >
                <Users className="w-4 h-4 text-[#50A5B1]" />
                <span>Coaches</span>
              </button>

              <button
                onClick={() => setActiveTab('customer_dashboard')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'customer_dashboard'
                    ? 'bg-[#1A265A] text-white font-bold shadow-xs'
                    : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 ${activeTab === 'customer_dashboard' ? 'text-white' : 'text-[#50A5B1]'}`} />
                <span>Mein Bereich</span>
              </button>

              <button
                onClick={() => setActiveTab('my_bookings')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'my_bookings'
                    ? 'bg-[#1A265A] text-white font-bold shadow-xs'
                    : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#50A5B1]" />
                <span>Meine Buchungen</span>
              </button>

              <button
                onClick={() => setActiveTab('my_requests')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'my_requests'
                    ? 'bg-[#1A265A] text-white font-bold shadow-xs'
                    : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
                }`}
              >
                <FileText className="w-4 h-4 text-[#50A5B1]" />
                <span>Anfragen & Angebote</span>
              </button>

              <button
                onClick={() => setActiveTab('waitlist')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'waitlist'
                    ? 'bg-[#1A265A] text-white font-bold shadow-xs'
                    : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
                }`}
              >
                <Clock className="w-4 h-4 text-[#50A5B1]" />
                <span>Warteliste & Favoriten</span>
              </button>

              <button
                onClick={() => setActiveTab('coach_pricing')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'coach_pricing'
                    ? 'bg-[#1A265A] text-white font-bold shadow-xs'
                    : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
                }`}
              >
                <Coins className="w-4 h-4 text-[#50A5B1]" />
                <span>Preise</span>
              </button>
            </>
          ) : (
            /* Authenticated Coach Navigation */
            <>
              <button
                onClick={() => setActiveTab('coach_dashboard')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'coach_dashboard' || activeTab === 'coach_accounting' || activeTab === 'coach_overview'
                    ? 'bg-[#F1600D] text-white font-bold shadow-xs'
                    : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 ${activeTab === 'coach_dashboard' || activeTab === 'coach_accounting' || activeTab === 'coach_overview' ? 'text-white' : 'text-[#F1600D]'}`} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('coach_requests')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer relative ${
                  activeTab === 'coach_requests'
                    ? 'bg-[#F1600D] text-white font-bold shadow-xs'
                    : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
                }`}
              >
                <Inbox className={`w-4 h-4 ${activeTab === 'coach_requests' ? 'text-white' : 'text-[#F1600D]'}`} />
                <span>Aktuelle Anfragen</span>
                {pendingRequestsCount > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
                    </span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      activeTab === 'coach_requests' ? 'bg-white text-[#F1600D]' : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {pendingRequestsCount}
                    </span>
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveTab('coach_confirmed')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'coach_confirmed'
                    ? 'bg-[#F1600D] text-white font-bold shadow-xs'
                    : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${activeTab === 'coach_confirmed' ? 'text-white' : 'text-[#F1600D]'}`} />
                <span>Bestätigte Buchungen</span>
              </button>

              <button
                onClick={() => setActiveTab('coach_calendar')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'coach_calendar' || activeTab === 'coach_ms_sync'
                    ? 'bg-[#F1600D] text-white font-bold shadow-xs'
                    : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
                }`}
              >
                <CalendarCheck className={`w-4 h-4 ${activeTab === 'coach_calendar' || activeTab === 'coach_ms_sync' ? 'text-white' : 'text-[#F1600D]'}`} />
                <span>Mein Kalendermanager</span>
              </button>

              <button
                onClick={() => setActiveTab('coach_profile')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  ['coach_profile', 'coach_profile_offerings', 'coach_verification', 'coach_pricing', 'coach_reviews', 'coach_sessions'].includes(activeTab)
                    ? 'bg-[#F1600D] text-white font-bold shadow-xs'
                    : 'text-[#1A265A]/70 hover:bg-[#FEF6ED] hover:text-[#1A265A]'
                }`}
              >
                <UserIcon className={`w-4 h-4 ${
                  ['coach_profile', 'coach_profile_offerings', 'coach_verification', 'coach_pricing', 'coach_reviews', 'coach_sessions'].includes(activeTab)
                    ? 'text-white'
                    : 'text-[#F1600D]'
                }`} />
                <span>Mein Profil</span>
                {currentUser.isVerified && (
                  <span className="text-emerald-400 font-bold text-xs">✓</span>
                )}
              </button>
            </>
          )}
        </nav>

      </div>
    </header>
  );
};
