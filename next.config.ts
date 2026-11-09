import type { NextConfig } from "next";

/*
 * What the pages may load, in production only (the dev server needs eval and a
 * websocket). Inline scripts and styles stay allowed: Next.js and the theme
 * script write some, and a nonce would force every page to render on demand.
 * Images accept any https source for the album cover Last.fm serves.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.open-meteo.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const EN_TETES = [
  // The browser never guesses a file's type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // No other site can show this one in a frame
  { key: "X-Frame-Options", value: "DENY" },
  // Other sites only learn the origin of a visit, not the page
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site uses none of these
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: CSP }] : []),
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: EN_TETES }];
  },
};

export default nextConfig;
