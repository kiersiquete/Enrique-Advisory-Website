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

export function requestOrigin(req, fallbackProtocol = "http") {
  const headers = req.headers || {};
  const protocol = headerValue(headers, "x-forwarded-proto") || req.protocol || fallbackProtocol;
  const host = headerValue(headers, "x-forwarded-host") || headerValue(headers, "host");
  return host ? originFrom(`${protocol}://${host}`) : "";
}

export function publicBaseUrl(req, fallbackProtocol = "https") {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/$/, "");

  const headers = req.headers || {};
  const origin = originFrom(headerValue(headers, "origin"));
  if (origin) return normalizeLocalPublicOrigin(origin);

  const referer = originFrom(headerValue(headers, "referer") || headerValue(headers, "referrer"));
  if (referer) return normalizeLocalPublicOrigin(referer);

  return normalizeLocalPublicOrigin(requestOrigin(req, fallbackProtocol));
}
