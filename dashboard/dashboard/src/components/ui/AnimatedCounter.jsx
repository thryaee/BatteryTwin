/**
 * src/components/ui/AnimatedCounter.jsx
 * -------------------------------------
 * High-performance animated counter for telemetry values and KPIs.
 * Smoothly interpolates numbers with an easing curve when entering view
 * or when live WebSocket telemetry updates.
 */

import React, { useState, useEffect, useRef } from 'react';

export default function AnimatedCounter({
  end = 0,
  duration = 1.4,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  style = {},
}) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);
  const prevEndRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const target = typeof end === 'number' ? end : parseFloat(end) || 0;
          prevEndRef.current = target;
          const startTime = performance.now();
          const durationMs = duration * 1000;

          const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            // Cubic ease out
            const ease = 1 - Math.pow(1 - progress, 3);
            setVal(target * ease);
            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              setVal(target);
            }
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  // When value updates from live WebSocket / API, smoothly update without jarring reset
  useEffect(() => {
    if (hasAnimated.current) {
      const target = typeof end === 'number' ? end : parseFloat(end) || 0;
      const start = prevEndRef.current;
      prevEndRef.current = target;
      const startTime = performance.now();
      const durationMs = 600; // swift transition on live update

      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setVal(start + (target - start) * ease);
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setVal(target);
        }
      };
      requestAnimationFrame(tick);
    }
  }, [end]);

  const formatted = Number(val).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span
      ref={ref}
      className={className}
      style={{
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: "'tnum' on, 'lnum' on",
        ...style,
      }}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
