/**
 * Obfuscates sensitive strings (like passwords) before sending in HTTP JSON payloads,
 * preventing plain-text inspection in local browser DevTools / Network tab.
 */
export function encodePasswordPayload(password?: string): string | undefined {
  if (!password) return password;
  const trimmed = password.trim();
  if (!trimmed) return trimmed;
  try {
    return 'b64:' + btoa(unescape(encodeURIComponent(trimmed)));
  } catch {
    return trimmed;
  }
}
