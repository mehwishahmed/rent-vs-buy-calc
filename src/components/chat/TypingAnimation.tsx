// src/components/chat/TypingAnimation.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export function TypingAnimation({ 
  text, 
  speed = 15, // Faster default speed
  onComplete, 
  className = '' 
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentCharIndex < text.length) {
      const baseDelay = speed;
      // More natural variation - humans pause at punctuation and spaces
      const char = text[currentCharIndex];
      let variation = 0;
      
      if (char === '.') variation = 150; // Pause after periods
      else if (char === ',') variation = 80; // Brief pause after commas
      else if (char === ' ') variation = 20; // Slight pause after spaces
      else if (char === '\n') variation = 100; // Pause after line breaks
      else variation = Math.random() * 20 - 10; // Random variation for other chars
      
      const actualDelay = Math.max(20, baseDelay + variation);
      
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentCharIndex + 1));
        setCurrentCharIndex(prev => prev + 1);
      }, actualDelay);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      // Slightly longer pause at end for natural feel
      setTimeout(() => {
        onComplete?.();
      }, 200);
    }
  }, [currentCharIndex, text, speed, onComplete, isComplete]);

  return (
    <div className={className}>
      <span>{displayedText}</span>
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-blue-400 ml-1 animate-pulse opacity-80"></span>
      )}
    </div>
  );
}
