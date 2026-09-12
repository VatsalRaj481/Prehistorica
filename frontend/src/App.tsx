import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import ScrollToTop from './components/ScrollToTop.js';
import ColdStartScreen from './components/ColdStartScreen.js';
import SmoothScroll from './components/SmoothScroll.js';
import Home from './pages/Home.js';
import Browse from './pages/Browse.js';
import SpeciesDetail from './pages/SpeciesDetail.js';
import TimeMap from './pages/TimeMap.js';
import { wakePing } from './services/api.js';

export default function App() {
  const isForcedColdStart = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('coldstart') === 'true';
  // Always activate ColdStartScreen upon initial page load / refresh
  const [showColdStart, setShowColdStart] = useState(true);
  const [isWaking, setIsWaking] = useState(true);
  const [backendReady, setBackendReady] = useState(isForcedColdStart);
  const [isNavbarLogoVisible, setIsNavbarLogoVisible] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    if (isForcedColdStart) {
      setBackendReady(true);
      return;
    }
    wakePing();

    const rawApiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://prehistorica.onrender.com/api');
    const cleanApiUrl = rawApiUrl.replace(/\/$/, '');
    const apiBase = cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`;

    let isDone = false;
    let pollTimeout: ReturnType<typeof setTimeout> | null = null;

    // Minimum display threshold (2.5s) so the cinematic museum preloader renders smoothly even if backend is already warm
    const minDisplayPromise = new Promise((resolve) => setTimeout(resolve, 2500));

    // Active health handshake: keep cold start screen active until backend responds 200 OK
    const checkHealth = async () => {
      if (isDone) return;
      const controller = new AbortController();
      // Allow generous 12s timeout for cloud container cold start spin-up
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      try {
        const res = await fetch(`${apiBase}/health`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok && !isDone) {
          // Backend is confirmed online! Wait for the minimum display threshold before opening galleries
          await minDisplayPromise;
          if (!isDone) {
            isDone = true;
            if (pollTimeout) clearTimeout(pollTimeout);
            setBackendReady(true);
            setIsWaking(false);
          }
          return;
        }
      } catch {
        clearTimeout(timeoutId);
      }

      // If not yet online and not cancelled, keep polling every 2s
      if (!isDone) {
        pollTimeout = setTimeout(checkHealth, 2000);
      }
    };

    checkHealth();

    return () => {
      isDone = true;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [isForcedColdStart, retryTrigger]);

  return (
    <Router>
      <SmoothScroll>
        <AnimatePresence>
          {(showColdStart || isForcedColdStart) && (
            <ColdStartScreen
              isWaking={isForcedColdStart ? true : isWaking}
              simulateDurationSeconds={isForcedColdStart ? 16 : 22}
              onRetryHealth={() => setRetryTrigger((c) => c + 1)}
              onLogoDock={() => setIsNavbarLogoVisible(true)}
              onWakeComplete={() => {
                setIsNavbarLogoVisible(true);
                if (!isForcedColdStart) setShowColdStart(false);
              }}
            />
          )}
        </AnimatePresence>

        <Navbar isLogoVisible={isNavbarLogoVisible} />
        <main className="flex-grow max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {backendReady ? (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/species/:id" element={<SpeciesDetail />} />
              <Route path="/map" element={<TimeMap />} />
            </Routes>
          ) : (
            <div className="min-h-[60vh]" />
          )}
        </main>
        <Footer />
        <ScrollToTop />
      </SmoothScroll>
    </Router>
  );
}
