/**
 * src/components/ui/ScrollProgressBar.jsx
 * ---------------------------------------
 * Ultra-thin 2px scroll progress indicator running along the top viewport.
 * Uses electric lime accent (#e8ff47).
 */

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: '0%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        backgroundColor: '#e8ff47',
        zIndex: 99990,
        pointerEvents: 'none',
      }}
    />
  );
}
