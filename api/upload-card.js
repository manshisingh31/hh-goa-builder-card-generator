import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const file = Buffer.concat(chunks);

    const blob = await put(
      `hh-goa/${Date.now()}-builder-card.png`,
      file,
      {
        access: "public",
        contentType: "image/png",
      }
    );

    res.status(200).json({
      url: blob.url,
    });
  } catch (error) {
    console.error("Upload error:", error);

    res.status(500).json({
      error: "Could not upload card",
    });
  }
}