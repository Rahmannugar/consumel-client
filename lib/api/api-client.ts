const defaultAPIURL = "http://localhost:8080";
const requestTimeout = 15_000;

type ErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class APIError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, code?: string, message?: string) {
    super(message ?? "Consumel could not complete the request.");
    this.name = "APIError";
    this.status = status;
    this.code = code;
  }
}

export async function apiRequest(path: string, init: RequestInit = {}): Promise<unknown> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), requestTimeout);

  try {
    const response = await fetch(apiURL(path), {
      ...init,
      credentials: "include",
      signal: controller.signal,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });

    if (!response.ok) {
      const body = await readErrorBody(response);
      throw new APIError(response.status, body?.error?.code, body?.error?.message);
    }
    if (response.status === 204 || response.headers.get("Content-Length") === "0") {
      return undefined;
    }
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new APIError(0, "request_timeout", "The request took too long. Try again.");
    }
    throw new APIError(0, "network_error", "Consumel could not reach the server. Try again.");
  } finally {
    window.clearTimeout(timeout);
  }
}

function apiURL(path: string) {
  const baseURL = process.env.NEXT_PUBLIC_CONSUMEL_API_URL ?? defaultAPIURL;
  return new URL(path, baseURL).toString();
}

async function readErrorBody(response: Response): Promise<ErrorBody | undefined> {
  try {
    return (await response.json()) as ErrorBody;
  } catch {
    return undefined;
  }
}
