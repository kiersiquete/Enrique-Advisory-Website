export const PRIVACY_POLICY_VERSION = "2026-09-07";
export const OPAQUE_ID_PATTERN = /^[a-f0-9]{32}$/;

const EMAIL_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export function validationError(message) {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  return error;
}

export function normalizeEmailAddress(value = "") {
  return String(value).trim().toLowerCase();
}

export function isValidEmailAddress(value = "") {
  const email = normalizeEmailAddress(value);
  return email.length <= 254 && !/[\r\n\0]/.test(email) && EMAIL_PATTERN.test(email);
}

export function isValidOpaqueId(value = "") {
  return OPAQUE_ID_PATTERN.test(String(value));
}

export function isValidIsoDate(value = "") {
  if (typeof value !== "string" || value.length < 20 || value.length > 35) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value;
}

export function hasUnsafeControlCharacters(value = "") {
  return /[\u0000-\u001f\u007f]/.test(String(value));
}
