import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Send, 
  Users, 
  ExternalLink,
  MessageCircle,
  Smartphone
} from 'lucide-react';
import { ActiveTripData, EmergencyContact } from '../types';
import { INITIAL_EMERGENCY_CONTACTS } from '../data/mockData';

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTrip: ActiveTripData | null;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({
  isOpen,
  onClose,
  activeTrip,
}) => {
  const [copied, setCopied] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>(INITIAL_EMERGENCY_CONTACTS);
  const [notifySuccess, setNotifySuccess] = useState(false);

  if (!isOpen) return null;

  const trackingUrl = activeTrip 
    ? `https://omniride.app/track/live-${activeTrip.id.toLowerCase()}`
    : 'https://omniride.app/track/live-omni-9842';

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleContact = (id: string) => {
    setContacts(contacts.map(c => c.id === id ? { ...c, notifyOnTrip: !c.notifyOnTrip } : c));
  };

  const handleSendToContacts = () => {
    setNotifySuccess(true);
    setTimeout(() => setNotifySuccess(false), 3000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hola, estoy viajando en OmniRide Navojoa con ${activeTrip?.driver.name || 'mi conductor'} (${activeTrip?.driver.vehicleModel || 'Vehículo Verificado'}, placas ${activeTrip?.driver.plate || 'Sonora'}). Sigue mi trayecto en tiempo real por Navojoa aquí: ${trackingUrl}`
    );
    try {
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
    } catch {
      navigator.clipboard.writeText(`https://api.whatsapp.com/send?text=${text}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Compartir Ubicación en Vivo</h3>
              <p className="text-xs text-slate-400">Monitoreo GPS 24/7 con tus contactos de confianza</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Tracking Link Card */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Enlace de Seguimiento en Vivo
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <input
                type="text"
                readOnly
                value={trackingUrl}
                className="bg-transparent text-xs text-slate-200 flex-1 font-mono focus:outline-none truncate"
              />
              <button
                id="btn-copy-tracking-link"
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  copied
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Quick External Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Enviar por WhatsApp</span>
            </button>

            <button
              onClick={() => {
                alert('Mensaje SMS de emergencia generado con enlace satelital.');
              }}
              className="py-2.5 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Enviar por SMS</span>
            </button>
          </div>

          {/* Selected Emergency Contacts List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Contactos Seleccionados
              </span>
              <span className="text-[11px] text-slate-400">
                {contacts.filter(c => c.notifyOnTrip).length} de {contacts.length} activos
              </span>
            </div>

            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleToggleContact(contact.id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{contact.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {contact.relation}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{contact.phone}</p>
                  </div>

                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    contact.notifyOnTrip
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : 'border-slate-700 bg-slate-800'
                  }`}>
                    {contact.notifyOnTrip && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>

            {notifySuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>¡Ubicación satelital compartida con los contactos seleccionados!</span>
              </div>
            )}

            <button
              onClick={handleSendToContacts}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Notificar a Contactos Marcados Ahora</span>
            </button>
          </div>

          {/* Guarantee Pill */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Tus contactos podrán visualizar la marca del auto, placas, nombre del conductor, velocidad satelital y hora estimada de llegada sin necesidad de tener cuenta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
