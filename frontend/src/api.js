// Thin wrapper around the backend /api/generate endpoint.
// Accepts an AbortSignal so the caller (App.jsx) can cancel a stale
// in-flight request when a newer one is fired off.
export async function generateStudyMaterial(input, signal) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
    signal,
  });

  let body;
  try {
    body = await res.json();
  } catch {
    throw new Error("Server sent back something that wasn't valid JSON.");
  }

  if (!res.ok) {
    throw new Error(body?.error || `Request failed with status ${res.status}`);
  }

  return body;
}
