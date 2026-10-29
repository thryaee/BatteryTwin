/**
 * src/utils/scrollNavigation.js
 * ------------------------------
 * Smooth scroll navigation and intersection observer spy for continuous editorial layout.
 */

import { useState, useEffect } from 'react';
import { soundEffects } from './soundEffects';

export const SECTION_IDS = [
  'overview',
  'live',
  'digital-twin',
  'health',
  'agents',
  'predictions',
  'charging',
  'maintenance',
  'analytics'
];

/**
 * Smoothly scrolls to a given section ID, or navigates to /#id if not on the continuous page.
 */
export function scrollToSection(sectionId) {
  soundEffects.playClick();
  const id = sectionId.replace('#', '').replace('/', '') || 'overview';
  const element = document.getElementById(id);

  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (window.history.pushState) {
      window.history.pushState(null, null, `#${id}`);
    }
    window.dispatchEvent(new CustomEvent('sectionchange', { detail: id }));
  } else {
    window.location.href = `/#${id}`;
  }
}

/**
 * Hook to observe the active section in view as the user scrolls.
 */
export function useActiveSection(sectionIds = SECTION_IDS) {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    // Listen to direct jump events
    const handleSectionChange = (e) => {
      if (e.detail) setActiveSection(e.detail);
    };
    window.addEventListener('sectionchange', handleSectionChange);

    // Initial check for URL hash
    if (window.location.hash) {
      const initialId = window.location.hash.replace('#', '');
      if (sectionIds.includes(initialId)) {
        setActiveSection(initialId);
        setTimeout(() => {
          const el = document.getElementById(initialId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }

    const observers = [];
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-10% 0px -60% 0px',
      threshold: [0.2, 0.5],
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        observers.push(el);
      }
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('sectionchange', handleSectionChange);
    };
  }, [sectionIds]);

  return activeSection;
}
