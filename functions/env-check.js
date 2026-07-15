export function onRequest(context) {
  return Response.json(
    {
      galleryConfigAvailable:
        Boolean(context.env.GALLERY_CONFIG),

      sessionSecretAvailable:
        Boolean(context.env.GALLERY_SESSION_SECRET),

      availableBindingNames:
        Object.keys(context.env)
          .filter((name) => name !== "ASSETS")
          .sort()
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow"
      }
    }
  );
}