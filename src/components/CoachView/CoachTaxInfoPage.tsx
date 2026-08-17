import React from 'react';
import { ArrowLeft, Scale, Calculator, ShieldAlert, FileText, CheckCircle, ExternalLink, HelpCircle, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CoachTaxInfoPageProps {
  onBack?: () => void;
}

export const CoachTaxInfoPage: React.FC<CoachTaxInfoPageProps> = ({ onBack }) => {
  const { currentUser } = useApp();

  return (
    <div className="bg-slate-50 text-[#1A265A] min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#50A5B1]/20 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-[#50A5B1]/30 text-[#1A265A] transition cursor-pointer flex items-center gap-1 text-xs font-bold mr-2 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Zurück zum Dashboard</span>
                </button>
              )}
              <span className="bg-[#F1600D] text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Calculator className="w-3.5 h-3.5" />
                Coach-Guide Schweiz
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-oswald font-medium text-[#1A265A] uppercase tracking-wide mt-2">
              Steuern & Rechtliches für Coaches
            </h1>
            <p className="text-xs sm:text-sm text-[#1A265A]/80 font-medium">
              Leitfaden zur selbstständigen Tätigkeit, Sozialversicherungen (SVA/AHV) & Steuerdeklaration auf GET A COACH
            </p>
          </div>

          {/* Self declaration status */}
          <div className="bg-white rounded-2xl p-4 border border-[#50A5B1]/30 shadow-xs shrink-0 w-full sm:w-auto text-xs space-y-1.5">
            <div className="font-bold text-[#1A265A] flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#50A5B1]" />
              <span>Status Selbstdeklaration:</span>
            </div>
            {currentUser.coach_tax_declaration_accepted_at ? (
              <div className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bestätigt am {new Date(currentUser.coach_tax_declaration_accepted_at).toLocaleDateString('de-CH')}</span>
              </div>
            ) : (
              <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-bold block">
                In Selbstverantwortung
              </span>
            )}
          </div>
        </div>

        {/* Highlight Summary Banner */}
        <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/30 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-slate-50 rounded-2xl text-[#F1600D] border border-[#50A5B1]/20 shrink-0 hidden sm:block">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="text-xs sm:text-sm text-[#1A265A]/90 leading-relaxed space-y-1.5">
            <h2 className="font-bold text-[#1A265A] text-sm sm:text-base">
              Transparente Spielregeln für deine sportliche Selbstständigkeit in der Schweiz
            </h2>
            <p>
              Als Coach auf GET A COACH profitierst du von voller zeitlicher und finanzieller Unabhängigkeit.
              GET A COACH agiert als technischer Vermittlungspartner und stellt dir Werkzeuge für Buchungen, Kalender, TWINT-Zahlungen und Quittungen zur Verfügung.
            </p>
          </div>
        </div>

        {/* 3 Main Topic Cards */}
        <div className="space-y-6">
          
          {/* Section 1: Plattformrolle & Kein Arbeitgeberverhältnis */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#50A5B1]/30 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-[#50A5B1]/20 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#1A265A] text-white flex items-center justify-center font-oswald font-bold text-sm shrink-0">
                1
              </div>
              <h2 className="font-oswald font-medium text-lg sm:text-xl text-[#1A265A] uppercase tracking-wide">
                Reine Vermittlungsplattform (Kein Arbeitgeberverhältnis)
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-[#1A265A]/90 space-y-3 leading-relaxed">
              <p>
                <strong>GET A COACH ist ein reiner Technologie- und Vermittlungsdienstleister:</strong> Wenn Sportler:innen über die Plattform eine Lektion buchen, kommt der Vertrag für die Sportleistung direkt zwischen dem:der Kund:in und dir als selbstständigem Coach zustande.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-[#1A265A]/80">
                <li>Es entsteht zu keinem Zeitpunkt ein arbeitsvertragliches Anstellungsverhältnis mit GET A COACH.</li>
                <li>GET A COACH zieht keine Sozialversicherungsbeiträge (AHV/IV/EO/ALV) von deinen Honoraren ab.</li>
                <li>Du erhältst dein Guthaben (85% Netto-Guthaben nach Abzug der 15% All-In Vermittlungsprovision) ohne Abzüge direkt auf dein Schweizer Bankkonto ausgezahlt.</li>
              </ul>
            </div>
          </div>

          {/* Section 2: Preisfreiheit & Unabhängigkeit */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#50A5B1]/30 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-[#50A5B1]/20 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#50A5B1] text-white flex items-center justify-center font-oswald font-bold text-sm shrink-0">
                2
              </div>
              <h2 className="font-oswald font-medium text-lg sm:text-xl text-[#1A265A] uppercase tracking-wide">
                Preisfreiheit & Unternehmerische Unabhängigkeit
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-[#1A265A]/90 space-y-3 leading-relaxed">
              <p>
                Als selbstständiger Coach bestimmst du deine Rahmenbedingungen 100% eigenverantwortlich:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-[#50A5B1]/20 space-y-1">
                  <span className="font-bold text-xs text-[#F1600D] block">Freie Preisgestaltung</span>
                  <p className="text-[11px] text-[#1A265A]/80">Du legst deine Stundensätze (z.B. CHF 90.–/Std.) und Gruppenpreise selbst fest.</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-[#50A5B1]/20 space-y-1">
                  <span className="font-bold text-xs text-[#50A5B1] block">Eigene Arbeitszeiten</span>
                  <p className="text-[11px] text-[#1A265A]/80">Du steuerst deine Kalender-Verfügbarkeiten und Ferientage voll flexibel im Kalender-Manager.</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-[#50A5B1]/20 space-y-1">
                  <span className="font-bold text-xs text-[#1A265A] block">Keine Mindeststunden</span>
                  <p className="text-[11px] text-[#1A265A]/80">Es gibt keine Vorgaben oder Exklusivitätsklauseln – du trainierst wann und wo du willst.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Steuer- & AHV-Pflicht in der Schweiz */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#50A5B1]/30 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-[#50A5B1]/20 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F1600D] text-white flex items-center justify-center font-oswald font-bold text-sm shrink-0">
                3
              </div>
              <h2 className="font-oswald font-medium text-lg sm:text-xl text-[#1A265A] uppercase tracking-wide">
                Steuer- & AHV-Deklarationspflicht in der Schweiz
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-[#1A265A]/90 space-y-3 leading-relaxed">
              <p>
                Alle Einnahmen aus deiner Coaching-Tätigkeit sind ordnungsgemäss bei den zuständigen Behörden deines Wohnsitzkantons anzugeben:
              </p>

              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
                  <h3 className="font-bold text-xs sm:text-sm text-[#1A265A] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#F1600D]" />
                    <span>Steuererklärung (Kantonale Steuerverwaltung)</span>
                  </h3>
                  <p className="text-xs text-[#1A265A]/80 leading-relaxed">
                    Sämtliche Brutto-Einnahmen aus GET A COACH Buchungen müssen in deiner jährlichen Steuererklärung angegeben werden (bei Nebenerwerb unter «Einkünfte aus selbstständiger Nebenerwerbstätigkeit»). Du kannst berufsspezifische Auslagen (z.B. Sportmaterial, Fahrkosten, Aus- und Weiterbildung) als Gewinnungskosten geltend machen.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
                  <h3 className="font-bold text-xs sm:text-sm text-[#1A265A] flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-[#50A5B1]" />
                    <span>Sozialversicherungen (SVA / AHV / IV)</span>
                  </h3>
                  <p className="text-xs text-[#1A265A]/80 leading-relaxed">
                    <strong>Nebenerwerb (unter CHF 2'300.–/Jahr):</strong> Einnahmen aus Nebenerwerb bis CHF 2'300.– pro Kalenderjahr sind in der Regel bei der SVA/AHV beitragsbefreit (sofern kein verlangter Einzug).
                    <br />
                    <strong>Selbstständiger Haupt- oder grösserer Nebenerwerb:</strong> Liegen deine jährlichen Einnahmen über dieser Freigrenze, musst du dich bei der Sozialversicherungsanstalt (SVA) deines Kantons als selbstständig Erwerbende/r anmelden.
                  </p>
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/80 flex items-start gap-3 text-xs text-amber-950 font-medium">
                <ShieldAlert className="w-5 h-5 text-[#F1600D] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-[#1A265A]">Wichtiger rechtlicher Hinweis:</span>
                  <p>
                    Coaches haften selbstständig für die vollständige Deklaration ihrer Einnahmen. Im Bereich «Auszahlungs-Quittungen» im Coach-Dashboard stellt dir GET A COACH detaillierte Monatsauszüge und PDF-Quittungen zum Herunterladen für dein Buchhaltungs-Dossier zur Verfügung.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Useful External Links */}
        <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/30 shadow-xs space-y-3">
          <h2 className="font-oswald font-medium text-base text-[#1A265A] uppercase tracking-wide flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#50A5B1]" />
            Nützliche offizielle Schweizer Informationsquellen
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <a
              href="https://www.ch.ch/de/steuern-und-finanzen/selbstandig-machen/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-slate-50 rounded-xl border border-[#50A5B1]/20 hover:border-[#F1600D] transition flex items-center justify-between font-bold text-[#1A265A]"
            >
              <span>ch.ch – Selbstständig machen in der Schweiz</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#F1600D]" />
            </a>
            <a
              href="https://www.ahv-iv.ch/p/2.02.d"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-slate-50 rounded-xl border border-[#50A5B1]/20 hover:border-[#F1600D] transition flex items-center justify-between font-bold text-[#1A265A]"
            >
              <span>AHV/IV Merkblatt 2.02 – Beiträge Selbstständige</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#F1600D]" />
            </a>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="text-center text-xs text-[#1A265A]/70 space-y-2 pt-2">
          <p>© 2026 GET A COACH Schweiz · Hilfecenter für Coaches</p>
          {onBack && (
            <button
              onClick={onBack}
              className="text-[#F1600D] font-bold hover:underline cursor-pointer"
            >
              ← Zurück zum Coach-Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
