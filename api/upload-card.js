import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const file = Buffer.concat(chunks);

    if (!file.length) {
      return res.status(400).json({
        error: "No card image received",
      });
    }

    const blob = await put(
      `hh-goa/${Date.now()}-builder-card.png`,
      file,
      {
        access: "public",
        contentType: "image/png",
        storeId: process.env.HHGOA_STORE_ID,
      }
    );

    return res.status(200).json({
      url: blob.url,
    });
  } catch (error) {
    console.error("Card upload failed:", error);

    return res.status(500).json({
      error: "Could not upload card",
      details: error?.message || "Unknown error",
    });
  }
}