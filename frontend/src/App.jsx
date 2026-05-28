import { useState } from "react";

function App() {
  const [diff, setDiff] = useState("");
  const [commitMsg, setCommitMsg] = useState("");
  const [prDesc, setPrDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const fetchDiff = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/git-diff");
      const data = await res.json();
      setDiff(data.diff);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const generateCommit = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/generate-commit");
      const data = await res.json();
      setCommitMsg(data.message);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const generatePR = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/generate-pr");
      const data = await res.json();
      setPrDesc(data.description);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const cardStyle = {
    border: "1px solid #121212",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    backgroundColor: "#161b22",
color: "white",
minHeight: "120px",
  };

  const buttonStyle = {
    padding: "10px 16px",
    marginRight: "10px",
    marginBottom: "10px",
    cursor: "pointer",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#111",
    color: "white",
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        fontFamily: "Arial",
        padding: "20px",
        minHeight: "100vh",
color: "white",
      }}
    >
      <h1 style={{ marginBottom: "10px" }}>DevLog</h1>

      <p style={{ marginBottom: "30px", color: "#766d6d" }}>
        AI-style Git Commit + PR Generator
      </p>

      <div style={{ marginBottom: "30px" }}>
        <button style={buttonStyle} onClick={fetchDiff}>
          Scan Git Diff
        </button>

        <button style={buttonStyle} onClick={generateCommit}>
          Generate Commit Message
        </button>

        <button style={buttonStyle} onClick={generatePR}>
          Generate PR Description
        </button>
      </div>

      {loading && (
        <p style={{ marginBottom: "20px" }}>
          Processing...
        </p>
      )}

      <div style={cardStyle}>
        <h2>Git Diff</h2>

        <pre
  style={{
    whiteSpace: "pre-wrap",
    overflowX: "auto",
    backgroundColor: "#0d1117",
    padding: "16px",
    borderRadius: "8px",
    color: "#58a6ff",
    fontSize: "14px",
  }}
>
          {diff}
        </pre>
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>Commit Message</h2>

          <button
            style={buttonStyle}
            onClick={() => copyText(commitMsg)}
          >
            Copy
          </button>
        </div>

        <pre
          style={{
            whiteSpace: "pre-wrap",
          }}
        >
          {commitMsg}
        </pre>
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>PR Description</h2>

          <button
            style={buttonStyle}
            onClick={() => copyText(prDesc)}
          >
            Copy
          </button>
        </div>

        <pre
          style={{
            whiteSpace: "pre-wrap",
          }}
        >
          {prDesc}
        </pre>
      </div>
    </div>
  );
}

export default App;