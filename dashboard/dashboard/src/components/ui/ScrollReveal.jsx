/**
 * src/components/ui/ScrollReveal.jsx
 * -----------------------------------
 * Cinematic Editorial Scroll Reveal component adapted from Nexus Studio design system.
 *
 * Characteristics:
 * - Subtle upward glide (30–50px) with smooth opacity fade
 * - Refined Nexus Studio cubic-bezier easing: [0.25, 0.46, 0.45, 0.94]
 * - Triggers once in viewport with comfortable margin threshold
 * - Fully respects prefers-reduced-motion accessibility preference
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function ScrollReveal({
  children,
  delay = 0,
  yOffset = 40,
  duration = 0.8,
  className = '',
  style = {},
  margin = '-60px',
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
