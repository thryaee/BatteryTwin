/**
 * ThreeBatteryTwin.jsx
 * --------------------
 * High-performance, fully interactive 3D Digital Twin of a Modular Li-Ion Battery Pack.
 * Photorealistic PBR engineering materials (brushed aluminum, copper busbars, smoked acrylic,
 * metallic cell canisters, BMS PCB board with active LEDs).
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { soundEffects } from '../utils/soundEffects';

// Color gradient mapper for Thermal Heatmap Mode
function getThermalColor(tempC) {
  const t = Math.max(18, Math.min(55, tempC));
  const norm = (t - 18) / 37;

  const color = new THREE.Color();
  if (norm < 0.25) {
    const f = norm / 0.25;
    color.setRGB(0.1 + 0.1 * f, 0.7 + 0.3 * f, 0.9 - 0.5 * f);
  } else if (norm < 0.6) {
    const f = (norm - 0.25) / 0.35;
    color.setRGB(0.2 + 0.75 * f, 0.9 - 0.25 * f, 0.2 - 0.2 * f);
  } else {
    const f = Math.min(1.0, (norm - 0.6) / 0.4);
    color.setRGB(0.95 + 0.05 * f, 0.65 - 0.55 * f, 0.05);
  }
  return color;
}

export default function ThreeBatteryTwin({
  liveData,
  selectedCell,
  onSelectCell,
  viewMode = 'thermal', // 'thermal' | 'health' | 'realistic' | 'wireframe'
  explodedAmount = 0,    // 0.0 to 1.0
  showParticles = true,
  autoRotate = false,
  cameraPreset = 'iso', // 'iso' | 'top' | 'bms' | 'terminals'
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const cellsRef = useRef([]);
  const animFrameRef = useRef(null);
  const particlesRef = useRef(null);
  const particleGeoRef = useRef(null);
  const bmsLedsRef = useRef([]);
  const coverMeshRef = useRef(null);
  const trayMeshRef = useRef(null);
  const busbarsGroupRef = useRef(null);
  const bmsGroupRef = useRef(null);

  const explodedRef = useRef(explodedAmount);
  const explodedTargetRef = useRef(explodedAmount);
  const hoveredCellRef = useRef(null);

  // Sync exploded target ref
  useEffect(() => {
    explodedTargetRef.current = explodedAmount;
  }, [explodedAmount]);

  // Handle camera presets
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (cameraPreset) {
      case 'top':
        cam.position.set(0, 15, 0.1);
        ctrl.target.set(0, 0, 0);
        break;
      case 'bms':
        cam.position.set(0, 4.5, 8.5);
        ctrl.target.set(0, 1.0, 2.8);
        break;
      case 'terminals':
        cam.position.set(-6.5, 5.0, -4.5);
        ctrl.target.set(-3.2, 1.2, -2.0);
        break;
      case 'iso':
      default:
        cam.position.set(8.5, 7.5, 10.5);
        ctrl.target.set(0, 0.5, 0);
        break;
    }
    ctrl.update();
  }, [cameraPreset]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.03);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(8.5, 7.5, 10.5);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 24;
    controls.minDistance = 3.2;
    controls.maxPolarAngle = Math.PI / 2 + 0.04;
    controls.target.set(0, 0.5, 0);
    controlsRef.current = controls;

    // 5. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainKey = new THREE.DirectionalLight(0xdbeafe, 2.4);
    mainKey.position.set(10, 16, 9);
    mainKey.castShadow = true;
    mainKey.shadow.mapSize.width = 1024;
    mainKey.shadow.mapSize.height = 1024;
    scene.add(mainKey);

    const fillLight = new THREE.DirectionalLight(0x00f0ff, 1.3);
    fillLight.position.set(-10, 8, -8);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xa855f7, 2.8, 20);
    rimLight.position.set(0, -1.5, 6);
    scene.add(rimLight);

    // 6. Holographic Floor Grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = -1.5;
    scene.add(gridHelper);

    const ringGeo = new THREE.RingGeometry(5.4, 5.48, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.22 });
    const floorRing = new THREE.Mesh(ringGeo, ringMat);
    floorRing.rotation.x = Math.PI / 2;
    floorRing.position.y = -1.49;
    scene.add(floorRing);

    // ── Build Battery Pack Model ──────────────────────────────────
    const batteryGroup = new THREE.Group();
    batteryGroup.name = 'battery_pack';
    scene.add(batteryGroup);

    // Base Aluminum Tray
    const trayGeo = new THREE.BoxGeometry(8.0, 0.5, 6.0);
    const trayMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.22,
    });
    const trayMesh = new THREE.Mesh(trayGeo, trayMat);
    trayMesh.position.y = -0.38;
    trayMesh.receiveShadow = true;
    trayMesh.castShadow = true;
    batteryGroup.add(trayMesh);
    trayMeshRef.current = trayMesh;

    // Acrylic Smoked Glass Top Cover
    const coverGeo = new THREE.BoxGeometry(7.9, 0.2, 5.9);
    const coverMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.1,
      roughness: 0.08,
      transmission: 0.88,
      thickness: 0.6,
      transparent: true,
      opacity: 0.42,
      reflectivity: 0.95,
    });
    const coverMesh = new THREE.Mesh(coverGeo, coverMat);
    coverMesh.position.y = 2.55;
    batteryGroup.add(coverMesh);
    coverMeshRef.current = coverMesh;

    // 12 Cylindrical Li-Ion Cells (4x3 matrix)
    const cellRadius = 0.58;
    const cellHeight = 2.2;
    const cellGeo = new THREE.CylinderGeometry(cellRadius, cellRadius, cellHeight, 32);
    const capGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.14, 20);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.95, roughness: 0.1 });
    const crimpMat = new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 0.8 });

    const cellList = [];
    const cols = 4;
    const rows = 3;
    const spacingX = 1.6;
    const spacingZ = 1.55;
    const startX = -((cols - 1) * spacingX) / 2;
    const startZ = -((rows - 1) * spacingZ) / 2;

    let cellIndex = 1;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const cellGroup = new THREE.Group();
        const posX = startX + c * spacingX;
        const posZ = startZ + r * spacingZ;
        const basePosY = 1.0;

        cellGroup.position.set(posX, basePosY, posZ);
        cellGroup.userData = {
          cellId: cellIndex,
          col: c,
          row: r,
          baseX: posX,
          baseY: basePosY,
          baseZ: posZ,
          tempVariation: Math.sin(c * 1.5 + r * 2.1) * 2.5,
          voltageVariation: Math.cos(c * 2.0 + r) * 0.016,
        };

        const cellMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          metalness: 0.7,
          roughness: 0.25,
          emissive: 0x083344,
          emissiveIntensity: 0.2,
        });
        const cellMesh = new THREE.Mesh(cellGeo, cellMat);
        cellMesh.castShadow = true;
        cellMesh.receiveShadow = true;
        cellMesh.userData = { parentGroup: cellGroup, cellId: cellIndex };
        cellGroup.add(cellMesh);

        const capMesh = new THREE.Mesh(capGeo, capMat);
        capMesh.position.y = cellHeight / 2 + 0.07;
        cellGroup.add(capMesh);

        const ringMesh = new THREE.Mesh(
          new THREE.TorusGeometry(cellRadius * 0.88, 0.035, 8, 24),
          crimpMat
        );
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = cellHeight / 2;
        cellGroup.add(ringMesh);

        batteryGroup.add(cellGroup);
        cellList.push({ group: cellGroup, mesh: cellMesh, id: cellIndex });
        cellIndex++;
      }
    }
    cellsRef.current = cellList;

    // Copper Busbars
    const busbarsGroup = new THREE.Group();
    const busbarMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15,
    });
    for (let c = 0; c < cols; c++) {
      const busbarGeo = new THREE.BoxGeometry(0.4, 0.06, (rows - 1) * spacingZ + 0.85);
      const busbarMesh = new THREE.Mesh(busbarGeo, busbarMat);
      busbarMesh.position.set(startX + c * spacingX, 2.25, 0);
      busbarsGroup.add(busbarMesh);
    }
    batteryGroup.add(busbarsGroup);
    busbarsGroupRef.current = busbarsGroup;

    // BMS PCB Board
    const bmsGroup = new THREE.Group();
    const pcbGeo = new THREE.BoxGeometry(7.2, 1.3, 0.12);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      metalness: 0.35,
      roughness: 0.4,
    });
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.position.set(0, 1.0, 2.85);
    bmsGroup.add(pcbMesh);

    const icGeo = new THREE.BoxGeometry(0.9, 0.9, 0.1);
    const icMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2 });
    const icMesh = new THREE.Mesh(icGeo, icMat);
    icMesh.position.set(-2.2, 1.0, 2.93);
    bmsGroup.add(icMesh);

    const leds = [];
    const ledColors = [0x10b981, 0x00f0ff, 0xf59e0b, 0xef4444];
    for (let i = 0; i < 4; i++) {
      const ledGeo = new THREE.BoxGeometry(0.12, 0.12, 0.06);
      const ledMat = new THREE.MeshBasicMaterial({ color: ledColors[i] });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.set(0.6 + i * 0.45, 1.0, 2.93);
      bmsGroup.add(ledMesh);
      leds.push({ mesh: ledMesh, baseColor: ledColors[i] });
    }
    bmsLedsRef.current = leds;
    batteryGroup.add(bmsGroup);
    bmsGroupRef.current = bmsGroup;

    // Power Terminals
    const termGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.7, 16);
    const posMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.85, roughness: 0.15 });
    const negMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.15 });

    const posTerm = new THREE.Mesh(termGeo, posMat);
    posTerm.position.set(-3.4, 2.55, -2.2);
    batteryGroup.add(posTerm);

    const negTerm = new THREE.Mesh(termGeo, negMat);
    negTerm.position.set(-3.4, 2.55, 2.2);
    batteryGroup.add(negTerm);

    // Electron Particles
    const particleCount = 400;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pSpeed = new Float32Array(particleCount);
    const pAngle = new Float32Array(particleCount);
    const pRadius = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 2.7 + Math.random() * 3.0;
      const y = -0.4 + Math.random() * 3.5;
      pPos[i * 3] = Math.cos(angle) * r;
      pPos[i * 3 + 1] = y;
      pPos[i * 3 + 2] = Math.sin(angle) * r;
      pSpeed[i] = 0.012 + Math.random() * 0.025;
      pAngle[i] = angle;
      pRadius[i] = r;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    particleGeoRef.current = { geo: pGeo, pos: pPos, angles: pAngle, radii: pRadius, speeds: pSpeed };

    const pMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.14,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    particlesRef.current = particles;
    scene.add(particles);

    // Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const cellMeshes = cellsRef.current.map((c) => c.mesh);
      const intersects = raycaster.intersectObjects(cellMeshes, false);

      if (intersects.length > 0) {
        hoveredCellRef.current = intersects[0].object.userData.cellId;
        renderer.domElement.style.cursor = 'pointer';
      } else {
        hoveredCellRef.current = null;
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onClickCanvas = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const cellMeshes = cellsRef.current.map((c) => c.mesh);
      const intersects = raycaster.intersectObjects(cellMeshes, false);

      if (intersects.length > 0) {
        const id = intersects[0].object.userData.cellId;
        soundEffects.playCellSelect();
        if (onSelectCell) onSelectCell(id);
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onClickCanvas);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Render loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Exploded interpolation
      explodedRef.current += (explodedTargetRef.current - explodedRef.current) * 0.1;
      const exp = explodedRef.current;

      if (coverMeshRef.current) {
        coverMeshRef.current.position.y = 2.55 + exp * 3.2;
        coverMeshRef.current.material.opacity = Math.max(0.12, 0.42 - exp * 0.3);
      }
      if (busbarsGroupRef.current) {
        busbarsGroupRef.current.position.y = exp * 1.7;
      }
      if (trayMeshRef.current) {
        trayMeshRef.current.position.y = -0.38 - exp * 0.95;
      }
      if (bmsGroupRef.current) {
        bmsGroupRef.current.position.z = 2.85 + exp * 1.4;
      }

      cellsRef.current.forEach(({ group, id }) => {
        const u = group.userData;
        const normX = (u.col - 1.5) / 1.5;
        const normZ = (u.row - 1.0) / 1.0;

        const isSelected = selectedCell === id;
        const isHovered = hoveredCellRef.current === id;
        const liftY = isSelected ? 0.78 : isHovered ? 0.28 : 0.0;

        group.position.x = u.baseX + normX * exp * 1.55;
        group.position.z = u.baseZ + normZ * exp * 1.35;
        group.position.y = u.baseY + liftY;
      });

      bmsLedsRef.current.forEach((led, i) => {
        const active = Math.sin(elapsedTime * (2.5 + i * 1.8)) > -0.15;
        led.mesh.visible = active;
      });

      if (particlesRef.current && particleGeoRef.current && showParticles) {
        const { pos, angles, radii, speeds } = particleGeoRef.current;
        const currentA = liveData?.current_a || 0;
        const isCharging = currentA > 0.05;
        const isDischarging = currentA < -0.05;
        const speedMultiplier = isCharging ? Math.min(3.5, 1 + currentA * 0.8) : isDischarging ? -Math.min(3.5, 1 + Math.abs(currentA) * 0.8) : 0.25;

        for (let i = 0; i < particleCount; i++) {
          angles[i] += speeds[i] * speedMultiplier * dt * 8;
          pos[i * 3] = Math.cos(angles[i]) * radii[i];
          pos[i * 3 + 2] = Math.sin(angles[i]) * radii[i];
        }
        particleGeoRef.current.geo.attributes.position.needsUpdate = true;

        if (isCharging) {
          particlesRef.current.material.color.setHex(0x00f0ff);
        } else if (isDischarging) {
          particlesRef.current.material.color.setHex(0xa855f7);
        } else {
          particlesRef.current.material.color.setHex(0x38bdf8);
        }
      }

      if (autoRotate && controlsRef.current) {
        batteryGroup.rotation.y += 0.005;
      } else {
        batteryGroup.rotation.y = 0;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('click', onClickCanvas);
      renderer.dispose();
      container.replaceChildren();
    };
  }, []);

  // Cell Material Telemetry Updates
  useEffect(() => {
    if (!cellsRef.current || cellsRef.current.length === 0) return;

    const baseTemp = liveData?.temperature_c || 25.0;
    const soc = liveData?.soc_percent || 50.0;

    cellsRef.current.forEach(({ mesh, group, id }) => {
      const u = group.userData;
      const cellTemp = baseTemp + u.tempVariation;
      const isSelected = selectedCell === id;
      const isHovered = hoveredCellRef.current === id;

      if (viewMode === 'thermal') {
        const thermalColor = getThermalColor(cellTemp);
        mesh.material.color.copy(thermalColor);
        mesh.material.wireframe = false;
        mesh.material.emissive.copy(thermalColor);
        mesh.material.emissiveIntensity = isSelected ? 0.85 : isHovered ? 0.55 : 0.22;
      } else if (viewMode === 'wireframe') {
        mesh.material.color.setHex(isSelected ? 0x00f0ff : 0x38bdf8);
        mesh.material.wireframe = true;
        mesh.material.emissive.setHex(0x00f0ff);
        mesh.material.emissiveIntensity = isSelected ? 0.9 : 0.3;
      } else {
        const baseColor = soc > 50 ? 0x0284c7 : soc > 20 ? 0xf59e0b : 0xef4444;
        mesh.material.color.setHex(baseColor);
        mesh.material.wireframe = false;
        mesh.material.emissive.setHex(isSelected ? 0x00f0ff : 0x0f172a);
        mesh.material.emissiveIntensity = isSelected ? 0.65 : 0.15;
      }
    });
  }, [liveData, viewMode, selectedCell]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 450,
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    />
  );
}
