import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import "./App.css";

// ==========================================
// BUILDER TITLE GENERATOR
// Deterministic "fun title" from name/role/stack
// ==========================================

const BUILDER_TITLE_PREFIXES = [
  "Sunset",
  "Coastal",
  "Monsoon",
  "Palm-Shade",
  "Tidewave",
  "Golden-Hour",
  "Coconut",
  "Beachside",
  "Firefly",
  "Vintage-Van",
];

const BUILDER_TITLE_SUFFIXES = [
  "Code Surfer",
  "Pixel Wizard",
  "Byte Voyager",
  "Stack Alchemist",
  "Ship-It Captain",
  "Bug Whisperer",
  "Build Nomad",
  "Debug Ninja",
  "Idea Architect",
  "Prototype Pirate",
];

function hashString(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function generateBuilderTitle(name, role, techStack) {
  const seed = `${name}|${role}|${techStack}`;
  const hash = hashString(seed);

  const prefix =
    BUILDER_TITLE_PREFIXES[hash % BUILDER_TITLE_PREFIXES.length];

  const suffix =
    BUILDER_TITLE_SUFFIXES[
      Math.floor(hash / BUILDER_TITLE_PREFIXES.length) %
        BUILDER_TITLE_SUFFIXES.length
    ];

  return `${prefix} ${suffix}`;
}

// ==========================================
// PHOTO REPOSITIONING HELPERS
// ==========================================

const PHOTO_BOX_WIDTH = 196;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function App() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [techStack, setTechStack] = useState("");
  const [photo, setPhoto] = useState(null);

  const [photoTransform, setPhotoTransform] = useState({
    x: 0,
    y: 0,
    scale: 1,
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef(null);

  const [error, setError] = useState("");
  const [sharing, setSharing] = useState(false);

  const builderTitle = useMemo(
    () => generateBuilderTitle(name, role, techStack),
    [name, role, techStack]
  );

  // ==========================================
  // PHOTO UPLOAD
  // JPG / JPEG / PNG / HEIC / HEIF ONLY
  // ==========================================

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heic",
      "image/heif",
    ];

    const fileName = file.name.toLowerCase();

    const validExtension =
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".heic") ||
      fileName.endsWith(".heif");

    const validType =
      allowedTypes.includes(file.type) ||
      validExtension;

    if (!validType) {
      setError(
        "Please upload only JPG, JPEG, PNG or HEIC/HEIF images."
      );

      event.target.value = "";

      return;
    }

    const imageURL = URL.createObjectURL(file);

    setPhoto(imageURL);

    // Reset positioning so a new photo always starts centered.
    setPhotoTransform({ x: 0, y: 0, scale: 1 });
  };

  // ==========================================
  // PHOTO DRAG-TO-REPOSITION
  // Lets off-center / oddly-cropped photos be
  // framed properly instead of assuming a
  // pre-cropped, centered portrait.
  // ==========================================

  const handlePhotoPointerDown = (event) => {
    if (!photo) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: photoTransform.x,
      originY: photoTransform.y,
    };

    setIsDragging(true);
  };

  const handlePhotoPointerMove = (event) => {
    if (!dragState.current) {
      return;
    }

    const deltaX = event.clientX - dragState.current.startX;
    const deltaY = event.clientY - dragState.current.startY;

    const maxOffset =
      (photoTransform.scale - 1) * PHOTO_BOX_WIDTH * 0.6 + 40;

    setPhotoTransform((previous) => ({
      ...previous,
      x: clamp(dragState.current.originX + deltaX, -maxOffset, maxOffset),
      y: clamp(dragState.current.originY + deltaY, -maxOffset, maxOffset),
    }));
  };

  const handlePhotoPointerUp = (event) => {
    dragState.current = null;

    setIsDragging(false);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore release errors.
    }
  };

  const handleZoomChange = (event) => {
    const nextScale = Number(event.target.value);

    setPhotoTransform((previous) => {
      const maxOffset = (nextScale - 1) * PHOTO_BOX_WIDTH * 0.6 + 40;

      return {
        x: clamp(previous.x, -maxOffset, maxOffset),
        y: clamp(previous.y, -maxOffset, maxOffset),
        scale: nextScale,
      };
    });
  };

  // ==========================================
  // CAPTURE CARD (raw html2canvas render)
  // ==========================================

  const CARD_WIDTH = 1080;
  const CARD_HEIGHT = 1350;

  const captureCard = async () => {
    const card = document.getElementById(
      "builder-card"
    );

    if (!card) {
      throw new Error(
        "Builder card not found."
      );
    }

    const images = card.querySelectorAll("img");

    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) {
          return Promise.resolve();
        }

        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    const rect =
      card.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      throw new Error(
        "Card has invalid dimensions."
      );
    }

    const targetWidth = CARD_WIDTH;

    const scale =
      targetWidth / rect.width;

    return html2canvas(
      card,
      {
        scale: scale,

        useCORS: true,

        allowTaint: false,

        backgroundColor: null,

        imageTimeout: 0,

        logging: false,

        windowWidth:
          document.documentElement
            .clientWidth,

        windowHeight:
          document.documentElement
            .clientHeight,
      }
    );
  };

  // ==========================================
  // CREATE FINAL CARD (for download)
  // EXACT SIZE: 1080 × 1350
  // ==========================================

  const createCardCanvas = async () => {
    const canvas = await captureCard();

    // ========================================
    // EXACT 1080 × 1350 OUTPUT
    // ========================================

    const outputCanvas =
      document.createElement(
        "canvas"
      );

    outputCanvas.width = CARD_WIDTH;
    outputCanvas.height = CARD_HEIGHT;

    const ctx =
      outputCanvas.getContext(
        "2d"
      );

    if (!ctx) {
      throw new Error(
        "Could not create canvas context."
      );
    }

    ctx.imageSmoothingEnabled =
      true;

    ctx.imageSmoothingQuality =
      "high";

    ctx.drawImage(
      canvas,

      0,
      0,
      canvas.width,
      canvas.height,

      0,
      0,
      CARD_WIDTH,
      CARD_HEIGHT
    );

    return outputCanvas;
  };

  // ==========================================
  // CREATE SHARE CARD (for X)
  // X only shows single images without cropping
  // when they're between 1:1 and 2:1. Our card is
  // a 4:5 portrait, which falls outside that and
  // gets center-cropped top/bottom in the timeline.
  // Pad the untouched card onto a 1:1 square with a
  // branded backdrop instead of reflowing/shrinking
  // the card itself.
  // ==========================================

  const createShareCanvas = async () => {
    const canvas = await captureCard();

    const size = CARD_HEIGHT;

    const outputCanvas =
      document.createElement("canvas");

    outputCanvas.width = size;
    outputCanvas.height = size;

    const ctx = outputCanvas.getContext("2d");

    if (!ctx) {
      throw new Error(
        "Could not create canvas context."
      );
    }

    const backdrop = ctx.createLinearGradient(
      0,
      0,
      size,
      size
    );

    backdrop.addColorStop(0, "#ff9e63");
    backdrop.addColorStop(0.34, "#ff6ec8");
    backdrop.addColorStop(0.68, "#6ed4ff");
    backdrop.addColorStop(1, "#7af0d1");

    ctx.fillStyle = backdrop;
    ctx.fillRect(0, 0, size, size);

    const offsetX = (size - CARD_WIDTH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      canvas,

      0,
      0,
      canvas.width,
      canvas.height,

      offsetX,
      0,
      CARD_WIDTH,
      CARD_HEIGHT
    );

    return outputCanvas;
  };

  // ==========================================
  // DOWNLOAD CARD
  // ==========================================

  const downloadCard = async () => {
    try {
      setError("");

      const outputCanvas =
        await createCardCanvas();

      outputCanvas.toBlob(
        (blob) => {
          if (!blob) {
            setError(
              "Could not create PNG."
            );

            return;
          }

          const url =
            URL.createObjectURL(
              blob
            );

          const link =
            document.createElement(
              "a"
            );

          link.href = url;

          link.download =
            "HH-GOA-2026-Builder-Card.png";

          document.body.appendChild(
            link
          );

          link.click();

          link.remove();

          URL.revokeObjectURL(
            url
          );
        },

        "image/png",

        1
      );
    } catch (error) {
      console.error(
        "Could not download card:",
        error
      );

      setError(
        error?.message ||
          "Could not generate the card. Please try again."
      );
    }
  };

  // ==========================================
  // CANVAS → PNG FILE
  // ==========================================

  const canvasToFile = (
    canvas
  ) => {
    return new Promise(
      (resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(
                new Error(
                  "Could not create PNG."
                )
              );

              return;
            }

            const file =
              new File(
                [blob],

                "HH-GOA-2026-Builder-Card.png",

                {
                  type: "image/png",
                }
              );

            resolve(file);
          },

          "image/png",

          1
        );
      }
    );
  };

  // ==========================================
  // UPLOAD PNG TO VERCEL BLOB
  // ==========================================

  const uploadCard = async (
    file
  ) => {
    const response =
      await fetch(
        "/api/upload-card",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "image/png",
          },

          body: file
        }
      );

    const responseText =
      await response.text();

    console.log(
      "Upload status:",
      response.status
    );

    console.log(
      "Upload response:",
      responseText
    );

    if (!response.ok) {
      throw new Error(
        `Upload failed (${response.status}): ${responseText}`
      );
    }

    let data;

    try {
      data =
        JSON.parse(
          responseText
        );
    } catch {
      throw new Error(
        "Upload API returned an invalid response: " +
          responseText
      );
    }

    if (!data.url) {
      throw new Error(
        "Upload API did not return an image URL."
      );
    }

    return data.url;
  };

  // ==========================================
  // SHARE TO X
  // Prefers a direct image attach via the native
  // Web Share API (full-size image, no link-card
  // shrinking). Falls back to a share link with
  // proper OG image tags on desktop / unsupported
  // browsers.
  // ==========================================

  const shareToX = async () => {
    if (sharing) {
      return;
    }

    const caption =
      "HH GOA 2026 #FrameInGoa";

    // ========================================
    // DECIDE SHARE STRATEGY SYNCHRONOUSLY
    // (must happen before any `await`, both to
    // stay inside the user-gesture window for
    // navigator.share and to keep the popup
    // trick below working for the link fallback)
    // ========================================

    const supportsFileShare =
      typeof navigator !== "undefined" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({
        files: [
          new File([""], "check.png", {
            type: "image/png",
          }),
        ],
      });

    // Only the link fallback needs a pre-opened
    // tab to dodge popup blockers.
    const xWindow = supportsFileShare
      ? null
      : window.open("about:blank", "_blank");

    if (!supportsFileShare && !xWindow) {
      setError(
        "Please allow pop-ups for this website and click Share to X again."
      );

      return;
    }

    try {
      setError("");

      setSharing(true);

      // ======================================
      // GENERATE FINAL CARD
      // Square (1:1) so X shows it uncropped.
      // ======================================

      const outputCanvas =
        await createShareCanvas();

      // ======================================
      // CONVERT CANVAS TO PNG
      // ======================================

      const file =
        await canvasToFile(
          outputCanvas
        );

      // ======================================
      // PREFERRED: DIRECT IMAGE ATTACH
      // ======================================

      if (supportsFileShare) {
        try {
          await navigator.share({
            files: [file],
            text: caption,
          });
        } catch (shareError) {
          if (shareError?.name !== "AbortError") {
            throw shareError;
          }
        }

        setSharing(false);

        return;
      }

      // ======================================
      // FALLBACK: UPLOAD + SHARE LINK
      // ======================================

      const imageUrl =
        await uploadCard(
          file
        );

      console.log(
        "Uploaded image URL:",
        imageUrl
      );

      // ======================================
      // IMPORTANT:
      // ALWAYS USE PRODUCTION DOMAIN
      // ======================================

      const productionDomain =
        "https://hh-goa-builder-card-generator-two.vercel.app";

      const sharePage =
        `${productionDomain}/api/share-card?image=${encodeURIComponent(
          imageUrl
        )}`;

      console.log(
        "Production share page:",
        sharePage
      );

      // ======================================
      // CREATE X POST TEXT
      // ======================================

      const xText =
        `${caption}\n\n${sharePage}`;

      // ======================================
      // CREATE X COMPOSER URL
      // ======================================

      const xURL =
        `https://x.com/intent/post?text=${encodeURIComponent(
          xText
        )}`;

      console.log(
        "X URL:",
        xURL
      );

      // ======================================
      // MOVE ALREADY-OPEN TAB TO X
      // ======================================

      xWindow.location.href =
        xURL;

      setSharing(false);

    } catch (error) {
      console.error(
        "Could not share card:",
        error
      );

      try {
        xWindow?.close();
      } catch {
        // Ignore close errors.
      }

      setSharing(false);

      setError(
        error?.message ||
          "Could not prepare the card for sharing."
      );
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <h1>
          HH GOA 2026
        </h1>

        <p>
          Builder Card Generator
        </p>

      </header>

      <main className="main-container">

        {/* ====================================
            LEFT SIDE
        ===================================== */}

        <section className="input-section">

          <h2>
            Create your Builder Card
          </h2>

          {/* PHOTO UPLOAD */}

          <div className="upload-box">

            <p>
              📸 Upload your photo
            </p>

            <label className="upload-button">

              Choose Photo

              <input
                type="file"

                accept=".jpg,.jpeg,.png,.heic,.heif,image/jpeg,image/png,image/heic,image/heif"

                onChange={
                  handlePhotoUpload
                }

                hidden
              />

            </label>

            {photo && (
              <div className="photo-adjust">

                <label className="photo-adjust-zoom">
                  <span>Zoom</span>

                  <input
                    type="range"
                    min="1"
                    max="2.2"
                    step="0.01"
                    value={photoTransform.scale}
                    onChange={handleZoomChange}
                  />
                </label>

                <p className="photo-adjust-hint">
                  Drag your photo on the card preview to reposition it.
                </p>

              </div>
            )}

            {error && (
              <p
                style={{
                  color: "red",
                  marginTop: "10px",
                  fontSize: "14px",
                  wordBreak:
                    "break-word",
                }}
              >
                {error}
              </p>
            )}

          </div>

          {/* NAME */}

          <label>

            <span>
              Name
            </span>

            <input
              type="text"

              placeholder="Enter your name"

              value={name}

              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
            />

          </label>

          {/* ROLE */}

          <label>

            <span>
              Role / Stack
            </span>

            <input
              type="text"

              placeholder="e.g. Frontend Developer"

              value={role}

              onChange={(event) =>
                setRole(
                  event.target.value
                )
              }
            />

          </label>

          {/* TECH STACK */}

          <label>

            <span>
              Tech Stack
            </span>

            <input
              type="text"

              placeholder="e.g. React, JavaScript"

              value={techStack}

              onChange={(event) =>
                setTechStack(
                  event.target.value
                )
              }
            />

          </label>

          {/* GENERATE BUTTON */}

          <div className="generate-button-wrapper">

            <button
              className="generate-button"
              type="button"
              onClick={
                downloadCard
              }
            >
              Generate Card
            </button>

          </div>

          {/* SHARE BUTTON */}

          <div
            className="generate-button-wrapper"
            style={{
              marginTop: "18px",
            }}
          >

            <button
              className="share-button"
              type="button"
              onClick={
                shareToX
              }
              disabled={sharing}
            >

              {sharing
                ? "Preparing..."
                : "Share to 𝕏"}

            </button>

          </div>

        </section>

        {/* ====================================
            RIGHT SIDE
        ===================================== */}

        <section className="preview-section">

          <h2>
            Preview
          </h2>

          {/* BUILDER CARD */}

          <div
            className="builder-card"
            id="builder-card"
          >

            {/* EVENT TITLE */}

            <h2
              className="card-event-title"
            >
              HH GOA 2026
            </h2>

            {/* PHOTO */}

            <div className="card-photo-frame">

              <div
                className="card-photo"
              >

                {photo ? (

                  <img
                    src={photo}
                    alt="Builder"
                    draggable={false}
                    style={{
                      transform: `translate(${photoTransform.x}px, ${photoTransform.y}px) scale(${photoTransform.scale})`,
                      cursor: isDragging
                        ? "grabbing"
                        : "grab",
                    }}
                    onPointerDown={handlePhotoPointerDown}
                    onPointerMove={handlePhotoPointerMove}
                    onPointerUp={handlePhotoPointerUp}
                    onPointerCancel={handlePhotoPointerUp}
                  />

                ) : (

                  <span>
                    Your Photo
                  </span>

                )}

              </div>

              <span
                className="card-photo-badge"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="5" fill="#fff" />
                  <g stroke="#fff" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 1.5v3" />
                    <path d="M12 19.5v3" />
                    <path d="M1.5 12h3" />
                    <path d="M19.5 12h3" />
                    <path d="M4.4 4.4l2.1 2.1" />
                    <path d="M17.5 17.5l2.1 2.1" />
                    <path d="M4.4 19.6l2.1-2.1" />
                    <path d="M17.5 6.5l2.1-2.1" />
                  </g>
                </svg>
              </span>

            </div>

            {/* NAME */}

            <div className="card-name-ribbon">

              <h3
                className="card-name"
              >
                {name ||
                  "Your Name"}
              </h3>

            </div>

            {/* FUN FIELDS */}

            <div className="card-fields">

              <p className="card-field card-field-title">
                <span className="card-field-icon">🏆</span>
                {builderTitle}
              </p>

              <p className="card-field">
                <span className="card-field-icon">💼</span>
                {role ||
                  "Frontend Developer"}
              </p>

              <p className="card-field">
                <span className="card-field-icon">🛠️</span>
                {techStack ||
                  "React • JavaScript"}
              </p>

            </div>

            {/* FOOTER */}

            <div
              className="card-footer"
              style={{
                margin: "8px 15px 0"
              }}
            >
              HH GOA 2026
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default App;