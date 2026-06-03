import React from 'react';
import { usePotteryStore } from '../../store/usePotteryStore';
import type { BaseShape } from '../../store/usePotteryStore';
import { Sparkles, HelpCircle } from 'lucide-react';

interface ShapeCardProps {
  type: BaseShape;
  label: string;
  selected: boolean;
  onClick: () => void;
}

const ShapeCard: React.FC<ShapeCardProps> = ({ type, label, selected, onClick }) => {
  // Mini visual SVG representation of base profile silhouettes
  const renderSilhouettes = () => {
    switch (type) {
      case 'sphere':
        return (
          <svg viewBox="0 0 40 60" className="shape-icon">
            <path d="M 20,5 Q 35,5 35,30 Q 35,55 20,55 Q 5,55 5,30 Q 5,5 20,5 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        );
      case 'cone':
        return (
          <svg viewBox="0 0 40 60" className="shape-icon">
            <path d="M 20,5 L 35,55 L 5,55 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        );
      case 'urn':
        return (
          <svg viewBox="0 0 40 60" className="shape-icon">
            <path d="M 13,5 L 27,5 C 27,5 25,12 24,15 C 23,17 32,22 32,32 C 32,42 26,48 25,52 L 26,55 L 14,55 L 15,52 C 14,48 8,42 8,32 C 8,22 17,17 16,15 C 15,12 13,5 13,5 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        );
      case 'cylinder':
      default:
        return (
          <svg viewBox="0 0 40 60" className="shape-icon">
            <rect x="8" y="5" width="24" height="50" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        );
    }
  };

  return (
    <button
      className={`shape-select-card ${selected ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="shape-icon-container">{renderSilhouettes()}</div>
      <span className="shape-label">{label}</span>
    </button>
  );
};

export const IntroScreen: React.FC = () => {
  const { baseShape, setBaseShape, setStep } = usePotteryStore();

  const startingShapes: { type: BaseShape; label: string }[] = [
    { type: 'cylinder', label: 'Cilindro' },
    { type: 'sphere', label: 'Sferico' },
    { type: 'cone', label: 'Conico' },
    { type: 'urn', label: 'Anfora' }
  ];

  return (
    <div className="intro-overlay">
      <div className="intro-card animate-fade-in">
        {/* Cerama Branding Header */}
        <div className="brand-header">
          <span className="brand-tag">Cerama Studio</span>
          <h1 className="brand-title">Tornio & Smaltatura</h1>
          <p className="brand-subtitle">Crea il tuo vaso in argilla interattiva</p>
        </div>

        {/* Narrative Description */}
        <p className="intro-text">
          Sperimenta il fascino rilassante dell'artigianato digitale. Modella l'argilla in movimento con le tue mani, applica finiture lucide e smalti pregiati e dai vita al tuo vaso unico ispirato al nostro catalogo e-commerce.
        </p>

        {/* Starting Silhouette Selection */}
        <div className="section-container">
          <label className="section-title">1. Scegli il blocco d'argilla di partenza</label>
          <div className="shape-grid">
            {startingShapes.map((shape) => (
              <ShapeCard
                key={shape.type}
                type={shape.type}
                label={shape.label}
                selected={baseShape === shape.type}
                onClick={() => setBaseShape(shape.type)}
              />
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button className="primary-cta-btn" onClick={() => setStep('shape')}>
          <Sparkles size={18} />
          <span>Inizia a Modellare</span>
        </button>

        {/* Quick Tutorial Tip */}
        <div className="onboarding-tip">
          <HelpCircle size={14} className="text-muted" />
          <span>Trascina o tocca l'argilla sul tornio per allargarla e stringerla.</span>
        </div>
      </div>
    </div>
  );
};
