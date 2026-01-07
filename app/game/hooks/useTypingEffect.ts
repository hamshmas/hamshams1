'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseTypingEffectOptions {
  speed?: number; // ms per character
  startDelay?: number;
}

export function useTypingEffect(
  text: string,
  options: UseTypingEffectOptions = {}
) {
  const { speed = 30, startDelay = 0 } = options;
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);

    if (!text) {
      setIsComplete(true);
      return;
    }

    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const startTyping = () => {
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          timeoutId = setTimeout(typeNextChar, speed);
        } else {
          setIsComplete(true);
        }
      };
      typeNextChar();
    };

    if (startDelay > 0) {
      timeoutId = setTimeout(startTyping, startDelay);
    } else {
      startTyping();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [text, speed, startDelay]);

  const skip = useCallback(() => {
    setDisplayedText(text);
    setIsComplete(true);
  }, [text]);

  return { displayedText, isComplete, skip };
}
