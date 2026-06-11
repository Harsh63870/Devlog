from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import ollama
import time

from config import get_settings, mask_token, save_settings
from git_service import (
    commit_changes,
    get_repo_status,
    get_staged_diff,
    is_git_repo,
    push_branch,
)
from github_client import create_pull_request
from schemas import (
    CommitRequest,
    CommitResponse,
    CreatePRRequest,
    CreatePRResponse,
    HealthResponse,
    PushRequest,
    PushResponse,
    RepoStatusResponse,
    SettingsResponse,
    SettingsUpdateRequest,
)

MODEL = "mistral"

app = FastAPI(title="DevLog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_WARMED = False


# =========================
# HELPERS
# =========================

def warmup_model():
    global OLLAMA_WARMED
    if not OLLAMA_WARMED:
        try:
            ollama.chat(model=MODEL, messages=[{"role": "user", "content": "hi"}])
            OLLAMA_WARMED = True
        except Exception:
            pass


def clean_git_diff(diff: str) -> str:
    cleaned_lines = []
    for line in diff.splitlines():
        if line.startswith("diff --git"):
            continue
        if line.startswith("index "):
            continue
        if line.startswith("new file mode"):
            continue
        if line.startswith("deleted file mode"):
            continue
        cleaned_lines.append(line)
    cleaned = "\n".join(cleaned_lines).strip()
    return cleaned[:3000]


def build_commit_prompt(diff: str) -> str:
    return f"""
You are an expert software engineer.

Generate a git commit message.

Rules:
- conventional commits format
- max 80 chars
- ONLY output commit message

Code:
{diff}
"""


def build_pr_prompt(diff: str) -> str:
    return f"""
Generate a GitHub PR description.

Rules:
- clear summary
- bullet points
- professional

Code:
{diff}
"""


# =========================
# ROUTES — core (local / Ollama only)
# =========================

@app.get("/")
def home():
    return {"message": "DevLog API running 🚀"}


@app.get("/health", response_model=HealthResponse)
def health():
    settings = get_settings()
    repo_path = str(__import__("pathlib").Path(settings.repo_path).resolve())
    git_ok = is_git_repo(repo_path)
    ollama_ok = False
    try:
        ollama.list()
        ollama_ok = True
    except Exception:
        pass
    return HealthResponse(
        status="ok" if git_ok else "degraded",
        git_repo=git_ok,
        ollama=ollama_ok,
    )


@app.get("/warmup")
def warmup():
    warmup_model()
    return {"status": "warmed up"}


@app.get("/git-diff")
def git_diff():
    return {"diff": get_staged_diff()}


@app.get("/generate-commit")
def generate_commit():
    start = time.time()
    try:
        warmup_model()
        diff = get_staged_diff()
        if not diff.strip():
            return {"message": "chore: no staged changes"}
        diff = clean_git_diff(diff)
        prompt = build_commit_prompt(diff)
        response = ollama.chat(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        commit_message = response["message"]["content"].strip().split("\n")[0]
        return {
            "message": commit_message,
            "time_taken_sec": round(time.time() - start, 2),
        }
    except Exception as e:
        return {"message": str(e)}


@app.get("/generate-pr")
def generate_pr():
    start = time.time()
    try:
        warmup_model()
        diff = get_staged_diff()
        if not diff.strip():
            return {"description": "No staged changes found."}
        diff = clean_git_diff(diff)
        prompt = build_pr_prompt(diff)
        response = ollama.chat(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return {
            "description": response["message"]["content"].strip(),
            "time_taken_sec": round(time.time() - start, 2),
        }
    except Exception as e:
        return {"description": str(e)}


# =========================
# ROUTES — settings & publishing (GitHub)
# =========================

@app.get("/settings", response_model=SettingsResponse)
def get_app_settings():
    s = get_settings()
    return SettingsResponse(
        repo_path=s.repo_path,
        github_token=mask_token(s.github_token),
        default_base_branch=s.default_base_branch,
    )


@app.post("/settings", response_model=SettingsResponse)
def update_app_settings(body: SettingsUpdateRequest):
    updates = {}
    if body.repo_path is not None:
        updates["repo_path"] = body.repo_path
    if body.github_token is not None and body.github_token.strip():
        updates["github_token"] = body.github_token.strip()
    if body.default_base_branch is not None:
        updates["default_base_branch"] = body.default_base_branch

    if not updates:
        raise HTTPException(status_code=400, detail="No settings provided to update.")

    saved = save_settings(updates)
    return SettingsResponse(
        repo_path=saved.repo_path,
        github_token=mask_token(saved.github_token),
        default_base_branch=saved.default_base_branch,
    )


@app.get("/repo-status", response_model=RepoStatusResponse)
def repo_status():
    try:
        return RepoStatusResponse(**get_repo_status())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/commit", response_model=CommitResponse)
def commit(body: CommitRequest):
    success, commit_hash, error = commit_changes(body.message)
    return CommitResponse(success=success, commit_hash=commit_hash, error=error)


@app.post("/push", response_model=PushResponse)
def push(body: PushRequest):
    success, output, error = push_branch(body.branch)
    return PushResponse(success=success, output=output, error=error)


@app.post("/create-pr", response_model=CreatePRResponse)
def create_pr(body: CreatePRRequest):
    success, pr_url, pr_number, error = create_pull_request(
        title=body.title,
        body=body.body,
        base=body.base,
        head=body.head,
    )
    return CreatePRResponse(
        success=success,
        pr_url=pr_url,
        pr_number=pr_number,
        error=error,
    )
