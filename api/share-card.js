export default async function handler(req, res) {
try {
// ==========================================
// GET ORIGINAL VERCEL BLOB IMAGE URL
// ==========================================

const imageParam = req.query.image;  

if (!imageParam) {  
  return res.status(400).send("Missing image");  
}  

// Vercel normally gives us the decoded query value.  
const imageUrl = Array.isArray(imageParam)  
  ? imageParam[0]  
  : String(imageParam);  

// ==========================================  
// VALIDATE IMAGE URL  
// ==========================================  

let parsedImageUrl;  

try {  
  parsedImageUrl = new URL(imageUrl);  
} catch {  
  return res.status(400).send("Invalid image URL");  
}  

if (parsedImageUrl.protocol !== "https:") {  
  return res.status(400).send("Invalid image URL");  
}  

if (  
  !parsedImageUrl.hostname.endsWith(  
    ".public.blob.vercel-storage.com"  
  )  
) {  
  return res.status(400).send("Image host not allowed");  
}  

// ==========================================  
// CURRENT PAGE URL  
// ==========================================  

const host = req.headers.host;  

const protocol =  
  req.headers["x-forwarded-proto"] || "https";  

const origin = `${protocol}://${host}`;  

const pageUrl = `${origin}${req.url}`;  

// ==========================================  
// HTML ESCAPING  
// ==========================================  

const safeImageUrl = imageUrl  
  .replace(/&/g, "&amp;")  
  .replace(/"/g, "&quot;")  
  .replace(/</g, "&lt;")  
  .replace(/>/g, "&gt;");  

const safePageUrl = pageUrl  
  .replace(/&/g, "&amp;")  
  .replace(/"/g, "&quot;")  
  .replace(/</g, "&lt;")  
  .replace(/>/g, "&gt;");  

// ==========================================  
// SHARE PAGE  
// ==========================================  

const html = `<!DOCTYPE html>

<html lang="en">  <head>    <meta charset="UTF-8">    <title>HH GOA 2026 #FrameInGoa</title>  <meta
name="description"
content="HH GOA 2026 Builder Card #FrameInGoa"

> 

  <!-- ===================================== -->    <!-- OPEN GRAPH -->    <!-- ===================================== -->  <meta
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

  <!-- IMPORTANT:  
       X now receives the ORIGINAL PNG directly.  
       No /api/card-image proxy. -->  <meta
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

  <!-- ===================================== -->    <!-- X / TWITTER -->    <!-- ===================================== -->  <meta
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

  <!-- ===================================== -->    <!-- PAGE STYLE -->    <!-- ===================================== -->    <style>  
  
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
      max-width: 700px;  
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
  
  </style>  </head>  <body>    <main class="container">  <img  
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

  </main>  </body>  </html>`;  // ==========================================  
// RESPONSE HEADERS  
// ==========================================  

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