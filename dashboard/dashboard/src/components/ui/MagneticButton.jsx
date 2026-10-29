/**
 * src/components/ui/MagneticButton.jsx
 * -------------------------------------
 * Magnetic Button primitive adapted from Nexus Studio design system.
 * Attracts smoothly toward the mouse pointer with spring physics.
 * Uses motion.div wrapper to support both direct button semantics and nested interactive controls.
 */

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function MagneticButton({
  children,
  className = '',
  strength = 0.3,
  onClick,
  style = {},
  role,
  ...props
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 220, damping: 16 });
  const springY = useSpring(y, { stiffness: 220, damping: 16 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ display: 'inline-block', cursor: onClick ? 'pointer' : undefined, x: springX, y: springY, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
      data-cursor="hover"
      role={role || (onClick ? 'button' : undefined)}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
