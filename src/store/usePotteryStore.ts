import { create } from 'zustand';
import { generateInitialProfile, gaussianInfluence, smoothProfile } from '../utils/math';

export type Step = 'intro' | 'shape' | 'glaze' | 'share';
export type BaseShape = 'cylinder' | 'sphere' | 'cone' | 'urn';
export type GlazeFinish = 'glossy' | 'matte' | 'satin' | 'metallic';

export interface GlazePreset {
  id: string;
  name: string;
  code: string;
  color: string;
  finish: GlazeFinish;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  crackle: boolean;
  speckled: boolean;
  price: string;
  description: string;
  shopUrl: string;
}

export const GLAZE_PRESETS: GlazePreset[] = [
  {
    id: 'tangerine',
    name: 'Tangerine',
    code: 'Bellissimo Colorobbia',
    color: '#f37021',
    finish: 'glossy',
    roughness: 0.05,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    crackle: false,
    speckled: false,
    price: '€8.90',
    description: 'Smalto liquido arancione mandarino brillante ad alta coprenza. Finitura vitrea lucida e vivace per creazioni energiche.',
    shopUrl: 'https://cerama.shop/shop/smalti-liquidi/bellissimo-colorobbia/prodotto/tangerine/?attribute_formato=236+ml&ref=tornio'
  },
  {
    id: 'carolina-blue',
    name: 'Carolina Blue',
    code: 'Bellissimo Colorobbia',
    color: '#8cb5e2',
    finish: 'glossy',
    roughness: 0.05,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    crackle: false,
    speckled: false,
    price: '€8.90',
    description: 'Smalto azzurro cielo morbido e rilassante, tipico della tradizione ceramica classica. Eccellente stendibilità e lucentezza.',
    shopUrl: 'https://cerama.shop/shop/smalti-liquidi/bellissimo-colorobbia/prodotto/carolina-blue/?attribute_formato=236+ml&ref=tornio'
  },
  {
    id: 'sunny-tuscany',
    name: 'Sunny Tuscany',
    code: 'Bellissimo Colorobbia',
    color: '#f5c647',
    finish: 'glossy',
    roughness: 0.05,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    crackle: false,
    speckled: false,
    price: '€8.90',
    description: 'Un giallo caldo e profondo che evoca i campi di grano e i paesaggi assolati della Toscana. Colore luminoso e uniforme.',
    shopUrl: 'https://cerama.shop/shop/smalti-liquidi/bellissimo-colorobbia/prodotto/sunny-tuscany/?attribute_formato=236+ml&ref=tornio'
  },
  {
    id: 'orange-sorbet',
    name: 'Orange Sorbet',
    code: 'Bellissimo Colorobbia',
    color: '#fda766',
    finish: 'glossy',
    roughness: 0.05,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    crackle: false,
    speckled: false,
    price: '€8.90',
    description: 'Smalto color arancio pastello delicato e cremoso. Perfetto per finiture morbide e accostamenti primaverili sobri.',
    shopUrl: 'https://cerama.shop/shop/smalti-liquidi/bellissimo-colorobbia/prodotto/orange-sorbet/?attribute_formato=236+ml&ref=tornio'
  },
  {
    id: 'pistachio',
    name: 'Pistachio',
    code: 'Bellissimo Colorobbia',
    color: '#9ac87a',
    finish: 'glossy',
    roughness: 0.05,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    crackle: false,
    speckled: false,
    price: '€8.90',
    description: 'Smalto verde pistacchio chiaro e fresco. Regala un tocco biologico e naturale a vasi e stoviglie con una superficie vetrosa specchiante.',
    shopUrl: 'https://cerama.shop/shop/smalti-liquidi/bellissimo-colorobbia/prodotto/pistachio/?attribute_formato=236+ml&ref=tornio'
  },
  {
    id: 'blue-isle',
    name: 'Blue Isle',
    code: 'Bellissimo Colorobbia',
    color: '#0093a8',
    finish: 'glossy',
    roughness: 0.05,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    crackle: false,
    speckled: false,
    price: '€8.90',
    description: 'Un azzurro turchese intenso e caraibico che ricorda le acque cristalline delle isole. Effetto profondità straordinario.',
    shopUrl: 'https://cerama.shop/shop/smalti-liquidi/bellissimo-colorobbia/prodotto/blue-isle/?attribute_formato=236+ml&ref=tornio'
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    code: 'Bellissimo Colorobbia',
    color: '#1c2841',
    finish: 'glossy',
    roughness: 0.05,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    crackle: false,
    speckled: false,
    price: '€8.90',
    description: 'Smalto blu notte profondo, elegante e magnetico. Ideale per un design raffinato che cattura la luce con riflessi vitrei scuri.',
    shopUrl: 'https://cerama.shop/shop/smalti-liquidi/bellissimo-colorobbia/prodotto/midnight-blue/?attribute_formato=236+ml&ref=tornio'
  }
];

export const N_POINTS = 40;
export const VASE_HEIGHT = 2.0;
export const CLAY_TERRACOTTA = '#a56251'; // Base clay red color

export interface HistoryEntry {
  radii: number[];
  glazeColors: string[];
  glazeIntensity: number[];
}

/**
 * Linearly interpolates (mixes) two hex colors
 */
function lerpColor(c1: string, c2: string, amount: number): string {
  const r1 = parseInt(c1.substring(1, 3), 16);
  const g1 = parseInt(c1.substring(3, 5), 16);
  const b1 = parseInt(c1.substring(5, 7), 16);

  const r2 = parseInt(c2.substring(1, 3), 16);
  const g2 = parseInt(c2.substring(3, 5), 16);
  const b2 = parseInt(c2.substring(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * amount);
  const g = Math.round(g1 + (g2 - g1) * amount);
  const b = Math.round(b1 + (b2 - b1) * amount);

  const rHex = Math.max(0, Math.min(255, r)).toString(16).padStart(2, '0');
  const gHex = Math.max(0, Math.min(255, g)).toString(16).padStart(2, '0');
  const bHex = Math.max(0, Math.min(255, b)).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

interface PotteryState {
  // Navigation & Flow
  step: Step;
  setStep: (step: Step) => void;
  
  // Base Shape Settings
  baseShape: BaseShape;
  setBaseShape: (shape: BaseShape) => void;
  
  // Pottery Geometry
  radii: number[];
  setRadii: (radii: number[]) => void;
  deformProfile: (yHit: number, targetRadius: number, speed: number, dt: number) => void;
  smoothVase: () => void;
  resetVase: () => void;

  // Painting Glazes
  glazeColors: string[];
  setGlazeColors: (colors: string[]) => void;
  glazeIntensity: number[];
  setGlazeIntensity: (intensity: number[]) => void;
  paintColor: (yHit: number, color: string, brushSize: number, strength: number, dt: number) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;

  // History (Undo/Redo snapshots for both radii and colors)
  history: HistoryEntry[];
  historyIndex: number;
  pushHistory: (customEntry?: Partial<HistoryEntry>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Glaze Properties
  selectedGlaze: GlazePreset;
  selectGlaze: (glazeId: string) => void;

  // Metadata
  vaseName: string;
  setVaseName: (name: string) => void;
  exportImage: string | null;
  setExportImage: (image: string | null) => void;
  wheelSpeed: number;
  setWheelSpeed: (speed: number) => void;

  // Playback/Interactions count
  interactionCount: number;
  incrementInteraction: () => void;
}

export const usePotteryStore = create<PotteryState>((set, get) => {
  const initialRadii = generateInitialProfile('cylinder', N_POINTS);
  const initialColors = Array(N_POINTS).fill(CLAY_TERRACOTTA);
  const initialIntensity = Array(N_POINTS).fill(0.0);
  
  return {
    step: 'intro',
    setStep: (step) => {
      // Speed up wheel for shaping, slow it down for coloring and freeze/stabilize for share
      let wheelSpeed = 2.0;
      if (step === 'glaze') wheelSpeed = 0.8;
      if (step === 'share') wheelSpeed = 0.05; // extremely slow/aesthetic rotation
      if (step === 'intro') wheelSpeed = 2.5;

      set({ step, wheelSpeed });
    },

    baseShape: 'cylinder',
    setBaseShape: (baseShape) => {
      const newRadii = generateInitialProfile(baseShape, N_POINTS);
      const newColors = Array(N_POINTS).fill(CLAY_TERRACOTTA);
      const newIntensity = Array(N_POINTS).fill(0.0);
      const entry: HistoryEntry = { radii: newRadii, glazeColors: newColors, glazeIntensity: newIntensity };
      set({ 
        baseShape, 
        radii: newRadii, 
        glazeColors: newColors,
        glazeIntensity: newIntensity,
        history: [entry], 
        historyIndex: 0 
      });
    },

    radii: initialRadii,
    setRadii: (radii) => set({ radii }),

    deformProfile: (yHit, targetRadius, speed, dt) => {
      const { radii } = get();
      const nextRadii = [...radii];
      const sigma = 0.22; // brush size

      // Enforce bounds to prevent ugly collapsing/blowing up
      const minRadius = 0.16;
      const maxRadius = 0.75;
      const boundedTarget = Math.max(minRadius, Math.min(maxRadius, targetRadius));

      let changed = false;
      for (let i = 0; i < N_POINTS; i++) {
        const y = (i / (N_POINTS - 1)) * VASE_HEIGHT;
        const influence = gaussianInfluence(y, yHit, sigma);
        
        if (influence > 0.005) {
          // Easing factor to feel like viscous clay
          const diff = boundedTarget - nextRadii[i];
          nextRadii[i] += diff * influence * speed * dt * 8.0;
          
          // Clamp individually
          nextRadii[i] = Math.max(minRadius, Math.min(maxRadius, nextRadii[i]));
          changed = true;
        }
      }

      if (changed) {
        // Apply very subtle continuous smoothing during shaping to keep surface organic
        const smoothed = smoothProfile(nextRadii, 0.02, true);
        set({ radii: smoothed });
      }
    },

    smoothVase: () => {
      const { radii } = get();
      // Stronger smoothing pass on request
      const smoothed = smoothProfile(radii, 0.25, false);
      get().pushHistory({ radii: smoothed });
    },

    resetVase: () => {
      const { step, baseShape } = get();
      if (step === 'glaze') {
        // Reset paint back to raw clay base
        const freshColors = Array(N_POINTS).fill(CLAY_TERRACOTTA);
        const freshIntensity = Array(N_POINTS).fill(0.0);
        get().pushHistory({ glazeColors: freshColors, glazeIntensity: freshIntensity });
      } else {
        // Reset clay shapes
        const freshRadii = generateInitialProfile(baseShape, N_POINTS);
        get().pushHistory({ radii: freshRadii });
      }
    },

    // Painting Glazes
    glazeColors: initialColors,
    setGlazeColors: (glazeColors) => set({ glazeColors }),
    glazeIntensity: initialIntensity,
    setGlazeIntensity: (glazeIntensity) => set({ glazeIntensity }),
    
    paintColor: (yHit, color, brushSize, strength, dt) => {
      const { glazeColors, glazeIntensity } = get();
      const nextColors = [...glazeColors];
      const nextIntensity = [...glazeIntensity];
      const boundedStrength = Math.max(0.0, Math.min(1.0, strength));
      
      let changed = false;
      for (let i = 0; i < N_POINTS; i++) {
        const y = (i / (N_POINTS - 1)) * VASE_HEIGHT;
        const influence = gaussianInfluence(y, yHit, brushSize);
        
        if (influence > 0.005) {
          // Blending factor using time delta, strength, and local Gaussian influence
          const blendFactor = Math.min(1.0, influence * boundedStrength * dt * 10.0);
          
          nextColors[i] = lerpColor(nextColors[i], color, blendFactor);
          nextIntensity[i] = Math.min(1.0, nextIntensity[i] + (1.0 - nextIntensity[i]) * blendFactor);
          
          changed = true;
        }
      }

      if (changed) {
        set({ glazeColors: nextColors, glazeIntensity: nextIntensity });
      }
    },

    brushSize: 0.15,
    setBrushSize: (brushSize) => set({ brushSize }),

    // History (Undo/Redo snapshots for both radii, colors, and intensity)
    history: [{ radii: initialRadii, glazeColors: initialColors, glazeIntensity: initialIntensity }],
    historyIndex: 0,
    
    pushHistory: (customEntry) => {
      const { radii, glazeColors, glazeIntensity, history, historyIndex } = get();
      
      // Combine values to form a complete history snapshot
      const snapRadii = customEntry?.radii ? customEntry.radii : [...radii];
      const snapColors = customEntry?.glazeColors ? customEntry.glazeColors : [...glazeColors];
      const snapIntensity = customEntry?.glazeIntensity ? customEntry.glazeIntensity : [...glazeIntensity];
      const entryToPush: HistoryEntry = { radii: snapRadii, glazeColors: snapColors, glazeIntensity: snapIntensity };

      // Overwrite any forward redo history
      const newHistory = history.slice(0, historyIndex + 1);
      
      // Avoid pushing exact duplicates
      const lastState = newHistory[newHistory.length - 1];
      if (lastState && 
          lastState.radii.every((r, idx) => r === entryToPush.radii[idx]) && 
          lastState.glazeColors.every((c, idx) => c === entryToPush.glazeColors[idx]) &&
          lastState.glazeIntensity.every((inty, idx) => inty === entryToPush.glazeIntensity[idx])) {
        return;
      }

      set({
        radii: entryToPush.radii,
        glazeColors: entryToPush.glazeColors,
        glazeIntensity: entryToPush.glazeIntensity,
        history: [...newHistory, entryToPush],
        historyIndex: newHistory.length
      });
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        const snapshot = history[nextIndex];
        set({
          historyIndex: nextIndex,
          radii: [...snapshot.radii],
          glazeColors: [...snapshot.glazeColors],
          glazeIntensity: [...snapshot.glazeIntensity]
        });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        const snapshot = history[nextIndex];
        set({
          historyIndex: nextIndex,
          radii: [...snapshot.radii],
          glazeColors: [...snapshot.glazeColors],
          glazeIntensity: [...snapshot.glazeIntensity]
        });
      }
    },

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    selectedGlaze: GLAZE_PRESETS[0],
    selectGlaze: (glazeId) => {
      const preset = GLAZE_PRESETS.find(g => g.id === glazeId);
      if (preset) {
        set({ selectedGlaze: preset });
      }
    },

    vaseName: 'Vaso Armonico',
    setVaseName: (vaseName) => set({ vaseName }),
    exportImage: null,
    setExportImage: (exportImage) => set({ exportImage }),
    wheelSpeed: 2.0,
    setWheelSpeed: (wheelSpeed) => set({ wheelSpeed }),

    interactionCount: 0,
    incrementInteraction: () => set((state) => ({ interactionCount: state.interactionCount + 1 }))
  };
});
