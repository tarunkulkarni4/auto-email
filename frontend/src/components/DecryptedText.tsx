import React, { useEffect, useRef, useState } from 'react';

interface DecryptedTextProps {
  text: string;
  className?: string;
  speed?: number;           // ms per frame
  maxIterations?: number;
  chars?: string;
  revealMode?: 'random' | 'sequential';
  animateOn?: 'mount' | 'hover';
  style?: React.CSSProperties;
}

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';

const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  className = '',
  speed = 40,
  maxIterations = 10,
  chars = CHARSET,
  revealMode = 'random',
  animateOn = 'mount',
  style = {},
}) => {
  const [displayed, setDisplayed] = useState<string[]>(text.split(''));
  const [revealed, setRevealed]   = useState<boolean[]>(text.split('').map(() => false));
  const frameRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const iterRef  = useRef(0);

  const animate = () => {
    iterRef.current = 0;
    const initialRevealed = text.split('').map(() => false);
    setRevealed(initialRevealed);

    const totalChars = text.length;
    let revealedCount = 0;
    let currentRevealed = [...initialRevealed];
    let currentDisplayed = text.split('');

    const tick = () => {
      iterRef.current++;
      const newRevealed = [...currentRevealed];
      const newDisplayed = text.split('').map((ch, i) => {
        if (newRevealed[i]) return ch;
        if (ch === ' ') return ' ';

        if (revealMode === 'sequential') {
          if (i === revealedCount) {
            if (iterRef.current >= maxIterations) {
              newRevealed[i] = true;
              revealedCount++;
              return ch;
            }
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return currentDisplayed[i] ?? chars[Math.floor(Math.random() * chars.length)];
        } else {
          // random reveal
          const prob = (iterRef.current / (maxIterations * 2));
          if (Math.random() < prob) {
            newRevealed[i] = true;
            revealedCount++;
            return ch;
          }
          return chars[Math.floor(Math.random() * chars.length)];
        }
      });

      currentRevealed = newRevealed;
      currentDisplayed = newDisplayed;
      setDisplayed(newDisplayed);
      setRevealed(newRevealed);

      if (revealedCount < totalChars) {
        frameRef.current = setTimeout(tick, speed);
      } else {
        setDisplayed(text.split(''));
      }
    };

    tick();
  };

  useEffect(() => {
    if (animateOn === 'mount') animate();
    return () => clearTimeout(frameRef.current);
  }, [text]);

  const handleMouseEnter = () => { if (animateOn === 'hover') animate(); };

  return (
    <span
      className={className}
      onMouseEnter={handleMouseEnter}
      aria-label={text}
      style={{ display: 'inline-block', ...style }}
    >
      {displayed.map((ch, i) => (
        <span
          key={i}
          style={{
            color: revealed[i] ? 'inherit' : 'var(--accent)',
            transition: 'color 0.1s',
            display: 'inline-block',
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
};

export default DecryptedText;
