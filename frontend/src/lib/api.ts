const BASE_URL = "http://localhost:8000";

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export interface DiffResponse {
  diff: string;
}

export interface CommitResponse {
  message: string;
  time_taken_sec?: number;
}

export interface PRResponse {
  description: string;
  time_taken_sec?: number;
}

export const api = {
  getDiff: () => request<DiffResponse>("/git-diff"),
  generateCommit: () => request<CommitResponse>("/generate-commit"),
  generatePR: () => request<PRResponse>("/generate-pr"),
  warmup: () => request<{ status: string }>("/warmup"),
};
