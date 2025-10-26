export class HttpError extends Error {
  public readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export interface RequestOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(base: string, path: string, query?: RequestOptions['query']): string {
  const url = new URL(path, base);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    return response;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new HttpError('Zeitüberschreitung beim Laden der Daten', 408);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}

export class HttpClient {
  private token?: string;
  constructor(private readonly baseUrl: string, token?: string) {
    this.token = token;
  }

  setToken(token?: string) {
    this.token = token;
  }

  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = buildUrl(this.baseUrl, path, options.query);
    const headers: Record<string, string> = {
      Accept: 'application/json'
    };
    if (this.token) {
      headers['X-Authorization'] = `Bearer ${this.token}`;
    }
    if (options.headers) {
      Object.assign(headers, options.headers);
    }
    const response = await fetchWithTimeout(url, { headers }, options.timeoutMs);
    if (!response.ok) {
      throw new HttpError(`Fehler beim Laden (${response.status})`, response.status);
    }
    return (await response.json()) as T;
  }
}

export async function getLocalJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new HttpError(`Lokale Datei nicht gefunden: ${path}`, response.status);
  }
  return (await response.json()) as T;
}
