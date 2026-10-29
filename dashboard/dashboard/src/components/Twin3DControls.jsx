/**
 * Twin3DControls.jsx
 * ------------------
 * Interactive HUD toolbar overlay for the 3D Three.js Digital Twin.
 */

import React from 'react';
import {
  Flame,
  Layers,
  Eye,
  RotateCw,
  Maximize2,
  Minimize2,
  Sparkles,
  Camera,
  Boxes,
  HelpCircle
} from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

export default function Twin3DControls({
  viewMode,
  setViewMode,
  explodedAmount,
  setExplodedAmount,
  showParticles,
  setShowParticles,
  autoRotate,
  setAutoRotate,
  cameraPreset,
  setCameraPreset,
  isFullscreen,
  setIsFullscreen,
  selectedCell,
  setSelectedCell,
}) {
  const handleModeChange = (mode) => {
    soundEffects.playClick();
    setViewMode(mode);
  };

  const handleCameraChange = (preset) => {
    soundEffects.playClick();
    setCameraPreset(preset);
  };

  const toggleAutoRotate = () => {
    soundEffects.playClick();
    setAutoRotate(!autoRotate);
  };

  const toggleParticles = () => {
    soundEffects.playClick();
    setShowParticles(!showParticles);
  };

  const toggleFullscreen = () => {
    soundEffects.playClick();
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        pointerEvents: 'none', // let clicks through except buttons
        zIndex: 20,
      }}
    >
      {/* Left HUD: Render Modes & Camera Presets */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 10,
          padding: '4px 8px',
          pointerEvents: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginRight: 4, fontFamily: 'Rajdhani' }}>
          VIEW MODE:
        </span>
        
        <button
          onClick={() => handleModeChange('thermal')}
          className={`cyber-button ${viewMode === 'thermal' ? 'cyber-button-active' : ''}`}
          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          title="Thermal Heatmap View"
        >
          <Flame size={13} color={viewMode === 'thermal' ? '#00f0ff' : '#f97316'} />
          Thermal
        </button>

        <button
          onClick={() => handleModeChange('realistic')}
          className={`cyber-button ${viewMode === 'realistic' ? 'cyber-button-active' : ''}`}
          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          title="Realistic Lithium Casing View"
        >
          <Boxes size={13} color={viewMode === 'realistic' ? '#00f0ff' : '#94a3b8'} />
          Solid
        </button>

        <button
          onClick={() => handleModeChange('wireframe')}
          className={`cyber-button ${viewMode === 'wireframe' ? 'cyber-button-active' : ''}`}
          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          title="Holographic Wireframe Mode"
        >
          <Layers size={13} color={viewMode === 'wireframe' ? '#00f0ff' : '#94a3b8'} />
          Matrix
        </button>

        <div style={{ width: 1, height: 16, background: '#1e293b', margin: '0 4px' }} />

        {/* Camera Presets */}
        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginRight: 4, fontFamily: 'Rajdhani' }}>
          CAMERA:
        </span>

        <button
          onClick={() => handleCameraChange('iso')}
          className={`cyber-button ${cameraPreset === 'iso' ? 'cyber-button-active' : ''}`}
          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
        >
          Iso
        </button>

        <button
          onClick={() => handleCameraChange('top')}
          className={`cyber-button ${cameraPreset === 'top' ? 'cyber-button-active' : ''}`}
          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
        >
          Top
        </button>

        <button
          onClick={() => handleCameraChange('bms')}
          className={`cyber-button ${cameraPreset === 'bms' ? 'cyber-button-active' : ''}`}
          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
        >
          BMS
        </button>
      </div>

      {/* Right HUD: Exploded View Slider & Canvas Toggles */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 10,
          padding: '4px 10px',
          pointerEvents: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* Exploded Disassembly Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, fontFamily: 'Rajdhani' }}>
            EXPLODE: {Math.round(explodedAmount * 100)}%
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodedAmount}
            onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
            style={{
              width: 75,
              accentColor: '#00f0ff',
              cursor: 'pointer',
            }}
          />
        </div>

        <div style={{ width: 1, height: 16, background: '#1e293b' }} />

        {/* Particles Toggle */}
        <button
          onClick={toggleParticles}
          className={`cyber-button ${showParticles ? 'cyber-button-active' : ''}`}
          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
          title="Toggle Electron Flow Particles"
        >
          <Sparkles size={13} color={showParticles ? '#00f0ff' : '#64748b'} />
        </button>

        {/* Auto Rotate Toggle */}
        <button
          onClick={toggleAutoRotate}
          className={`cyber-button ${autoRotate ? 'cyber-button-active' : ''}`}
          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
          title="Toggle Auto-Orbit"
        >
          <RotateCw size={13} color={autoRotate ? '#00f0ff' : '#64748b'} />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="cyber-button"
          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D View'}
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>

        {/* Cell selection indicator */}
        {selectedCell && (
          <button
            onClick={() => setSelectedCell(null)}
            className="cyber-button cyber-button-danger"
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
          >
            Clear Cell #{selectedCell} ✕
          </button>
        )}
      </div>
    </div>
  );
}
