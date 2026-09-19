import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Phone, 
  ShieldCheck, 
  Mic, 
  Play, 
  Sparkles,
  CheckCheck
} from 'lucide-react';
import { ChatMessage, DriverInfo } from '../types';
import { soundManager } from '../services/sound';

interface TripChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: DriverInfo;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

const QUICK_PHRASES = [
  'Ya estoy afuera esperándote',
  'Estoy en la entrada de Plaza 5 de Mayo',
  'Voy saliendo del campus ITSON Navojoa',
  'Ya te veo por Blvd. Cuauhtémoc',
  'Tengo una maleta para cajuela',
  'Estoy frente a la entrada principal',
];

export const TripChatModal: React.FC<TripChatModalProps> = ({
  isOpen,
  onClose,
  driver,
  messages,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    soundManager.playChat();
  };

  const handleSendQuick = (phrase: string) => {
    onSendMessage(phrase);
    soundManager.playChat();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chat Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={driver.photo}
                alt={driver.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500"
                referrerPolicy="no-referrer"
              />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 absolute bottom-0 right-0"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">{driver.name}</h3>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-semibold">
                  En línea
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {driver.vehicleModel} • {driver.plate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="chat-call-btn"
              onClick={() => alert(`Llamada enmascarada conectando con ${driver.name}. Tu número de teléfono personal se mantiene 100% privado y protegido.`)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
              title="Llamada segura"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              id="chat-close-btn"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="px-4 py-2 bg-emerald-950/20 border-b border-emerald-500/20 flex items-center gap-2 text-[11px] text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Chat privado encriptado de extremo a extremo para tu seguridad.</span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40">
          {messages.map((msg) => {
            const isMe = msg.sender === 'passenger';
            const isSys = msg.sender === 'system';

            if (isSys) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700 shadow-md'
                  }`}
                >
                  {msg.isVoiceNote ? (
                    <div className="flex items-center gap-2 py-1">
                      <button className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </button>
                      <div className="h-1 w-20 bg-white/30 rounded-full overflow-hidden">
                        <div className="w-1/2 h-full bg-white rounded-full"></div>
                      </div>
                      <span className="text-[10px] opacity-80">{msg.audioDuration || '0:14'}</span>
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                  <span>{msg.time}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Phrase Pills */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar">
          {QUICK_PHRASES.map((phrase, i) => (
            <button
              key={i}
              onClick={() => handleSendQuick(phrase)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0 transition-colors"
            >
              {phrase}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onSendMessage('🎙️ Nota de voz de cortesía (12 seg)');
              soundManager.playChat();
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors"
            title="Enviar nota de voz"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            id="chat-input"
            type="text"
            placeholder={`Escribe un mensaje a ${driver.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:outline-none"
          />

          <button
            id="chat-send-btn"
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-bold transition-all shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
