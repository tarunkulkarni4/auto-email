import React, { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollVelocityProps {
  texts: string[];
  className?: string;
  style?: React.CSSProperties;
  velocity?: number; // Base speed
  velocityFactor?: number; // How much scroll speeds it up
  velocityClamp?: number; // Max speed
}

const ScrollVelocity: React.FC<ScrollVelocityProps> = ({
  texts,
  className = '',
  style = {},
  velocity = 1,
  velocityFactor = 0.5,
  velocityClamp = 20,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [clonedTexts, setClonedTexts] = useState([...texts, ...texts, ...texts]);

  useLayoutEffect(() => {
    if (!containerRef.current || !scrollRef.current) return;

    let xPos = 0;
    let currentVelocity = velocity;
    let animId: number;

    const ctx = gsap.context(() => {
      // Update velocity based on scroll
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const delta = self.getVelocity() / 100;
          let newVelocity = velocity + Math.abs(delta) * velocityFactor;
          newVelocity = Math.max(velocity, Math.min(newVelocity, velocityClamp));
          // Apply direction based on overall scroll direction or keep moving forward
          const dir = delta < 0 ? -1 : 1; 
          // Actually, scroll velocity usually just speeds up in the direction of scroll or keeps moving
          currentVelocity = newVelocity * (velocity < 0 ? -1 : 1);
        },
      });

      const tick = () => {
        xPos -= currentVelocity;
        
        // Simple wrap logic assuming the first group of texts takes up some width
        const scrollWidth = scrollRef.current!.scrollWidth;
        const containerWidth = containerRef.current!.offsetWidth;
        const itemWidth = scrollWidth / clonedTexts.length;
        const groupWidth = itemWidth * texts.length;

        if (xPos <= -groupWidth) {
           xPos += groupWidth;
        } else if (xPos > 0) {
           xPos -= groupWidth;
        }

        gsap.set(scrollRef.current, { x: xPos });

        // Dampen velocity back to base velocity
        currentVelocity += (velocity - currentVelocity) * 0.1;
        animId = requestAnimationFrame(tick);
      };

      tick();
    }, containerRef);

    return () => {
      ctx.revert();
      cancelAnimationFrame(animId);
    };
  }, [velocity, velocityFactor, velocityClamp, texts.length, clonedTexts.length]);

  return (
    <div ref={containerRef} className={className} style={{ overflow: 'hidden', whiteSpace: 'nowrap', ...style }}>
      <div ref={scrollRef} style={{ display: 'inline-flex', gap: '2rem', willChange: 'transform' }}>
        {clonedTexts.map((text, i) => (
          <span key={i} style={{ display: 'inline-block' }}>{text}</span>
        ))}
      </div>
    </div>
  );
};

export default ScrollVelocity;
