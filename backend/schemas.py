"""Pydantic request/response models for DevLog API."""

from __future__ import annotations

from pydantic import BaseModel, Field


# ── Settings ──────────────────────────────────────────────────────────────────

class SettingsResponse(BaseModel):
    repo_path: str
    github_token: str
    default_base_branch: str


class SettingsUpdateRequest(BaseModel):
    repo_path: str | None = None
    github_token: str | None = None
    default_base_branch: str | None = None


# ── Repo status ───────────────────────────────────────────────────────────────

class RepoStatusResponse(BaseModel):
    branch: str
    remote_url: str
    owner: str
    repo: str
    ahead: int
    behind: int
    default_branch: str


# ── Git actions ───────────────────────────────────────────────────────────────

class CommitRequest(BaseModel):
    message: str = Field(..., min_length=1)


class CommitResponse(BaseModel):
    success: bool
    commit_hash: str | None = None
    error: str | None = None


class PushRequest(BaseModel):
    branch: str | None = None


class PushResponse(BaseModel):
    success: bool
    output: str | None = None
    error: str | None = None


# ── GitHub PR ─────────────────────────────────────────────────────────────────

class CreatePRRequest(BaseModel):
    title: str = Field(..., min_length=1)
    body: str = Field(..., min_length=1)
    base: str | None = None
    head: str | None = None


class CreatePRResponse(BaseModel):
    success: bool
    pr_url: str | None = None
    pr_number: int | None = None
    error: str | None = None


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    git_repo: bool
    ollama: bool
