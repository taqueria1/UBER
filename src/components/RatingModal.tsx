import React, { useState } from 'react';
import { 
  Star, 
  ThumbsUp, 
  Heart, 
  FileDown, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { ActiveTripData } from '../types';
import { generateTripReceiptPDF } from '../services/pdfReceipt';
import confetti from 'canvas-confetti';

interface RatingModalProps {
  isOpen: boolean;
  activeTrip: ActiveTripData;
  onSubmitRating: (rating: number, review: string, tip: number) => void;
}

const COMPLIMENT_TAGS = [
  'Manejo suave y seguro',
  'Vehículo impecable',
  'Ruta óptima sin tráfico',
  'Conductor muy amable',
  'Excelente música',
  'Conversación agradable',
];

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  activeTrip,
  onSubmitRating,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Manejo suave y seguro', 'Vehículo impecable']);
  const [comment, setComment] = useState('');
  const [tip, setTip] = useState(2.0);

  if (!isOpen) return null;

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleDownloadPDF = () => {
    generateTripReceiptPDF(activeTrip);
  };

  const handleSubmit = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
    onSubmitRating(rating, comment, tip);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-emerald-950 via-slate-950 to-teal-950 border-b border-slate-800 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-2 shadow-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white">¡Has llegado a tu destino!</h2>
          <p className="text-xs text-slate-400 mt-1">
            Trayecto completado con éxito • Cobro realizado: <span className="text-white font-mono font-bold">${activeTrip.fare.toFixed(2)} USD</span>
          </p>

          {/* PDF Quick Download Button */}
          <button
            id="btn-download-trip-pdf"
            onClick={handleDownloadPDF}
            className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-md active:scale-95"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Descargar Recibo Oficial en PDF</span>
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Driver & Bidirectional Passenger Rating Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={activeTrip.driver.photo}
                alt={activeTrip.driver.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/80"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-bold text-white text-sm">
                  ¿Cómo estuvo tu experiencia con {activeTrip.driver.name}?
                </h4>
                <p className="text-xs text-slate-400">
                  {activeTrip.driver.vehicleModel} • {activeTrip.driver.plate}
                </p>
              </div>
            </div>

            {/* Interactive Stars */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    id={`rate-star-${star}`}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-slate-600 hover:text-slate-400'
                      } transition-colors`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Bidirectional Driver review of Passenger */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Calificación mutua del conductor:
                </span>
                <span className="font-bold text-amber-400">5.0 ★</span>
              </div>
              <p className="text-slate-300 italic">
                "{activeTrip.driver.name} te calificó con 5 estrellas: Pasajero muy respetuoso, puntual y cuidadoso con el vehículo."
              </p>
            </div>
          </div>

          {/* Compliment Badges */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Elogios destacados
            </label>
            <div className="flex flex-wrap gap-2">
              {COMPLIMENT_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Driver Tip Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Propina voluntaria para el conductor
              </label>
              <span className="text-xs text-emerald-400 font-bold font-mono">
                {tip > 0 ? `+$${tip.toFixed(2)} MXN` : 'Sin propina'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 10, 20, 50].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setTip(amount)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    tip === amount
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {amount === 0 ? 'Sin propina' : `$${amount.toFixed(2)} MXN`}
                </button>
              ))}
            </div>
          </div>

          {/* Review comment */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Comentario adicional (Opcional)
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Algún detalle que quieras destacar sobre la ruta o el servicio?"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-3 focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <button
            id="btn-submit-rating"
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            Enviar Calificación y Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};
