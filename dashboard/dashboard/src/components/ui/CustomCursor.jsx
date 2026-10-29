/**
 * src/components/ui/CustomCursor.jsx
 * -----------------------------------
 * Fluid Desktop Custom Cursor adapted from Nexus Studio design system.
 *
 * Capabilities:
 * - Dual spring physics: inner follower + outer trailing ring
 * - Mix-blend mode difference with high-contrast inverted tracking
 * - Contextual hover states: 'default' | 'hover' (CLICK) | 'view' (VIEW) | 'text'
 * - Strictly desktop-only: automatically disabled on touch devices and coarse pointers
 */

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [cursorState, setCursorState] = useState('default');
  const [isEnabled, setIsEnabled] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Outer trailing ring spring physics
  const trailX = useSpring(mouseX, { stiffness: 160, damping: 24 });
  const trailY = useSpring(mouseY, { stiffness: 160, damping: 24 });

  // Inner dot spring physics
  const springX = useSpring(mouseX, { stiffness: 500, damping: 38 });
  const springY = useSpring(mouseY, { stiffness: 500, damping: 38 });

  // Detect desktop fine-pointer device only
  useEffect(() => {
    const checkPointer = () => {
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
      const isTouch = window.matchMedia('(hover: none)').matches;
      setIsEnabled(hasFinePointer && !isTouch);
    };

    checkPointer();
    window.addEventListener('resize', checkPointer);
    return () => window.removeEventListener('resize', checkPointer);
  }, []);

  // Track mouse coordinates
  useEffect(() => {
    if (!isEnabled) return;

    document.body.classList.add('custom-cursor-active');

    const onMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [isEnabled, mouseX, mouseY]);

  // Contextual cursor states based on data-cursor attribute
  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseOver = (e) => {
      const el = e.target.closest && e.target.closest('[data-cursor]');
      if (el) {
        setCursorState(el.getAttribute('data-cursor') || 'hover');
      }
    };

    const handleMouseOut = (e) => {
      if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('[data-cursor]')) {
        return;
      }
      setCursorState('default');
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  // Variants for inner tracker dot
  const variants = {
    default: {
      width: 10,
      height: 10,
      x: '-50%',
      y: '-50%',
      borderRadius: '50%',
      backgroundColor: '#ffffff',
      opacity: 1,
    },
    hover: {
      width: 44,
      height: 44,
      x: '-50%',
      y: '-50%',
      borderRadius: '50%',
      backgroundColor: '#e8ff47', // Signal Lime
      opacity: 1,
    },
    text: {
      width: 3,
      height: 22,
      x: '-1.5px',
      y: '-11px',
      borderRadius: '2px',
      backgroundColor: '#ffffff',
      opacity: 1,
    },
    view: {
      width: 60,
      height: 60,
      x: '-50%',
      y: '-50%',
      borderRadius: '50%',
      backgroundColor: 'transparent',
      border: '1.5px solid #e8ff47',
      opacity: 1,
    },
  };

  // Trailing ring states
  const trailingVariants = {
    default: {
      width: 30,
      height: 30,
      opacity: 0.35,
      border: '1px solid rgba(255, 255, 255, 0.6)',
      backgroundColor: 'transparent',
    },
    hover: { opacity: 0 },
    text: { opacity: 0 },
    view: { opacity: 0 },
  };

  return (
    <>
      {/* Inner Active Tracker */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none flex justify-center items-center text-ink-950 font-mono text-[9px] tracking-widest font-bold overflow-hidden"
        style={{
          x: springX,
          y: springY,
          mixBlendMode: 'difference',
          zIndex: 99999,
          position: 'fixed',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#04040a',
          fontFamily: 'JetBrains Mono',
          letterSpacing: '0.12em',
        }}
        variants={variants}
        animate={cursorState}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      >
        {cursorState === 'hover' && 'VIEW'}
        {cursorState === 'view' && 'DRAG'}
      </motion.div>

      {/* Trailing Physics Ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none rounded-full flex justify-center items-center"
        style={{
          x: trailX,
          y: trailY,
          mixBlendMode: 'difference',
          zIndex: 99998,
          position: 'fixed',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
        }}
        variants={trailingVariants}
        animate={cursorState}
        transition={{ duration: 0.18 }}
      />
    </>
  );
}
