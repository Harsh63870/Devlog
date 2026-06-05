from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import ollama
import time

MODEL = "mistral"  

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_WARMED = False

def warmup_model():
    """Preload model into memory (removes first-request delay)"""
    global OLLAMA_WARMED

    if not OLLAMA_WARMED:
        try:
            ollama.chat(
                model=MODEL,
                messages=[{"role": "user", "content": "hi"}]
            )
            OLLAMA_WARMED = True
        except:
            pass


def get_staged_diff() -> str:
    """Get git staged diff safely"""
    try:
        return subprocess.check_output(
            ["git", "diff", "--cached"],
            cwd="../"
        ).decode("utf-8")
    except:
        return ""


def clean_git_diff(diff: str) -> str:
    """Reduce noise + LIMIT size for speed"""
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


@app.get("/")
def home():
    return {"message": "DevLog API running 🚀"}


@app.get("/warmup")
def warmup():
    """Call once after server start to make API FAST"""
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
            messages=[{"role": "user", "content": prompt}]
        )

        commit_message = response["message"]["content"].strip().split("\n")[0]

        return {
            "message": commit_message,
            "time_taken_sec": round(time.time() - start, 2)
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
            messages=[{"role": "user", "content": prompt}]
        )

        return {
            "description": response["message"]["content"].strip(),
            "time_taken_sec": round(time.time() - start, 2)
        }

    except Exception as e:
        return {"description": str(e)}
