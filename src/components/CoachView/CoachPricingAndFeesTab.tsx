import React from 'react';
import { useApp } from '../../context/AppContext';
import { createDefaultCoachProfile } from '../../utils/coachUtils';
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  HelpCircle,
  Coins,
  Sparkles,
  ArrowRight,
  Receipt,
  Percent,
  Wallet,
  Scale,
  FileText
} from 'lucide-react';

interface CoachPricingAndFeesTabProps {
  onOpenTaxInfo?: () => void;
}

export const CoachPricingAndFeesTab: React.FC<CoachPricingAndFeesTabProps> = ({ onOpenTaxInfo }) => {
  const { coaches, currentUser, isAuthenticated, switchRole } = useApp();

  // Find current user's coach profile, or fallback to default coach profile
  const existingCoach = coaches.find(c => c.userId === currentUser.id || c.id === currentUser.id) || coaches[0] || createDefaultCoachProfile(currentUser);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Green Banner (For Customers & Participants) */}
      {(!isAuthenticated || currentUser.role === 'kunde') && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-[#1A265A] text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-400/30">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="space-y-3 relative z-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl text-white font-oswald font-medium uppercase tracking-wide flex items-center gap-3">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white bg-white/10 p-1.5 rounded-2xl shrink-0" />
              <span>KOSTENLOSE NUTZUNG & BUCHUNG FÜR KURSTEILNEHMER:INNEN UND SPORTBEGEISTERTE</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed font-medium">
              Als Kursteilnehmer:in ist der Service und die Terminbuchung über GET A COACH.ch für dich zu 100% gebührenfrei. Du zahlst immer genau den regulären Lektionspreis, den dein Coach festlegt – ohne versteckte Buchungsspesen, ohne Plattformaufschläge und absolut ohne Abo-Zwang!
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-extrabold text-emerald-100">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/15">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> 0 CHF Plattform- & Buchungsgebühr
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/15">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> 1:1 Echter Coach-Lektionspreis
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl border border-white/15">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Kein Abo- oder Mitgliedszwang
              </span>
            </div>
          </div>
          
          <div className="relative z-10 shrink-0 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 text-center space-y-2 min-w-[200px]">
            <span className="text-3xl sm:text-4xl font-black text-amber-300 block">0 CHF</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">Plattform-Gebühr</span>
            <p className="text-[11px] text-emerald-100">Nutzung & Vermittlung stets gratis</p>
          </div>
        </div>
      )}

      {/* Special Banner for Interested Coaches without a profile */}
      {!existingCoach && (
        <div className="bg-gradient-to-r from-[#FEF6ED] via-amber-50 to-[#FEF6ED] p-5 sm:p-6 rounded-3xl border-2 border-[#F1600D]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#F1600D] font-extrabold text-sm">
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>Interessiert als Coach durchzustarten?</span>
            </div>
            <p className="text-xs text-[#1A265A] leading-relaxed">
              Du hast noch kein Coach-Profil? Die Registrierung ist zu 100% kostenlos und risikofrei. Du zahlst erst 15% All-In Vermittlungsprovision, wenn du Kunden über GET A COACH.ch gewinnst.
            </p>
          </div>
          <button
            onClick={() => {
              switchRole('coach');
            }}
            className="bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs px-5 py-3 rounded-2xl transition shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Zap className="w-4 h-4" />
            <span>Jetzt als Coach registrieren</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dedicated Coach Fee Facts Card & FAQ Section - Shown for Coaches & Unauthenticated Users */}
      {(!isAuthenticated || currentUser.role === 'coach') && (
        <>
          {/* Dedicated Coach Fee Facts Card with Orange Gradient Background */}
          <div className="bg-gradient-to-br from-[#F1600D] via-[#f3772b] to-[#d85208] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-orange-400/30 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-2 relative z-10">
              <h2 className="text-2xl sm:text-3xl text-white font-oswald font-medium uppercase tracking-wide flex items-center gap-3">
                <Coins className="w-7 h-7 sm:w-8 sm:h-8 text-white bg-white/10 p-1.5 rounded-2xl shrink-0" />
                <span>GEBÜHREN & KONDITIONEN FÜR COACHES AUF GET A COACH.CH</span>
              </h2>
              <p className="text-xs sm:text-sm text-orange-50 max-w-2xl leading-relaxed">
                Maximale Transparenz für dein Coaching-Business. Alle Kosten und Bedingungen auf einen Blick:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 text-xs">
              {/* Fact 1 */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-200 text-sm">
                  <Percent className="w-4 h-4 text-amber-200" />
                  <span>15% Fair-Play Provision</span>
                </div>
                <p className="text-orange-50 leading-relaxed text-[11px]">
                  Fällt ausschliesslich bei erfolgreicher Buchung durch einen Kunden an. Du erhältst garantiert 85% deines festgelegten Preises.
                </p>
              </div>

              {/* Fact 2 */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-200 text-sm">
                  <Zap className="w-4 h-4 text-amber-200" />
                  <span>0 CHF Fixkosten & Gebühren</span>
                </div>
                <p className="text-orange-50 leading-relaxed text-[11px]">
                  Keine monatliche Grundgebühr, keine Einrichtungs- oder Lizenzkosten. Die Plattformnutzung ist für dich 100% risikofrei.
                </p>
              </div>

              {/* Fact 3 */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-200 text-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-200" />
                  <span>Zahlungsgebühren Inklusive</span>
                </div>
                <p className="text-orange-50 leading-relaxed text-[11px]">
                  Sämtliche TWINT-, Visa-, Mastercard- & Stripe-Transaktionsgebühren übernimmt GET A COACH.ch komplett.
                </p>
              </div>

              {/* Fact 4 */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-200 text-sm">
                  <Wallet className="w-4 h-4 text-amber-200" />
                  <span>Garantierte Auszahlung</span>
                </div>
                <p className="text-orange-50 leading-relaxed text-[11px]">
                  Pünktliche monatliche Überweisung deiner Netto-Einnahmen direkt auf dein Schweizer Bankkonto (IBAN).
                </p>
              </div>

              {/* Fact 5 */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-200 text-sm">
                  <Receipt className="w-4 h-4 text-amber-200" />
                  <span>Automatische Buchhaltung</span>
                </div>
                <p className="text-orange-50 leading-relaxed text-[11px]">
                  Monatliche PDF-Gutschrift & Abrechnung direkt im Coach-Dashboard verfügbar für deine Steuererklärung.
                </p>
              </div>

              {/* Fact 6 */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-200 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-200" />
                  <span>Keine Vertragsbindung</span>
                </div>
                <p className="text-orange-50 leading-relaxed text-[11px]">
                  Keine Mindestlaufzeiten oder Kündigungsfristen. Du kannst dein Profil jederzeit pausieren oder Termine anpassen.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#50A5B1]/20 shadow-xs space-y-4">
            <h3 className="text-lg text-[#1A265A] flex items-center gap-2 font-bold">
              <HelpCircle className="w-5 h-5 text-[#50A5B1]" />
              Häufige Fragen zu Gebühren & Auszahlungen
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/20 space-y-1">
                <h4 className="font-bold text-[#1A265A]">Wann wird mein Geld ausbezahlt?</h4>
                <p className="text-[#1A265A]/80 leading-relaxed">
                  Die Auszahlungen erfolgen gebündelt jeweils zum 1. Arbeitstag des Folgemonats direkt auf dein angegebenes Schweizer Bankkonto (IBAN).
                </p>
              </div>

              <div className="bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/20 space-y-1">
                <h4 className="font-bold text-[#1A265A]">Was passiert bei Stornierungen durch Kunden?</h4>
                <p className="text-[#1A265A]/80 leading-relaxed">
                  Bei Absagen mehr als 24 Stunden vor Termin erhält der Kunde 100% Rückerstattung. Bei Absagen unter 24h vor Termin erhältst du 50% Ausfallentschädigung.
                </p>
              </div>

              <div className="bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/20 space-y-1">
                <h4 className="font-bold text-[#1A265A]">Muss ich TWINT/Stripe Gebühren bezahlen?</h4>
                <p className="text-[#1A265A]/80 leading-relaxed">
                  Nein! Alle Transaktionskosten (TWINT, Visa, Mastercard, Stripe) werden zu 100% von GET A COACH.ch im Rahmen der 15% Provision übernommen.
                </p>
              </div>

              <div className="bg-[#FEF6ED] p-4 rounded-2xl border border-[#50A5B1]/20 space-y-1">
                <h4 className="font-bold text-[#1A265A]">Gibt es Mindestumsätze oder Vertragsfristen?</h4>
                <p className="text-[#1A265A]/80 leading-relaxed">
                  Keine Vertragsbindung. Du kannst dein Profil jederzeit pausieren oder löschen. Wenn du keine Lektionen anbietest, zahlst du absolut nichts.
                </p>
              </div>
            </div>

            {/* Steuern & Rechtliches Infoseite Banner */}
            {onOpenTaxInfo && (
              <div className="pt-2 border-t border-[#50A5B1]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#FEF6ED]/60 p-4 rounded-2xl border border-[#50A5B1]/20">
                <div className="flex items-center gap-2.5">
                  <Scale className="w-5 h-5 text-[#F1600D] shrink-0" />
                  <div>
                    <span className="font-bold text-xs text-[#1A265A] block">Info-Leitfaden: Steuern & Sozialversicherungen (SVA/AHV)</span>
                    <p className="text-[11px] text-[#1A265A]/70">Detaillierte Erklärungen zur selbstständigen Tätigkeit und Deklarationspflicht in der Schweiz.</p>
                  </div>
                </div>
                <button
                  onClick={onOpenTaxInfo}
                  className="bg-[#1A265A] hover:bg-[#263773] text-white font-extrabold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-[#50A5B1]" />
                  <span>Info-Seite Öffnen</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
};
