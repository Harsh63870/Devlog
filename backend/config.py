"""DevLog configuration — env vars + persisted local overrides."""

from __future__ import annotations

import json
import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

CONFIG_DIR = Path(os.getenv("DEVLOG_CONFIG_DIR", Path(__file__).parent))
LOCAL_CONFIG_PATH = CONFIG_DIR / "devlog.local.json"


class AppSettings(BaseModel):
    repo_path: str = Field(default=".", description="Path to the git repository")
    github_token: str = Field(default="", description="GitHub personal access token")
    default_base_branch: str = Field(default="main", description="Default PR base branch")


_settings: AppSettings | None = None


def _load_from_env() -> AppSettings:
    return AppSettings(
        repo_path=os.getenv("REPO_PATH", "."),
        github_token=os.getenv("GITHUB_TOKEN", ""),
        default_base_branch=os.getenv("DEFAULT_BASE_BRANCH", "main"),
    )


def _load_from_file() -> dict:
    if not LOCAL_CONFIG_PATH.exists():
        return {}
    try:
        return json.loads(LOCAL_CONFIG_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def get_settings() -> AppSettings:
    global _settings
    if _settings is None:
        base = _load_from_env()
        overrides = _load_from_file()
        if overrides:
            base = base.model_copy(update={k: v for k, v in overrides.items() if v is not None})
        _settings = base
    return _settings


def save_settings(updates: dict) -> AppSettings:
    global _settings
    current = get_settings()
    merged = current.model_copy(update={k: v for k, v in updates.items() if v is not None})
    LOCAL_CONFIG_PATH.write_text(
        json.dumps(merged.model_dump(), indent=2),
        encoding="utf-8",
    )
    _settings = merged
    return merged


def mask_token(token: str) -> str:
    if not token:
        return ""
    if len(token) <= 8:
        return "****"
    return f"{token[:4]}****{token[-4:]}"
