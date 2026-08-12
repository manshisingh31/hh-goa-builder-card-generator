import React from "react";

export function ShinyButton({ children, onClick, className = "" }) {
  return (
    <>
      <style>{`
        .shiny-cta {
          --shiny-cta-bg: #000000;
          --shiny-cta-bg-subtle: #1a1818;
          --shiny-cta-fg: #ffffff;
          --shiny-cta-highlight: #008cff;
          --shiny-cta-highlight-subtle: #6dbdff;
          --duration: 3s;

          position: relative;
          isolation: isolate;
          overflow: hidden;
          cursor: pointer;

          padding: 1rem 2rem;

          font-family: Inter, system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 600;

          border: 1px solid transparent;
          border-radius: 360px;

          color: var(--shiny-cta-fg);

          background:
            linear-gradient(
              var(--shiny-cta-bg),
              var(--shiny-cta-bg)
            ) padding-box,

            conic-gradient(
              from 0deg,
              transparent,
              var(--shiny-cta-highlight) 10%,
              white 20%,
              var(--shiny-cta-highlight) 30%,
              transparent 40%
            ) border-box;

          box-shadow:
            inset 0 0 0 1px var(--shiny-cta-bg-subtle),
            0 0 20px rgba(0, 140, 255, 0.15);

          transition:
            transform 0.2s ease,
            box-shadow 0.3s ease;
        }

        .shiny-cta::before {
          content: "";
          position: absolute;
          inset: 2px;
          border-radius: inherit;

          background:
            radial-gradient(
              circle at 20% 20%,
              rgba(255,255,255,0.3) 1px,
              transparent 2px
            );

          background-size: 8px 8px;

          opacity: 0.25;

          pointer-events: none;
        }

        .shiny-cta::after {
          content: "";
          position: absolute;

          width: 120%;
          height: 120%;

          left: -10%;
          top: -10%;

          background:
            linear-gradient(
              120deg,
              transparent 35%,
              rgba(0, 140, 255, 0.35),
              transparent 65%
            );

          transform: translateX(-100%);
          transition: transform 0.8s ease;

          pointer-events: none;
        }

        .shiny-cta:hover {
          transform: translateY(-2px);

          box-shadow:
            inset 0 0 0 1px #1a1818,
            0 0 25px rgba(0, 140, 255, 0.35);
        }

        .shiny-cta:hover::after {
          transform: translateX(100%);
        }

        .shiny-cta:active {
          transform: translateY(1px);
        }

        .shiny-cta span {
          position: relative;
          z-index: 2;
        }
      `}</style>

      <button
        type="button"
        className={`shiny-cta ${className}`}
        onClick={onClick}
      >
        <span>{children}</span>
      </button>
    </>
  );
}

export default ShinyButton;