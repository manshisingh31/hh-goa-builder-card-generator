import { useState } from "react";
import html2canvas from "html2canvas";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [techStack, setTechStack] = useState("");
  const [photo, setPhoto] = useState(null);

  // Photo upload
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const imageURL = URL.createObjectURL(file);
      setPhoto(imageURL);
    }
  };

  // Generate / download card
  const downloadCard = async () => {
    const card = document.getElementById("builder-card");

    if (!card) return;

    try {
      const canvas = await html2canvas(card, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#171717",
      });

      const link = document.createElement("a");

      link.download = "HH-GOA-2026-Builder-Card.png";
      link.href = canvas.toDataURL("image/png");

      link.click();
    } catch (error) {
      console.error("Could not generate card:", error);
    }
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <h1>HH GOA 2026</h1>
        <p>Builder Card Generator</p>
      </header>

      <main className="main-container">

        {/* LEFT SIDE - FORM */}
        <section className="input-section">

          <h2>Create your Builder Card</h2>

          {/* PHOTO UPLOAD */}
          <div className="upload-box">
            <p>📸 Upload your photo</p>

            <label className="upload-button">
              Choose Photo

              <input
                type="file"
                accept="image/jpeg,image/png,image/heic,image/*"
                onChange={handlePhotoUpload}
                hidden
              />
            </label>
          </div>

          {/* NAME */}
          <label>
            <span>Name</span>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          {/* ROLE */}
          <label>
            <span>Role / Stack</span>

            <input
              type="text"
              placeholder="e.g. Frontend Developer"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            />
          </label>

          {/* TECH STACK */}
          <label>
            <span>Tech Stack</span>

            <input
              type="text"
              placeholder="e.g. React, JavaScript"
              value={techStack}
              onChange={(event) => setTechStack(event.target.value)}
            />
          </label>

          {/* STARDUST GENERATE BUTTON */}
          <div className="generate-button-wrapper">
            <button
              className="generate-button"
              type="button"
              onClick={downloadCard}
            >
              Generate Card
            </button>
          </div>

        </section>

        {/* RIGHT SIDE - PREVIEW */}
        <section className="preview-section">

          <h2>Preview</h2>

          {/* CARD TO BE DOWNLOADED */}
          <div
            className="builder-card"
            id="builder-card"
          >

            {/* EVENT TITLE */}
            <h2 className="card-event-title">
              HH GOA 2026
            </h2>

            {/* PHOTO */}
            <div className="card-photo">

              {photo ? (
                <img
                  src={photo}
                  alt="Builder"
                />
              ) : (
                <span>Your Photo</span>
              )}

            </div>

            {/* NAME */}
            <h3 className="card-name">
              {name || "Your Name"}
            </h3>

            {/* ROLE */}
            <p className="card-role">
              {role || "Frontend Developer"}
            </p>

            {/* TECH STACK */}
            <p className="card-stack">
              {techStack || "React • JavaScript"}
            </p>

            {/* FOOTER */}
            <div className="card-footer">
              HH GOA 2026
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default App;