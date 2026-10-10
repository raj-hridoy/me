// Explicit project-path resolution for the static Pages preview.
export function sitePath(path: string): string {
  if (/^https?:/.test(path) || path === "/me" || path.startsWith("/me/"))
    return path;
  return `/me${path.startsWith("/") ? path : `/${path}`}`;
}
