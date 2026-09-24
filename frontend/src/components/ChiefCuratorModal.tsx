import { useState, useRef, useEffect, KeyboardEvent, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X,
  Send,
  Loader2,
  BookOpen,
  Compass,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Dna,
  Square,
  Pause,
  Play,
  Sliders,
  RotateCcw
} from 'lucide-react';
import { askChiefCurator, CuratorGroundingSpecimen } from '../services/api.js';
import RajyResponseRenderer from './RajyResponseRenderer.js';

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

const DEFAULT_COMPACT_QUESTIONS = [
  'How did Spinosaurus adapt to aquatic life?',
  'Apex predators in Hell Creek?',
  'How is dinosaur mass estimated?',
  'Marine reptile evolutionary diversity?',
  'Flight mechanics in Azhdarchid pterosaurs?'
];

// Rajy's Default Voice Profile Configuration
const DEFAULT_VOICE_CONFIG = {
  lang: 'en-US',
  rate: 0.92,
  pitch: 1.08,
  volume: 1.0
};

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

  // Global Voice Mode setting (ON / OFF)
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // Active playback state: speaking vs. paused
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Voice Settings Panel Open/Closed
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);

  // Available System Voices & User Preferences
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() => {
    return localStorage.getItem('prehistorica_voice_uri') || '';
  });
  const [speechRate, setSpeechRate] = useState<number>(() => {
    const saved = localStorage.getItem('prehistorica_voice_rate');
    return saved ? parseFloat(saved) : DEFAULT_VOICE_CONFIG.rate;
  });
  const [speechPitch, setSpeechPitch] = useState<number>(() => {
    const saved = localStorage.getItem('prehistorica_voice_pitch');
    return saved ? parseFloat(saved) : DEFAULT_VOICE_CONFIG.pitch;
  });

  // Text buffer & character tracking for seamless pause/resume
  const currentCleanTextRef = useRef<string>('');
  const currentCharIndexRef = useRef<number>(0);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const keepAliveTimerRef = useRef<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  /**
   * Asynchronous System Voice Loading:
   * Handles browser-specific voice loading events across Chrome, Safari, Edge, Firefox, and mobile.
   */
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  /**
   * Click-outside handler for the compact voice settings panel
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsVoiceSettingsOpen(false);
      }
    };

    if (isVoiceSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVoiceSettingsOpen]);

  /**
   * Selects an active voice:
   * 1. User's chosen voice from settings if set.
   * 2. Natural / high-clarity English voice as preferred docent default.
   * 3. Graceful fallback to any English voice or first system voice.
   */
  const getActiveVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (availableVoices.length === 0) return null;

    if (selectedVoiceURI) {
      const userChoice = availableVoices.find((v) => v.voiceURI === selectedVoiceURI);
      if (userChoice) return userChoice;
    }

    const enVoices = availableVoices.filter((v) => v.lang.startsWith('en'));
    if (enVoices.length === 0) return availableVoices[0] || null;

    // Favor natural, clear English voices with friendly museum docent timbre
    const preferred =
      enVoices.find(
        (v) =>
          (v.name.includes('Natural') ||
            v.name.includes('Online') ||
            v.name.includes('Samantha') ||
            v.name.includes('Victoria') ||
            v.name.includes('Google US English') ||
            v.name.includes('Jenny') ||
            v.name.includes('Zira') ||
            v.name.includes('Karen')) &&
          (v.lang === 'en-US' || v.lang === 'en_US')
      ) ||
      enVoices.find((v) => v.lang.startsWith('en-US')) ||
      enVoices[0];

    return preferred || null;
  }, [availableVoices, selectedVoiceURI]);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveTimerRef.current !== null) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
  }, []);

  const startKeepAlive = useCallback(() => {
    stopKeepAlive();
    // Periodically pulse pause/resume to prevent long-speech timeouts in Chromium engines
    keepAliveTimerRef.current = window.setInterval(() => {
      if ('speechSynthesis' in window && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }, [stopKeepAlive]);

  const stopSpeaking = useCallback(() => {
    stopKeepAlive();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    activeUtteranceRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
    currentCharIndexRef.current = 0;
  }, [stopKeepAlive]);

  // Focus input on open, silence speech on close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      stopSpeaking();
      setIsVoiceSettingsOpen(false);
    }
  }, [isOpen, stopSpeaking]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // Auto-scroll on subsequent messages or loading states
  useEffect(() => {
    if (messages.length > 1 || loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  }, [messages.length, loading, shouldReduceMotion]);

  /**
   * Prepares raw AI-generated text for vocal speech:
   * - Strips Markdown syntax (asterisks, hashtags, backticks, bullet symbols).
   * - Converts internal/external links [Taxon](/species/123) -> "Taxon".
   * - Preserves natural punctuation (periods, commas, colons, question marks)
   *   to give the speech engine human-like breathing pauses.
   */
  const prepareTextForSpeech = (rawText: string): string => {
    return rawText
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_~`]/g, '')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^>\s+/gm, '')
      .replace(/^[-*]\s+/gm, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n/g, '. ')
      .replace(/\n/g, ' ')
      .trim();
  };

  /**
   * Core vocal speech synthesizer:
   * Applies the default docent configuration:
   * - lang: "en-US"
   * - rate: 0.92 (articulate, friendly docent cadence)
   * - pitch: 1.08 (subtle, youthful, engaging lift)
   * - volume: 1.0
   * - Word boundary tracking for exact pause/resume offset
   */
  const speakText = useCallback(
    (text: string, startIndex: number = 0) => {
      if (!ttsEnabled || !('speechSynthesis' in window)) return;

      stopKeepAlive();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      const clean = prepareTextForSpeech(text);
      if (!clean) return;

      currentCleanTextRef.current = clean;
      const textToSpeak = startIndex > 0 ? clean.slice(startIndex) : clean;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      // Default Docent Tuning Configuration
      utterance.lang = DEFAULT_VOICE_CONFIG.lang;
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      utterance.volume = DEFAULT_VOICE_CONFIG.volume;

      const voice = getActiveVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || DEFAULT_VOICE_CONFIG.lang;
      }

      // Track character boundary for precise pause/resume
      utterance.onboundary = (e) => {
        if (e.name === 'word') {
          currentCharIndexRef.current = startIndex + e.charIndex;
        }
      };

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        startKeepAlive();
      };

      utterance.onend = () => {
        stopKeepAlive();
        setIsSpeaking(false);
        setIsPaused(false);
        currentCharIndexRef.current = 0;
      };

      utterance.onerror = (e) => {
        stopKeepAlive();
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          setIsSpeaking(false);
          setIsPaused(false);
        }
      };

      activeUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [ttsEnabled, speechRate, speechPitch, getActiveVoice, startKeepAlive, stopKeepAlive]
  );

  /**
   * Dedicated Pause:
   * Pauses speech at the current word without canceling or losing position.
   */
  const pauseSpeaking = () => {
    stopKeepAlive();
    if (!('speechSynthesis' in window)) return;

    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
    setIsSpeaking(false);
    setIsPaused(true);
  };

  /**
   * Dedicated Resume:
   * Resumes vocal speech from the exact word where paused.
   */
  const resumeSpeaking = () => {
    if (!('speechSynthesis' in window)) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
      setIsPaused(false);
      startKeepAlive();
    } else if (currentCleanTextRef.current && currentCharIndexRef.current > 0) {
      speakText(currentCleanTextRef.current, currentCharIndexRef.current);
    } else {
      const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
      if (lastAssistantMsg) {
        speakText(lastAssistantMsg.content, 0);
      }
    }
  };

  /**
   * Global Voice Mode Toggle:
   * Toggles Voice Mode ON / OFF.
   * Toggling OFF completely cancels and flushes all audio.
   */
  const toggleTts = () => {
    if (ttsEnabled) {
      stopSpeaking();
      setTtsEnabled(false);
      setIsVoiceSettingsOpen(false);
    } else {
      setTtsEnabled(true);
      const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
      if (lastAssistantMsg) {
        setTimeout(() => speakText(lastAssistantMsg.content, 0), 50);
      }
    }
  };

  // User Settings Handlers with LocalStorage Persistence
  const handleRateChange = (newRate: number) => {
    setSpeechRate(newRate);
    localStorage.setItem('prehistorica_voice_rate', newRate.toString());
  };

  const handlePitchChange = (newPitch: number) => {
    setSpeechPitch(newPitch);
    localStorage.setItem('prehistorica_voice_pitch', newPitch.toString());
  };

  const handleVoiceChange = (newURI: string) => {
    setSelectedVoiceURI(newURI);
    localStorage.setItem('prehistorica_voice_uri', newURI);
  };

  const handleResetDefaults = () => {
    setSpeechRate(DEFAULT_VOICE_CONFIG.rate);
    setSpeechPitch(DEFAULT_VOICE_CONFIG.pitch);
    setSelectedVoiceURI('');
    localStorage.removeItem('prehistorica_voice_rate');
    localStorage.removeItem('prehistorica_voice_pitch');
    localStorage.removeItem('prehistorica_voice_uri');
  };

  const handleTestVoice = () => {
    speakText('Greetings, explorer! I am Rajy, your prehistoric museum docent.', 0);
  };

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || input).trim();
    if (!text || loading) return;

    stopSpeaking();

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
      speakText(res.answer, 0);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Docent Notice**: ${err.message || 'The docent archives are temporarily busy. Please ask again in a moment.'}`,
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

  const isInitialState = messages.length <= 1;

  // Context-aware dynamic follow-up suggestions
  const contextualSuggestions = useMemo(() => {
    if (isInitialState) return DEFAULT_COMPACT_QUESTIONS;

    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content.toLowerCase() || '';
    const lastBotMsg = [...messages].reverse().find((m) => m.role === 'assistant');
    const groundedNames = lastBotMsg?.groundedSpecimens?.map((s) => s.name) || [];

    if (groundedNames.length > 0) {
      const first = groundedNames[0];
      const list = [
        `What were ${first}'s ecological adaptations?`,
        `How does ${first} scale in the 1:1 Runway?`,
        `Which formation yielded ${first} fossils?`
      ];
      if (groundedNames.length > 1) {
        list.push(`Compare ${groundedNames[0]} and ${groundedNames[1]}`);
      }
      return list;
    }

    if (lastUserMsg.includes('spino') || lastUserMsg.includes('aquatic') || lastUserMsg.includes('swim')) {
      return [
        'Did Spinosaurus actively swim or wade?',
        'How does Spinosaurus compare in size to T. rex?',
        'What fossils were found in the Kem Kem beds?',
        'Baryonyx vs Spinosaurus adaptations?'
      ];
    }

    if (lastUserMsg.includes('rex') || lastUserMsg.includes('tyranno') || lastUserMsg.includes('predator')) {
      return [
        "What was Tyrannosaurus rex's estimated bite force?",
        'Did adult Tyrannosaurus possess feathers?',
        'Apex predators in Hell Creek?',
        'Scavenger vs apex predator hypothesis?'
      ];
    }

    if (lastUserMsg.includes('mass') || lastUserMsg.includes('weight') || lastUserMsg.includes('size')) {
      return [
        'How do volumetric models calculate dinosaur mass?',
        'Could massive sauropods run?',
        'What was the heaviest land animal ever?',
        'Bone histology and growth rings in dinosaurs?'
      ];
    }

    if (lastUserMsg.includes('fly') || lastUserMsg.includes('pterosaur') || lastUserMsg.includes('wing')) {
      return [
        'Quadrupedal launch mechanics in giant azhdarchids?',
        'Did pterosaurs have pycnofibers?',
        'Quetzalcoatlus vs modern aircraft scale?',
        'Evolutionary divergence of pterosaurs and birds?'
      ];
    }

    if (lastUserMsg.includes('marine') || lastUserMsg.includes('sea') || lastUserMsg.includes('ocean')) {
      return [
        'How did Mosasaurs adapt from terrestrial lizards?',
        'Did Ichthyosaurs give live birth at sea?',
        'Four-flipper swimming in Plesiosaurs?',
        'Marine apex predators of the Cretaceous?'
      ];
    }

    return DEFAULT_COMPACT_QUESTIONS;
  }, [messages, isInitialState]);

  const lastAssistantMessageId = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === 'assistant');
    return last?.id;
  }, [messages]);

  // English-prioritized voice options list
  const englishVoices = useMemo(() => {
    const en = availableVoices.filter((v) => v.lang.startsWith('en'));
    return en.length > 0 ? en : availableVoices;
  }, [availableVoices]);

  const activeVoiceName = useMemo(() => {
    const v = getActiveVoice();
    return v ? v.name : 'System Default';
  }, [getActiveVoice]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Rajy — Prehistorica AI Docent Consultation"
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
            <header className="relative px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-white/[0.08] bg-gradient-to-r from-[#070B16] via-[#0A0F1D] to-[#070B16] flex items-center justify-between shrink-0 z-20">
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
                    <span className="text-slate-200 font-semibold">Rajy &bull; AI Docent</span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="italic text-slate-300">Rajasaurus narmadensis</span>
                  </p>
                </div>
              </div>

              {/* Header Controls: Global Voice Mode Toggle, Playback, Voice Settings & Close */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* 1. Global Voice Mode Toggle (ON / OFF) */}
                <button
                  type="button"
                  onClick={toggleTts}
                  className={`min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    ttsEnabled
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/30'
                      : 'bg-slate-900/80 border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                  title={
                    ttsEnabled
                      ? 'Voice Mode is ON (click to turn OFF)'
                      : 'Enable docent vocal narration for Rajy'
                  }
                  aria-pressed={ttsEnabled}
                  aria-label={
                    ttsEnabled
                      ? 'Voice Mode Active'
                      : 'Voice Mode Inactive — Enable vocal narration for Rajy'
                  }
                >
                  {ttsEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] font-bold">Voice: ON</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Voice Mode</span>
                    </>
                  )}
                </button>

                {/* 2. Separate Pause / Resume & Stop Controls (Visible when Voice Mode is ON and audio is active or paused) */}
                {ttsEnabled && (isSpeaking || isPaused) && (
                  <div className="flex items-center gap-1 bg-slate-900/90 border border-amber-500/30 rounded-lg p-0.5 shadow-sm">
                    {/* Pause / Resume Button */}
                    {isSpeaking ? (
                      <button
                        type="button"
                        onClick={pauseSpeaking}
                        className="min-h-[32px] sm:min-h-[34px] px-2 sm:px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                        title="Pause speech at current word"
                        aria-label="Pause vocal narration"
                      >
                        <span className="flex items-end gap-0.5 h-3">
                          <span className="w-0.5 bg-amber-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2" />
                          <span className="w-0.5 bg-amber-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-3" />
                          <span className="w-0.5 bg-amber-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-1.5" />
                        </span>
                        <Pause className="w-3 h-3 fill-current ml-0.5" />
                        <span className="text-[10px] uppercase font-bold hidden xs:inline">Pause</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={resumeSpeaking}
                        className="min-h-[32px] sm:min-h-[34px] px-2 sm:px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-400 transition-colors shadow-sm"
                        title="Resume speech from current word"
                        aria-label="Resume vocal narration"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span className="text-[10px] uppercase font-bold">Resume</span>
                      </button>
                    )}

                    {/* Instant Stop Button */}
                    <button
                      type="button"
                      onClick={stopSpeaking}
                      className="min-h-[32px] sm:min-h-[34px] p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                      title="Stop audio narration completely"
                      aria-label="Stop vocal narration"
                    >
                      <Square className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                )}

                {/* 3. Compact Voice Settings Control Button */}
                {ttsEnabled && (
                  <button
                    type="button"
                    onClick={() => setIsVoiceSettingsOpen(!isVoiceSettingsOpen)}
                    className={`min-h-[36px] min-w-[36px] sm:min-h-[38px] sm:min-w-[38px] p-2 rounded-lg border text-xs font-mono flex items-center justify-center transition-all cursor-pointer ${
                      isVoiceSettingsOpen
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                        : 'bg-slate-900/80 border-white/[0.08] text-slate-400 hover:text-amber-300 hover:bg-slate-850'
                    }`}
                    title="Rajy's Voice Settings & Speed"
                    aria-label="Voice settings and speed control"
                    aria-expanded={isVoiceSettingsOpen}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Close Modal Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[36px] min-w-[36px] sm:min-h-[38px] sm:min-w-[38px] p-2 rounded-lg bg-slate-900/80 hover:bg-slate-850 border border-white/[0.08] text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center ml-0.5"
                  title="Close Rajy AI Docent"
                  aria-label="Close Rajy AI Docent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Compact Voice Settings Popover ── */}
              <AnimatePresence>
                {isVoiceSettingsOpen && ttsEnabled && (
                  <motion.div
                    ref={settingsRef}
                    initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-4 sm:right-6 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 p-3.5 rounded-xl bg-slate-950/98 border border-amber-500/35 shadow-[0_12px_36px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-40 font-mono text-slate-200 space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        <span>Rajy Voice Settings</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetDefaults}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 hover:bg-amber-500/15 border border-white/[0.08] text-[10px] text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Restore Rajy's Default Voice Profile (Rate: 0.92, Pitch: 1.08)"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Reset Defaults</span>
                      </button>
                    </div>

                    {/* System Voice Selection */}
                    <div className="space-y-1">
                      <label htmlFor="voice-select" className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                        System Voice ({englishVoices.length} available)
                      </label>
                      <select
                        id="voice-select"
                        value={selectedVoiceURI}
                        onChange={(e) => handleVoiceChange(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/[0.1] text-xs text-slate-200 focus:border-amber-500/70 focus:outline-none transition-colors"
                      >
                        <option value="">Preferred Docent Voice ({activeVoiceName})</option>
                        {englishVoices.map((v) => (
                          <option key={v.voiceURI} value={v.voiceURI}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Speaking Speed (Rate) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 uppercase tracking-wider font-semibold">Speaking Speed</span>
                        <span className="text-amber-400 font-bold">{speechRate.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.75"
                        max="1.25"
                        step="0.05"
                        value={speechRate}
                        onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
                        aria-label="Adjust speaking speed"
                      />
                      <div className="flex items-center justify-between pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleRateChange(0.85)}
                          className={`px-1.5 py-0.5 rounded text-[9px] border transition-colors cursor-pointer ${
                            speechRate === 0.85
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                              : 'bg-slate-900 text-slate-400 border-white/[0.06] hover:text-slate-200'
                          }`}
                        >
                          Slow (0.85x)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRateChange(DEFAULT_VOICE_CONFIG.rate)}
                          className={`px-1.5 py-0.5 rounded text-[9px] border transition-colors cursor-pointer ${
                            speechRate === DEFAULT_VOICE_CONFIG.rate
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                              : 'bg-slate-900 text-slate-400 border-white/[0.06] hover:text-slate-200'
                          }`}
                        >
                          Rajy Default (0.92x)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRateChange(1.05)}
                          className={`px-1.5 py-0.5 rounded text-[9px] border transition-colors cursor-pointer ${
                            speechRate === 1.05
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                              : 'bg-slate-900 text-slate-400 border-white/[0.06] hover:text-slate-200'
                          }`}
                        >
                          Brisk (1.05x)
                        </button>
                      </div>
                    </div>

                    {/* Vocal Pitch */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 uppercase tracking-wider font-semibold">Pitch Lift</span>
                        <span className="text-amber-400 font-bold">{speechPitch.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.90"
                        max="1.25"
                        step="0.02"
                        value={speechPitch}
                        onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
                        aria-label="Adjust voice pitch"
                      />
                      <p className="text-[9px] text-slate-500 leading-tight">
                        Default: 1.08 (Subtle youthful docent lift, clear & articulate)
                      </p>
                    </div>

                    {/* Test Audio & Done */}
                    <div className="pt-1 flex items-center justify-between border-t border-white/[0.08]">
                      <button
                        type="button"
                        onClick={handleTestVoice}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Test Voice</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsVoiceSettingsOpen(false)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-white/[0.08] text-[10px] cursor-pointer transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </header>

            {/* ── Main Body: Split-Panel Layout ── */}
            <div className="flex flex-1 min-h-0 overflow-hidden relative">

              {/* ── LEFT PANEL: Rajy's Museum Exhibit Plinth ── */}
              <aside
                className="hidden sm:flex flex-col w-[170px] md:w-[190px] lg:w-[215px] shrink-0 bg-gradient-to-b from-[#090F1C] via-[#070C18] to-[#040812] border-r border-white/[0.06] relative overflow-hidden select-none"
                aria-label="Rajy Mascot Showcase"
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
                  className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 md:p-6 space-y-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/20 overscroll-contain"
                >
                  {messages.map((msg) => {
                    const isAssistant = msg.role === 'assistant';
                    const isThisLastAssistant = msg.id === lastAssistantMessageId;
                    const isCurrentlySpeaking = isSpeaking && isThisLastAssistant;
                    const isCurrentlyPaused = isPaused && isThisLastAssistant;

                    return (
                      <article
                        key={msg.id}
                        className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                      >
                        {/* Sender Meta Label */}
                        <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] font-mono text-slate-400">
                          {isAssistant ? (
                            <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                              <img
                                src="/rajy-head.jpg"
                                alt="Rajy the AI Docent"
                                className="w-4 h-4 rounded-full object-cover object-top sm:hidden border border-amber-500/40"
                              />
                              <span>Rajy &bull; AI Docent</span>
                              {isCurrentlySpeaking && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono border border-amber-500/40 animate-pulse ml-1">
                                  <Volume2 className="w-2.5 h-2.5" /> Narrating
                                </span>
                              )}
                              {isCurrentlyPaused && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-300 text-[9px] font-mono border border-amber-500/30 ml-1">
                                  <Pause className="w-2.5 h-2.5" /> Paused
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                              Visitor
                            </span>
                          )}
                          <span className="text-slate-600">&bull;</span>
                          <time className="text-[10px] text-slate-500">{msg.timestamp}</time>
                        </div>

                        {/* Message Bubble with Left Pointer for Rajy */}
                        <div className="relative overflow-visible max-w-[94%] sm:max-w-[88%] lg:max-w-[85%]">
                          {isAssistant && (
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
                            className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-lg ${
                              isAssistant
                                ? 'bg-[#151E34] border border-white/[0.08] text-slate-100 rounded-tl-xs selection:bg-amber-500 selection:text-slate-950'
                                : 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs selection:bg-slate-900 selection:text-white'
                            }`}
                          >
                            {isAssistant ? (
                              <RajyResponseRenderer
                                content={msg.content}
                                onLinkClick={onClose}
                                isLatestAssistantMessage={isThisLastAssistant}
                              />
                            ) : (
                              <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-[13px] md:text-sm">
                                {msg.content}
                              </p>
                            )}
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
                    );
                  })}

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

                  <div ref={messagesEndRef} className="h-2" />
                </div>

                {/* ── Refined Context-Aware Suggestion Chips (Visible during ongoing chat) ── */}
                {!isInitialState && (
                  <div className="px-3.5 sm:px-5 py-2 border-t border-white/[0.06] bg-[#070B16]/95 flex items-center gap-2 shrink-0 z-10 overflow-hidden">
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 uppercase tracking-wider flex items-center gap-1 font-bold">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="hidden xs:inline">Follow-up:</span>
                    </span>
                    <div className="flex-1 overflow-x-auto flex items-center gap-2 scrollbar-none py-0.5">
                      {contextualSuggestions.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(q)}
                          disabled={loading}
                          className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-900/90 hover:bg-amber-500/15 border border-white/[0.08] hover:border-amber-500/40 text-slate-300 hover:text-amber-200 text-[11px] sm:text-xs font-mono shrink-0 transition-all text-left whitespace-nowrap cursor-pointer active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 shadow-sm"
                          title={`Ask Rajy: ${q}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
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
                    Rajy &bull; Prehistorica AI Docent &bull; Evidence-based retrieval augmented generation (RAG)
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
