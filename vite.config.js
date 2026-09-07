import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    headers: securityHeaders(true),
    proxy: {
      "/api": "http://127.0.0.1:5174"
    }
  },
  preview: {
    host: "127.0.0.1",
    headers: securityHeaders(false)
  }
});

function securityHeaders(development) {
  const connectSources = development
    ? "connect-src 'self' ws://127.0.0.1:* ws://localhost:*"
    : "connect-src 'self'";
  const scriptSources = development
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self'";
  return {
    "Content-Security-Policy": [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      scriptSources,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https://flagcdn.com",
      connectSources
    ].join("; "),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  };
}
