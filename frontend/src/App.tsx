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
  const [isNavbarLogoVisible, setIsNavbarLogoVisible] = useState(false);

  useEffect(() => {
    if (isForcedColdStart) return;
    wakePing();

    const rawApiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://prehistorica.onrender.com/api');
    const cleanApiUrl = rawApiUrl.replace(/\/$/, '');
    const apiBase = cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`;

    let isDone = false;

    // Ping health in the background to ensure backend is warm
    const pingBackend = async () => {
      try {
        await fetch(`${apiBase}/health`);
      } catch {
        // Ping silently in background
      }
    };
    pingBackend();

    // The coldstart screen always appears for exactly 2 seconds, then transitions into the home screen
    const transitionTimer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        setIsWaking(false);
      }
    }, 2000);

    return () => {
      isDone = true;
      clearTimeout(transitionTimer);
    };
  }, [isForcedColdStart]);

  return (
    <Router>
      <SmoothScroll>
        <AnimatePresence>
          {(showColdStart || isForcedColdStart) && (
            <ColdStartScreen
              isWaking={isForcedColdStart ? true : isWaking}
              simulateDurationSeconds={isForcedColdStart ? 16 : 2}
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
