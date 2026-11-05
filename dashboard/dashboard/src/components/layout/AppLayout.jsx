/**
 * src/components/layout/AppLayout.jsx
 * -----------------------------------
 * Master layout frame with Minimal Sticky Top Navigation and Full-Width Content Outlet.
 * Premium Commercial White Theme.
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import MobileNavDrawer from './MobileNavDrawer';
import ScrollProgressBar from '../ui/ScrollProgressBar';
import { useBatteryData } from '../../hooks/useBatteryData';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState('BATTERY_01');
  const [isMuted, setIsMuted] = useState(false);

  const { liveData, history, loading, connected, error, lastUpdated } = useBatteryData();

  return (
    <div
      className="engineering-grid"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        position: 'relative',
        width: '100%',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div className="ambient-glow-underlay" />
      <ScrollProgressBar />

      {/* Modern Clean Sticky Top Navigation */}
      <TopNav
        liveData={liveData}
        connected={connected}
        error={error}
        lastUpdated={lastUpdated}
        selectedBattery={selectedBattery}
        setSelectedBattery={setSelectedBattery}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        setMobileOpen={setMobileOpen}
      />

      {/* Mobile Responsive Navigation Drawer */}
      <MobileNavDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        connected={connected}
        selectedBattery={selectedBattery}
        setSelectedBattery={setSelectedBattery}
      />

      {/* Main Content Workspace Container */}
      <main
        style={{
          flex: 1,
          padding: '24px 32px 64px 32px',
          maxWidth: 1680,
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Outlet context={{ liveData, history, loading, connected, error, lastUpdated, selectedBattery }} />
      </main>
    </div>
  );
}
