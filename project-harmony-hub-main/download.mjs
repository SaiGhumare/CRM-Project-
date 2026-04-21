import fs from 'fs';

async function downloadLogo() {
  try {
    console.log("Starting download...");
    const res = await fetch("https://upload.wikimedia.org/wikipedia/en/2/29/Karmaveer_Adv._Baburao_Ganpatrao_Thakare_College_of_Engineering_Nashik_logo.png", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const buffer = await res.arrayBuffer();
    fs.writeFileSync('src/assets/kbtcoe-logo.png', Buffer.from(buffer));
    console.log("Image downloaded successfully! Bytes:", buffer.byteLength);
  } catch(e) {
    console.error("Failed to download image: ", e);
  }
}

downloadLogo();
