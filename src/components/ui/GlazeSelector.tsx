import React, { useState } from 'react';
import { usePotteryStore, GLAZE_PRESETS } from '../../store/usePotteryStore';
import type { GlazePreset } from '../../store/usePotteryStore';
import { ShoppingBag, Sparkles, HelpCircle, Eye, X } from 'lucide-react';

export const GlazeSelector: React.FC = () => {
  const { step, selectedGlaze, selectGlaze, brushSize, setBrushSize } = usePotteryStore();
  const [isOpen, setIsOpen] = useState(true);

  if (step !== 'glaze') return null;

  if (!isOpen) {
    return (
      <button
        className="glaze-panel-collapsed-trigger animate-slide-up"
        onClick={() => setIsOpen(true)}
        title="Scegli un colore"
      >
        <Eye size={16} />
        <span>Scegli un colore</span>
      </button>
    );
  }

  // Render a visual representation of the swatch texture based on its finish style
  const renderSwatchDetails = (glaze: GlazePreset) => {
    switch (glaze.finish) {
      case 'glossy':
        return (
          <>
            {/* Glassy reflection highlight */}
            <div className="swatch-highlight-gloss" />
            {glaze.crackle && <div className="swatch-pattern-crackle" />}
          </>
        );
      case 'metallic':
        return <div className="swatch-highlight-metallic" />;
      case 'satin':
        return <div className="swatch-highlight-satin" />;
      case 'matte':
      default:
        return <div className="swatch-highlight-matte" />;
    }
  };

  return (
    <div className="glaze-panel-container animate-fade-in">
      <div className="glaze-panel-header">
        <div className="panel-header-title-group">
          <Sparkles size={16} className="text-accent" />
          <h2 className="panel-title">Seleziona lo Smalto</h2>
        </div>
        <button
          className="panel-minimize-btn"
          onClick={() => setIsOpen(false)}
          title="Nascondi selettore"
        >
          <X size={16} />
        </button>
      </div>
      
      <p className="panel-intro-text">
        Applica uno dei nostri smalti professionali cotti a gran fuoco. Vengono riprodotti con finiture fisiche realistiche.
      </p>

      {/* Grid list of glazes */}
      <div className="glaze-grid">
        {GLAZE_PRESETS.map((glaze) => {
          const isSelected = selectedGlaze.id === glaze.id;
          return (
            <button
              key={glaze.id}
              className={`glaze-card-option ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                selectGlaze(glaze.id);
                if (window.innerWidth <= 921) {
                  setIsOpen(false);
                }
              }}
            >
              {/* Colored Swatch circle */}
              <div 
                className="glaze-swatch-circle"
                style={{ backgroundColor: glaze.color }}
              >
                {renderSwatchDetails(glaze)}
                {glaze.speckled && <div className="swatch-pattern-speckled" />}
              </div>
              
              <div className="glaze-meta-summary">
                <span className="glaze-option-name">{glaze.name.split(' ')[0]}</span>
                <span className="glaze-option-code">{glaze.code}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Glaze detailed specs */}
      <div className="selected-glaze-details animate-fade-in" key={selectedGlaze.id}>
        <div className="details-header-row">
          <div>
            <h3 className="glaze-detailed-name">{selectedGlaze.name}</h3>
            <span className="glaze-detailed-code">Codice Prodotto: {selectedGlaze.code}</span>
          </div>
          <span className="glaze-detailed-price">{selectedGlaze.price}</span>
        </div>

        <p className="glaze-detailed-desc">{selectedGlaze.description}</p>

        {/* E-Commerce direct CTA */}
        <a
          href={selectedGlaze.shopUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shop-link-btn"
        >
          <ShoppingBag size={16} />
          <span>Ordina su cerama.shop</span>
        </a>
      </div>

      {/* Paintbrush Slider Controls */}
      <div className="brush-controls-container">
        <div className="brush-control-header">
          <span className="brush-control-label">Spessore Pennello</span>
          <span className="brush-control-value">{Math.round(brushSize * 250)} px</span>
        </div>
        <input
          type="range"
          min="0.04"
          max="0.3"
          step="0.01"
          value={brushSize}
          onChange={(e) => setBrushSize(parseFloat(e.target.value))}
          className="brush-size-slider"
        />
      </div>

      <div className="glaze-tutorial-tip">
        <HelpCircle size={14} />
        <span>Usa il mouse o le dita per ruotare e controllare i riflessi della finitura!</span>
      </div>
    </div>
  );
};
