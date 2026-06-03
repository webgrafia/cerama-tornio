import React from 'react';
import { usePotteryStore } from '../../store/usePotteryStore';
import { Undo2, Redo2, RotateCcw, Paintbrush, Check, ChevronLeft, Sparkles } from 'lucide-react';

export const StudioControls: React.FC = () => {
  const {
    step,
    setStep,
    undo,
    redo,
    resetVase,
    smoothVase,
    canUndo,
    canRedo,
    interactionCount
  } = usePotteryStore();

  if (step === 'intro' || step === 'share') return null;

  return (
    <div className="controls-floating-container animate-slide-up">
      {/* 1. Tool/Stage Header Banner */}
      <div className="controls-status-bar">
        <div className="status-indicator">
          <span className={`bullet ${step === 'shape' ? 'active' : ''}`} />
          <span className="step-label">
            {step === 'shape' ? '1. Modella il Vaso' : '2. Decora & Smalta'}
          </span>
        </div>
        
        {step === 'shape' && (
          <span className="interaction-badge">
            {interactionCount === 0 
              ? 'Tocca la creta per iniziare' 
              : `${interactionCount} gesti artigianali`}
          </span>
        )}
      </div>

      {/* 2. Interactive Tool Actions Row */}
      <div className="controls-actions-row">
        {step === 'shape' ? (
          <>
            {/* Shape Phase Tools */}
            <div className="tools-button-group">
              <button
                className="tool-btn"
                onClick={resetVase}
                title="Ripristina argilla iniziale"
              >
                <RotateCcw size={16} />
                <span>Azzera</span>
              </button>

              <button
                className="tool-btn"
                onClick={smoothVase}
                title="Lavora e liscia i bordi"
              >
                <Sparkles size={16} />
                <span>Liscia</span>
              </button>
            </div>

            {/* History Control Group (Undo/Redo) */}
            <div className="tools-button-group divider">
              <button
                className="tool-btn"
                onClick={undo}
                disabled={!canUndo()}
                title="Annulla ultimo gesto"
              >
                <Undo2 size={16} />
              </button>
              
              <button
                className="tool-btn"
                onClick={redo}
                disabled={!canRedo()}
                title="Ripristina gesto annullato"
              >
                <Redo2 size={16} />
              </button>
            </div>

            {/* Stage Progression Action */}
            <button
              className="primary-action-btn"
              onClick={() => setStep('glaze')}
            >
              <Paintbrush size={16} />
              <span>Scegli lo Smalto</span>
            </button>
          </>
        ) : (
          <>
            {/* Glazing Phase Tools */}
            <button
              className="tool-btn secondary"
              onClick={() => setStep('shape')}
            >
              <ChevronLeft size={16} />
              <span>Modella ancora</span>
            </button>

            {/* Stage Progression Action */}
            <button
              className="primary-action-btn success"
              onClick={() => setStep('share')}
            >
              <Check size={16} />
              <span>Completa Vaso</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
