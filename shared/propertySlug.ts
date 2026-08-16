export function slugifyPropertyTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id-ID")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 220);
}

export function buildPropertySlug(title: string, id: number): string {
  const base = slugifyPropertyTitle(title) || "properti";
  return `${base}-${id}`;
}

export function propertyDetailPath(property: { id: number; title: string; slug?: string | null }): string {
  return `/properti/${encodeURIComponent(property.slug || buildPropertySlug(property.title, property.id))}`;
}
