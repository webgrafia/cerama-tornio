import React from 'react';
import { usePotteryStore } from './store/usePotteryStore';
import { CanvasContainer } from './components/scene/CanvasContainer';
import { IntroScreen } from './components/ui/IntroScreen';
import { StudioControls } from './components/ui/StudioControls';
import { GlazeSelector } from './components/ui/GlazeSelector';
import { FinalScreen } from './components/ui/FinalScreen';
import { ShoppingBag } from 'lucide-react';

const App: React.FC = () => {
  const { step } = usePotteryStore();

  return (
    <div className="app-container">
      {/* 1. Main Global Studio Header (Aesthetic Branding) */}
      <header className="global-header animate-fade-in">
        <div className="header-logo-group">
          <img 
            src="https://cerama.shop/wp-content/uploads/2025/09/logo-cerama.svg" 
            alt="Cerama Logo" 
            className="header-logo-img" 
          />
          <div className="header-text">
            <span className="logo-main">CERAMA</span>
            <span className="logo-sub">TORNIO VIRTUALE</span>
          </div>
        </div>

        {/* Dynamic header stage title */}
        <div className="header-stage-banner">
          {step === 'shape' && <span className="badge">Fase Modellazione</span>}
          {step === 'glaze' && <span className="badge warning">Fase Smaltatura</span>}
          {step === 'share' && <span className="badge success">Collezione Privata</span>}
        </div>

        {/* E-Commerce Anchor link */}
        <a 
          href="https://cerama.shop/shop/?ref=tornio" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="header-ecommerce-link"
        >
          <ShoppingBag size={15} />
          <span>Shop</span>
        </a>
      </header>

      {/* 2. Fullscreen Interactive 3D Canvas Scene */}
      <main className="main-content">
        <CanvasContainer />

        {/* 3. HTML Interfaces Overlays Layer */}
        {step === 'intro' && <IntroScreen />}
        
        {/* Active Shaping / Coloring Sidebar Elements */}
        {step === 'glaze' && <GlazeSelector />}
        
        {/* Floating Core Toolbars (Undo, Smooth, Reset) */}
        <StudioControls />

        {/* Museum Exhibition Card & Export screen */}
        {step === 'share' && <FinalScreen />}
      </main>

      {/* 4. Elegant Studio Footer */}
      <footer className="global-footer animate-fade-in">
        <p>© {new Date().getFullYear()} Cerama S.r.l. — Tutti i diritti riservati. Esperienza interattiva per ceramisti.</p>
      </footer>
    </div>
  );
};

export default App;
