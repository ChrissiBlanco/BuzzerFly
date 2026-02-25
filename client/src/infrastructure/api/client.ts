const FETCH_TIMEOUT_MS = 15000;

export const API =
  (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/$/, "") + "/api";

export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = FETCH_TIMEOUT_MS, ...init } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error(
        "Server did not respond in time. Check your connection and that the backend is running."
      );
    }
    throw e;
  } finally {
    clearTimeout(id);
  }
}
