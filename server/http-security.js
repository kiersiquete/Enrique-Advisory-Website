import { requestOrigin, trustedPublicOrigin } from "./url.js";

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https://flagcdn.com",
  "connect-src 'self'",
  "upgrade-insecure-requests"
].join("; ");

const LOCAL_WEB_ORIGINS = new Set([
  "http://127.0.0.1:5173",
  "http://localhost:5173"
]);
const MAX_RATE_LIMIT_BUCKETS = 5000;
const rateLimitBuckets = new Map();

function headerValue(req, name) {
  const headers = req?.headers ?? {};
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return String(value[0] ?? "");
  return String(value ?? "").split(",")[0].trim();
}

function normalizedOrigin(value) {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

export function setSecurityHeaders(res, { api = false } = {}) {
  res.setHeader("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=63072000");
  }
  if (api) {
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Vary", "Origin");
  }
}

export function isTrustedApiRequest(req) {
  const fetchSite = headerValue(req, "sec-fetch-site").toLowerCase();
  if (fetchSite === "cross-site") return false;

  const rawOrigin = headerValue(req, "origin");
  if (!rawOrigin) return true;

  const origin = normalizedOrigin(rawOrigin);
  if (!origin) return false;
  if (LOCAL_WEB_ORIGINS.has(origin) && process.env.NODE_ENV !== "production") return true;

  const configuredOrigin = trustedPublicOrigin();
  if (configuredOrigin && origin === configuredOrigin) return true;

  const currentOrigin = requestOrigin(req);
  return Boolean(configuredOrigin && currentOrigin === configuredOrigin && origin === currentOrigin);
}

export function prepareApiRequest(req, res) {
  setSecurityHeaders(res, { api: true });
  if (isTrustedApiRequest(req)) return true;
  res.status(403).json({ error: "Cross-origin request denied" });
  return false;
}

function requestClientKey(req) {
  const trustProxyHeaders = process.env.VERCEL === "1" || process.env.TRUST_PROXY === "true";
  const forwardedAddress = trustProxyHeaders
    ? headerValue(req, "x-vercel-forwarded-for") || headerValue(req, "x-forwarded-for")
    : "";
  return String(forwardedAddress || req?.socket?.remoteAddress || "unknown").slice(0, 128);
}

function pruneRateLimitBuckets(now) {
  if (rateLimitBuckets.size < MAX_RATE_LIMIT_BUCKETS) return;

  for (const [key, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(key);
  }

  if (rateLimitBuckets.size >= MAX_RATE_LIMIT_BUCKETS) {
    rateLimitBuckets.delete(rateLimitBuckets.keys().next().value);
  }
}

export function enforceRateLimit(req, res, scope, { limit, windowMs }) {
  const now = Date.now();
  pruneRateLimitBuckets(now);
  const key = `${scope}:${requestClientKey(req)}`;
  const current = rateLimitBuckets.get(key);
  const bucket = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : current;

  bucket.count += 1;
  rateLimitBuckets.set(key, bucket);
  res.setHeader("RateLimit-Limit", String(limit));
  res.setHeader("RateLimit-Remaining", String(Math.max(0, limit - bucket.count)));
  res.setHeader("RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count <= limit) return true;
  res.setHeader("Retry-After", String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
  res.status(429).json({ error: "Too many requests" });
  return false;
}

export function resetRateLimitsForTests() {
  rateLimitBuckets.clear();
}
