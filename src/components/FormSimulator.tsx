import React, { useState, useEffect } from 'react';
import { UserProfile, WebFormField, FieldMapping, FormPreset, DomainRule } from '../types';
import { PRESET_FORMS } from '../data';
import { 
  Chrome, RotateCw, ShieldCheck, Play, Layers, 
  HelpCircle, Eye, Settings, Terminal, Sparkles, CheckSquare, 
  ChevronRight, AlertCircle, RefreshCw, ClipboardCheck
} from 'lucide-react';

interface FormSimulatorProps {
  profile: UserProfile;
}

export default function FormSimulator({ profile }: FormSimulatorProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("google_form");
  const [customRules, setCustomRules] = useState<DomainRule[]>([
    { domain: "forms.google.com", customInstruction: "" },
    { domain: "jotform.com", customInstruction: "" },
    { domain: "careers.linkedin.com", customInstruction: "Be detailed about engineering and React skills." }
  ]);
  
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [scannedFields, setScannedFields] = useState<WebFormField[]>([]);
  const [suggestedMappings, setSuggestedMappings] = useState<FieldMapping[]>([]);
  const [status, setStatus] = useState<string>("Ready to scan.");
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTabUrl, setActiveTabUrl] = useState<string>("https://forms.google.com/skills-evaluation");
  const [reviewMode, setReviewMode] = useState<boolean>(true);
  const [showReviewPanel, setShowReviewPanel] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  const currentPreset = PRESET_FORMS.find(p => p.id === selectedPresetId) || PRESET_FORMS[0];

  // Update mock browser address bar and sync scanned elements
  useEffect(() => {
    let url = "https://forms.google.com/evaluation-sheet";
    if (selectedPresetId === "jotform") {
      url = "https://jotform.com/sb/enterprise-application";
    } else if (selectedPresetId === "job_board") {
      url = "https://careers.linkedin.com/jobs/senior-frontend-designer";
    }
    setActiveTabUrl(url);
    setFormState({});
    setSuggestedMappings([]);
    setShowReviewPanel(false);
    setScannedFields([]);
    setFormSubmitted(false);
    setLogs([`[SYSTEM] Loaded framework preset: ${currentPreset.name}`]);
    setStatus("Ready to scan.");
  }, [selectedPresetId]);

  // Sync custom prompt for the active domain
  const activeCustomInstruction = customRules.find(r => r.domain === currentPreset.domain)?.customInstruction || "";
  
  const handleCustomInstructionChange = (text: string) => {
    setCustomRules(prev => prev.map(r => r.domain === currentPreset.domain ? { ...r, customInstruction: text } : r));
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-14), msg]); // keep last 15 logs
  };

  // 1. Ingestion & Detection Phase (DOM Scrape Simulation)
  const handleScanDOM = () => {
    setLoading(true);
    setStatus("Analyzing parent nodes & resolving labels...");
    addLog("[SCANNER] Recurse parent container nodes for <label>");
    
    // Simulate content.js DOM query latency
    setTimeout(() => {
      setScannedFields(currentPreset.fields);
      addLog(`[SCANNER] Discovered ${currentPreset.fields.length} interactive inputs: ${currentPreset.fields.map(f => f.id).join(', ')}`);
      setStatus("DOM elements parsed. Invoking AI Mapping Engine...");
      
      // 2. AI Analysis & Schema Matching Phase
      handleAIMapping(currentPreset.fields);
    }, 800);
  };

  const handleAIMapping = async (fields: WebFormField[]) => {
    try {
      addLog(`[NETWORK] Calling server Gemini Proxy endpoint /api/map-fields`);
      
      const response = await fetch('/api/map-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: fields,
          profile: profile,
          customInstructions: activeCustomInstruction
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const resData = await response.json();
      
      if (resData.error) {
        throw new Error(resData.error);
      }

      const maps: FieldMapping[] = resData.mappings || [];
      setSuggestedMappings(maps);
      
      if (resData.offlineMode) {
        addLog("[GEMINI] offline state detected. Applying fast structural heuristics.");
      } else {
        addLog(`[GEMINI] 3.5-flash response schema mapping completed.`);
      }

      maps.forEach(m => {
        addLog(`[AI MAP] ${m.fieldId} ➔ "${m.value}" (Confidence: ${Math.round(m.confidence * 100)}%)`);
      });

      if (reviewMode) {
        setStatus("AI mapped inputs. Awaiting human confirmation...");
        setShowReviewPanel(true);
      } else {
        setStatus("Injecting mapped values directly...");
        executeFormInjection(maps);
      }
    } catch (err: any) {
      console.error(err);
      setStatus("Mapping failed.");
      addLog(`[ERROR] AI mapping failure: ${err?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Modify individual matched mappings under Human-in-the-loop review
  const handleReviewValueChange = (fieldId: string, val: string) => {
    setSuggestedMappings(prev => prev.map(m => m.fieldId === fieldId ? { ...m, value: val } : m));
  };

  // 4. Simulated Physical Event Injection Phase
  const executeFormInjection = async (mappings: FieldMapping[]) => {
    setShowReviewPanel(false);
    setStatus("Injecting state-bound inputs...");
    addLog(`[INJECT] Beginning SPA event dispatcher sequence on ${mappings.length} selectors`);

    // Stagger injection of values to visually represent actual framework binding updates
    for (let i = 0; i < mappings.length; i++) {
      const match = mappings[i];
      const targetField = currentPreset.fields.find(f => f.id === match.fieldId);
      
      if (!targetField) continue;

      setHighlightedFieldId(match.fieldId);
      addLog(`[DISPATCH] ──── Fill Target: #${match.fieldId} ────`);
      addLog(`[DISPATCH] Event: Focus on input element ID "${match.fieldId}"`);
      
      await new Promise(r => setTimeout(r, 120));
      
      // Update the React state value
      setFormState(prev => ({ ...prev, [match.fieldId]: match.value }));
      addLog(`[DISPATCH] Value input: "${match.value}"`);
      addLog(`[DISPATCH] Event: Dispatching physical keypress & Input events`);
      
      await new Promise(r => setTimeout(r, 120));
      addLog(`[DISPATCH] Event: Dispatching Change and Blur events to refresh SPA binds`);
      
      setHighlightedFieldId(null);
    }

    setStatus("Autofill complete! Validation active.");
    addLog("[SYSTEM] All elements populated with framework-proof native event dispatches.");
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLog("[SUBMIT] Submitting form. Running client validations...");
    setStatus("Verifying form framework submission...");
    
    // Validate required fields
    const missing = currentPreset.fields.filter(f => !formState[f.id]);
    if (missing.length > 2) {
      addLog(`[VALIDATION FAIL] Missing entries for: ${missing.map(m => m.label).join(', ')}`);
      setStatus("Validation failed. Inputs cleared by framework.");
      return;
    }

    setFormSubmitted(true);
    setStatus("Form successfully submitted!");
    addLog(`[SUCCESS] Validation Passed! Payload submitted successfully. Event dispatching worked perfectly!`);
  };

  const handleResetForm = () => {
    setFormState({});
    setSuggestedMappings([]);
    setScannedFields([]);
    setShowReviewPanel(false);
    setFormSubmitted(false);
    setLogs([`[SYSTEM] Reset simulated workspace`]);
    setStatus("Ready to scan.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 md:p-6 bg-transparent">
      
      {/* LEFT: Simulated Chrome Web Browser Space (Primary Bento Block) */}
      <div className="lg:col-span-8 flex flex-col border border-slate-800 rounded-3xl bg-slate-900 shadow-2xl overflow-hidden h-[660px]">
        
        {/* Mock Browser Title bar */}
        <div className="bg-slate-950 px-5 py-4 flex items-center justify-between border-b border-slate-850">
          <div className="flex items-center space-x-2">
            {/* Window control buttons */}
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>

          <div className="flex-1 max-w-xl mx-4 relative">
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 pl-9 pr-4 text-xs font-mono text-slate-400 flex items-center space-x-2 select-all leading-none shadow-inner">
              <ShieldCheck className="h-4 w-4 text-emerald-400 absolute left-3 top-1.5" />
              <span>{activeTabUrl}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={handleResetForm}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors" 
              title="Reset Sandbox"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-mono font-bold px-2.5 py-1 rounded-md border border-indigo-500/25">React 19 Stage</span>
          </div>
        </div>

        {/* Browser Form Body Layout */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-950/40">
          
          {formSubmitted ? (
            <div className="max-w-md mx-auto mt-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full"></div>
              <div className="h-16 w-16 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                ✓
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Application Transmitted!</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                The form triggers verified that client-side framework data states (React/Vue/Angular matching models) accepted the simulation parameters. Values did not clear on click event dispatches.
              </p>
              <div className="bg-slate-950 text-slate-400 text-xs font-mono rounded-xl p-4 border border-slate-800 text-left">
                <strong className="text-white block mb-2 font-semibold">Payload received:</strong>
                <pre className="text-[11px] whitespace-pre-wrap text-indigo-300 shrink-0 overflow-x-auto">{JSON.stringify(formState, null, 2)}</pre>
              </div>
              <button
                type="button"
                onClick={handleResetForm}
                className="mt-6 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 text-white rounded-xl text-xs font-bold transition-all"
              >
                Simulate Field Fresh Run
              </button>
            </div>
          ) : (
            <div className="max-w-xl mx-auto bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
              
              {/* Form header branding ribbon */}
              <div className={`h-2 w-full ${
                selectedPresetId === "google_form" ? "bg-purple-600" : selectedPresetId === "jotform" ? "bg-orange-500" : "bg-indigo-600"
              }`}></div>
              
              <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 font-mono">Simulated Web Form Endpoint</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                    <span className="text-[9px] font-mono font-bold text-indigo-300 uppercase tracking-widest">Observer Active</span>
                  </div>
                </div>
                <h3 className="text-lg font-black text-white tracking-tight">{currentPreset.name}</h3>
                <p className="text-xs text-slate-450 mt-1 leading-relaxed">{currentPreset.description}</p>
              </div>

              {/* Editable simulated forms */}
              <form onSubmit={handleManualSubmit} className="p-6 space-y-5 bg-slate-900">
                {currentPreset.fields.map((f) => {
                  const isHighlighted = highlightedFieldId === f.id;
                  const hasValue = !!formState[f.id];

                  return (
                    <div 
                      key={f.id} 
                      className={`p-4 rounded-2xl border transition-all duration-150 ${
                        isHighlighted 
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5 scale-[1.01]' 
                          : hasValue 
                          ? 'border-slate-800 bg-slate-950/20' 
                          : 'border-slate-800/40'
                      }`}
                    >
                      <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                        <span>{f.label}</span>
                        {f.context && (
                          <span className="text-[10px] font-normal font-mono text-slate-500">({f.context})</span>
                        )}
                      </label>

                      {/* Render appropriate Input types */}
                      {f.type === 'textarea' ? (
                        <textarea
                          id={f.id}
                          name={f.name}
                          placeholder={f.placeholder}
                          value={formState[f.id] || ""}
                          onChange={(e) => setFormState(prev => ({ ...prev, [f.id]: e.target.value }))}
                          rows={3}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-700 rounded-xl px-3.5 py-2 text-xs focus:bg-slate-950 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                      ) : f.type === 'select-one' ? (
                        <select
                          id={f.id}
                          name={f.name}
                          value={formState[f.id] || ""}
                          onChange={(e) => setFormState(prev => ({ ...prev, [f.id]: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-slate-950 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        >
                          <option value="">{f.placeholder || "-- Select Option --"}</option>
                          {f.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : f.type === 'radio' ? (
                        <div className="space-y-2 mt-1">
                          {f.options?.map(opt => (
                            <label key={opt} className="flex items-center space-x-2.5 text-xs text-slate-400 hover:text-white cursor-pointer transition-colors">
                              <input
                                type="radio"
                                id={`${f.id}_${opt}`}
                                name={f.name}
                                checked={formState[f.id] === opt}
                                value={opt}
                                onChange={() => setFormState(prev => ({ ...prev, [f.id]: opt }))}
                                className="h-4 w-4 text-indigo-650 border-slate-850 bg-slate-950 focus:ring-indigo-500"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={f.type}
                          id={f.id}
                          name={f.name}
                          placeholder={f.placeholder}
                          value={formState[f.id] || ""}
                          onChange={(e) => setFormState(prev => ({ ...prev, [f.id]: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-700 rounded-xl px-3.5 py-2 text-xs focus:bg-slate-950 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                      )}
                    </div>
                  );
                })}

                <div className="pt-5 border-t border-slate-800 flex justify-between items-center">
                  <p className="text-[10px] text-slate-500 font-mono">💡 Swap custom presets to alter browser layout metrics.</p>
                  <button
                    type="submit"
                    id="simulated_submit_button"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Submit Form Simulation
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Mini event debugger terminal rail */}
        <div className="bg-slate-950 text-slate-300 px-5 py-4 h-36 font-mono border-t border-slate-850 overflow-y-auto leading-relaxed text-[10px]">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-2 text-slate-600">
            <span className="flex items-center space-x-1.5">
              <Terminal className="h-3.5 w-3.5 text-teal-400" />
              <span className="font-bold text-teal-500 tracking-wider font-mono">Chrome Content Script Log Console</span>
            </span>
            <span className="text-[9px] font-mono">Mutation observer active</span>
          </div>
          {logs.map((log, i) => (
            <div key={i} className={
              log.includes('[DISPATCH]') ? 'text-teal-400' :
              log.includes('[ERROR]') ? 'text-rose-400 font-bold' :
              log.includes('[AI MAP]') ? 'text-indigo-300' : 'text-slate-500'
            }>
              {log}
            </div>
          ))}
        </div>

      </div>

      {/* RIGHT: Floating Mock Chrome Extension Overlay Panel */}
      <div className="lg:col-span-4 space-y-6 flex flex-col">
        
        {/* Panel Container (Bento block) */}
        <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl animate-spin" style={{ animationDuration: '6s' }}>✨</span>
                <div>
                  <h4 className="text-xs font-black tracking-widest text-white">AI FORM-FILLER</h4>
                  <p className="text-[9px] font-mono text-indigo-400 uppercase leading-none mt-0.5">Chrome Extension Panel</p>
                </div>
              </div>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold">MV3 Background Active</span>
            </div>

            {/* Target Preset Selector tab buttons within popup */}
            <div className="space-y-2 mb-5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Preset Target Website</label>
              <div className="grid grid-cols-3 gap-1.5">
                {PRESET_FORMS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPresetId(p.id)}
                    className={`px-2 py-2 rounded-xl text-[9px] font-bold tracking-tight text-center truncate border transition-all ${
                      selectedPresetId === p.id 
                        ? 'bg-indigo-650 text-white border-indigo-500 shadow-lg shadow-indigo-500/15' 
                        : 'bg-slate-950 text-slate-450 border-slate-850 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {p.id === 'google_form' ? 'Google Forms' : p.id === 'jotform' ? 'JotForm' : 'LinkedIn Jobs'}
                  </button>
                ))}
              </div>
            </div>

            {/* User Custom Site context overlay */}
            <div className="space-y-2 mb-5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Domain Overlay Instructions</label>
              <input
                type="text"
                value={activeCustomInstruction}
                onChange={(e) => handleCustomInstructionChange(e.target.value)}
                placeholder="e.g. emphasize Senior React skills on LinkedIn."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-750 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[9px] text-slate-500 font-mono leading-relaxed block mt-1">Generates per-site prompt modifiers injected into LLM prompts.</span>
            </div>

            {/* Gating triggers: Human-in-the-loop validation */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950/55 rounded-2xl border border-slate-800 mb-5">
              <div className="flex items-center space-x-2.5">
                <CheckSquare className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-[11px] font-bold text-slate-200 block leading-tight">Review before injection</span>
                  <span className="text-[9px] text-slate-500 font-mono">Gated verification workflow</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={reviewMode}
                onChange={(e) => setReviewMode(e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded-md border-slate-800 bg-slate-950 focus:ring-indigo-500 focus:ring-offset-slate-900"
              />
            </div>

            {/* Big Extension Execution Button */}
            <button
              id="ext_trigger_button"
              onClick={handleScanDOM}
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all ${
                loading 
                  ? 'bg-indigo-700/40 cursor-wait' 
                  : 'bg-indigo-650 hover:bg-indigo-500 shadow-indigo-500/20 hover:scale-[1.01]'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4.5 w-4.5 animate-spin text-white" />
                  <span>AI Scanning Fields...</span>
                </>
              ) : (
                <>
                  <Play className="h-4.5 w-4.5 fill-current text-white" />
                  <span>Scan active webpage</span>
                </>
              )}
            </button>

            {/* Simulated Extension Status feedback */}
            <div className="mt-3.5 p-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-[10px] text-slate-400 font-mono">
              Status Dial: {status}
            </div>

          </div>

        </div>

        {/* Human-in-the-loop modal/overlay panel */}
        {showReviewPanel && suggestedMappings.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 animate-motion">
            <div className="flex items-center justify-between pb-3 border-b border-slate-850">
              <span className="font-black text-xs text-white uppercase tracking-widest flex items-center space-x-2">
                <ClipboardCheck className="h-4.5 w-4.5 text-indigo-400" />
                <span>Verify Form Matches</span>
              </span>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold font-mono text-[9px] px-2.5 py-0.5 rounded-full">
                Review Required ({suggestedMappings.filter(m => m.value).length}/{suggestedMappings.length})
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Below are the Gemini-mapped form matches. Modify anything before confirming. This represents the in-page overlay review stage of the Chrome Extension.
            </p>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {suggestedMappings.map((m) => {
                const targetField = currentPreset.fields.find(f => f.id === m.fieldId);
                if (!targetField) return null;
                
                return (
                  <div key={m.fieldId} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-black text-slate-200 block leading-tight">{targetField.label}</span>
                        <span className="text-[9px] font-mono text-slate-500 mt-0.5 block">{m.fieldId}</span>
                      </div>
                      <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded ${
                        m.confidence > 0.8 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {Math.round(m.confidence * 100)}% Match
                      </span>
                    </div>

                    {/* Manual override input within review panel */}
                    <input
                      type="text"
                      value={m.value}
                      onChange={(e) => handleReviewValueChange(m.fieldId, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />

                    <p className="text-[10px] text-slate-500 leading-normal italic font-mono">
                      💡 Reason: {m.reasoning}
                    </p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => executeFormInjection(suggestedMappings)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-500/15"
            >
              <span>Approve & Inject States</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
