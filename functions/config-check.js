export function onRequest(context) {
  const rawConfig = context.env.GALLERY_CONFIG;

  let parsedConfig = null;
  let parseError = null;

  try {
    parsedConfig = JSON.parse(rawConfig || "");
  } catch (error) {
    parseError = error instanceof Error
      ? error.message
      : "Unknown JSON error";
  }

  const validObject =
    parsedConfig !== null &&
    typeof parsedConfig === "object" &&
    !Array.isArray(parsedConfig);

  return Response.json(
    {
      configExists: Boolean(rawConfig),
      jsonIsValid: parseError === null,
      parseError,
      configIsObject: validObject,
      configuredGalleryNames: validObject
        ? Object.keys(parsedConfig)
        : [],
      dance2026Exists:
        validObject &&
        typeof parsedConfig["dance-2026"] === "string",
      dance2026ValueType:
        validObject && "dance-2026" in parsedConfig
          ? typeof parsedConfig["dance-2026"]
          : "missing"
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow"
      }
    }
  );
}