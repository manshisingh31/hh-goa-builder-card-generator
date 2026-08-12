import { useState } from "react";
import html2canvas from "html2canvas";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [techStack, setTechStack] = useState("");
  const [photo, setPhoto] = useState(null);

  const [error, setError] = useState("");
  const [sharing, setSharing] = useState(false);

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
  };

  // ==========================================
  // CREATE FINAL CARD
  // EXACT SIZE: 1080 × 1350
  // ==========================================

  const createCardCanvas = async () => {
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

    const targetWidth = 1080;

    const scale =
      targetWidth / rect.width;

    const canvas =
      await html2canvas(
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

    // ========================================
    // EXACT 1080 × 1350 OUTPUT
    // ========================================

    const outputCanvas =
      document.createElement(
        "canvas"
      );

    outputCanvas.width = 1080;
    outputCanvas.height = 1350;

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
      1080,
      1350
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
  // ==========================================

  const shareToX = async () => {
    if (sharing) {
      return;
    }

    // ========================================
    // OPEN X TAB IMMEDIATELY
    // ========================================

    const xWindow =
      window.open(
        "about:blank",
        "_blank"
      );

    if (!xWindow) {
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
      // ======================================

      const outputCanvas =
        await createCardCanvas();

      // ======================================
      // CONVERT CANVAS TO PNG
      // ======================================

      const file =
        await canvasToFile(
          outputCanvas
        );

      // ======================================
      // UPLOAD PNG
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
      // X CAPTION
      // ======================================

      const caption =
        "HH GOA 2026 #FrameInGoa";

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
        xWindow.close();
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
                : "𝕏 Share to X"}

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

            <div
              className="card-photo"
            >

              {photo ? (

                <img
                  src={photo}
                  alt="Builder"
                />

              ) : (

                <span>
                  Your Photo
                </span>

              )}

            </div>

            {/* NAME */}

            <h3
              className="card-name"
            >
              {name ||
                "Your Name"}
            </h3>

            {/* ROLE */}

            <p
              className="card-role"
            >
              {role ||
                "Frontend Developer"}
            </p>

            {/* TECH STACK */}

            <p
              className="card-stack"
            >
              {techStack ||
                "React • JavaScript"}
            </p>

            {/* FOOTER */}

            <div
              className="card-footer"
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