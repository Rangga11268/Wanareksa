import React, { useEffect, useState, useRef } from 'react';

export const AmbientCursorFollower: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const posRef = useRef({ x: -100, y: -100 });
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only enable on desktop pointer devices with fine control, disabled on touch screens and reduced motion
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isFinePointer || isReducedMotion) {
      setIsEnabled(false);
      return;
    }

    setIsEnabled(true);

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[40] overflow-hidden transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
      aria-hidden="true"
    >
      <div
        ref={glowRef}
        className="absolute -top-48 -left-48 w-96 h-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.06)_0%,rgba(14,165,233,0.02)_40%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.09)_0%,rgba(14,165,233,0.03)_40%,transparent_70%)] blur-2xl will-change-transform"
      />
    </div>
  );
};
