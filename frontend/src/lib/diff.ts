export interface DiffFile {
  path: string;
  additions: number;
  deletions: number;
  status: "modified" | "added" | "deleted";
}

export interface DiffStats {
  files: DiffFile[];
  additions: number;
  deletions: number;
  raw: string;
}

/** Parse a raw `git diff` string into per-file stats. */
export function parseDiff(raw: string): DiffStats {
  const files: DiffFile[] = [];
  let current: DiffFile | null = null;

  for (const line of raw.split("\n")) {
    if (line.startsWith("diff --git")) {
      if (current) files.push(current);
      const match = line.match(/ b\/(.+)$/);
      current = {
        path: match?.[1] ?? "unknown",
        additions: 0,
        deletions: 0,
        status: "modified",
      };
    } else if (current) {
      if (line.startsWith("new file mode")) current.status = "added";
      else if (line.startsWith("deleted file mode")) current.status = "deleted";
      else if (line.startsWith("+") && !line.startsWith("+++")) current.additions++;
      else if (line.startsWith("-") && !line.startsWith("---")) current.deletions++;
    }
  }
  if (current) files.push(current);

  return {
    files,
    additions: files.reduce((sum, f) => sum + f.additions, 0),
    deletions: files.reduce((sum, f) => sum + f.deletions, 0),
    raw,
  };
}

export type DiffLineKind = "add" | "del" | "hunk" | "meta" | "context";

export interface DiffLine {
  kind: DiffLineKind;
  text: string;
}

/** Classify each diff line for syntax-aware rendering. */
export function classifyDiffLines(raw: string): DiffLine[] {
  return raw
    .split("\n")
    .filter((l) => l.length > 0)
    .map((text) => {
      let kind: DiffLineKind = "context";
      if (text.startsWith("+++") || text.startsWith("---") || text.startsWith("diff ") || text.startsWith("index ")) {
        kind = "meta";
      } else if (text.startsWith("@@")) kind = "hunk";
      else if (text.startsWith("+")) kind = "add";
      else if (text.startsWith("-")) kind = "del";
      return { kind, text };
    });
}
