/**
 * src/components/3d/DigitalTwinCanvas.jsx
 * ---------------------------------------
 * Ultra-Premium 2026 Commercial Automotive 3D Digital Twin Viewport.
 *
 * Visual & Engineering Capabilities:
 * 1. Dark Automotive Studio Environment: ACESFilmic tonemapping, soft volumetric key light,
 *    subtle ambient bounce, and dramatic rim/kicker lighting tracing metallic pack edges.
 * 2. Precision Interaction: Raycasting cell picker, smooth camera lerping with cubic damping
 *    for macro cell zoom, module focus, and top-down CAD views.
 * 3. Cinematic Landing Sequence: Optional skippable 1.8s lighting & camera dolly-in intro.
 * 4. Multi-Tier Exploded View Control: One-click toggle or continuous precision slider.
 * 5. Dynamic Telemetry HUD: Real-time charging power-flow banner, infrared thermal legend,
 *    floating glass metric chips, and AI agent intelligence card.
 * 6. WebGL hardware fallback screen & full responsive layout.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  RotateCcw,
  Flame,
  Boxes,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  AlertCircle,
  ShieldCheck,
  BatteryCharging,
  Thermometer,
  Zap,
  Cpu,
  Play,
  RotateCw,
  Camera,
  Activity,
  ArrowDown,
  ChevronRight,
  X
} from 'lucide-react';
import Battery3DModel from './Battery3DModel';
import VehicleChassis3D from './VehicleChassis3D';
import CellTooltipHUD from './CellTooltipHUD';
import AIDigitalTwinInsight from './AIDigitalTwinInsight';
import { soundEffects } from '../../utils/soundEffects';

export default function DigitalTwinCanvas({
  liveData,
  selectedCell,
  onSelectCell,
  height = 560,
  enableControls = true,
  reducedMotion = false,
  initialViewLayer = 'vehicle',
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  // Smooth camera interpolation targets
  const initialCamPos = initialViewLayer === 'vehicle'
    ? new THREE.Vector3(18.0, 9.5, 18.0)
    : new THREE.Vector3(8.5, 7.5, 10.5);
  const targetCamPosRef = useRef(initialCamPos);
  const targetCtrlTargetRef = useRef(new THREE.Vector3(0, 0.4, 0));
  const isTransitioningCamRef = useRef(false);

  const [sceneReady, setSceneReady] = useState(false);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Phase D: 3D View Layer Hierarchy ('vehicle' | 'chassis' | 'pack' | 'cell')
  const [viewLayer, setViewLayer] = useState(initialViewLayer);

  // 3D View Controls & Modes
  const [viewMode, setViewMode] = useState('thermal'); // 'thermal' | 'health' | 'realistic' | 'wireframe'
  const [explodedAmount, setExplodedAmount] = useState(0);
  const [isExploded, setIsExploded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [cameraPreset, setCameraPreset] = useState('iso');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [showAIInsight, setShowAIInsight] = useState(true);
  const [introActive, setIntroActive] = useState(false);

  // Check WebGL Support
  const checkWebGL = () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  };

  // Smooth Camera Transition helper
  const moveCameraTo = useCallback((posVector, targetVector) => {
    targetCamPosRef.current.copy(posVector);
    targetCtrlTargetRef.current.copy(targetVector);
    isTransitioningCamRef.current = true;
  }, []);

  // Phase D: View Layer Switcher with smooth cinematic lerping
  const handleLayerChange = useCallback((layer) => {
    soundEffects.playClick();
    setViewLayer(layer);
    if (layer === 'vehicle') {
      moveCameraTo(new THREE.Vector3(18.0, 9.5, 18.0), new THREE.Vector3(0, 0.4, 0));
      if (onSelectCell) onSelectCell(null);
    } else if (layer === 'chassis') {
      moveCameraTo(new THREE.Vector3(12.5, 6.5, 12.5), new THREE.Vector3(0, 0.2, 0));
      if (onSelectCell) onSelectCell(null);
    } else if (layer === 'pack') {
      moveCameraTo(new THREE.Vector3(8.5, 7.5, 10.5), new THREE.Vector3(0, 0.5, 0));
      if (onSelectCell) onSelectCell(null);
    } else if (layer === 'cell') {
      if (onSelectCell && !selectedCell) onSelectCell(1);
    }
  }, [moveCameraTo, onSelectCell, selectedCell]);

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    soundEffects.playClick();
    setCameraPreset('iso');
    setExplodedAmount(0);
    setIsExploded(false);
    if (onSelectCell) onSelectCell(null);
    if (viewLayer === 'vehicle') {
      moveCameraTo(new THREE.Vector3(18.0, 9.5, 18.0), new THREE.Vector3(0, 0.4, 0));
    } else if (viewLayer === 'chassis') {
      moveCameraTo(new THREE.Vector3(12.5, 6.5, 12.5), new THREE.Vector3(0, 0.2, 0));
    } else {
      moveCameraTo(new THREE.Vector3(8.5, 7.5, 10.5), new THREE.Vector3(0, 0.5, 0));
    }
  }, [onSelectCell, moveCameraTo, viewLayer]);

  // Exploded View Toggle
  const toggleExploded = useCallback(() => {
    soundEffects.playClick();
    const nextState = !isExploded;
    setIsExploded(nextState);
    setExplodedAmount(nextState ? 1.0 : 0);
  }, [isExploded]);

  // Handle cell selection camera focus
  useEffect(() => {
    if (!selectedCell) return;
    setViewLayer('cell');
    // Map 12 cells to 4 modules:
    const modIdx = Math.floor((selectedCell - 1) / 3);
    const cellInMod = (selectedCell - 1) % 3;
    const modX = (modIdx === 0 || modIdx === 1) ? -2.0 : 2.0;
    const modZ = (modIdx === 0 || modIdx === 2) ? -1.4 : 1.4;
    const cellX = modX + (cellInMod - 1) * 1.1;
    const cellZ = modZ;

    // Smooth camera macro dolly-in to inspect selected cell & busbar
    moveCameraTo(
      new THREE.Vector3(cellX + 2.2, 3.4, cellZ + 3.2),
      new THREE.Vector3(cellX, 1.2, cellZ)
    );
  }, [selectedCell, moveCameraTo]);

  // Handle Camera Presets
  useEffect(() => {
    if (selectedCell) return; // Selected cell focus takes precedence

    switch (cameraPreset) {
      case 'top':
        moveCameraTo(new THREE.Vector3(0, 15.5, 0.1), new THREE.Vector3(0, 0, 0));
        break;
      case 'module':
        moveCameraTo(new THREE.Vector3(0, 4.2, 7.5), new THREE.Vector3(0, 1.1, 0));
        break;
      case 'bms':
        moveCameraTo(new THREE.Vector3(0, 4.0, 7.8), new THREE.Vector3(0, 1.15, 3.1));
        break;
      case 'terminals':
        moveCameraTo(new THREE.Vector3(-6.8, 5.0, -4.2), new THREE.Vector3(-3.7, 2.0, -1.8));
        break;
      case 'iso':
      default:
        moveCameraTo(new THREE.Vector3(8.5, 7.5, 10.5), new THREE.Vector3(0, 0.5, 0));
        break;
    }
  }, [cameraPreset, selectedCell, moveCameraTo]);

  // ─────────────────────────────────────────────────────────────
  // THREE.JS SCENE, LIGHTING, RENDERER & CONTROLS SETUP
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!checkWebGL()) {
      setWebGlSupported(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const h = container.clientHeight || height;

    // 1. Scene & Atmosphere (Cinematic Dark Studio)
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.028);

    // 2. Perspective Camera (42 deg FOV for realistic product perspective)
    const camera = new THREE.PerspectiveCamera(42, width / h, 0.1, 100);
    camera.position.copy(targetCamPosRef.current);
    cameraRef.current = camera;

    // 3. WebGL Renderer (PBR, ACES Filmic, Soft Shadows)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Smooth OrbitControls (Luxurious Damping)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.maxDistance = 38;
    controls.minDistance = 2.8;
    controls.maxPolarAngle = Math.PI / 2 + 0.02; // prevent going below studio floor
    controls.target.copy(targetCtrlTargetRef.current);
    controlsRef.current = controls;

    // 5. Cinematic 3-Point Studio Lighting
    // Ambient Bounce
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    // Key Light: High-angle directional with soft shadows
    const keyLight = new THREE.DirectionalLight(0xdbeafe, 2.5);
    keyLight.position.set(10, 16, 9);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.radius = 2.5;
    scene.add(keyLight);

    // Fill Light: Soft cyan-blue fill from opposite side
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-10, 8, -8);
    scene.add(fillLight);

    // Rim / Kicker Light: Low-angled violet-cyan rim behind battery
    // Highlights the chamfered metallic edges of aluminum casing and cells
    const rimLight = new THREE.PointLight(0x00f0ff, 3.2, 22);
    rimLight.position.set(0, -1.2, -6);
    scene.add(rimLight);

    const secondaryRim = new THREE.PointLight(0xa855f7, 2.0, 18);
    secondaryRim.position.set(6, 1.0, -5);
    scene.add(secondaryRim);

    // 6. Reflective Studio Floor Grid & Contact Shadow
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      roughness: 0.85,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.5;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Engineering Precision Grid
    const gridHelper = new THREE.GridHelper(28, 28, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = -1.49;
    scene.add(gridHelper);

    // Concentric Turntable Measurement Rings
    const ringGeo1 = new THREE.RingGeometry(5.6, 5.66, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = -1.48;
    scene.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(8.2, 8.24, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = -1.48;
    scene.add(ring2);

    setSceneReady(true);

    // ─────────────────────────────────────────────────────────────
    // RAYCASTING FOR INTERACTIVE CELL HOVER & SELECTION
    // ─────────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = [];
      scene.traverse((child) => {
        if (child.isMesh && child.userData?.cellId) {
          meshes.push(child);
        }
      });

      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        const id = intersects[0].object.userData.cellId;
        setHoveredCell(id);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredCell(null);
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onClickCanvas = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = [];
      scene.traverse((child) => {
        if (child.isMesh && child.userData?.cellId) {
          meshes.push(child);
        }
      });

      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        const id = intersects[0].object.userData.cellId;
        soundEffects.playCellSelect();
        if (onSelectCell) {
          onSelectCell(id === selectedCell ? null : id);
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onClickCanvas);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: w, height: h_ } = entry.contentRect;
        if (w > 0 && h_ > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h_;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h_);
        }
      }
    });
    resizeObserver.observe(container);

    // ─────────────────────────────────────────────────────────────
    // RENDER LOOP & SMOOTH CAMERA LERP
    // ─────────────────────────────────────────────────────────────
    let animId;
    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);

      if (controlsRef.current && cameraRef.current) {
        // Smooth camera lerping when target changes
        if (isTransitioningCamRef.current) {
          cameraRef.current.position.lerp(targetCamPosRef.current, 0.08);
          controlsRef.current.target.lerp(targetCtrlTargetRef.current, 0.08);

          if (
            cameraRef.current.position.distanceTo(targetCamPosRef.current) < 0.04 &&
            controlsRef.current.target.distanceTo(targetCtrlTargetRef.current) < 0.04
          ) {
            isTransitioningCamRef.current = false;
          }
        }

        // Auto Turntable Orbit
        if (autoRotate && !reducedMotion) {
          const master = scene.getObjectByName('battery_pack_master');
          if (master) master.rotation.y += 0.005;
        } else {
          const master = scene.getObjectByName('battery_pack_master');
          if (master) master.rotation.y = 0;
        }

        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };
    renderLoop();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('click', onClickCanvas);
      renderer.dispose();
      container.replaceChildren();
    };
  }, [height]);

  // WebGL Fallback screen
  if (!webGlSupported) {
    return (
      <div
        className="glass-panel"
        style={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <AlertCircle size={36} color="#f59e0b" />
        <div style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', color: '#f8fafc' }}>
          3D HARDWARE ACCELERATION UNAVAILABLE
        </div>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: 450 }}>
          WebGL hardware acceleration is disabled in your browser. Telemetry data continues to stream in 2D mode.
        </p>
      </div>
    );
  }

  const isCharging = liveData?.charging_status === 'CHARGING' || (liveData?.current_a || 0) > 0.05;
  const powerKw = liveData?.power_w ? (liveData.power_w / 1000).toFixed(2) : ((liveData?.voltage_v || 14.8) * Math.abs(liveData?.current_a || 0) / 1000).toFixed(2);

  return (
    <div
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : height,
        zIndex: isFullscreen ? 9999 : 1,
        borderRadius: isFullscreen ? 0 : 16,
        overflow: 'hidden',
        background: '#030712',
        border: isFullscreen ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.85), inset 0 0 35px rgba(232, 255, 71, 0.02)',
      }}
    >
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* 3D Vehicle Skateboard Chassis & Ghost Body Shell Context (Phase D) */}
      {sceneReady && sceneRef.current && (
        <VehicleChassis3D
          scene={sceneRef.current}
          liveData={liveData}
          viewLayer={viewLayer}
          reducedMotion={reducedMotion}
        />
      )}

      {/* 3D Battery Model (Mounted inside Three.js scene - 12-Cell 4S3P Architecture) */}
      {sceneReady && sceneRef.current && (
        <Battery3DModel
          scene={sceneRef.current}
          liveData={liveData}
          selectedCell={selectedCell}
          onSelectCell={onSelectCell}
          hoveredCell={hoveredCell}
          setHoveredCell={setHoveredCell}
          viewMode={viewMode}
          explodedAmount={explodedAmount}
          showParticles={true}
          reducedMotion={reducedMotion}
        />
      )}

      {/* ── TOP LEFT FLOATING BRAND BADGE ──────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          pointerEvents: 'none',
          zIndex: 20,
        }}
      >
        <div className="glass-pill-badge" style={{ padding: '6px 14px', background: 'rgba(4, 4, 10, 0.88)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <div className="pulse-dot-signal" style={{ width: 6, height: 6 }} />
          <span style={{ fontFamily: 'Clash Display', fontWeight: 700, color: '#f0f0f8', letterSpacing: '0.04em', fontSize: '0.84rem' }}>
            BATTERY<span style={{ color: '#e8ff47' }}>TWIN</span>
          </span>
          <span style={{ color: '#9898b8', fontSize: '0.68rem', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
            LIVING 3D TWIN
          </span>
        </div>
      </div>

      {/* ── TOP CENTER 4-LAYER HIERARCHY SWITCHER (Phase D) ───────── */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(4, 4, 10, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 9999,
          padding: '3px 4px',
          gap: 3,
          zIndex: 25,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.65)',
        }}
      >
        {[
          { id: 'vehicle', label: '01 VEHICLE' },
          { id: 'chassis', label: '02 CHASSIS' },
          { id: 'pack', label: '03 BATTERY PACK' },
          { id: 'cell', label: '04 CELL LEVEL' },
        ].map((layer) => (
          <button
            key={layer.id}
            onClick={() => handleLayerChange(layer.id)}
            style={{
              padding: '5px 12px',
              fontSize: '0.68rem',
              fontFamily: 'JetBrains Mono',
              fontWeight: viewLayer === layer.id ? 700 : 500,
              color: viewLayer === layer.id ? '#04040a' : '#9898b8',
              background: viewLayer === layer.id ? '#e8ff47' : 'transparent',
              border: 'none',
              borderRadius: 9999,
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              letterSpacing: '0.04em',
            }}
            data-cursor="hover"
          >
            {layer.label}
          </button>
        ))}
      </div>

      {/* ── CINEMATIC CAMERA TRANSITION CTA: INSPECT BATTERY SYSTEM ── */}
      {(viewLayer === 'vehicle' || viewLayer === 'chassis') && (
        <button
          onClick={() => handleLayerChange('pack')}
          style={{
            position: 'absolute',
            top: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 16px',
            background: 'rgba(232, 255, 71, 0.12)',
            border: '1px solid rgba(232, 255, 71, 0.45)',
            borderRadius: 9999,
            color: '#e8ff47',
            fontFamily: 'JetBrains Mono',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(232, 255, 71, 0.15)',
            zIndex: 25,
            letterSpacing: '0.04em',
            transition: 'all 0.2s ease',
          }}
          data-cursor="hover"
        >
          <span>INSPECT BATTERY SYSTEM</span>
          <ArrowDown size={13} />
        </button>
      )}

      {/* ── TOP RIGHT LIVE TELEMETRY BADGE ────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          pointerEvents: 'none',
          zIndex: 20,
        }}
      >
        <div className="glass-pill-badge" style={{ padding: '6px 14px', background: 'rgba(4, 4, 10, 0.88)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <div className={isCharging ? 'pulse-dot-signal' : 'pulse-dot-emerald'} />
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: isCharging ? '#e8ff47' : '#10b981', fontWeight: 700 }}>
            ● {isCharging ? 'CHARGING' : 'LIVE'}
          </span>
          <span style={{ color: '#64748b', fontSize: '0.7rem' }}>
            {liveData?.battery_id || 'BATTERY_01'}
          </span>
        </div>
      </div>

      {/* ── CHARGING MODE FLOATING BANNER (When active) ────────────── */}
      {isCharging && (
        <div
          style={{
            position: 'absolute',
            top: 58,
            left: 20,
            background: 'rgba(8, 8, 18, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(232, 255, 71, 0.35)',
            borderRadius: 9999,
            padding: '7px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            zIndex: 20,
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7), 0 0 16px rgba(232, 255, 71, 0.1)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BatteryCharging size={15} color="#e8ff47" />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.74rem', fontWeight: 700, color: '#e8ff47', letterSpacing: '0.04em' }}>
              FAST CHARGING
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem', fontFamily: 'JetBrains Mono', color: '#f0f0f8' }}>
            <span>SOC: <strong style={{ color: '#e8ff47' }}>{liveData?.soc_percent?.toFixed(1) || 50}%</strong></span>
            <span>Power: <strong style={{ color: '#f0f0f8' }}>{powerKw} kW</strong></span>
            <span>Voltage: <strong style={{ color: '#f0f0f8' }}>{liveData?.voltage_v?.toFixed(2) || 14.8} V</strong></span>
            <span>Current: <strong style={{ color: '#10b981' }}>{Math.abs(liveData?.current_a || 0).toFixed(2)} A</strong></span>
          </div>
        </div>
      )}

      {/* ── AI DIGITAL TWIN INSIGHT OVERLAY ───────────────────────── */}
      {showAIInsight && (
        <AIDigitalTwinInsight
          liveData={liveData}
          selectedCell={selectedCell}
          onClose={() => setShowAIInsight(false)}
        />
      )}

      {/* ── MINIMAL FLOATING TELEMETRY (Phase D Specification) ─────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
          zIndex: 20,
          background: 'rgba(4, 4, 10, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          padding: '12px 16px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65)',
          minWidth: 210,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#9898b8', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
              BATTERY STATE
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e8ff47', fontFamily: 'JetBrains Mono' }}>
              {liveData?.soc_percent !== undefined ? `${liveData.soc_percent.toFixed(1)}% SOC` : '82.0% SOC'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.6rem', color: '#9898b8', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
              HEALTH
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981', fontFamily: 'JetBrains Mono' }}>
              {liveData?.soh_percent !== undefined ? `${liveData.soh_percent.toFixed(1)}% SOH` : '96.2% SOH'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.6rem', color: '#9898b8', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
              THERMAL
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>
              {liveData?.temperature_c !== undefined ? `${liveData.temperature_c.toFixed(1)}°C` : '31.4°C'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.6rem', color: '#9898b8', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
              POWER
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f0f8', fontFamily: 'JetBrains Mono' }}>
              {powerKw} kW
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.6rem', color: '#9898b8', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
              CELL STATUS
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f0f0f8', fontFamily: 'JetBrains Mono' }}>
              12 / 12 ONLINE
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.6rem', color: '#9898b8', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em' }}>
              AI STATUS
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e8ff47', fontFamily: 'JetBrains Mono' }}>
              MONITORING
            </div>
          </div>
        </div>
      </div>

      {/* ── THERMAL MAP GRADIENT LEGEND (Visible in Thermal Mode) ───── */}
      {viewMode === 'thermal' && (
        <div
          style={{
            position: 'absolute',
            bottom: 160,
            left: 20,
            width: 240,
            background: 'rgba(4, 4, 10, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 8,
            padding: '8px 12px',
            pointerEvents: 'none',
            zIndex: 20,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#9898b8', fontFamily: 'JetBrains Mono', marginBottom: 4 }}>
            <span>TEMPERATURE GRADIENT</span>
            <span style={{ color: '#f0f0f8', fontWeight: 700 }}>18°C — 55°C+</span>
          </div>
          <div className="thermal-legend-bar" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b', fontFamily: 'JetBrains Mono', marginTop: 3 }}>
            <span>Cool</span>
            <span>Normal</span>
            <span>Warm</span>
            <span>Hot</span>
            <span>Critical</span>
          </div>
        </div>
      )}

      {/* ── BOTTOM RIGHT FLOATING CONTROL BAR ────────────────────── */}
      {enableControls && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            background: 'rgba(8, 8, 18, 0.90)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 9999,
            padding: '6px 14px',
            pointerEvents: 'auto',
            boxShadow: '0 16px 40px rgba(0,0,0,0.75)',
            zIndex: 20,
            flexWrap: 'wrap',
          }}
        >
          {/* Render Mode Toggles */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button
              onClick={() => { soundEffects.playClick(); setViewMode('thermal'); }}
              className={`cyber-button ${viewMode === 'thermal' ? 'cyber-button-active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              title="Thermal Infrared Mode"
              data-cursor="hover"
            >
              <Flame size={12} color={viewMode === 'thermal' ? '#e8ff47' : '#f59e0b'} />
              Thermal
            </button>

            <button
              onClick={() => { soundEffects.playClick(); setViewMode('health'); }}
              className={`cyber-button ${viewMode === 'health' ? 'cyber-button-active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              title="Cell SOH Health Mode"
              data-cursor="hover"
            >
              <ShieldCheck size={12} color={viewMode === 'health' ? '#e8ff47' : '#10b981'} />
              Health
            </button>

            <button
              onClick={() => { soundEffects.playClick(); setViewMode('realistic'); }}
              className={`cyber-button ${viewMode === 'realistic' ? 'cyber-button-active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              title="Photorealistic PBR Engineering Metals"
              data-cursor="hover"
            >
              <Boxes size={12} color={viewMode === 'realistic' ? '#e8ff47' : '#9898b8'} />
              Solid PBR
            </button>

            <button
              onClick={() => { soundEffects.playClick(); setViewMode('wireframe'); }}
              className={`cyber-button ${viewMode === 'wireframe' ? 'cyber-button-active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              title="CAD Engineering Matrix"
              data-cursor="hover"
            >
              <Layers size={12} color={viewMode === 'wireframe' ? '#e8ff47' : '#9898b8'} />
              CAD
            </button>
          </div>

          <div style={{ width: 1, height: 18, background: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Exploded View Toggle & Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={toggleExploded}
              className={`cyber-button ${isExploded ? 'cyber-button-active' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              title="Toggle Multi-Tier Exploded Disassembly"
              data-cursor="hover"
            >
              <Layers size={12} />
              {isExploded ? 'Exploded' : 'Exploded View'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={explodedAmount}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setExplodedAmount(val);
                setIsExploded(val > 0.05);
              }}
              style={{ width: 56, accentColor: '#e8ff47', cursor: 'pointer' }}
              title={`Disassembly Spread: ${Math.round(explodedAmount * 100)}%`}
            />
          </div>

          <div style={{ width: 1, height: 18, background: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Camera Presets Menu */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button
              onClick={() => { soundEffects.playClick(); setCameraPreset('iso'); }}
              className={`cyber-button ${cameraPreset === 'iso' ? 'cyber-button-active' : ''}`}
              style={{ padding: '4px 8px', fontSize: '0.7rem' }}
              title="Isometric Perspective"
              data-cursor="hover"
            >
              Iso
            </button>
            <button
              onClick={() => { soundEffects.playClick(); setCameraPreset('top'); }}
              className={`cyber-button ${cameraPreset === 'top' ? 'cyber-button-active' : ''}`}
              style={{ padding: '4px 8px', fontSize: '0.7rem' }}
              title="Top-Down CAD View"
              data-cursor="hover"
            >
              Top
            </button>
            <button
              onClick={() => { soundEffects.playClick(); setCameraPreset('module'); }}
              className={`cyber-button ${cameraPreset === 'module' ? 'cyber-button-active' : ''}`}
              style={{ padding: '4px 8px', fontSize: '0.7rem' }}
              title="Module Cross-Section View"
              data-cursor="hover"
            >
              Module
            </button>
            <button
              onClick={() => { soundEffects.playClick(); setCameraPreset('bms'); }}
              className={`cyber-button ${cameraPreset === 'bms' ? 'cyber-button-active' : ''}`}
              style={{ padding: '4px 8px', fontSize: '0.7rem' }}
              title="BMS Electronics & Contactor View"
              data-cursor="hover"
            >
              BMS
            </button>
          </div>

          <div style={{ width: 1, height: 18, background: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Turntable Auto-Rotate */}
          <button
            onClick={() => { soundEffects.playClick(); setAutoRotate(!autoRotate); }}
            className={`cyber-button ${autoRotate ? 'cyber-button-active' : ''}`}
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
            title="Toggle Cinematic Turntable Auto-Rotation"
            data-cursor="hover"
          >
            <RotateCw size={13} color={autoRotate ? '#e8ff47' : '#9898b8'} />
          </button>

          {/* AI Insight Overlay Toggle */}
          <button
            onClick={() => { soundEffects.playClick(); setShowAIInsight(!showAIInsight); }}
            className={`cyber-button ${showAIInsight ? 'cyber-button-active' : ''}`}
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
            title="Toggle AI Digital Twin Insight"
            data-cursor="hover"
          >
            <Cpu size={13} color={showAIInsight ? '#e8ff47' : '#9898b8'} />
          </button>

          {/* Reset Camera Focus */}
          <button
            onClick={handleResetCamera}
            className="cyber-button"
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
            title="Reset Camera to Hero Angle"
            data-cursor="hover"
          >
            <RotateCcw size={13} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => { soundEffects.playClick(); setIsFullscreen(!isFullscreen); }}
            className="cyber-button"
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen 3D'}
            data-cursor="hover"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      )}

      {/* Selected Cell Floating HUD Tooltip */}
      <CellTooltipHUD
        selectedCell={selectedCell}
        liveData={liveData}
        onClose={() => onSelectCell(null)}
      />
    </div>
  );
}
