const COOKIE_NAME = "fv_gallery_session";

/* Sessione valida per 2 ore */
const SESSION_DURATION_SECONDS = 60 * 60 * 2;

const encoder = new TextEncoder();

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

export function readCookie(request) {
  const cookieHeader = request.headers.get("Cookie") || "";

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (name === COOKIE_NAME) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

export async function createSessionToken(secret) {
  const expiresAt =
    Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;

  const signature = await createSignature(
    String(expiresAt),
    secret
  );

  return `${expiresAt}.${signature}`;
}

export async function verifySessionToken(token, secret) {
  if (!token || !secret) {
    return false;
  }

  const [expiresAtText, receivedSignature] = token.split(".");

  if (!expiresAtText || !receivedSignature) {
    return false;
  }

  const expiresAt = Number(expiresAtText);
  const currentTime = Math.floor(Date.now() / 1000);

  if (!Number.isFinite(expiresAt) || expiresAt <= currentTime) {
    return false;
  }

  const expectedSignature = await createSignature(
    expiresAtText,
    secret
  );

  return safeEqual(receivedSignature, expectedSignature);
}

export function createSessionCookie(token) {
  return [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${SESSION_DURATION_SECONDS}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax"
  ].join("; ");
}

export function clearSessionCookie() {
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "Secure",
    "SameSite=Lax"
  ].join("; ");
}