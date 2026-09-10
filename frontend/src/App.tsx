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

  useEffect(() => {
    if (isForcedColdStart) return;
    wakePing();

    const rawApiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://prehistorica.onrender.com/api');
    const cleanApiUrl = rawApiUrl.replace(/\/$/, '');
    const apiBase = cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`;

    let isDone = false;
    let activeInterval: ReturnType<typeof setInterval> | null = null;

    // Minimum display duration (1.4s) so the cinematic museum preloader renders smoothly even if backend is warm
    const minDisplayPromise = new Promise((resolve) => setTimeout(resolve, 1400));

    // Maximum failsafe timer: never lock the user out for more than 16 seconds
    const maxWakeTimer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        if (activeInterval) clearInterval(activeInterval);
        setIsWaking(false);
      }
    }, 16000);

    const checkHealth = async () => {
      if (isDone) return;
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 6000);

      try {
        const res = await fetch(`${apiBase}/health`, { signal: controller.signal });
        clearTimeout(fetchTimeout);
        if (res.ok && !isDone) {
          // Await minimum display promise so preloader animation transitions smoothly
          await minDisplayPromise;
          if (!isDone) {
            isDone = true;
            if (activeInterval) clearInterval(activeInterval);
            clearTimeout(maxWakeTimer);
            setIsWaking(false);
          }
        }
      } catch {
        clearTimeout(fetchTimeout);
      }
    };

    // Initial check
    checkHealth().then(() => {
      if (!isDone) {
        activeInterval = setInterval(checkHealth, 2000);
      }
    });

    return () => {
      isDone = true;
      clearTimeout(maxWakeTimer);
      if (activeInterval) clearInterval(activeInterval);
    };
  }, []);

  return (
    <Router>
      <SmoothScroll>
        <AnimatePresence>
          {(showColdStart || isForcedColdStart) && (
            <ColdStartScreen
              isWaking={isForcedColdStart ? true : isWaking}
              onWakeComplete={() => {
                if (!isForcedColdStart) setShowColdStart(false);
              }}
            />
          )}
        </AnimatePresence>

        <Navbar />
        <main className="flex-grow max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/species/:id" element={<SpeciesDetail />} />
            <Route path="/map" element={<TimeMap />} />
          </Routes>
        </main>
        <Footer />
        <ScrollToTop />
      </SmoothScroll>
    </Router>
  );
}
