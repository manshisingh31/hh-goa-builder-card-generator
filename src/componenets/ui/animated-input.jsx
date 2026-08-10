import React, { useEffect, useMemo, useRef, useState } from "react";

export function OrbInput() {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const placeholders = useMemo(
    () => [
      "Build your developer card...",
      "What's your name?",
      "What's your tech stack?",
      "Ready to build?",
    ],
    []
  );

  const CHAR_DELAY = 75;
  const IDLE_DELAY_AFTER_FINISH = 2200;

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const current = placeholders[placeholderIndex];

    if (!current) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }

    const chars = Array.from(current);

    setDisplayedText("");
    setIsTyping(true);

    let charIndex = 0;

    intervalRef.current = window.setInterval(() => {
      if (charIndex < chars.length) {
        const next = chars.slice(0, charIndex + 1).join("");
        setDisplayedText(next);
        charIndex += 1;
      } else {
        clearInterval(intervalRef.current);
        intervalRef.current = null;

        setIsTyping(false);

        timeoutRef.current = window.setTimeout(() => {
          setPlaceholderIndex(
            (prev) => (prev + 1) % placeholders.length
          );
        }, IDLE_DELAY_AFTER_FINISH);
      }
    }, CHAR_DELAY);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [placeholderIndex, placeholders]);

  return (
    <div className="orb-input-container">

      {/* Animated Orb */}
      <div className="orb-wrapper">
        <img
          src="https://media.giphy.com/media/26gsuUjoEBmLrNBxC/giphy.gif"
          alt="Animated orb"
          className="orb-image"
        />
      </div>

      {/* Divider */}
      <div className="orb-divider"></div>

      {/* Input */}
      <div className="orb-input-area">
        <input
          data-testid="orb-input"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={`${displayedText}${isTyping ? "|" : ""}`}
          aria-label="Builder assistant input"
          className="orb-input"
        />
      </div>

    </div>
  );
}

export default OrbInput;