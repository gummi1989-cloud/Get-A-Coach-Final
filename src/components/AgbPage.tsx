import React from 'react';
import { ShieldCheck, ArrowLeft, FileText, CheckCircle2, Lock, Scale, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AgbPageProps {
  onBack?: () => void;
}

export const AgbPage: React.FC<AgbPageProps> = ({ onBack }) => {
  const { currentUser, acceptAgb } = useApp();

  const handleManualAccept = () => {
    acceptAgb("1.0");
    alert("AGB Version 1.0 wurde erfolgreich in deinem Nutzer:innen-Konto bestätigt.");
  };

  return (
    <div className="bg-slate-50 text-[#1A265A] min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#50A5B1]/20 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-[#50A5B1]/30 text-[#1A265A] transition cursor-pointer flex items-center gap-1 text-xs font-bold mr-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Zurück</span>
                </button>
              )}
              <span className="bg-[#F1600D] text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <FileText className="w-3.5 h-3.5" />
                Rechtliches
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-oswald font-medium text-[#1A265A] uppercase tracking-wide mt-2">
              Allgemeine Geschäftsbedingungen (AGB) – GET A COACH
            </h1>
            <p className="text-xs sm:text-sm text-[#1A265A]/80 font-medium">
              Gültig ab: Version 1.0 (Stand: 2026) · GET A COACH Schweiz AG
            </p>
          </div>

          {/* User AGB acceptance badge status */}
          <div className="bg-white rounded-2xl p-4 border border-[#50A5B1]/30 shadow-xs shrink-0 w-full sm:w-auto text-xs space-y-1.5">
            <div className="font-bold text-[#1A265A] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#50A5B1]" />
              <span>Dein AGB-Status:</span>
            </div>
            {currentUser.agb_accepted_at ? (
              <div className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Akzeptiert am {new Date(currentUser.agb_accepted_at).toLocaleDateString('de-CH')} (v{currentUser.agb_version || '1.0'})</span>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium block">
                  Noch nicht quittiert
                </span>
                <button
                  onClick={handleManualAccept}
                  className="w-full text-center bg-[#F1600D] hover:bg-[#d85208] text-white font-bold text-[11px] py-1.5 px-3 rounded-lg transition cursor-pointer shadow-xs"
                >
                  Jetzt AGB v1.0 Bestätigen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Introduction Summary Box */}
        <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/20 shadow-xs flex items-start gap-4">
          <div className="p-3 bg-slate-50 rounded-2xl text-[#F1600D] border border-[#50A5B1]/20 shrink-0 hidden sm:block">
            <Scale className="w-6 h-6" />
          </div>
          <div className="text-xs sm:text-sm text-[#1A265A]/90 leading-relaxed space-y-2">
            <p className="font-bold text-[#1A265A] text-sm">
              Willkommen bei GET A COACH – der Schweizer Online-Plattform für Sport-, Fitness- & Wellbeing-Coaching.
            </p>
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung der Plattform GET A COACH für Sportler:innen und Kund:innen (Teil A) sowie für selbstständige Coaches (Teil B) und enthalten allgemeine Schlussbestimmungen (Teil C).
            </p>
          </div>
        </div>

        {/* Main AGB Document Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#50A5B1]/30 shadow-md space-y-8 text-[#1A265A] leading-relaxed text-xs sm:text-sm">
          
          {/* TEIL A */}
          <section className="space-y-6">
            <div className="border-b-2 border-[#F1600D] pb-2">
              <span className="text-[#F1600D] font-extrabold text-xs uppercase tracking-wider block">Teil A</span>
              <h2 className="text-xl sm:text-2xl font-oswald font-medium text-[#1A265A] uppercase tracking-wide">
                Allgemeine Bestimmungen & Kund:innen
              </h2>
            </div>

            {/* Section 1 */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-[#50A5B1]/15">
              <h3 className="font-bold text-base text-[#1A265A] flex items-center gap-2">
                <span className="bg-[#1A265A] text-white w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0">1</span>
                Geltungsbereich & Plattformrolle
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-[#1A265A]/90">
                <li>
                  <strong>Dienstleistung von GET A COACH:</strong> GET A COACH betreibt eine Online-Plattform, die Sportler:innen / Kund:innen mit selbstständigen Coaches zusammenbringt. GET A COACH stellt dabei lediglich die technische Infrastruktur (Suche, Buchung, Kalender, Zahlungsabwicklung) zur Verfügung.
                </li>
                <li>
                  <strong>Vertragsverhältnis:</strong> Der Vertrag über die eigentliche Coaching-Dienstleistung kommt direkt zwischen dem:der Kund:in und dem jeweiligen Coach zustande. GET A COACH ist nicht Vertragspartei der Trainingsleistung und übernimmt keine Haftung für die Durchführung oder Qualität des Trainings.
                </li>
                <li>
                  <strong>Kostenfreiheit für Kund:innen:</strong> Die Nutzung der Plattform (Suche, Profilansicht, Buchung) ist für Kund:innen kostenfrei. Es gelten die beim jeweiligen Coach ausgewiesenen Stundensätze.
                </li>
              </ol>
            </div>

            {/* Section 2 */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-[#50A5B1]/15">
              <h3 className="font-bold text-base text-[#1A265A] flex items-center gap-2">
                <span className="bg-[#1A265A] text-white w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0">2</span>
                Buchungen, Zahlung & Stornierung
              </h3>
              <ol className="list-decimal pl-5 space-y-3 text-[#1A265A]/90">
                <li>
                  <strong>Zahlungsabwicklung:</strong> Der Rechnungsbetrag für eine gebuchte Lektion wird direkt bei der Buchung über die integrierten Zahlungsanbieter (z. B. Kreditkarte, TWINT) eingezogen.
                </li>
                <li>
                  <strong>Stornierungsbedingungen:</strong>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1 text-xs">
                    <li>
                      <strong>Bis 24 Stunden vor Trainingsbeginn:</strong> Kostenlose Stornierung möglich. Der Betrag wird dem:der Kund:in vollumfänglich zurückerstattet.
                    </li>
                    <li>
                      <strong>Unter 24 Stunden vor Trainingsbeginn:</strong> Bei späten Stornierungen oder Nichterscheinen (No-Show) verfällt der Anspruch auf Rückerstattung, und der Betrag wird dem Coach (abzüglich der Plattformgebühr) gutgeschrieben.
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Absage durch den Coach:</strong> Fällt eine Lektion seitens des Coaches aus, erhält der:die Kund:in den vollen Betrag zurückerstattet.
                </li>
              </ol>
            </div>

            {/* Section 3 */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-[#50A5B1]/15">
              <h3 className="font-bold text-base text-[#1A265A] flex items-center gap-2">
                <span className="bg-[#1A265A] text-white w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0">3</span>
                Haftung & Haftungsausschluss
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-[#1A265A]/90">
                <li>
                  <strong>Sportausübung:</strong> Die Teilnahme an Trainingseinheiten erfolgt auf eigenes Risiko des:der Kund:in. Der:die Kund:in ist selbst dafür verantwortlich, seine/ihre sportliche Belastbarkeit einzuschätzen.
                </li>
                <li>
                  <strong>Plattformhaftung:</strong> GET A COACH haftet nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem Verhalten von GET A COACH beruhen. Für Körper- oder Sachschäden während des Trainings haftet ausschliesslich der jeweilige Coach im Rahmen seiner Sorgfaltspflicht.
                </li>
              </ol>
            </div>
          </section>

          {/* TEIL B */}
          <section className="space-y-6 pt-4">
            <div className="border-b-2 border-[#50A5B1] pb-2">
              <span className="text-[#50A5B1] font-extrabold text-xs uppercase tracking-wider block">Teil B</span>
              <h2 className="text-xl sm:text-2xl font-oswald font-medium text-[#1A265A] uppercase tracking-wide">
                Bestimmungen für Coaches
              </h2>
            </div>

            {/* Section 4 */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-[#50A5B1]/15">
              <h3 className="font-bold text-base text-[#1A265A] flex items-center gap-2">
                <span className="bg-[#50A5B1] text-white w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0">4</span>
                Status der Coaches
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-[#1A265A]/90">
                <li>
                  <strong>Selbstständigkeit:</strong> Coaches agieren auf GET A COACH als unabhängige, freiberufliche Dienstleister oder Gewerbetreibende. Sie sind für die Versteuerung ihrer Einnahmen und die Einhaltung allfälliger sozialversicherungsrechtlicher Pflichten selbst verantwortlich. Der Coach stellt GET A COACH vollumfänglich von jeglichen Ansprüchen Dritter – insbesondere von Nachforderungen der Sozialversicherungsanstalten (SVA) oder Steuerbehörden – frei, die aus einer Nichtdeklaration oder fehlerhaften Abrechnung der Einnahmen des Coaches resultieren.
                </li>
                <li>
                  <strong>Qualifikationen:</strong> Der Coach versichert, dass alle im Profil gemachten Angaben zu Diplomen, Zertifikaten, Erfolgen und Qualifikationen der Wahrheit entsprechen.
                </li>
              </ol>
            </div>

            {/* Section 5 */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-[#50A5B1]/15">
              <h3 className="font-bold text-base text-[#1A265A] flex items-center gap-2">
                <span className="bg-[#50A5B1] text-white w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0">5</span>
                Gebühren & Provision
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-[#1A265A]/90">
                <li>
                  <strong>Keine Fixkosten:</strong> Für Coaches fallen keine monatlichen Abo- oder Registrierungsgebühren an (0 CHF/Monat).
                </li>
                <li>
                  <strong>Vermittlungsprovision (15 % All-in):</strong> Für jede erfolgreich über die Plattform gebuchte und durchgeführte Lektion erhebt GET A COACH eine Vermittlungsprovision von 15 % des Brutto-Buchungsbetrags. In den 15 % sind sämtliche Transaktions- und Zahlungsdienstleister-Gebühren (z. B. Stripe, TWINT) vollumfänglich enthalten.
                </li>
                <li>
                  <strong>Auszahlung:</strong> Die Auszahlung der Einnahmen an den Coach erfolgt netto (85 % des Buchungsbetrags) auf das vom Coach hinterlegte Bankkonto.
                </li>
              </ol>
            </div>

            {/* Section 6 */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-[#50A5B1]/15">
              <h3 className="font-bold text-base text-[#1A265A] flex items-center gap-2">
                <span className="bg-[#50A5B1] text-white w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0">6</span>
                Plattform-Treue, Kontaktschutz & Umgehungsverbot (Fairplay-Richtlinie)
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-[#1A265A]/90">
                <li>
                  <strong>Ausschliessliche Abwicklung über die Plattform:</strong> Sämtliche Erstkontakte, Kommunikation, Terminvereinbarungen und Zahlungen zwischen Kund:innen und Coaches, die über GET A COACH vermittelt wurden, müssen zwingend und ausnahmslos über das interne Nachrichtensystem und das Anfragesystem von GET A COACH abgewickelt werden.
                </li>
                <li>
                  <strong>Kontaktschutz & Filterung:</strong> Die Übermittlung von direkten Kontaktdaten (wie z. B. persönliche E-Mail-Adressen, Telefonnummern, Messenger-Handles) im Chat wird automatisiert gefiltert und überwacht. Es ist untersagt, die Kontaktfilterung durch Verschlüsselungen oder Schreibweisen-Tricks zu umgehen.
                </li>
                <li>
                  <strong>Direktbuchungs- & Umgehungsverbot:</strong> Es ist sowohl dem Coach als auch dem:der Kund:in strikt untersagt, Trainings oder Folgebuchungen am System von GET A COACH vorbeizubuchen oder in bar vor Ort abzurechnen, um die Plattformprovision zu umgehen.
                </li>
                <li>
                  <strong>Konsequenzen bei Verstoss:</strong> Bei versuchter oder erfolgreicher Umgehung behält sich GET A COACH das Recht vor, das betroffene Profil unverzüglich zu sperren, ausstehende Auszahlungen einzubehalten und Schadensersatz in Höhe der entgangenen Vermittlungsprovisionen geltend zu machen.
                </li>
              </ol>
            </div>
          </section>

          {/* TEIL C */}
          <section className="space-y-6 pt-4">
            <div className="border-b-2 border-[#1A265A] pb-2">
              <span className="text-[#1A265A] font-extrabold text-xs uppercase tracking-wider block">Teil C</span>
              <h2 className="text-xl sm:text-2xl font-oswald font-medium text-[#1A265A] uppercase tracking-wide">
                Schlussbestimmungen
              </h2>
            </div>

            {/* Section 7 */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-[#50A5B1]/15">
              <h3 className="font-bold text-base text-[#1A265A] flex items-center gap-2">
                <span className="bg-[#1A265A] text-white w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0">7</span>
                Datenschutz & Anwendbares Recht
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-[#1A265A]/90">
                <li>
                  <strong>Datenschutz:</strong> Es gilt die Datenschutzerklärung von GET A COACH. Kund:innendaten werden nur insoweit an den Coach übermittelt, wie dies zur Durchführung des Trainings erforderlich ist.
                </li>
                <li>
                  <strong>Anwendbares Recht & Gerichtsstand:</strong> Es gilt Schweizer Recht. Gerichtsstand ist Winterthur.
                </li>
              </ol>
            </div>
          </section>

        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-[#1A265A]/70 space-y-2 pt-4">
          <p>© 2026 GET A COACH Schweiz AG · Winterthur, Schweiz</p>
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
