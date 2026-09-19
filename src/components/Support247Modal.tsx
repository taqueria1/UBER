import React, { useState } from 'react';
import { 
  X, 
  Headphones, 
  AlertTriangle, 
  Search, 
  Send, 
  ShieldAlert, 
  Clock, 
  HelpCircle, 
  MessageSquare,
  FileQuestion,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { SupportMessage } from '../types';

interface Support247ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_ISSUES = [
  'Olvidé un objeto dentro del vehículo',
  'Tengo dudas sobre el cobro de mi tarifa',
  'Reportar conducta inadecuada o desvío',
  '¿Cómo funciona el viaje compartido CoRide?',
];

export const Support247Modal: React.FC<Support247ModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: 'sup_1',
      sender: 'agent',
      text: '¡Hola! Soy Valeria del equipo de Soporte y Seguridad OmniRide 24/7. ¿En qué puedo asistirte en este momento?',
      time: 'Ahora',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [sosActivated, setSosActivated] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: SupportMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      time: 'Ahora',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Generate intelligent AI support reply
    setTimeout(() => {
      let replyText = 'Estamos revisando tu caso de inmediato en la central de OmniRide Navojoa. Un agente supervisor se ha enlazado a esta conversación para brindarte asistencia personalizada.';
      
      const lower = text.toLowerCase();
      if (lower.includes('objeto') || lower.includes('olvid')) {
        replyText = 'Para objetos olvidados, ya notificamos al conductor más reciente en Navojoa (Carlos M., placas VKY-489-A Sonora) mediante línea prioritaria para verificar los asientos traseros y cajuela.';
      } else if (lower.includes('cobro') || lower.includes('tarifa') || lower.includes('dinero')) {
        replyText = 'Realizamos una auditoría telemática en tiempo real de tu ruta por Navojoa. Si existió algún desvío innecesario, la diferencia se acredita automáticamente a tu saldo de OmniRide en menos de 5 minutos.';
      } else if (lower.includes('coride') || lower.includes('compartido')) {
        replyText = 'CoRide empareja hasta 3 pasajeros que comparten el mismo corredor vial en Navojoa (Blvd. Centenario, Cuauhtémoc, ITSON o UNISON). El algoritmo calcula paradas óptimas en un radio máximo de 400m, ahorrando hasta 45% del costo habitual.';
      }

      const agentReply: SupportMessage = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        text: replyText,
        time: 'Ahora',
      };
      setMessages((prev) => [...prev, agentReply]);
    }, 800);
  };

  const handleTriggerSOS = () => {
    setSosActivated(true);
    setTimeout(() => {
      alert('ALERTA SOS ENVIADA: Central de emergencias 911 (C5i Sonora - Navojoa) y tus contactos de confianza han recibido tu ubicación GPS satelital en tiempo real con prioridad máxima.');
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Centro de Soporte y Seguridad 24/7</h2>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Agentes en vivo
                </span>
              </div>
              <p className="text-xs text-slate-400">Atención técnica, vial y auditoría de rutas garantizada</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SOS Panic Bar */}
        <div className="px-5 py-3 bg-red-950/30 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-red-300 block">¿Te encuentras en una situación de emergencia real?</span>
              <span className="text-[11px] text-red-400/80">Enlace satelital directo con servicios de auxilio y seguridad vial</span>
            </div>
          </div>

          <button
            id="btn-sos-emergency"
            onClick={handleTriggerSOS}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 ${
              sosActivated
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-red-500 hover:bg-red-400 text-slate-950'
            }`}
          >
            {sosActivated ? 'SOS ACTIVADO (GPS ENVIADO)' : 'BOTÓN SOS 24/7'}
          </button>
        </div>

        {/* Support Chat Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-950/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
              </div>
            );
          })}
        </div>

        {/* Quick Issues Carousel */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar">
          {COMMON_ISSUES.map((issue, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(issue)}
              className="text-[11px] px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 shrink-0 transition-colors"
            >
              {issue}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Describe tu consulta a nuestro equipo técnico 24/7..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-bold transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
