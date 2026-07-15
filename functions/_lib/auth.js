const COOKIE_PREFIX = "fv_gallery_";
const SESSION_DURATION_SECONDS = 60 * 60 * 2; // 2 ore

const encoder = new TextEncoder();

function isValidGallerySlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function getCookieName(gallerySlug) {
  if (!isValidGallerySlug(gallerySlug)) {
    throw new Error("Invalid gallery slug.");
  }

  return `${COOKIE_PREFIX}${gallerySlug}`;
}

function bytesToBase64Url(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function createSignature(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value)
  );

  return bytesToBase64Url(new Uint8Array(signature));
}

function safeEqual(first, second) {
  if (
    typeof first !== "string" ||
    typeof second !== "string" ||
    first.length !== second.length
  ) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < first.length; index += 1) {
    difference |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }

  return difference === 0;
}

export function readGalleryConfig(env) {
  if (!env.GALLERY_CONFIG) {
    return {};
  }

  try {
    const config = JSON.parse(env.GALLERY_CONFIG);

    if (
      !config ||
      typeof config !== "object" ||
      Array.isArray(config)
    ) {
      return {};
    }

    return config;
  } catch {
    return {};
  }
}

export function readGalleryCookie(request, gallerySlug) {
  const cookieName = getCookieName(gallerySlug);
  const cookieHeader = request.headers.get("Cookie") || "";

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (name === cookieName) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

export async function createSessionToken(
  gallerySlug,
  secret
) {
  if (!isValidGallerySlug(gallerySlug)) {
    throw new Error("Invalid gallery slug.");
  }

  const expiresAt =
    Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;

  const signedValue = `${gallerySlug}.${expiresAt}`;
  const signature = await createSignature(
    signedValue,
    secret
  );

  return `${expiresAt}.${signature}`;
}

export async function verifySessionToken(
  token,
  gallerySlug,
  secret
) {
  if (
    !token ||
    !secret ||
    !isValidGallerySlug(gallerySlug)
  ) {
    return false;
  }

  const [expiresAtText, receivedSignature] = token.split(".");

  if (!expiresAtText || !receivedSignature) {
    return false;
  }

  const expiresAt = Number(expiresAtText);
  const currentTime = Math.floor(Date.now() / 1000);

  if (
    !Number.isFinite(expiresAt) ||
    expiresAt <= currentTime
  ) {
    return false;
  }

  const signedValue = `${gallerySlug}.${expiresAtText}`;

  const expectedSignature = await createSignature(
    signedValue,
    secret
  );

  return safeEqual(
    receivedSignature,
    expectedSignature
  );
}

export function createSessionCookie(
  gallerySlug,
  token
) {
  const cookieName = getCookieName(gallerySlug);

  return [
    `${cookieName}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${SESSION_DURATION_SECONDS}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax"
  ].join("; ");
}

export function clearSessionCookie(gallerySlug) {
  const cookieName = getCookieName(gallerySlug);

  return [
    `${cookieName}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "Secure",
    "SameSite=Lax"
  ].join("; ");
}