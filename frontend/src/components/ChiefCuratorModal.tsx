import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X,
  Send,
  Loader2,
  BookOpen,
  Compass,
  ExternalLink,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Dna
} from 'lucide-react';
import { askChiefCurator, CuratorGroundingSpecimen } from '../services/api.js';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  groundedSpecimens?: CuratorGroundingSpecimen[];
  timestamp: string;
}

const INITIAL_EXPLORE_QUESTIONS = [
  {
    title: 'Spinosaurus Ecology',
    prompt: 'How did Spinosaurus adapt to aquatic environments?'
  },
  {
    title: 'Hell Creek Ecosystem',
    prompt: 'Which predators lived alongside Triceratops in Hell Creek?'
  },
  {
    title: 'Paleo-Biomechanics',
    prompt: 'How do paleontologists estimate dinosaur mass?'
  },
  {
    title: 'Marine Reptile Radiation',
    prompt: 'What made prehistoric marine reptiles so diverse?'
  }
];

const COMPACT_PRESET_QUESTIONS = [
  'How did Spinosaurus adapt to aquatic life?',
  'Apex predators in Hell Creek?',
  'How is dinosaur mass estimated?',
  'Marine reptile evolutionary diversity?',
  'Flight mechanics in Azhdarchid pterosaurs?'
];

interface ChiefCuratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function ChiefCuratorModal({ isOpen, onClose, initialQuery }: ChiefCuratorModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Greetings, explorer! I am **Rajy**, your Prehistorica AI Docent.\n\nAsk me about prehistoric creatures, ancient ecosystems, evolution, biomechanics, or the deep-time history of Earth. Every insight is scientifically grounded directly in our **596 cataloged specimens**.',
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
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [messages, loading, shouldReduceMotion]);

  const speakText = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(\[[^\]]+\]\(\/species\/\d+\))/g);

    return parts.map((part, i) => {
      const match = part.match(/\[([^\]]+)\](\/species\/\d+)/);
      if (match) {
        return (
          <Link
            key={i}
            to={match[2]}
            onClick={onClose}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/35 text-xs font-mono font-bold transition-all shadow-sm"
          >
            <span>{match[1]}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-80" />
          </Link>
        );
      }

      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {boldParts.map((bPart, bi) => {
            if (bPart.startsWith('**') && bPart.endsWith('**')) {
              return (
                <strong key={bi} className="font-semibold text-amber-200/90">
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

  const isInitialState = messages.length <= 1;

  useEffect(() => {
    // Only auto-scroll on subsequent messages or loading states so the initial view remains clean at the top
    if (messages.length > 1 || loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  }, [messages.length, loading, shouldReduceMotion]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Prehistorica AI Docent Consultation"
        >
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent
            className="relative w-full max-w-4xl h-[94vh] sm:h-[90vh] max-h-[800px] flex flex-col bg-[#0A0F1D] border border-amber-500/25 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.75)] overflow-hidden font-sans text-slate-100"
          >
            {/* ── Fixed Museum Header ── */}
            <header className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-white/[0.08] bg-gradient-to-r from-[#070B16] via-[#0A0F1D] to-[#070B16] flex items-center justify-between shrink-0 z-20">
              <div className="flex items-center gap-3 min-w-0">
                {/* Small Rajy Avatar Icon with Online Status Indicator */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-amber-500/40 bg-slate-900 shadow-inner ring-2 ring-amber-500/15">
                    <img
                      src="/rajy-head.jpg"
                      alt="Rajy the AI Docent"
                      className="w-full h-full object-cover object-top select-none"
                    />
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 shadow-sm"
                    title="Rajy is active and ready"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs sm:text-sm font-black font-mono tracking-widest uppercase text-slate-100 truncate">
                      PREHISTORICA <span className="text-amber-400">&bull;</span> AI DOCENT
                    </h2>
                    <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                      596 Verified
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 truncate flex items-center gap-1.5">
                    <span>Curatorial Guide: Rajy</span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="italic text-slate-300">Rajasaurus narmadensis</span>
                  </p>
                </div>
              </div>

              {/* Header Controls: Voice Narration & Close */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    ttsEnabled
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900/80 border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                  title={ttsEnabled ? 'Mute vocal narration' : 'Enable vocal voice narration for Rajy'}
                  aria-label={ttsEnabled ? 'Voice Mode Active' : 'Voice Mode Inactive'}
                >
                  {ttsEnabled ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                      </span>
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] font-bold">Voice On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Voice Mode</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[36px] min-w-[36px] sm:min-h-[38px] sm:min-w-[38px] p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                  title="Close AI Docent"
                  aria-label="Close AI Docent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* ── Main Body: Split-Panel Layout ── */}
            <div className="flex flex-1 min-h-0 overflow-hidden relative">

              {/* ── LEFT PANEL: Rajy's Museum Exhibit Plinth ── */}
              <aside
                className="hidden sm:flex flex-col w-[170px] md:w-[190px] lg:w-[215px] shrink-0 bg-gradient-to-b from-[#090F1C] via-[#070C18] to-[#040812] border-r border-white/[0.06] relative overflow-hidden select-none"
                aria-label="Docent Mascot Showcase"
              >
                {/* Atmospheric Backlight: Warm Gold & Deep Cyan Halo */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />

                {/* Decorative Museum Corner Markers */}
                <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t border-l border-amber-500/30 pointer-events-none" />
                <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t border-r border-amber-500/30 pointer-events-none" />

                {/* Rajy Mascot Illustration — Centered comfortably in available height */}
                <div className="relative flex-1 min-h-0 w-full flex items-center justify-center px-3 py-2">
                  <img
                    src="/rajy-full.png"
                    alt="Rajy - Prehistorica AI Docent mascot"
                    className="w-full h-full max-h-[300px] object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,0.65)]"
                    draggable={false}
                  />
                </div>

                {/* Curatorial Museum Nameplate & Pedestal */}
                <div className="w-full px-3 py-3 bg-[#060913]/95 border-t border-amber-500/25 shrink-0 z-10 text-center space-y-1 shadow-inner">
                  <div className="flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span className="text-sm font-black font-mono text-amber-400 tracking-[0.2em] uppercase">
                      RAJY
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 italic tracking-wider leading-tight">
                    Rajasaurus narmadensis
                  </p>
                  <div className="pt-0.5 flex justify-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-widest shadow-sm">
                      <Dna className="w-2.5 h-2.5" />
                      AI DOCENT
                    </span>
                  </div>
                </div>
              </aside>

              {/* ── RIGHT PANEL: Conversation Interface ── */}
              <main className="flex flex-col flex-1 min-h-0 overflow-hidden bg-gradient-to-b from-[#080D1A] via-[#0A0F20] to-[#060A14] relative">

                {/* Independently Scrollable Message Area */}
                <div
                  data-lenis-prevent
                  tabIndex={0}
                  className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 md:p-6 space-y-4 focus:outline-none focus:ring-1 focus:ring-amber-500/20 overscroll-contain"
                >
                  {messages.map((msg) => (
                    <article
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      {/* Sender Meta Label */}
                      <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] font-mono text-slate-400">
                        {msg.role === 'assistant' ? (
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                            <img
                              src="/rajy-head.jpg"
                              alt="Rajy"
                              className="w-4 h-4 rounded-full object-cover object-top sm:hidden border border-amber-500/40"
                            />
                            <span>Rajy &bull; Docent</span>
                          </div>
                        ) : (
                          <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                            Visitor
                          </span>
                        )}
                        <span className="text-slate-600">&bull;</span>
                        <time className="text-[10px] text-slate-500">{msg.timestamp}</time>
                      </div>

                      {/* Message Bubble with Pointer */}
                      <div className="relative overflow-visible max-w-[92%] sm:max-w-[85%]">
                        {msg.role === 'assistant' && (
                          <div
                            className="hidden sm:block absolute -left-2.5 top-3.5 w-0 h-0
                              border-t-[7px] border-t-transparent
                              border-r-[11px] border-r-[#151E34]
                              border-b-[7px] border-b-transparent
                              z-10"
                            aria-hidden="true"
                          />
                        )}

                        <div
                          className={`rounded-2xl px-4 py-3 sm:px-4.5 sm:py-3.5 text-xs sm:text-sm leading-relaxed shadow-lg ${
                            msg.role === 'user'
                              ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs selection:bg-slate-900 selection:text-white'
                              : 'bg-[#151E34] border border-white/[0.08] text-slate-100 rounded-tl-xs whitespace-pre-wrap selection:bg-amber-500 selection:text-slate-950'
                          }`}
                        >
                          {msg.role === 'user' ? msg.content : renderFormattedContent(msg.content)}
                        </div>
                      </div>

                      {/* Museum Grounding Specimens Ribbon */}
                      {msg.groundedSpecimens && msg.groundedSpecimens.length > 0 && (
                        <section
                          aria-label="Museum Grounding Specimens"
                          className="mt-3.5 w-full max-w-[95%] sm:max-w-[88%] bg-[#080D19]/90 border border-amber-500/20 rounded-xl p-3.5 space-y-2.5 shadow-md"
                        >
                          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/[0.06] pb-2">
                            <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                              Grounded Museum Records ({msg.groundedSpecimens.length})
                            </span>
                            <span className="text-[10px] text-slate-500">Vector Cosine Match</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-0.5">
                            {msg.groundedSpecimens.map((spec) => (
                              <Link
                                key={spec.id}
                                to={`/species/${spec.id}`}
                                onClick={onClose}
                                className="group flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/80 hover:bg-slate-850 border border-white/[0.06] hover:border-amber-500/40 transition-all text-left"
                              >
                                <div className="w-10 h-10 rounded-md bg-slate-950 border border-white/[0.08] overflow-hidden shrink-0 flex items-center justify-center">
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
                                      className="w-7 h-7 object-contain filter invert opacity-70"
                                    />
                                  ) : (
                                    <Compass className="w-4 h-4 text-slate-600" />
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
                                  <p className="text-[10px] text-slate-400 truncate italic font-mono">
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
                        </section>
                      )}
                    </article>
                  ))}

                  {/* ── INITIAL STATE: "EXPLORE WITH RAJY" CARDS ── */}
                  {isInitialState && (
                    <div className="pt-2 pb-6 space-y-3">
                      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <h3 className="text-xs font-bold tracking-widest uppercase text-amber-400">
                          EXPLORE WITH RAJY
                        </h3>
                        <span className="text-[10px] text-slate-500 tracking-wider">
                          &bull; Curated Inquiries
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {INITIAL_EXPLORE_QUESTIONS.map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSend(q.prompt)}
                            disabled={loading}
                            className="group flex flex-col justify-between p-3 sm:p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-850/90 border border-white/[0.08] hover:border-amber-500/50 hover:shadow-[0_4px_16px_rgba(245,158,11,0.08)] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none text-left transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
                                <HelpCircle className="w-3 h-3 text-amber-400 shrink-0" />
                                {q.title}
                              </span>
                              <p className="text-xs font-medium text-slate-200 group-hover:text-amber-100 transition-colors leading-snug">
                                {q.prompt}
                              </p>
                            </div>
                            <div className="pt-2 flex items-center justify-end text-[10px] font-mono text-slate-500 group-hover:text-amber-400 font-semibold gap-1 transition-colors">
                              <span>Ask Rajy</span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Typing Indicator */}
                  {loading && (
                    <div className="flex items-start gap-3 pt-1">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="bg-[#151E34] border border-white/[0.08] rounded-2xl rounded-tl-xs px-4 py-3 text-xs font-mono text-slate-300 flex items-center gap-2 shadow-md">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>Rajy is reviewing anatomical records and taphonomic literature...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* ── Compact Suggestion Chips (Visible during ongoing chat) ── */}
                {!isInitialState && (
                  <div className="px-3.5 sm:px-5 py-2 border-t border-white/[0.06] bg-[#070B16]/90 overflow-x-auto flex items-center gap-2 shrink-0 scrollbar-none">
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Inquiries:
                    </span>
                    {COMPACT_PRESET_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(q)}
                        disabled={loading}
                        className="px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-850 border border-white/[0.08] hover:border-amber-500/30 text-slate-300 hover:text-amber-200 text-xs font-mono shrink-0 transition-all text-left truncate max-w-xs cursor-pointer disabled:opacity-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Refined Fixed Message Input Area ── */}
                <div className="px-3.5 py-3 sm:px-5 sm:py-3.5 border-t border-white/[0.08] bg-[#070B16] shrink-0 z-10">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Rajy about prehistoric life..."
                        disabled={loading}
                        aria-label="Question for Rajy"
                        className="w-full px-4 py-2.5 sm:py-3 bg-[#0D1527] border border-white/[0.1] focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-all font-mono shadow-inner"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="min-h-[42px] sm:min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/10 shrink-0"
                      aria-label="Send message to Rajy"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span className="hidden xs:inline">Consult</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                  <p className="hidden sm:block text-[10px] font-mono text-slate-500 pt-1.5 text-center">
                    Prehistorica AI Docent &bull; Evidence-based retrieval augmented generation (RAG)
                  </p>
                </div>

              </main>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
