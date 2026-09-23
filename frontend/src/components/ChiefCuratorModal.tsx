import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Loader2,
  BookOpen,
  Compass,
  ExternalLink,
  Volume2,
  VolumeX
} from 'lucide-react';
import { askChiefCurator, CuratorGroundingSpecimen } from '../services/api.js';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  groundedSpecimens?: CuratorGroundingSpecimen[];
  timestamp: string;
}

const PRESET_QUESTIONS = [
  'Why do paleontologists think Spinosaurus was semi-aquatic?',
  'Which apex theropods coexisted with Triceratops in Hell Creek?',
  'How did giant azhdarchid pterosaurs achieve flight?',
  'What caused the end-Triassic extinction event?'
];

interface ChiefCuratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function ChiefCuratorModal({ isOpen, onClose, initialQuery }: ChiefCuratorModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Greetings! I am **Rajy**, your Prehistorica docent. I provide evidence-based cladistic, anatomical, and taphonomic insights grounded directly in our 596 cataloged specimens. How may I assist your deep-time research today?',
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const speakText = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    // Strip markdown formatting for speech
    const clean = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || input).trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await askChiefCurator(text, history);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.answer,
        groundedSpecimens: res.groundedSpecimens,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);
      speakText(res.answer);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Curatorial Notice**: ${err.message || 'The docent archives are temporarily busy. Please ask again in a moment.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedContent = (content: string) => {
    // Process markdown links [Title](/species/id) into interactive tags
    const parts = content.split(/(\[[^\]]+\]\(\/species\/\d+\))/g);

    return parts.map((part, i) => {
      const match = part.match(/\[([^\]]+)\](\/species\/\d+)/);
      if (match) {
        return (
          <Link
            key={i}
            to={match[2]}
            onClick={onClose}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-mono font-bold transition-all"
          >
            <span>{match[1]}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </Link>
        );
      }

      // Handle bold text **text**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {boldParts.map((bPart, bi) => {
            if (bPart.startsWith('**') && bPart.endsWith('**')) {
              return (
                <strong key={bi} className="font-semibold text-slate-100">
                  {bPart.slice(2, -2)}
                </strong>
              );
            }
            return bPart;
          })}
        </span>
      );
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-4xl h-[88vh] max-h-[780px] flex flex-col bg-slate-900 border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100"
          >
            {/* Top bar — close + TTS controls only */}
            <div className="px-4 py-2.5 border-b border-white/[0.08] bg-slate-950/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
                  Prehistorica · AI Docent
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`p-2 rounded-lg border transition-all text-xs font-mono flex items-center gap-1.5 ${
                    ttsEnabled
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-800/60 border-white/[0.08] text-slate-400 hover:text-slate-200'
                  }`}
                  title={ttsEnabled ? 'Mute vocal narration' : 'Enable vocal narration'}
                >
                  {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="hidden sm:inline">{ttsEnabled ? 'Voice On' : 'Voice Off'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-white/[0.08] text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main body: character panel (left) + chat (right) */}
            <div className="flex flex-1 overflow-hidden">

              {/* ── Rajy Character Panel (left sidebar) ── */}
              <div className="hidden sm:flex flex-col items-center justify-end w-[180px] lg:w-[210px] shrink-0 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900/80 border-r border-white/[0.06] relative overflow-hidden">
                {/* Subtle radial glow behind Rajy */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                {/* Rajy full-body image */}
                <img
                  src="/rajy-full.png"
                  alt="Rajy the Curator"
                  className="relative w-full object-contain object-bottom select-none"
                  style={{ maxHeight: '78%' }}
                  draggable={false}
                />

                {/* Name plate at the bottom */}
                <div className="w-full px-3 py-3 flex flex-col items-center gap-0.5 bg-slate-950/60 border-t border-white/[0.06] shrink-0">
                  <span className="text-sm font-black font-mono text-amber-400 tracking-widest uppercase">
                    Rajy
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 italic text-center leading-tight">
                    Rajasaurus narmadensis
                  </span>
                  <span className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/25 uppercase tracking-wider">
                    RAG Docent
                  </span>
                </div>
              </div>

              {/* ── Chat Area (right) ── */}
              <div className="flex flex-col flex-1 overflow-hidden">

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-gradient-to-b from-slate-950/40 via-slate-900/60 to-slate-950/80">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      {/* Sender label */}
                      <div className="flex items-center gap-2 mb-1 px-1 text-[11px] font-mono text-slate-400">
                        {msg.role === 'assistant' && (
                          <img
                            src="/rajy-head.jpg"
                            alt="Rajy"
                            className="w-5 h-5 rounded-full object-cover object-top sm:hidden"
                          />
                        )}
                        <span>{msg.role === 'user' ? 'Visitor' : 'Rajy'}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {/* Bubble — speech-bubble style for assistant */}
                      <div className="relative">
                        {msg.role === 'assistant' && (
                          /* Speech bubble pointer pointing left (from Rajy's mouth direction) */
                          <div className="absolute -left-2 top-4 w-0 h-0
                            border-t-[6px] border-t-transparent
                            border-r-[8px] border-r-slate-800/90
                            border-b-[6px] border-b-transparent" />
                        )}
                        <div
                          className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                            msg.role === 'user'
                              ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-sm selection:bg-slate-900 selection:text-white'
                              : 'bg-slate-800/90 border border-white/[0.1] text-slate-200 rounded-tl-sm whitespace-pre-wrap'
                          }`}
                        >
                          {msg.role === 'user' ? msg.content : renderFormattedContent(msg.content)}
                        </div>
                      </div>

                      {/* Grounded Specimen Dossiers */}
                      {msg.groundedSpecimens && msg.groundedSpecimens.length > 0 && (
                        <div className="mt-3 max-w-[90%] sm:max-w-[85%] bg-slate-950/80 border border-white/[0.08] rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                            <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider">
                              <BookOpen className="w-3.5 h-3.5" />
                              Museum Grounding Specimens ({msg.groundedSpecimens.length})
                            </span>
                            <span>Vector Cosine Match</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                            {msg.groundedSpecimens.map((spec) => (
                              <Link
                                key={spec.id}
                                to={`/species/${spec.id}`}
                                onClick={onClose}
                                className="group flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-white/[0.06] hover:border-amber-500/40 transition-all text-left"
                              >
                                <div className="w-11 h-11 rounded-md bg-slate-950 border border-white/[0.08] overflow-hidden shrink-0 flex items-center justify-center">
                                  {spec.imageUrl ? (
                                    <img
                                      src={spec.imageUrl}
                                      alt={spec.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  ) : spec.silhouetteUrl ? (
                                    <img
                                      src={spec.silhouetteUrl}
                                      alt={spec.name}
                                      className="w-8 h-8 object-contain filter invert opacity-70"
                                    />
                                  ) : (
                                    <Compass className="w-5 h-5 text-slate-600" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 truncate font-mono">
                                      {spec.name}
                                    </span>
                                    <span className="text-[10px] font-mono text-amber-400/90 font-semibold shrink-0">
                                      {spec.similarity}%
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 truncate italic">
                                    {spec.scientificName}
                                  </p>
                                  <div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-400 font-mono">
                                    <span className="px-1 rounded bg-slate-800 text-slate-300">
                                      {spec.clade}
                                    </span>
                                    <span className="truncate">{spec.timePeriod}</span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="bg-slate-800/80 border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3 text-xs font-mono text-slate-400 flex items-center gap-2">
                        <span>Consulting phylogenetic records and bone density data...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Chips */}
                <div className="px-4 py-2.5 border-t border-white/[0.06] bg-slate-950/60 overflow-x-auto flex items-center gap-2 shrink-0 scrollbar-none">
                  <span className="text-[11px] font-mono text-slate-400 shrink-0 uppercase tracking-wider">
                    Inquiries:
                  </span>
                  {PRESET_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      disabled={loading}
                      className="px-2.5 py-1 rounded-full bg-slate-850 hover:bg-slate-800 border border-white/[0.08] hover:border-amber-500/30 text-slate-300 hover:text-amber-200 text-xs font-mono shrink-0 transition-all text-left truncate max-w-xs cursor-pointer disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <div className="p-4 border-t border-white/[0.08] bg-slate-950 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about taxonomy, biomechanics, Hell Creek fauna, bite force..."
                        disabled={loading}
                        className="w-full px-4 py-3 bg-slate-900 border border-white/[0.1] focus:border-amber-500/60 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-all font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10 shrink-0"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Consult</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

              </div>
              {/* end chat area */}
            </div>
            {/* end main body */}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
