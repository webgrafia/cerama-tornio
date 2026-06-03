import React, { useMemo } from 'react';
import { usePotteryStore, GLAZE_PRESETS } from '../../store/usePotteryStore';
import { Download, RotateCcw, ArrowRight, ExternalLink, Award } from 'lucide-react';

export const FinalScreen: React.FC = () => {
  const {
    step,
    setStep,
    vaseName,
    setVaseName,
    exportImage,
    setBaseShape,
    glazeColors,
    glazeIntensity
  } = usePotteryStore();

  if (step !== 'share') return null;

  // Let the user download their high-res PNG locally
  const handleDownload = () => {
    if (!exportImage) return;
    
    // Construct clean safe filename
    const safeName = vaseName.trim()
      ? vaseName.toLowerCase().replace(/[^a-z0-9]/g, '-')
      : 'mio-vaso-cerama';

    const link = document.createElement('a');
    link.href = exportImage;
    link.download = `${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to compute color difference (distance)
  const colorDiff = (c1: string, c2: string) => {
    const r1 = parseInt(c1.substring(1, 3), 16);
    const g1 = parseInt(c1.substring(3, 5), 16);
    const b1 = parseInt(c1.substring(5, 7), 16);
    
    const r2 = parseInt(c2.substring(1, 3), 16);
    const g2 = parseInt(c2.substring(3, 5), 16);
    const b2 = parseInt(c2.substring(5, 7), 16);
    
    return Math.hypot(r1 - r2, g1 - g2, b1 - b2);
  };

  // Determine which glazes were actually painted onto the vase
  const usedGlazes = useMemo(() => {
    const used = new Set<string>();
    for (let i = 0; i < glazeIntensity.length; i++) {
      if (glazeIntensity[i] > 0.05) {
        let minDiff = Infinity;
        let closestGlaze = null;
        for (const preset of GLAZE_PRESETS) {
          const diff = colorDiff(glazeColors[i], preset.color);
          if (diff < minDiff) {
            minDiff = diff;
            closestGlaze = preset;
          }
        }
        if (closestGlaze && minDiff < 45) {
          used.add(closestGlaze.id);
        }
      }
    }
    return GLAZE_PRESETS.filter(g => used.has(g.id));
  }, [glazeColors, glazeIntensity]);

  const glazeNameLabel = useMemo(() => {
    if (usedGlazes.length === 0) return 'Argilla Grezza';
    if (usedGlazes.length === 1) return usedGlazes[0].name;
    return usedGlazes.map(g => g.name).join(', ');
  }, [usedGlazes]);

  const glazeCodeLabel = useMemo(() => {
    if (usedGlazes.length === 0) return 'Terracotta';
    if (usedGlazes.length === 1) return usedGlazes[0].code;
    return 'Colori Misti (Colorobbia)';
  }, [usedGlazes]);

  const handleRestart = () => {
    // Reset base shape to cylinder and return to start
    setBaseShape('cylinder');
    setStep('intro');
  };

  return (
    <div className="final-overlay animate-fade-in">
      <div className="final-container">
        {/* Left Side: Museum Catalog Framing */}
        <div className="gallery-card-wrapper animate-slide-up">
          <div className="gallery-card">
            {exportImage ? (
              <div className="gallery-image-frame">
                <img
                  src={exportImage}
                  alt={vaseName}
                  className="gallery-image"
                />
              </div>
            ) : (
              <div className="gallery-image-loading">
                <div className="spinner" />
                <span>Fotografando la tua opera...</span>
              </div>
            )}

            {/* Museum Style label */}
            <div className="museum-label">
              <div className="label-heading">
                <span className="label-collection">Cerama Gallery</span>
                <span className="label-year">{new Date().getFullYear()}</span>
              </div>
              <h2 className="label-title">“{vaseName || 'Senza Titolo'}”</h2>
              <div className="label-specs">
                <div className="spec-row">
                  <span className="spec-label">Autore:</span>
                  <span className="spec-val">Vasaio Digitale</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Smalto:</span>
                  <span className="spec-val">{glazeNameLabel}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Finitura:</span>
                  <span className="spec-val font-caps">{usedGlazes.length > 0 ? 'Lucido Vetroso' : 'Opaca (Argilla)'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Linea Smalto:</span>
                  <span className="spec-val highlight-code">{glazeCodeLabel}</span>
                </div>
              </div>
              <div className="label-footer">
                <span>Creato su cerama.shop</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Controls */}
        <div className="final-actions-panel animate-fade-in">
          <div className="final-badge-row">
            <div className="badge-icon">
              <Award size={18} />
            </div>
            <div>
              <span className="badge-category">Congratulazioni!</span>
              <h3 className="badge-title">La tua opera è finita</h3>
            </div>
          </div>

          {/* Name input */}
          <div className="naming-input-group">
            <label htmlFor="vase-name-input" className="naming-label">
              Assegna un titolo al tuo vaso
            </label>
            <input
              id="vase-name-input"
              type="text"
              className="naming-field"
              placeholder="E.g., Sinfonia d'Argilla"
              value={vaseName}
              onChange={(e) => setVaseName(e.target.value.slice(0, 32))}
            />
          </div>

          <p className="final-description-text">
            Scarica l'immagine trasparente ad alta definizione della tua creazione, adatta per essere condivisa sui social o utilizzata come ispirazione.
          </p>

          {/* Action buttons */}
          <div className="final-buttons-stack">
            <button
              className="primary-cta-btn"
              onClick={handleDownload}
              disabled={!exportImage}
            >
              <Download size={18} />
              <span>Salva l'Immagine (PNG)</span>
            </button>

            <a
              href="https://cerama.shop/shop/?ref=tornio"
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-shop-btn"
            >
              <span>Visita l'E-Commerce Cerama</span>
              <ExternalLink size={16} />
            </a>

            <button
              className="restart-btn"
              onClick={handleRestart}
            >
              <RotateCcw size={16} />
              <span>Modella un nuovo vaso</span>
            </button>
          </div>
          
          {/* Subtle Lead-in details */}
          <div className="final-commercial-box">
            <h4 className="commercial-title">Vuoi riprodurlo dal vivo?</h4>
            {usedGlazes.length > 0 ? (
              <>
                <p className="commercial-text" style={{ marginBottom: '8px' }}>
                  Ecco gli smalti professionali <strong>Bellissimo Colorobbia</strong> che hai utilizzato per dipingere il tuo vaso:
                </p>
                <div className="used-glazes-links-list">
                  {usedGlazes.map((glaze) => (
                    <a
                      key={glaze.id}
                      href={glaze.shopUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="used-glaze-link-item animate-fade-in"
                    >
                      <div className="bullet-circle" style={{ backgroundColor: glaze.color }} />
                      <span className="glaze-name">{glaze.name}</span>
                      <span className="glaze-code">({glaze.code})</span>
                      <ExternalLink size={12} className="text-muted" />
                    </a>
                  ))}
                </div>
                <p className="commercial-text" style={{ marginTop: '12px' }}>
                  Sul nostro e-commerce trovi l'argilla per modellare, il tornio e tutti gli smalti per riprodurlo a casa!
                </p>
              </>
            ) : (
              <p className="commercial-text">
                Non hai applicato alcuno smalto. Il tuo vaso è in <strong>Argilla Terracotta grezza</strong>. Sul nostro e-commerce trovi il panetto di argilla per modellare e il tornio per iniziare!
              </p>
            )}
            <a 
              href="https://cerama.shop/shop/strumenti/kit-creativi/?ref=tornio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="commercial-link"
              style={{ marginTop: '12px', display: 'flex' }}
            >
              <span>Esplora i Kit Creativi</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
