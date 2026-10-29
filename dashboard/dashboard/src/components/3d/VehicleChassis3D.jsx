/**
 * src/components/3d/VehicleChassis3D.jsx
 * --------------------------------------
 * Photorealistic 3D Electric Vehicle Skateboard Chassis & Aerodynamic Body Shell.
 *
 * Visual & Engineering Hierarchy:
 * 1. Aerodynamic Ghost Body Shell: Sleek GT Coupe / Sports Sedan translucent silhouette
 *    showing the battery pack housed low inside the floor pan.
 * 2. Skateboard Chassis Frame: Dual longitudinal titanium-alloy side beams, front & rear subframes,
 *    suspension wishbones, and 4 high-performance wheels with turbine aero rims and lime brake calipers.
 * 3. Front & Rear Dual Electric Drive Units (Motors + Inverters).
 * 4. High-Voltage Shielded Energy Conduits: Glowing orange/lime buslines routing from the Battery's
 *    HVDU to front and rear motors and the rear charge port.
 * 5. Dynamic Energy Flow: Subtle animated particle pulses flowing INTO the pack when charging,
 *    and OUT toward the drivetrains when discharging.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function VehicleChassis3D({
  scene,
  liveData,
  viewLayer = 'vehicle', // 'vehicle' | 'chassis' | 'pack' | 'cell'
  reducedMotion = false,
}) {
  const vehicleGroupRef = useRef(null);
  const bodyMeshRef = useRef(null);
  const wheelsRef = useRef([]);
  const energyPulsesRef = useRef([]);
  const animFrameRef = useRef(null);

  const isCharging = liveData?.charging_status === 'CHARGING' || (liveData?.current_a || 0) > 0.05;
  const isDischarging = (liveData?.current_a || 0) < -0.05;
  const currentMagnitude = Math.abs(liveData?.current_a || 0);

  useEffect(() => {
    if (!scene) return;

    const vehicleGroup = new THREE.Group();
    vehicleGroup.name = 'ev_vehicle_context';
    scene.add(vehicleGroup);
    vehicleGroupRef.current = vehicleGroup;

    // ─────────────────────────────────────────────────────────────
    // 1. SKATEBOARD CHASSIS FRAME BEAMS
    // ─────────────────────────────────────────────────────────────
    // Left & Right Longitudinal Aluminum Rails framing the 8.6x6.6 battery pack
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x181e2b,
      metalness: 0.9,
      roughness: 0.25,
    });

    const railGeo = new THREE.BoxGeometry(17.4, 0.45, 0.4);
    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(0, -0.4, 3.7);
    leftRail.castShadow = true;
    leftRail.receiveShadow = true;
    vehicleGroup.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(0, -0.4, -3.7);
    rightRail.castShadow = true;
    rightRail.receiveShadow = true;
    vehicleGroup.add(rightRail);

    // Front & Rear Lateral Subframe Crossbars
    const crossbarGeo = new THREE.BoxGeometry(0.5, 0.45, 7.8);
    const frontSubframe = new THREE.Mesh(crossbarGeo, railMat);
    frontSubframe.position.set(8.5, -0.4, 0);
    vehicleGroup.add(frontSubframe);

    const rearSubframe = new THREE.Mesh(crossbarGeo, railMat);
    rearSubframe.position.set(-8.5, -0.4, 0);
    vehicleGroup.add(rearSubframe);

    // Diagonal chassis reinforcement braces
    const braceMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.3 });
    const braceGeo = new THREE.BoxGeometry(2.4, 0.15, 0.25);
    const brace1 = new THREE.Mesh(braceGeo, braceMat);
    brace1.position.set(5.5, -0.25, 3.2);
    brace1.rotation.y = 0.45;
    vehicleGroup.add(brace1);

    const brace2 = new THREE.Mesh(braceGeo, braceMat);
    brace2.position.set(5.5, -0.25, -3.2);
    brace2.rotation.y = -0.45;
    vehicleGroup.add(brace2);

    // ─────────────────────────────────────────────────────────────
    // 2. FRONT & REAR DUAL-MOTOR ELECTRIC DRIVE UNITS
    // ─────────────────────────────────────────────────────────────
    const motorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.95,
      roughness: 0.2,
    });
    const motorCapMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.88,
      roughness: 0.3,
    });

    // Front Motor & Differential Unit
    const frontMotorGroup = new THREE.Group();
    frontMotorGroup.position.set(8.2, 0.2, 0);

    const fMotorCylinder = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.8, 24), motorMat);
    fMotorCylinder.rotation.x = Math.PI / 2;
    frontMotorGroup.add(fMotorCylinder);

    const fInverter = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.8), motorCapMat);
    fInverter.position.set(0, 0.9, 0);
    frontMotorGroup.add(fInverter);
    vehicleGroup.add(frontMotorGroup);

    // Rear High-Power Motor & Differential Unit
    const rearMotorGroup = new THREE.Group();
    rearMotorGroup.position.set(-8.2, 0.3, 0);

    const rMotorCylinder = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.2, 24), motorMat);
    rMotorCylinder.rotation.x = Math.PI / 2;
    rearMotorGroup.add(rMotorCylinder);

    const rInverter = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 2.2), motorCapMat);
    rInverter.position.set(0, 1.0, 0);
    rearMotorGroup.add(rInverter);
    vehicleGroup.add(rearMotorGroup);

    // ─────────────────────────────────────────────────────────────
    // 3. 4 HIGH-PERFORMANCE WHEELS & BRAKE ASSEMBLIES
    // ─────────────────────────────────────────────────────────────
    const wheelPositions = [
      { x: 8.2, y: 0.2, z: 4.8, isFront: true },   // Front Left
      { x: 8.2, y: 0.2, z: -4.8, isFront: true },  // Front Right
      { x: -8.2, y: 0.2, z: 4.8, isFront: false }, // Rear Left
      { x: -8.2, y: 0.2, z: -4.8, isFront: false } // Rear Right
    ];

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      roughness: 0.92,
      metalness: 0.1,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
    });
    const rotorMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.98,
      roughness: 0.1,
    });
    const caliperMat = new THREE.MeshStandardMaterial({
      color: 0xe8ff47, // Electric Lime Caliper
      metalness: 0.4,
      roughness: 0.2,
    });

    const tireGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.85, 28);
    tireGeo.rotateX(Math.PI / 2);

    const rimGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.86, 24);
    rimGeo.rotateX(Math.PI / 2);

    const rotorGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.1, 24);
    rotorGeo.rotateX(Math.PI / 2);

    const caliperGeo = new THREE.BoxGeometry(0.4, 0.7, 0.35);

    const wheels = [];
    wheelPositions.forEach((pos, idx) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos.x, pos.y, pos.z);

      // Tire
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.castShadow = true;
      wheelGroup.add(tire);

      // Aero turbine rim
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheelGroup.add(rim);

      // Spoke detail
      for (let s = 0; s < 5; s++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.9, 0.88), rimMat);
        spoke.rotation.z = (s * Math.PI * 2) / 5;
        wheelGroup.add(spoke);
      }

      // Brake Rotor
      const rotor = new THREE.Mesh(rotorGeo, rotorMat);
      rotor.position.z = pos.z > 0 ? -0.2 : 0.2;
      wheelGroup.add(rotor);

      // Brake Caliper
      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(0.65, 0.5, pos.z > 0 ? -0.2 : 0.2);
      wheelGroup.add(caliper);

      // Axle drive half-shaft
      const axleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 12);
      axleGeo.rotateX(Math.PI / 2);
      const axle = new THREE.Mesh(axleGeo, railMat);
      axle.position.z = pos.z > 0 ? -0.8 : 0.8;
      wheelGroup.add(axle);

      vehicleGroup.add(wheelGroup);
      wheels.push(wheelGroup);
    });
    wheelsRef.current = wheels;

    // ─────────────────────────────────────────────────────────────
    // 4. HIGH-VOLTAGE ENERGY CONDUITS & CHARGING PORT
    // ─────────────────────────────────────────────────────────────
    // High-voltage insulated conduit curve from battery to front motor
    const hvOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xff6b35, // High-voltage safety orange
      metalness: 0.3,
      roughness: 0.4,
      emissive: 0xff6b35,
      emissiveIntensity: 0.35,
    });

    const frontCableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(4.3, 0.2, 0.8),
      new THREE.Vector3(6.0, 0.1, 0.6),
      new THREE.Vector3(7.5, 0.4, 0.3),
    ]);
    const frontCableGeo = new THREE.TubeGeometry(frontCableCurve, 20, 0.09, 8, false);
    const frontCable = new THREE.Mesh(frontCableGeo, hvOrangeMat);
    vehicleGroup.add(frontCable);

    // High-voltage cable curve from battery to rear motor
    const rearCableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.3, 0.2, -0.8),
      new THREE.Vector3(-6.0, 0.1, -0.6),
      new THREE.Vector3(-7.5, 0.5, -0.3),
    ]);
    const rearCableGeo = new THREE.TubeGeometry(rearCableCurve, 20, 0.09, 8, false);
    const rearCable = new THREE.Mesh(rearCableGeo, hvOrangeMat);
    vehicleGroup.add(rearCable);

    // Rear Left EV Charge Port Inlet
    const chargePortGroup = new THREE.Group();
    chargePortGroup.position.set(-7.8, 1.4, 4.35);

    const chargeInlet = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.5, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x080812, metalness: 0.8, roughness: 0.3 })
    );
    chargePortGroup.add(chargeInlet);

    // Glowing Charge Port LED Ring
    const chargeRing = new THREE.Mesh(
      new THREE.RingGeometry(0.12, 0.18, 24),
      new THREE.MeshBasicMaterial({
        color: isCharging ? 0xe8ff47 : 0x10b981,
        side: THREE.DoubleSide,
      })
    );
    chargeRing.rotation.y = Math.PI / 2;
    chargeRing.position.x = 0.16;
    chargePortGroup.add(chargeRing);

    // Cable from charge port into battery
    const chargeCableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-7.7, 1.4, 4.2),
      new THREE.Vector3(-6.2, 0.6, 3.6),
      new THREE.Vector3(-4.4, 0.3, 2.5),
    ]);
    const chargeCable = new THREE.Mesh(
      new THREE.TubeGeometry(chargeCableCurve, 24, 0.07, 8, false),
      new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: isCharging ? 0xe8ff47 : 0x10b981,
        emissiveIntensity: isCharging ? 0.8 : 0.3,
      })
    );
    vehicleGroup.add(chargeCable);
    vehicleGroup.add(chargePortGroup);

    // ─────────────────────────────────────────────────────────────
    // 5. ANIMATED ENERGY FLOW PARTICLES (Living conduits)
    // ─────────────────────────────────────────────────────────────
    const pulseGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xe8ff47,
      transparent: true,
      opacity: 0.85,
    });

    const pulses = [];
    for (let p = 0; p < 8; p++) {
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      vehicleGroup.add(pulseMesh);
      pulses.push({
        mesh: pulseMesh,
        progress: p / 8,
        curve: p < 4 ? frontCableCurve : rearCableCurve,
        speed: 0.008,
      });
    }
    energyPulsesRef.current = pulses;

    // ─────────────────────────────────────────────────────────────
    // 6. AERODYNAMIC TRANSLUCENT GHOST BODY SHELL
    // ─────────────────────────────────────────────────────────────
    // Create sleek sports GT coupe body form
    const bodyGroup = new THREE.Group();
    bodyGroup.name = 'ev_body_shell';

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x070c18,
      metalness: 0.9,
      roughness: 0.18,
      transparent: true,
      opacity: 0.22,
      clearcoat: 0.95,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide,
    });

    // Lower Body Sills & Rockers
    const lowerBodyGeo = new THREE.BoxGeometry(19.2, 1.2, 8.4);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, bodyMat);
    lowerBody.position.set(0, 0.7, 0);
    bodyGroup.add(lowerBody);

    // Sleek Cabin Greenhouse & Panoramic Canopy
    const greenhouseGeo = new THREE.BoxGeometry(9.6, 1.4, 6.2);
    const greenhouse = new THREE.Mesh(greenhouseGeo, bodyMat);
    greenhouse.position.set(-0.8, 2.0, 0);
    bodyGroup.add(greenhouse);

    // Aerodynamic Sloped Front Bonnet / Hood
    const hoodGeo = new THREE.BoxGeometry(5.2, 0.7, 7.8);
    const hood = new THREE.Mesh(hoodGeo, bodyMat);
    hood.position.set(6.6, 1.1, 0);
    hood.rotation.z = -0.08;
    bodyGroup.add(hood);

    // Sloped Rear Fastback Trunk / Hatch
    const trunkGeo = new THREE.BoxGeometry(4.4, 0.7, 7.6);
    const trunk = new THREE.Mesh(trunkGeo, bodyMat);
    trunk.position.set(-6.8, 1.2, 0);
    trunk.rotation.z = 0.09;
    bodyGroup.add(trunk);

    // Front Aerodynamic Splitter & LED Lightbar
    const frontLightbar = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.12, 7.2),
      new THREE.MeshBasicMaterial({ color: 0xf0f0f8, transparent: true, opacity: 0.85 })
    );
    frontLightbar.position.set(9.5, 0.85, 0);
    bodyGroup.add(frontLightbar);

    // Rear Full-Width Taillight Ribbon
    const rearLightbar = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.12, 7.2),
      new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.9 })
    );
    rearLightbar.position.set(-9.5, 1.35, 0);
    bodyGroup.add(rearLightbar);

    // Refined Edge Wireframe contour tracing the body form
    const bodyEdges = new THREE.EdgesGeometry(lowerBodyGeo, 25);
    const bodyLineMat = new THREE.LineBasicMaterial({
      color: 0xe8ff47,
      transparent: true,
      opacity: 0.28,
    });
    const edgeLines = new THREE.LineSegments(bodyEdges, bodyLineMat);
    edgeLines.position.copy(lowerBody.position);
    bodyGroup.add(edgeLines);

    vehicleGroup.add(bodyGroup);
    bodyMeshRef.current = bodyGroup;

    // ─────────────────────────────────────────────────────────────
    // ANIMATION TICK: ENERGY FLOW & WHEEL ROTATION
    // ─────────────────────────────────────────────────────────────
    let t = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      t += 0.015;

      // Animate energy pulses along conduits
      if (!reducedMotion) {
        pulses.forEach((p, idx) => {
          if (isCharging) {
            // Charging: Flow into the battery
            p.progress = (p.progress + p.speed) % 1.0;
            const pt = p.curve.getPointAt(1.0 - p.progress);
            if (pt) p.mesh.position.copy(pt);
            p.mesh.visible = true;
          } else if (isDischarging || currentMagnitude > 0.05) {
            // Discharging: Flow out toward drive units
            p.progress = (p.progress + p.speed * 1.5) % 1.0;
            const pt = p.curve.getPointAt(p.progress);
            if (pt) p.mesh.position.copy(pt);
            p.mesh.visible = true;
          } else {
            // Idle: subtle breathing glow
            p.mesh.visible = (idx % 2 === 0);
            const pt = p.curve.getPointAt(p.progress);
            if (pt) p.mesh.position.copy(pt);
          }
        });
      }
    };
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (vehicleGroupRef.current && scene) {
        scene.remove(vehicleGroupRef.current);
      }
    };
  }, [scene]);

  // Adjust body opacity based on active viewLayer
  useEffect(() => {
    if (!bodyMeshRef.current) return;
    const body = bodyMeshRef.current;

    body.traverse((child) => {
      if (child.isMesh && child.material && child.material.transparent) {
        if (viewLayer === 'vehicle') {
          child.material.opacity = 0.25;
        } else if (viewLayer === 'chassis') {
          child.material.opacity = 0.08;
        } else if (viewLayer === 'pack' || viewLayer === 'cell') {
          // In Pack or Cell view, ghost the body significantly to let battery shine
          child.material.opacity = 0.03;
        }
      }
    });
  }, [viewLayer]);

  return null;
}
