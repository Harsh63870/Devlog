const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init);
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? body.error ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(typeof detail === "string" ? detail : `API error ${res.status}`);
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

export interface SettingsResponse {
  repo_path: string;
  github_token: string;
  default_base_branch: string;
}

export interface SettingsUpdateRequest {
  repo_path?: string;
  github_token?: string;
  default_base_branch?: string;
}

export interface RepoStatusResponse {
  branch: string;
  remote_url: string;
  owner: string;
  repo: string;
  ahead: number;
  behind: number;
  default_branch: string;
}

export interface CommitActionResponse {
  success: boolean;
  commit_hash?: string;
  error?: string;
}

export interface PushResponse {
  success: boolean;
  output?: string;
  error?: string;
}

export interface CreatePRResponse {
  success: boolean;
  pr_url?: string;
  pr_number?: number;
  error?: string;
}

export const api = {
  getDiff: () => request<DiffResponse>("/git-diff"),
  generateCommit: () => request<CommitResponse>("/generate-commit"),
  generatePR: () => request<PRResponse>("/generate-pr"),
  warmup: () => request<{ status: string }>("/warmup"),

  getSettings: () => request<SettingsResponse>("/settings"),
  updateSettings: (body: SettingsUpdateRequest) =>
    request<SettingsResponse>("/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  getRepoStatus: () => request<RepoStatusResponse>("/repo-status"),
  commitChanges: (message: string) =>
    request<CommitActionResponse>("/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }),
  pushBranch: (branch?: string) =>
    request<PushResponse>("/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branch }),
    }),
  createPR: (body: { title: string; body: string; base?: string; head?: string }) =>
    request<CreatePRResponse>("/create-pr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
};
