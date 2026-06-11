"""Git subprocess helpers — all operations use the configured REPO_PATH."""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

from fastapi import HTTPException

from config import get_settings


class GitError(Exception):
    pass


def _repo_cwd() -> str:
    path = get_settings().repo_path
    resolved = str(Path(path).resolve())
    if not is_git_repo(resolved):
        raise HTTPException(
            status_code=400,
            detail=f"REPO_PATH is not a git repository: {path}",
        )
    return resolved


def run_git(args: list[str], cwd: str | None = None, check: bool = True) -> subprocess.CompletedProcess[str]:
    cwd = cwd or _repo_cwd()
    result = subprocess.run(
        ["git", *args],
        cwd=cwd,
        capture_output=True,
        text=True,
    )
    if check and result.returncode != 0:
        stderr = result.stderr.strip() or result.stdout.strip()
        raise GitError(stderr)
    return result


def is_git_repo(path: str) -> bool:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--is-inside-work-tree"],
            cwd=path,
            capture_output=True,
            text=True,
        )
        return result.returncode == 0 and result.stdout.strip() == "true"
    except OSError:
        return False


def get_staged_diff() -> str:
    try:
        return run_git(["diff", "--cached"], check=False).stdout
    except HTTPException:
        return ""


def has_staged_changes() -> bool:
    result = run_git(["diff", "--cached", "--quiet"], check=False)
    return result.returncode == 1


def get_current_branch() -> str:
    return run_git(["rev-parse", "--abbrev-ref", "HEAD"]).stdout.strip()


def get_remote_url() -> str:
    result = run_git(["remote", "get-url", "origin"], check=False)
    if result.returncode != 0:
        return ""
    return result.stdout.strip()


def parse_owner_repo(remote_url: str) -> tuple[str, str]:
    if not remote_url:
        return "", ""

    # SSH: git@github.com:owner/repo.git
    ssh_match = re.match(r"git@[^:]+:([^/]+)/(.+?)(?:\.git)?$", remote_url)
    if ssh_match:
        return ssh_match.group(1), ssh_match.group(2)

    # HTTPS: https://github.com/owner/repo.git
    https_match = re.match(r"https?://[^/]+/([^/]+)/(.+?)(?:\.git)?/?$", remote_url)
    if https_match:
        return https_match.group(1), https_match.group(2)

    return "", ""


def get_upstream_branch() -> str | None:
    result = run_git(
        ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"],
        check=False,
    )
    if result.returncode != 0:
        return None
    ref = result.stdout.strip()
    # origin/main -> main
    if "/" in ref:
        return ref.split("/", 1)[1]
    return ref


def get_ahead_behind() -> tuple[int, int]:
    upstream = get_upstream_branch()
    if not upstream:
        return 0, 0
    result = run_git(
        ["rev-list", "--left-right", "--count", f"origin/{upstream}...HEAD"],
        check=False,
    )
    if result.returncode != 0:
        return 0, 0
    parts = result.stdout.strip().split()
    if len(parts) != 2:
        return 0, 0
    behind, ahead = int(parts[0]), int(parts[1])
    return ahead, behind


def get_default_branch() -> str:
    result = run_git(
        ["symbolic-ref", "refs/remotes/origin/HEAD"],
        check=False,
    )
    if result.returncode == 0:
        ref = result.stdout.strip()
        if "/" in ref:
            return ref.rsplit("/", 1)[-1]
    return get_settings().default_base_branch


def get_repo_status() -> dict:
    cwd = _repo_cwd()
    branch = get_current_branch()
    remote_url = get_remote_url()
    owner, repo = parse_owner_repo(remote_url)
    ahead, behind = get_ahead_behind()
    default_branch = get_default_branch()
    return {
        "branch": branch,
        "remote_url": remote_url,
        "owner": owner,
        "repo": repo,
        "ahead": ahead,
        "behind": behind,
        "default_branch": default_branch,
    }


def commit_changes(message: str) -> tuple[bool, str | None, str | None]:
    try:
        if not has_staged_changes():
            return False, None, "No staged changes to commit. Run `git add` first."
        run_git(["commit", "-m", message])
        result = run_git(["rev-parse", "HEAD"])
        return True, result.stdout.strip(), None
    except GitError as e:
        return False, None, str(e)
    except HTTPException as e:
        return False, None, e.detail


def push_branch(branch: str | None = None) -> tuple[bool, str | None, str | None]:
    try:
        cwd = _repo_cwd()
        target = branch or get_current_branch()
        upstream = get_upstream_branch()

        if upstream:
            ahead, _ = get_ahead_behind()
            if ahead == 0:
                return True, "Nothing to push — branch is up to date with remote.", None
            result = subprocess.run(
                ["git", "push", "origin", target],
                cwd=cwd,
                capture_output=True,
                text=True,
            )
        else:
            result = subprocess.run(
                ["git", "push", "--set-upstream", "origin", target],
                cwd=cwd,
                capture_output=True,
                text=True,
            )

        if result.returncode != 0:
            stderr = result.stderr.strip() or result.stdout.strip()
            return False, None, stderr

        output = (result.stdout + result.stderr).strip() or f"Pushed {target} to origin."
        return True, output, None
    except GitError as e:
        return False, None, str(e)
    except HTTPException as e:
        return False, None, e.detail
