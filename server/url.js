function headerValue(headers = {}, name) {
  const value = headers[name];
  if (Array.isArray(value)) return value[0] || "";
  return String(value || "").split(",")[0].trim();
}

function originFrom(value) {
  if (!value) return "";
  try {
    return new URL(value).origin.replace(/\/$/, "");
  } catch {
    return "";
  }
}

function normalizeLocalPublicOrigin(origin) {
  if (!origin) return "";

  try {
    const url = new URL(origin);
    if ((url.hostname === "localhost" || url.hostname === "127.0.0.1") && url.port === "5174") {
      url.port = "5173";
      return url.origin;
    }
    return url.origin;
  } catch {
    return origin.replace(/\/$/, "");
  }
}

export function trustedPublicOrigin() {
  try {
    const url = new URL(String(process.env.PUBLIC_SITE_URL || ""));
    const allowedProtocol =
      url.protocol === "https:" || (url.protocol === "http:" && process.env.NODE_ENV !== "production");
    const rootOnly = !url.username && !url.password && ["", "/"].includes(url.pathname) && !url.search && !url.hash;
    return allowedProtocol && rootOnly ? url.origin : "";
  } catch {
    return "";
  }
}

export function requestOrigin(req, fallbackProtocol = "http") {
  const headers = req.headers || {};
  const protocol = headerValue(headers, "x-forwarded-proto") || req.protocol || fallbackProtocol;
  const host = headerValue(headers, "x-forwarded-host") || headerValue(headers, "host");
  return host ? originFrom(`${protocol}://${host}`) : "";
}

export function publicBaseUrl(req, fallbackProtocol = "https") {
  const configured = trustedPublicOrigin();
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") return "";

  const requestHeaders = req?.headers || {};
  const suppliedOrigin = normalizeLocalPublicOrigin(originFrom(headerValue(requestHeaders, "origin")));
  try {
    const suppliedUrl = new URL(suppliedOrigin);
    if (["localhost", "127.0.0.1"].includes(suppliedUrl.hostname)) return suppliedUrl.origin;
  } catch {
    // Fall back to the request host for local command-line and integration tests.
  }

  const current = requestOrigin(req, fallbackProtocol);
  const local = normalizeLocalPublicOrigin(current);
  try {
    const url = new URL(local);
    return ["localhost", "127.0.0.1"].includes(url.hostname) ? url.origin : "";
  } catch {
    return "";
  }
}
