import { useRef, useState } from "react";
import { generateStudyMaterial } from "./api.js";
import BackgroundDecor from "./components/BackgroundDecor.jsx";
import StudyInput from "./components/StudyInput.jsx";
import EmptyState from "./components/EmptyState.jsx";
import LoadingState from "./components/LoadingState.jsx";
import ErrorState from "./components/ErrorState.jsx";
import StudyDashboard from "./components/StudyDashboard.jsx";

// status: "idle" | "loading" | "error" | "ready"
export default function App() {
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState(null);
  const [lastInput, setLastInput] = useState("");

  // Guards against a slow, older request overwriting a newer one's result.
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  async function runGenerate(input) {
    // Cancel any in-flight request before starting a new one.
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const thisRequestId = ++requestIdRef.current;

    setStatus("loading");
    setErrorMsg("");
    setLastInput(input);

    try {
      const result = await generateStudyMaterial(input, controller.signal);

      // If a newer request has started since this one began, drop this result.
      if (thisRequestId !== requestIdRef.current) return;

      setData(result);
      setStatus("ready");
    } catch (err) {
      if (err.name === "AbortError") return; // superseded by a newer request, not a real error
      if (thisRequestId !== requestIdRef.current) return;

      setErrorMsg(err.message || "Unknown error");
      setStatus("error");
    }
  }

  function handleRetry() {
    if (lastInput) runGenerate(lastInput);
  }

  function handleReset() {
    setStatus("idle");
    setData(null);
    setErrorMsg("");
  }

  return (
    <div className="sf-app">
      <BackgroundDecor />

      <div className="sf-main">
        <div className="sf-topbar">
          <div className="sf-brand">
            <span className="sf-brand-mark" aria-hidden="true" />
            <span className="sf-brand-name">StudyFlow AI</span>
          </div>
          {status === "ready" && (
            <button className="sf-reset-btn" onClick={handleReset}>
              New session
            </button>
          )}
        </div>

        {status !== "ready" && <StudyInput onSubmit={runGenerate} disabled={status === "loading"} />}

        <main>
          {status === "idle" && <EmptyState />}
          {status === "loading" && <LoadingState />}
          {status === "error" && <ErrorState message={errorMsg} onRetry={handleRetry} />}
          {status === "ready" && data && <StudyDashboard data={data} />}
        </main>
      </div>
    </div>
  );
}
