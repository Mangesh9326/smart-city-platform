import React, { useEffect } from 'react';
import { useTrafficControlStore, SCENARIO_STEPS } from '../store/useTrafficControlStore';

const BrainIcon = () => <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const AlertIcon = () => <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const scenarioColor = (severity) =>
  severity === "CRITICAL" || severity === "SEVERE" ? "text-red-500" :
  severity === "HIGH" ? "text-orange-400" :
  severity === "MODERATE" ? "text-yellow-400" : "text-emerald-400";

const SimulateDemonstation = () => {
  const {
    scenarios, scenariosLoading, scenariosError,
    selectedScenarioId, selectedScenario,
    scenarioStep, isRunning, isPaused, agentStatus, agentDecision,
    fetchScenarios, prepareScenario, runScenario, pauseScenario, resetScenario,
  } = useTrafficControlStore();

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  // ---------------------------------------------------------------------
  // CROSS-DEVICE SYNC
  // The Zustand store's actions already POST the resulting playback state
  // to the backend (see useTrafficControlStore.js), which any LiveTraffic
  // page (on this device or another) polls and mirrors. This page only
  // needs to call the store actions directly — no duplicate POST logic here.
  // ---------------------------------------------------------------------
  const handlePrepareScenario = (id) => {
    prepareScenario(id);
  };

  const handleRunScenario = () => {
    if (!selectedScenarioId || isRunning) return;
    runScenario();
  };

  const handlePauseScenario = () => {
    if (!isRunning) return;
    pauseScenario();
  };

  const handleResetScenario = () => {
    if (!selectedScenarioId) return;
    resetScenario();
  };

  const statusLabel = scenarioStep < 0 ? "READY" : SCENARIO_STEPS[scenarioStep] || "READY";

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 flex flex-col gap-4 sm:gap-6">

        {/* HEADER */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <BrainIcon />
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight">
              Scenario Control
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Drive the Live Traffic Analysis playback remotely
          </p>
        </div>

        {/* ERROR */}
        {scenariosError && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-4 flex items-center gap-2 text-sm text-red-300">
            <AlertIcon /> {scenariosError}
          </div>
        )}

        {/* CONTROLS CARD */}
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-4">

          {/* Dropdown: full width on mobile/tablet, constrained on desktop */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Scenario
            </label>
            <select
              value={selectedScenarioId}
              onChange={(e) => handlePrepareScenario(e.target.value)}
              disabled={scenariosLoading}
              className="w-full sm:w-80 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500 font-bold disabled:opacity-50"
            >
              <option value="">
                {scenariosLoading ? "Loading scenarios..." : "Manual Exploration Mode"}
              </option>
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Buttons: stack full-width on mobile, row on sm+ */}
          <div className="grid grid-cols-1 xs:grid-cols-3 sm:flex sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleRunScenario}
              disabled={!selectedScenarioId || isRunning}
              className="w-full sm:w-auto sm:min-w-[110px] bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPaused ? "▶ Resume" : "▶ Start"}
            </button>
            <button
              onClick={handlePauseScenario}
              disabled={!isRunning}
              className="w-full sm:w-auto sm:min-w-[110px] bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-600 text-slate-200 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ⏸ Pause
            </button>
            <button
              onClick={handleResetScenario}
              disabled={!selectedScenarioId}
              className="w-full sm:w-auto sm:min-w-[110px] bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-600 text-slate-200 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ↻ Reset
            </button>
          </div>
        </div>

        {/* STATUS ROW: stacks on mobile, 2-up on tablet, 3-up on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`}></span>
              <span className="text-sm font-bold text-blue-300 uppercase tracking-wide break-words">
                {selectedScenarioId ? statusLabel : agentStatus}
              </span>
            </div>
            {selectedScenarioId && (
              <span className="text-[11px] text-slate-500 font-mono">
                Step {Math.max(scenarioStep, 0) + (scenarioStep >= 0 ? 1 : 0)} / {SCENARIO_STEPS.length}
              </span>
            )}
          </div>

          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Location</span>
            <span className="text-sm font-bold text-slate-100 truncate">
              {selectedScenario?.location || "—"}
            </span>
            {selectedScenario?.severity && (
              <span className={`text-xs font-bold uppercase tracking-wide ${scenarioColor(selectedScenario.severity)}`}>
                {selectedScenario.severity}
              </span>
            )}
          </div>

          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Decision</span>
            <span className="text-sm font-bold text-emerald-400 break-words">
              {agentDecision?.routeRecommendation?.name || agentDecision?.decision || "Awaiting run"}
            </span>
          </div>
        </div>

        {/* DESCRIPTION */}
        {selectedScenario?.description && (
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 sm:p-5 shadow-lg">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">
              Scenario Description
            </span>
            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedScenario.description}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default SimulateDemonstation;