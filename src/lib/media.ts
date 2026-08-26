/**
 * Resolve a media path returned by the API into a URL the browser can load.
 *
 * Historically several screens hardcoded the production droplet's IP
 * (`http://68.183.174.17:8081`). That was wrong on two counts: the droplet was
 * rebuilt (so the IP is dead), and media has since moved to Google Cloud
 * Storage. Never hardcode a server IP in application code -- the address of an
 * environment belongs in DNS and in env vars, not in the repo.
 *
 * Handles three shapes of input:
 *   - already absolute ("https://storage.googleapis.com/...") -> returned as-is
 *   - protocol-relative ("//host/path")                       -> returned as-is
 *   - relative ("/media/docs/x.jpg" or "docs/x.jpg")          -> prefixed with
 *     NEXT_PUBLIC_MEDIA_BASE_URL
 */
const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "";

export function resolveMediaUrl(path?: string | null): string {
  if (!path) return "";

  const trimmed = String(path).trim();
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }
  if (!MEDIA_BASE) return trimmed;

  return `${MEDIA_BASE.replace(/\/+$/, "")}/${trimmed.replace(/^\/+/, "")}`;
}

export default resolveMediaUrl;
