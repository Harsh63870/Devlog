"""GitHub REST API client for pull request creation."""

from __future__ import annotations

import httpx

from config import get_settings
from git_service import get_current_branch, get_repo_status


def create_pull_request(
    title: str,
    body: str,
    base: str | None = None,
    head: str | None = None,
) -> tuple[bool, str | None, int | None, str | None]:
    settings = get_settings()
    token = settings.github_token

    if not token:
        return False, None, None, "GitHub token not configured. Add it in Settings."

    status = get_repo_status()
    owner, repo = status["owner"], status["repo"]

    if not owner or not repo:
        return False, None, None, "Could not parse owner/repo from remote URL. Check origin remote."

    base_branch = base or settings.default_base_branch or status["default_branch"]
    head_branch = head or get_current_branch()

    url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    payload = {
        "title": title,
        "body": body,
        "base": base_branch,
        "head": head_branch,
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, headers=headers, json=payload)

        if response.status_code == 201:
            data = response.json()
            return True, data.get("html_url"), data.get("number"), None

        if response.status_code == 401:
            return False, None, None, "Invalid GitHub token. Check your token in Settings."

        if response.status_code == 422:
            errors = response.json().get("errors", [])
            message = response.json().get("message", "")
            for err in errors:
                if err.get("message", "").lower().find("already exists") >= 0:
                    return False, None, None, f"A pull request already exists for branch '{head_branch}'."
            if "already exists" in message.lower():
                return False, None, None, f"A pull request already exists for branch '{head_branch}'."
            if "no commits between" in message.lower():
                return False, None, None, (
                    f"No commits between '{base_branch}' and '{head_branch}'. "
                    "Push your branch first."
                )
            return False, None, None, message or "GitHub rejected the pull request."

        return False, None, None, f"GitHub API error ({response.status_code}): {response.text}"

    except httpx.RequestError as e:
        return False, None, None, f"Failed to reach GitHub API: {e}"
