import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface SplitTextProps {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  from?: gsap.TweenVars;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  charClassName = '',
  delay = 0,
  duration = 0.6,
  stagger = 0.03,
  from = { opacity: 0, y: 20, rotateX: -40 },
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chars = ref.current.querySelectorAll('.mc-char');
    gsap.fromTo(
      chars,
      { ...from },
      {
        opacity: 1, y: 0, rotateX: 0,
        duration,
        stagger,
        delay,
        ease: 'power3.out',
      }
    );
  }, [text, delay, duration, stagger]);

  const chars = text.split('').map((ch, i) => (
    <span
      key={i}
      className={`mc-char ${charClassName}`}
      style={{ display: 'inline-block', willChange: 'transform, opacity' }}
    >
      {ch === ' ' ? '\u00A0' : ch}
    </span>
  ));

  return (
    <span ref={ref} className={className} aria-label={text} style={{ perspective: '600px' }}>
      {chars}
    </span>
  );
};

export default SplitText;
