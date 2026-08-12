export default async function handler(req, res) {
  try {
    const imageUrl = req.query.image;

    if (!imageUrl) {
      return res.status(400).send("Missing image");
    }

    const decodedImageUrl = decodeURIComponent(
      String(imageUrl)
    );

    let parsedUrl;

    try {
      parsedUrl = new URL(decodedImageUrl);
    } catch {
      return res.status(400).send("Invalid image URL");
    }

    // Only allow HTTPS Vercel Blob URLs.
    if (parsedUrl.protocol !== "https:") {
      return res.status(400).send("Invalid image URL");
    }

    if (
      !parsedUrl.hostname.endsWith(
        ".public.blob.vercel-storage.com"
      )
    ) {
      return res.status(400).send("Image host not allowed");
    }

    // Fetch the actual generated PNG.
    const response = await fetch(
      parsedUrl.toString()
    );

    if (!response.ok) {
      return res.status(502).send(
        "Could not fetch generated image"
      );
    }

    const contentType =
      response.headers.get("content-type") ||
      "image/png";

    const imageBuffer =
      Buffer.from(
        await response.arrayBuffer()
      );

    // Tell X and other crawlers this endpoint
    // is an actual image, not an HTML page.
    res.setHeader(
      "Content-Type",
      contentType
    );

    res.setHeader(
      "Content-Length",
      imageBuffer.length
    );

    res.setHeader(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    res.setHeader(
      "X-Content-Type-Options",
      "nosniff"
    );

    return res.status(200).send(
      imageBuffer
    );

  } catch (error) {
    console.error(
      "Card image error:",
      error
    );

    return res.status(500).send(
      "Could not serve card image"
    );
  }
}