import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import Home from './pages/Home.js';
import Browse from './pages/Browse.js';
import SpeciesDetail from './pages/SpeciesDetail.js';
import TimeMap from './pages/TimeMap.js';

export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/species/:id" element={<SpeciesDetail />} />
          <Route path="/map" element={<TimeMap />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
