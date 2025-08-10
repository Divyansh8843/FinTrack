async function parseJsonSafe<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  // If not JSON, treat as error (likely HTML from a redirect to sign-in)
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(text || "Non-JSON response received");
  }
  try {
    return (await res.json()) as T;
  } catch (err) {
    const text = await res.text();
    throw new Error(text || (err instanceof Error ? err.message : String(err)));
  }
}

function ensureOkOrThrow(res: Response) {
  // If fetch followed a redirect or returned HTML, likely hit auth page
  const contentType = res.headers.get("content-type") || "";
  const isHtml = contentType.includes("text/html");
  if (res.status === 401 || res.status === 403) {
    throw new Error("Unauthorized - please sign in");
  }
  if (res.redirected || isHtml) {
    throw new Error("Redirected - please sign in and retry");
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText || "Request failed"}`);
  }
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  ensureOkOrThrow(res);
  return parseJsonSafe<T>(res);
}

export async function apiPost<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  ensureOkOrThrow(res);
  return parseJsonSafe<T>(res);
}

export async function apiPut<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  ensureOkOrThrow(res);
  return parseJsonSafe<T>(res);
}

export async function apiDelete<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  ensureOkOrThrow(res);
  return parseJsonSafe<T>(res);
}
