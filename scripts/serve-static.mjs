// Preview the exact GitHub Pages export, including its /me project path.
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { createGzip } from "node:zlib";
import { stat } from "node:fs/promises";
import { resolve, extname, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../out");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
};
const port = Number(process.env.PORT ?? 3000);
createServer(async (req, res) => {
  try {
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    const url = new URL(req.url, "http://localhost");
    if (["/", "/me"].includes(url.pathname)) {
      res.writeHead(308, { Location: `/me/${url.search}` }).end();
      return;
    }
    const path = decodeURIComponent(url.pathname);
    let file = resolve(root, path.slice(4));
    if (
      !path.startsWith("/me/") ||
      (file !== root && !file.startsWith(root + sep))
    ) {
      res.writeHead(404).end();
      return;
    }
    let info;
    try {
      info = await stat(file);
    } catch {
      file = resolve(root, "404.html");
      info = await stat(file);
      res.statusCode = 404;
    }
    if (info.isDirectory()) {
      if (!path.endsWith("/")) {
        res.writeHead(308, { Location: `${url.pathname}/${url.search}` }).end();
        return;
      }
      file = resolve(file, "index.html");
      info = await stat(file);
    }
    if (!info.isFile()) {
      res.writeHead(404).end();
      return;
    }
    res.setHeader(
      "Content-Type",
      mime[extname(file)] ?? "application/octet-stream",
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Cache-Control",
      /\/(?:audio|_next\/static)\//.test(path)
        ? "public, max-age=31536000, immutable"
        : "no-cache",
    );
    res.setHeader("Accept-Ranges", "bytes");
    let start = 0,
      end = info.size - 1;
    if (req.headers.range && res.statusCode === 200) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (range && (range[1] || range[2])) {
        start = range[1]
          ? Number(range[1])
          : Math.max(0, info.size - Number(range[2]));
        end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end;
        if (start > end || start >= info.size) {
          res.writeHead(416, { "Content-Range": `bytes */${info.size}` }).end();
          return;
        }
        res.statusCode = 206;
        res.setHeader("Content-Range", `bytes ${start}-${end}/${info.size}`);
      } else {
        res.writeHead(416, { "Content-Range": `bytes */${info.size}` }).end();
        return;
      }
    }
    res.setHeader("Content-Length", end - start + 1);
    if (req.method === "HEAD") res.end();
    else {
      const stream = createReadStream(file, { start, end }).on("error", () =>
        res.destroy(),
      );
      const acceptsGzip = /\bgzip\b/.test(req.headers["accept-encoding"] ?? "");
      if (
        res.statusCode !== 206 &&
        acceptsGzip &&
        /\.(?:html|css|js|json|txt|xml|svg)$/.test(file)
      ) {
        res.removeHeader("Content-Length");
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Vary", "Accept-Encoding");
        stream
          .pipe(createGzip())
          .on("error", () => res.destroy())
          .pipe(res);
      } else stream.pipe(res);
    }
  } catch {
    if (!res.headersSent) res.writeHead(400);
    res.end();
  }
}).listen(port, "0.0.0.0", () =>
  console.log(`Static Pages preview: http://localhost:${port}/me/`),
);
