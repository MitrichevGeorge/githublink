import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // tailwind должен быть подключен здесь

function GitHubRawConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const outRef = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      document.documentElement.style.setProperty("--cursor-x", x + "px");
      document.documentElement.style.setProperty("--cursor-y", y + "px");
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  function convertGitHubUrl(url) {
    setError("");
    if (!url) return "";
    try {
      const u = new URL(url.trim());
      if (!u.hostname.includes("github.com") && !u.hostname.includes("raw.githubusercontent.com")) {
        setError("URL is not a GitHub URL.");
        return "";
      }
      if (u.hostname === "raw.githubusercontent.com") return url.trim();
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length < 3) { setError("Couldn't parse GitHub path."); return ""; }
      const owner = parts[0], repo = parts[1];
      let markerIndex = parts.indexOf("blob"); if (markerIndex === -1) markerIndex = parts.indexOf("raw");
      let branch = "", filepath = "";
      if (markerIndex !== -1) {
        branch = parts[markerIndex + 1] || "main";
        filepath = parts.slice(markerIndex + 2).join("/");
      } else { branch = parts[2] || "main"; filepath = parts.slice(3).join("/"); }
      if (!filepath) { setError("No file path detected in the URL."); return ""; }
      return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filepath}`;
    } catch { setError("Invalid URL format."); return ""; }
  }

  function handleConvert(e) { e && e.preventDefault(); setOutput(convertGitHubUrl(input)); setTimeout(() => outRef.current?.select(), 50); }
  function handleCopy() { if (!output) return; navigator.clipboard.writeText(output).then(() => { const prev = outRef.current?.value; outRef.current.value = "Copied! ✅"; setTimeout(() => (outRef.current.value = prev), 900); }); }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 relative overflow-hidden text-white">
      <div className="absolute inset-0 -z-10 animate-[gradientMove_12s_ease_infinite] bg-[linear-gradient(130deg,rgba(99,102,241,0.25),rgba(168,85,247,0.25),rgba(14,165,233,0.25))] bg-[length:300%_300%]" />
      <div aria-hidden className="pointer-events-none fixed inset-0" style={{ mixBlendMode: 'screen' }}>
        <div className="absolute left-0 top-0 w-full h-full" style={{
          background: 'radial-gradient(600px circle at var(--cursor-x) var(--cursor-y), rgba(99,102,241,0.18), transparent 20%), radial-gradient(300px circle at calc(var(--cursor-x) - 200px) calc(var(--cursor-y) - 80px), rgba(59,130,246,0.06), transparent 10%)'
        }} />
      </div>
      <main className="max-w-3xl w-full backdrop-blur-2xl bg-white/10 rounded-3xl p-10 shadow-[0_0_50px_rgba(255,255,255,0.08)] border border-white/20">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold">GitHub Raw Link Converter</h1>
          <p className="text-sm text-white/70 mt-1">Paste a GitHub file URL and get the corresponding <code>raw.githubusercontent.com</code> link.</p>
        </header>
        <form onSubmit={handleConvert} className="space-y-4">
          <label className="block text-sm text-white/80">GitHub file URL</label>
          <div className="flex gap-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 rounded-lg px-4 py-3 bg-white/6 placeholder-white/40 outline-none border border-white/6 focus:border-indigo-400" placeholder="https://github.com/owner/repo/blob/main/path/to/file.sh" />
            <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 font-medium">Convert</button>
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <label className="block text-sm text-white/80">Raw URL</label>
          <div className="flex gap-3">
            <input ref={outRef} value={output} readOnly className="flex-1 rounded-lg px-4 py-3 bg-white/6 placeholder-white/40 outline-none border border-white/6" placeholder="Converted link will appear here" />
            <button type="button" onClick={handleCopy} className="px-4 py-2 rounded-lg bg-white/8 hover:bg-white/12">Copy</button>
            <a href={output} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-white/8 hover:bg-white/12 flex items-center">Open</a>
          </div>
          <div className="mt-4 text-sm text-white/60">Examples supported: <code>/blob/</code>, <code>/raw/</code> and many common GitHub file links. If branch can't be detected, <strong>main</strong> is assumed.</div>
          <hr className="my-4 border-white/6" />
          <div className="flex items-center justify-between text-sm text-white/70"><div className="text-xs text-white/50">Tip: hit Enter to convert</div></div>
        </form>
      </main>
      <div className="pointer-events-none fixed -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-indigo-600 to-purple-500" />
      <div className="pointer-events-none fixed -top-24 -right-24 w-72 h-72 rounded-full blur-2xl opacity-20 bg-gradient-to-br from-sky-500 to-indigo-600" />
    </div>
  );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<GitHubRawConverter />);
