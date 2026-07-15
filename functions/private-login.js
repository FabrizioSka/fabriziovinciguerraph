import {
  createSessionToken,
  createSessionCookie
} from "./_lib/auth.js";

const encoder = new TextEncoder();

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function hashValue(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(value)
  );

  return new Uint8Array(digest);
}

function safeEqual(first, second) {
  if (first.length !== second.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < first.length; index += 1) {
    difference |= first[index] ^ second[index];
  }

  return difference === 0;
}

async function passwordsMatch(receivedPassword, expectedPassword) {
  const [receivedHash, expectedHash] = await Promise.all([
    hashValue(receivedPassword),
    hashValue(expectedPassword)
  ]);

  return safeEqual(receivedHash, expectedHash);
}

function getSafeReturnTo(value) {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    (
      value === "/private" ||
      value.startsWith("/private/")
    )
  ) {
    return value;
  }

  return "/private/";
}

function renderLoginPage(returnTo, showError = false) {
  const safeReturnTo = escapeHtml(returnTo);

  return new Response(
    `<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="robots"
    content="noindex, nofollow, noimageindex"
  >

  <title>Private Gallery | Fabrizio Vinciguerra</title>

  <style>

    :root {
      color-scheme: dark;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      min-height: 100vh;
      padding: 30px 20px;
      display: grid;
      place-items: center;
      background: #090909;
      color: #f2eee8;
      font-family: Georgia, "Times New Roman", serif;
    }

    .login-box {
      width: min(100%, 480px);
      padding: 50px 40px;
      border: 1px solid rgba(242, 238, 232, 0.16);
      background: rgba(255, 255, 255, 0.025);
    }

    .subtitle {
      margin-bottom: 22px;
      color: #c8b89f;
      font-size: 12px;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    h1 {
      margin-bottom: 22px;
      font-size: clamp(44px, 10vw, 68px);
      line-height: 0.95;
      font-weight: normal;
    }

    .intro {
      margin-bottom: 32px;
      color: rgba(242, 238, 232, 0.72);
      font-size: 18px;
      line-height: 1.55;
    }

    label {
      display: block;
      margin-bottom: 10px;
      color: #f2eee8;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    input {
      width: 100%;
      padding: 15px 16px;
      border: 1px solid rgba(242, 238, 232, 0.32);
      border-radius: 0;
      outline: none;
      background: #111;
      color: #f2eee8;
      font: inherit;
    }

    input:focus {
      border-color: #c8b89f;
    }

    button {
      width: 100%;
      margin-top: 16px;
      padding: 15px 20px;
      border: 1px solid rgba(242, 238, 232, 0.55);
      border-radius: 0;
      background: transparent;
      color: #f2eee8;
      font: inherit;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      cursor: pointer;
    }

    button:hover {
      background: #f2eee8;
      color: #090909;
    }

    .error {
      margin-top: 18px;
      color: #e4a1a1;
      font-size: 15px;
      line-height: 1.45;
    }

    @media (max-width: 600px) {

      .login-box {
        padding: 40px 26px;
      }

      h1 {
        font-size: 48px;
      }

      .intro {
        font-size: 17px;
      }

    }

  </style>

</head>

<body>

  <main class="login-box">

    <p class="subtitle">
      Private Gallery
    </p>

    <h1>
      Access Code
    </h1>

    <p class="intro">
      Enter the password provided by Fabrizio to access
      this private photography gallery.
    </p>

    <form
      method="POST"
      action="/private-login"
    >

      <input
        type="hidden"
        name="returnTo"
        value="${safeReturnTo}"
      >

      <label for="galleryPassword">
        Password
      </label>

      <input
        type="password"
        id="galleryPassword"
        name="password"
        autocomplete="current-password"
        required
        autofocus
      >

      <button type="submit">
        Enter Gallery
      </button>

      ${
        showError
          ? `<p class="error">
               The password is incorrect. Please try again.
             </p>`
          : ""
      }

    </form>

  </main>

</body>

</html>`,
    {
      status: showError ? 401 : 200,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "no-store"
      }
    }
  );
}

export function onRequestGet(context) {
  const url = new URL(context.request.url);

  const returnTo = getSafeReturnTo(
    url.searchParams.get("returnTo") || "/private/"
  );

  return renderLoginPage(returnTo, false);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (
    !env.GALLERY_PASSWORD ||
    !env.GALLERY_SESSION_SECRET
  ) {
    return new Response(
      "Private gallery configuration is incomplete.",
      {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8",
          "Cache-Control": "no-store"
        }
      }
    );
  }

  const formData = await request.formData();

  const password = String(
    formData.get("password") || ""
  );

  const returnTo = getSafeReturnTo(
    String(formData.get("returnTo") || "")
  );

  const passwordIsCorrect = await passwordsMatch(
    password,
    env.GALLERY_PASSWORD
  );

  if (!passwordIsCorrect) {
    return renderLoginPage(returnTo, true);
  }

  const sessionToken = await createSessionToken(
    env.GALLERY_SESSION_SECRET
  );

  return new Response(null, {
    status: 303,
    headers: {
      Location: returnTo,
      "Set-Cookie": createSessionCookie(sessionToken),
      "Cache-Control": "no-store"
    }
  });
}