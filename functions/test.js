export function onRequest() {
  return new Response(
    "Pages Functions attive correttamente.",
    {
      headers: {
        "Content-Type": "text/plain; charset=UTF-8"
      }
    }
  );
}