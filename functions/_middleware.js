import {
  readGalleryCookie,
  verifySessionToken,
  clearSessionCookie,
  readGalleryConfig
} from "./_lib/auth.js";

function getPrivatePageGallery(pathname) {
  const match = pathname.match(
    /^\/private\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/|$)/
  );

  return match ? match[1] : null;
}

function getPrivateImageGallery(pathname) {
  const match = pathname.match(
    /^\/assets\/images\/private\/([a-z0-9]+(?:-[a-z0-9]+)*)\//
  );

  return match ? match[1] : null;
}

function buildLoginUrl(requestUrl) {
  const url = new URL(requestUrl);
  const returnTo = `${url.pathname}${url.search}`;

  const loginUrl = new URL(
    "/private-login",
    url.origin
  );

  loginUrl.searchParams.set(
    "returnTo",
    returnTo
  );

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
   * Pagina di accesso sempre pubblica.
   */
  if (pathname === "/private-login") {
    return next();
  }

  /*
   * /private/ resta una pagina informativa pubblica.
   * Solo le singole gallerie vengono protette.
   */
  const pageGallery =
    getPrivatePageGallery(pathname);

  const imageGallery =
    getPrivateImageGallery(pathname);

  const gallerySlug =
    pageGallery || imageGallery;

  if (!gallerySlug) {
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

  const galleryConfig = readGalleryConfig(env);

  if (
    typeof galleryConfig[gallerySlug] !== "string"
  ) {
    return new Response(
      "Private gallery not available.",
      {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8",
          "Cache-Control": "no-store",
          "X-Robots-Tag":
            "noindex, nofollow, noimageindex"
        }
      }
    );
  }

  const sessionToken = readGalleryCookie(
    request,
    gallerySlug
  );

  const authenticated = await verifySessionToken(
    sessionToken,
    gallerySlug,
    env.GALLERY_SESSION_SECRET
  );

  if (!authenticated) {
    if (pageGallery) {
      return Response.redirect(
        buildLoginUrl(request.url),
        302
      );
    }

    return new Response(
      "Authentication required.",
      {
        status: 401,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8",
          "Cache-Control": "no-store",
          "X-Robots-Tag":
            "noindex, nofollow, noimageindex",
          "Set-Cookie":
            clearSessionCookie(gallerySlug)
        }
      }
    );
  }

  const response = await next();

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