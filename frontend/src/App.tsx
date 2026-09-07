import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import ScrollToTop from './components/ScrollToTop.js';
import ColdStartScreen from './components/ColdStartScreen.js';
import Home from './pages/Home.js';
import Browse from './pages/Browse.js';
import SpeciesDetail from './pages/SpeciesDetail.js';
import TimeMap from './pages/TimeMap.js';
import { wakePing } from './services/api.js';

export default function App() {
  const [showColdStart, setShowColdStart] = useState(false);
  const [isWaking, setIsWaking] = useState(true);

  useEffect(() => {
    wakePing();

    const searchParams = new URLSearchParams(window.location.search);
    const isSimulated = searchParams.get('simulateColdStart') === 'true' || searchParams.get('coldstart') === '1';
    const isWarmed = sessionStorage.getItem('prehistorica_warmed') === 'true';

    if (isSimulated) {
      setShowColdStart(true);
      setIsWaking(true);
      const simDuration = parseInt(searchParams.get('duration') || '12', 10);
      const timer = setTimeout(() => {
        setIsWaking(false);
      }, simDuration * 1000);
      return () => clearTimeout(timer);
    }

    if (!isWarmed) {
      // If backend takes longer than 750ms to respond, activate cold start screen
      const timer = setTimeout(() => {
        setShowColdStart(true);
      }, 750);

      const rawApiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://prehistorica.onrender.com/api');
      const cleanApiUrl = rawApiUrl.replace(/\/$/, '');
      const apiBase = cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`;

      fetch(`${apiBase}/health`)
        .then(() => {
          clearTimeout(timer);
          setIsWaking(false);
          sessionStorage.setItem('prehistorica_warmed', 'true');
        })
        .catch(() => {
          // Retry /health until server wakes up
          const retryInterval = setInterval(() => {
            fetch(`${apiBase}/health`)
              .then((r) => {
                if (r.ok) {
                  clearInterval(retryInterval);
                  setIsWaking(false);
                  sessionStorage.setItem('prehistorica_warmed', 'true');
                }
              })
              .catch(() => {});
          }, 3000);

          return () => clearInterval(retryInterval);
        });

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Router>
      <AnimatePresence>
        {showColdStart && (
          <ColdStartScreen
            isWaking={isWaking}
            onWakeComplete={() => setShowColdStart(false)}
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
    </Router>
  );
}
