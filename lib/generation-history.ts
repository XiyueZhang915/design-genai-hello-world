export type PublishedCaption = { id: string; place: string; caption: string };

// A unique generation_id makes PostgREST return a one-to-one object or null.
// Accept arrays as well so older relationship metadata does not break the page.
export function publishedCaption(value: unknown): PublishedCaption | null {
  const record = Array.isArray(value) ? value[0] : value;
  if (!record || typeof record !== "object") return null;
  const { id, place, caption } = record;
  return typeof id === "string" && typeof place === "string" && typeof caption === "string"
    ? { id, place, caption } : null;
}
