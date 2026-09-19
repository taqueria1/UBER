import React, { useState } from 'react';
import { AlertCircle, X, Check, ShieldAlert } from 'lucide-react';
import { ActiveTripData } from '../types';

interface CancelTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (reason: string) => void;
  activeTrip: ActiveTripData | null;
}

const CANCEL_REASONS = [
  'Cambio de planes / Ya no necesito el viaje',
  'El conductor tarda mucho en llegar o está detenido',
  'Me equivoqué de dirección o categoría de vehículo',
  'Pedí el viaje por error',
  'Encontré otro medio de transporte en Navojoa',
  'Otro motivo personal',
];

export const CancelTripModal: React.FC<CancelTripModalProps> = ({
  isOpen,
  onClose,
  onConfirmCancel,
  activeTrip,
}) => {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);

  if (!isOpen) return null;

  const isFindingDriver = activeTrip?.state === 'finding_driver';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">¿Deseas cancelar tu viaje?</h3>
              <p className="text-xs text-slate-400">
                {isFindingDriver 
                  ? 'Búsqueda de conductor en curso' 
                  : `Conductor: ${activeTrip?.driver.name || 'Asignado'}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* No penalty notice */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Cancelación Gratuita:</strong> Sin tarifa de penalización. Tu método de pago no recibirá ningún cargo.
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Por favor, dinos el motivo de la cancelación:
            </label>
            <div className="space-y-2">
              {CANCEL_REASONS.map((reason, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedReason(reason)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    selectedReason === reason
                      ? 'bg-red-500/10 border-red-500/50 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{reason}</span>
                  {selectedReason === reason && (
                    <div className="w-4 h-4 rounded-full bg-red-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-colors"
          >
            No cancelar, continuar viaje
          </button>
          <button
            type="button"
            id="btn-confirm-cancel-trip"
            onClick={() => onConfirmCancel(selectedReason)}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-950/40 active:scale-95"
          >
            Sí, cancelar viaje
          </button>
        </div>
      </div>
    </div>
  );
};
