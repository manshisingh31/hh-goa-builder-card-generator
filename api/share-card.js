export default async function handler(req, res) {
  try {
    const imageUrl = req.query.image;

    if (!imageUrl) {
      return res.status(400).send("Missing image");
    }

    const decodedImageUrl = decodeURIComponent(
      String(imageUrl)
    );

    // Only allow HTTPS image URLs.
    if (!decodedImageUrl.startsWith("https://")) {
      return res.status(400).send("Invalid image URL");
    }

    // Escape HTML-sensitive characters.
    const safeImageUrl = decodedImageUrl
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const pageUrl =
      `https://${req.headers.host}${req.url}`;

    const safePageUrl = pageUrl
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>

  <meta charset="UTF-8">

  <title>HH GOA 2026 #FrameInGoa</title>

  <meta
    name="description"
    content="HH GOA 2026 Builder Card #FrameInGoa"
  >

  <!-- Open Graph -->

  <meta
    property="og:title"
    content="HH GOA 2026 #FrameInGoa"
  >

  <meta
    property="og:description"
    content="HH GOA 2026 Builder Card #FrameInGoa"
  >

  <meta
    property="og:type"
    content="website"
  >

  <meta
    property="og:url"
    content="${safePageUrl}"
  >

  <meta
    property="og:image"
    content="${safeImageUrl}"
  >

  <meta
    property="og:image:secure_url"
    content="${safeImageUrl}"
  >

  <meta
    property="og:image:type"
    content="image/png"
  >

  <meta
    property="og:image:width"
    content="1080"
  >

  <meta
    property="og:image:height"
    content="1350"
  >

  <!-- X / Twitter -->

  <meta
    name="twitter:card"
    content="summary_large_image"
  >

  <meta
    name="twitter:title"
    content="HH GOA 2026 #FrameInGoa"
  >

  <meta
    name="twitter:description"
    content="HH GOA 2026 Builder Card #FrameInGoa"
  >

  <meta
    name="twitter:image"
    content="${safeImageUrl}"
  >

  <meta
    name="twitter:image:alt"
    content="HH GOA 2026 Builder Card"
  >

  <meta
    name="twitter:url"
    content="${safePageUrl}"
  >

  <style>
    html,
    body {
      margin: 0;
      padding: 0;
      min-height: 100%;
      background: #111;
      color: white;
      font-family: Arial, sans-serif;
    }

    body {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .container {
      width: 100%;
      max-width: 600px;
      padding: 30px;
      box-sizing: border-box;
    }

    .card-image {
      width: 100%;
      max-width: 540px;
      height: auto;
      display: block;
      margin: 0 auto 25px;
      border-radius: 16px;
    }

    h1 {
      margin: 10px 0;
    }

    p {
      opacity: 0.8;
    }
  </style>

</head>

<body>

  <main class="container">

    <img
      class="card-image"
      src="${safeImageUrl}"
      alt="HH GOA 2026 Builder Card"
    >

    <h1>
      HH GOA 2026
    </h1>

    <p>
      #FrameInGoa
    </p>

  </main>

</body>
</html>`;

    // Important headers for social-media crawlers.
    res.setHeader(
      "Content-Type",
      "text/html; charset=utf-8"
    );

    res.setHeader(
      "Cache-Control",
      "public, max-age=300, s-maxage=300"
    );

    res.setHeader(
      "X-Content-Type-Options",
      "nosniff"
    );

    return res.status(200).send(html);

  } catch (error) {
    console.error(
      "Share card error:",
      error
    );

    return res.status(500).send(
      "Could not prepare share card"
    );
  }
}