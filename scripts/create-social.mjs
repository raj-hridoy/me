import sharp from "sharp";
import { writeFile } from "node:fs/promises";
const plates = Array.from({ length: 24 }, (_, i) => {
  const y = 207 + i * 8 + (i < 8 ? -18 : i > 15 ? 18 : 0);
  const wide = i > 7 && i < 16 ? 143 : 167;
  return `<path d="M${895 - wide} ${y} 895 ${y - 66} ${895 + wide} ${y} 895 ${y + 66}Z" fill="#10131c" stroke="${i > 7 && i < 16 ? "#a7b5ff" : "#c6cddf"}" stroke-opacity=".55" stroke-width="1"/>`;
})
  .reverse()
  .join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#08090e"/><stop offset="1" stop-color="#10131c"/></linearGradient><linearGradient id="policy" x2="1" y2="1"><stop stop-color="#8194ff" stop-opacity=".28"/><stop offset="1" stop-color="#a199c7" stop-opacity=".08"/></linearGradient></defs>
<rect width="1200" height="630" fill="url(#bg)"/>
<path d="M55 100h1090M55 560h1090M895 145v370" stroke="#2a3040"/>
<g transform="translate(53 23)" fill="#f2f4f8"><path d="M4 40V8H26L34 16V25L26 31L36 40H25L15 30H12V40ZM12 16V23H23L26 20V18L23 16Z" fill-rule="evenodd"/><path d="M39 8H47V21H55V8H63V40H55V29H47V40H39Z"/></g>
<text x="137" y="59" fill="#f2f4f8" font-family="sans-serif" font-size="21" font-weight="600">RAJ HRIDOY</text>
<text x="1145" y="58" text-anchor="end" fill="#a1a9bc" font-family="monospace" font-size="11" letter-spacing="1">BOUNDARY STUDIES / BANGLADESH</text>
<text x="55" y="158" fill="#c6cddf" font-family="sans-serif" font-size="20">I explore where</text>
<g fill="#f2f4f8" font-family="sans-serif" font-weight="500"><text x="45" y="339" font-size="210" letter-spacing="-12">TRUST</text><text x="49" y="486" font-size="125" letter-spacing="-7">BREAKS<tspan fill="#8194ff">.</tspan></text></g>
${plates}
<path d="M705 306 895 230 1085 306 895 382Z" fill="url(#policy)" stroke="#a7b5ff" stroke-width="1.4"/>
<rect x="891" y="302" width="8" height="8" fill="#a7b5ff"/>
<path d="M58 520h38m-38-15v15m1089-355v-20h-20" stroke="#8194ff"/>
<text x="55" y="594" fill="#a1a9bc" font-family="monospace" font-size="12" letter-spacing="1">INDEPENDENT SECURITY RESEARCHER</text>
<text x="1145" y="594" text-anchor="end" fill="#c6cddf" font-family="monospace" font-size="11">IDENTITY ≠ PERMISSION</text>
</svg>`;
await writeFile(new URL("../public/social-preview.svg", import.meta.url), svg);
await sharp(Buffer.from(svg))
  .png()
  .toFile(new URL("../public/social-preview.png", import.meta.url).pathname);
console.log("Generated original dark RH social preview: 1200 × 630");
