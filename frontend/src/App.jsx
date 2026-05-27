import { useState } from "react";

function App() {
  const [diff, setDiff] = useState("");
  const [commitMsg, setCommitMsg] = useState("");
  const [prDesc, setPrDesc] = useState("");
const copyText = (text) => {
  navigator.clipboard.writeText(text);
};
  const fetchDiff = async () => {
    const res = await fetch("http://localhost:8000/git-diff");
    const data = await res.json();
    setDiff(data.diff);
  };

 const generateCommit = async () => {
  const res = await fetch("http://localhost:8000/generate-commit");
  const data = await res.json();
  setCommitMsg(data.message);
};

 const generatePR = async () => {
  const res = await fetch("http://localhost:8000/generate-pr");
  const data = await res.json();
  setPrDesc(data.description);
};

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", fontFamily: "Arial" }}>
      <h1>DevLog</h1>

      <button onClick={fetchDiff}>Scan Git Diff</button>
      <button onClick={generateCommit}>Generate Commit Message</button>
      <button onClick={generatePR}>Generate PR Description</button>
      
      <h3>Git Diff</h3>
      <pre>{diff}</pre>

      <h3>Commit Message</h3>
      <button onClick={() => copyText(commitMsg)}>
  Copy Commit Message
</button>
      <pre>{commitMsg}</pre>

      <h3>PR Description</h3>
      <button onClick={() => copyText(prDesc)}>
  Copy PR Description
</button>
      <pre>{prDesc}</pre>
    </div>
  );
}

export default App;