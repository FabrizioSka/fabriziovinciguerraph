import {
  readCookie,
  verifySessionToken,
  clearSessionCookie
} from "./_lib/auth.js";

function isProtectedPath(pathname) {
  return (
    pathname === "/private" ||
    pathname.startsWith("/private/") ||
    pathname.startsWith("/assets/images/private/")
  );
}

function buildLoginUrl(requestUrl) {
  const url = new URL(requestUrl);
  const returnTo = `${url.pathname}${url.search}`;

  const loginUrl = new URL("/private-login", url.origin);
  loginUrl.searchParams.set("returnTo", returnTo);

  return loginUrl.toString();
}

export async function onRequest(context) {
  const {
    request,
    env,
    next
  } = context;

  const url = new URL(request.url);
  const pathname = url.pathname;

  /*
   * Lasciamo passare normalmente:
   * - la pagina di login;
   * - tutto il sito pubblico.
   */
  if (
    pathname === "/private-login" ||
    !isProtectedPath(pathname)
  ) {
    return next();
  }

  if (!env.GALLERY_SESSION_SECRET) {
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

  const sessionToken = readCookie(request);

  const authenticated = await verifySessionToken(
    sessionToken,
    env.GALLERY_SESSION_SECRET
  );

  if (!authenticated) {
    /*
     * Per una normale pagina HTML facciamo un redirect
     * verso il modulo di accesso.
     */
    if (
      pathname === "/private" ||
      pathname.startsWith("/private/")
    ) {
      return Response.redirect(
        buildLoginUrl(request.url),
        302
      );
    }

    /*
     * Se qualcuno tenta di aprire direttamente una foto
     * privata, non mostriamo il file.
     */
    return new Response(
      "Authentication required.",
      {
        status: 401,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8",
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow, noimageindex",
          "Set-Cookie": clearSessionCookie()
        }
      }
    );
  }

  const response = await next();

  /*
   * Evitiamo che pagine e immagini private vengano
   * conservate nelle cache condivise.
   */
  const protectedResponse = new Response(
    response.body,
    response
  );

  protectedResponse.headers.set(
    "Cache-Control",
    "private, no-store"
  );

  protectedResponse.headers.set(
    "X-Robots-Tag",
    "noindex, nofollow, noimageindex"
  );

  return protectedResponse;
}