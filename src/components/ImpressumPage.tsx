import React from 'react';
import { ArrowLeft, Building2, Mail, User, ShieldAlert, ExternalLink, Copyright, MapPin } from 'lucide-react';

interface ImpressumPageProps {
  onBack?: () => void;
}

export const ImpressumPage: React.FC<ImpressumPageProps> = ({ onBack }) => {
  return (
    <div className="bg-[#FFFFFF] text-[#1A265A] min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans">
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
                  <span>Zurück</span>
                </button>
              )}
              <span className="bg-[#1A265A] text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-[#50A5B1]" />
                Rechtliche Angaben
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-oswald font-medium text-[#1A265A] uppercase tracking-wide mt-2">
              Impressum
            </h1>
            <p className="text-xs sm:text-sm text-[#1A265A]/80 font-medium">
              Angaben gemäss Schweizer Recht & Informationspflichten · GET A COACH
            </p>
          </div>
        </div>

        {/* Contact & Owner Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Address */}
          <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/30 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#F1600D]">
              <MapPin className="w-5 h-5 shrink-0" />
              <h2 className="font-oswald font-medium text-lg uppercase tracking-wide text-[#1A265A]">
                Kontakt-Adresse
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-[#1A265A]/90 space-y-1 font-medium leading-relaxed bg-[#FFFFFF]/60 p-4 rounded-2xl border border-[#50A5B1]/15">
              <p className="font-bold text-[#1A265A] text-base">Michael Löffler</p>
              <p className="font-semibold text-[#F1600D]">GET A COACH</p>
              <p>Schachenweg 83</p>
              <p>8400 Winterthur</p>
              <p>Schweiz</p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#1A265A]">
                <Mail className="w-4 h-4 text-[#50A5B1]" />
                <span>E-Mail: <a href="mailto:support@getacoach.ch" className="text-[#F1600D] hover:underline">support@getacoach.ch</a></span>
              </div>
            </div>
          </div>

          {/* Authorized Representative */}
          <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/30 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#50A5B1]">
              <User className="w-5 h-5 shrink-0" />
              <h2 className="font-oswald font-medium text-lg uppercase tracking-wide text-[#1A265A]">
                Vertretungsberechtigte Person
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-[#1A265A]/90 space-y-2 font-medium leading-relaxed bg-[#FFFFFF]/60 p-4 rounded-2xl border border-[#50A5B1]/15">
              <p className="font-bold text-[#1A265A] text-base">Michael Löffler</p>
              <p className="text-xs text-[#1A265A]/80">Inhaber:in / Betreiber:in</p>
              <div className="pt-2 text-[11px] text-[#1A265A]/70 leading-normal border-t border-[#50A5B1]/20">
                Verantwortlich für den Inhalt und die technische Betreuung der Plattform GET A COACH.
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Sections */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#50A5B1]/30 shadow-md space-y-8 text-[#1A265A] text-xs sm:text-sm leading-relaxed">
          
          {/* Haftungsausschluss */}
          <section className="space-y-3 bg-[#FFFFFF]/50 p-5 rounded-2xl border border-[#50A5B1]/15">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#F1600D] shrink-0" />
              <h2 className="font-oswald font-medium text-lg text-[#1A265A] uppercase tracking-wide">
                Haftungsausschluss
              </h2>
            </div>
            <p className="text-[#1A265A]/90 leading-relaxed">
              Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen.
            </p>
            <p className="text-[#1A265A]/90 leading-relaxed">
              Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen, durch Missbrauch der Verbindung oder durch technische Störungen entstanden sind, werden ausgeschlossen.
            </p>
            <p className="text-[#1A265A]/90 leading-relaxed">
              Alle Angebote sind unverbindlich. Der Autor behält es sich ausdrücklich vor, Teile der Seiten oder das gesamte Angebot ohne gesonderte Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen.
            </p>
          </section>

          {/* Haftung für Links */}
          <section className="space-y-3 bg-[#FFFFFF]/50 p-5 rounded-2xl border border-[#50A5B1]/15">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-[#50A5B1] shrink-0" />
              <h2 className="font-oswald font-medium text-lg text-[#1A265A] uppercase tracking-wide">
                Haftung für Links
              </h2>
            </div>
            <p className="text-[#1A265A]/90 leading-relaxed">
              Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres Verantwortungsbereichs. Es wird jegliche Verantwortung für solche Webseiten abgelehnt. Der Zugriff und die Nutzung solcher Webseiten erfolgen auf eigene Gefahr der Nutzer:innen.
            </p>
          </section>

          {/* Urheberrechte */}
          <section className="space-y-3 bg-[#FFFFFF]/50 p-5 rounded-2xl border border-[#50A5B1]/15">
            <div className="flex items-center gap-2">
              <Copyright className="w-5 h-5 text-[#1A265A] shrink-0" />
              <h2 className="font-oswald font-medium text-lg text-[#1A265A] uppercase tracking-wide">
                Urheberrechte
              </h2>
            </div>
            <p className="text-[#1A265A]/90 leading-relaxed">
              Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf der Website gehören ausschliesslich <strong>Michael Löffler</strong> oder den speziell genannten Rechteinhaber:innen. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung der Urheberrechtsträger:innen im Voraus einzuholen.
            </p>
          </section>

        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-[#1A265A]/70 space-y-2 pt-2">
          <p>© 2026 GET A COACH · Michael Löffler · Winterthur, Schweiz</p>
          {onBack && (
            <button
              onClick={onBack}
              className="text-[#F1600D] font-bold hover:underline cursor-pointer"
            >
              ← Zurück zur Plattform
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
