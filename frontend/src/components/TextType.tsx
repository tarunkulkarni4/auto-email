import React, { useEffect, useRef, useState } from 'react';

interface TextTypeProps {
  strings: string[];
  className?: string;
  typingSpeed?: number;    // ms per char
  deletingSpeed?: number;
  pauseDuration?: number;  // ms after full string
  loop?: boolean;
  cursor?: boolean;
}

const TextType: React.FC<TextTypeProps> = ({
  strings,
  className = '',
  typingSpeed = 60,
  deletingSpeed = 35,
  pauseDuration = 1800,
  loop = true,
  cursor = true,
}) => {
  const [text, setText]         = useState('');
  const [phase, setPhase]       = useState<'typing' | 'pausing' | 'deleting'>('typing');
  const [strIdx, setStrIdx]     = useState(0);
  const [charIdx, setCharIdx]   = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // cursor blink
  useEffect(() => {
    if (!cursor) return;
    const id = setInterval(() => setShowCursor(v => !v), 530);
    return () => clearInterval(id);
  }, [cursor]);

  useEffect(() => {
    if (strings.length === 0) return;
    const current = strings[strIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (charIdx < current.length) {
        timeout = setTimeout(() => {
          setText(current.slice(0, charIdx + 1));
          setCharIdx(c => c + 1);
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => setPhase('pausing'), pauseDuration);
      }
    } else if (phase === 'pausing') {
      setPhase('deleting');
    } else if (phase === 'deleting') {
      if (charIdx > 0) {
        timeout = setTimeout(() => {
          setCharIdx(c => c - 1);
          setText(current.slice(0, charIdx - 1));
        }, deletingSpeed);
      } else {
        if (loop || strIdx < strings.length - 1) {
          setStrIdx(i => (i + 1) % strings.length);
          setPhase('typing');
        }
      }
    }

    return () => clearTimeout(timeout);
  }, [phase, charIdx, strIdx, strings, typingSpeed, deletingSpeed, pauseDuration, loop]);

  return (
    <span className={className} aria-live="polite">
      {text}
      {cursor && (
        <span style={{ opacity: showCursor ? 1 : 0, color: 'var(--accent)', transition: 'opacity 0.1s', marginLeft: 1 }}>
          |
        </span>
      )}
    </span>
  );
};

export default TextType;
