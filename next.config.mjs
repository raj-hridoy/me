const nextConfig = {
  output: "export",
  basePath: "/me",
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: "/me" },
  devIndicators: false,
  poweredByHeader: false,
  experimental: {
    lockDistDir: process.env.CODEX_PORTAL_WORKAROUND !== "1",
    useWasmBinary: process.env.CODEX_PORTAL_WORKAROUND === "1",
  },
  reactStrictMode: true,
  /* GitHub Pages owns response headers; retain this policy only for Next dev. */
  ...(process.env.NODE_ENV === "development"
    ? {
        async headers() {
          const development = process.env.NODE_ENV === "development";
          return [
            {
              source: "/:path*",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                {
                  key: "Referrer-Policy",
                  value: "strict-origin-when-cross-origin",
                },
                { key: "X-Frame-Options", value: "DENY" },
                {
                  key: "Permissions-Policy",
                  value: "camera=(), microphone=(), geolocation=()",
                },
                {
                  key: "Content-Security-Policy",
                  value: `default-src 'self'; script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self'${development ? " ws: wss:" : ""}; frame-ancestors 'none'; base-uri 'self'; form-action 'none'; object-src 'none'`,
                },
              ],
            },
            {
              source: "/audio/:path*",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
          ];
        },
      }
    : {}),
};
export default nextConfig;
