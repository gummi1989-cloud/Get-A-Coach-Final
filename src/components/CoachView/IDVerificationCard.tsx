import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Upload, CheckCircle2, FileText, AlertCircle, Lock } from 'lucide-react';

export const IDVerificationCard: React.FC = () => {
  const { currentUser, uploadCoachVerification } = useApp();
  const [selectedFileName, setSelectedFileName] = useState('');

  const handleSimulateUpload = () => {
    const fileName = selectedFileName || 'pass_id_svenja_meier_swisspadel.pdf';
    uploadCoachVerification(fileName);
    alert('Ausweisdokument erfolgreich eingereicht und verifiziert! Das grüne Haken-Symbol ist jetzt aktiv.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#F1600D] via-[#f3772b] to-[#d85208] text-white rounded-3xl p-6 sm:p-8 border border-orange-400/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-oswald font-medium uppercase tracking-wide text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white bg-white/10 p-2 rounded-2xl shrink-0" />
            <span>Mandatspflichtiger Ausweis-Check</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
            Zur Qualitätssicherung aller Coaches auf GET A COACH ist die Prüfung eines amtlichen Identitätsnachweises (ID, Pass oder Trainerdiplom) obligatorisch.
          </p>
        </div>

        <div className="shrink-0">
          {currentUser.isVerified ? (
            <span className="bg-white/20 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-white/30 flex items-center gap-1.5 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-amber-200" />
              Verifiziert
            </span>
          ) : (
            <span className="bg-white/20 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-white/30 flex items-center gap-1.5 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 text-amber-200" />
              Prüfung Ausstehend
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#50A5B1]/20 shadow-xs space-y-6">

      {currentUser.isVerified ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2 text-emerald-950">
          <h3 className="font-extrabold text-sm text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Dein Coach-Konto ist vollständig verifiziert!
          </h3>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Eingereichtes Dokument: <strong>{currentUser.verificationDocName || 'ausweis_svenja_meier_swisspadel.pdf'}</strong>.
            Das grüne Zertifizierungs-Häkchen wird auf deinem Coach-Profil, auf der interaktiven Karte und in den Suchresultaten angezeigt.
          </p>
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-[#50A5B1]/40 rounded-2xl p-8 text-center space-y-4">
          <Upload className="w-10 h-10 text-[#50A5B1] mx-auto" />
          <div>
            <h4 className="font-extrabold text-sm text-[#1A265A]">Dokument hochladen (Pass, ID oder Trainerlizenz)</h4>
            <p className="text-xs text-[#1A265A]/70 mt-1">
              Erlaubte Formate: PDF, JPG, PNG (Max. 10 MB). Deine Daten werden verschlüsselt gespeichert.
            </p>
          </div>

          <div className="max-w-xs mx-auto space-y-2">
            <input
              type="text"
              placeholder="Dokumentenname (z.B. pass_svenja.pdf)"
              value={selectedFileName}
              onChange={e => setSelectedFileName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#50A5B1]/30 bg-white text-xs font-semibold text-[#1A265A] focus:outline-none focus:border-[#F1600D]"
            />
            <button
              onClick={handleSimulateUpload}
              className="w-full bg-[#F1600D] hover:bg-[#d85208] text-white font-extrabold text-xs py-3 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Ausweis-Check Einreichen
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
