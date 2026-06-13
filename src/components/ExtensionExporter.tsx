import React, { useState } from 'react';
import { generateExtensionFiles } from '../extensionFiles';
import { UserProfile } from '../types';
import { INSTALLED_CHROME_EXTENSION_STEPS } from '../data';
import JSZip from 'jszip';
import { Download, FileCode, CheckCircle2, Copy, Terminal, ExternalLink } from 'lucide-react';

interface ExtensionExporterProps {
  profile: UserProfile;
}

export default function ExtensionExporter({ profile }: ExtensionExporterProps) {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // We feed our development or production host into the script so the real background.js links to our full API routes seamlessly
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000';
  const repoFiles = generateExtensionFiles(profile, currentOrigin);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(repoFiles[selectedFileIdx].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZIP = async () => {
    try {
      setDownloading(true);
      setDownloadSuccess(false);
      
      const zip = new JSZip();
      
      // Pack all files
      repoFiles.forEach(file => {
        zip.file(file.name, file.code);
      });

      // Include a basic transparent 16x16 icon file using SVG format as a fallback or a simple base64 PNG dummy
      // Icon base64 representing a cute dynamic yellow puzzle/lightning bolt icon
      const dummyIconBase64 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAm0lEQVQ4T2NkoBAwUqifAb/6m38YGBhEGfChYpjA78yGDOzGVAxDOf6ff/D/zH9scv///gXWpBiGChb/v/sPPpLg938gW5RhYGHV/8/NBlpA9v///wxIclgM/ff6OVDzPxaD/9v83OAYxOAtID/++P+b/+gYxOBfID8e/0cyBOY3ZgP7m7gMQAOsh+L///9DDIZpIBGfAwCPkzAFeV0oqwAAAABJRU5ErkJggg==";
      zip.file("icon.png", dummyIconBase64, { base64: true });

      const contentBlob = await zip.generateAsync({ type: "blob" });
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(contentBlob);
      link.download = `ai-form-filler-extension-v3.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 6000);
    } catch (err) {
      console.error("ZIP Generation error:", err);
      alert("Could not generate ZIP container: " + err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-1 md:p-6 bg-transparent min-h-[500px]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Step Guide & Action Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full"></div>
            <h3 className="text-base font-black text-white mb-3 flex items-center space-x-2.5">
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2.5 py-1 rounded-lg font-mono font-bold">MV3</span>
              <span>Compile Extension Repository</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Export the fully coded Chrome Extension source. It is bundled with your currently configured profile as the default fallback and points secure API callbacks back to this server hub: <code className="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold">{currentOrigin}</code>.
            </p>

            <button
              id="download_zip_trigger"
              onClick={handleDownloadZIP}
              disabled={downloading}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl text-white transition-all shadow-lg ${
                downloading 
                  ? 'bg-indigo-700/40 cursor-not-allowed' 
                  : 'bg-indigo-650 hover:bg-indigo-500 shadow-indigo-500/15'
              }`}
            >
              <Download className="h-4.5 w-4.5" />
              <span>{downloading ? 'Packing Artifacts...' : 'Download Unpacked ZIP'}</span>
            </button>

            {downloadSuccess && (
              <div className="mt-4 p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl text-xs font-semibold flex items-start space-x-2.5 border border-emerald-500/20">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-450 shrink-0 mt-0.5" />
                <span>
                  <strong>Success! ZIP Downloaded.</strong> Follow the installation steps on the right to unpack your custom MV3 AI Form-Filler directly into Google Chrome.
                </span>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-slate-505 animate-pulse" />
              <span>Extension Key Modules Architecture</span>
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3.5 text-xs leading-relaxed">
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase font-mono tracking-wider shrink-0 mt-0.5">Service Worker</span>
                <div>
                  <span className="font-bold text-slate-200">background.js</span>
                  <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">Handles background message routines, pulls profile state securely, and makes the Gemini mapping dispatch calls.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3.5 text-xs leading-relaxed">
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase font-mono tracking-wider shrink-0 mt-0.5">Content Script</span>
                <div>
                  <span className="font-bold text-slate-200">content.js</span>
                  <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">Injects onto active pages to scrape input attributes, options matrices, and applies native-dispatch change events to drive SPA reactivity.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3.5 text-xs leading-relaxed">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase font-mono tracking-wider shrink-0 mt-0.5">Popup view</span>
                <div>
                  <span className="font-bold text-slate-200">popup.html & popup.js</span>
                  <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">Compact, clean MV3 drop-down view. Lets users customize prompt modifiers and review extracted elements immediately.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File Browser and Steps switcher */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="flex bg-slate-950 px-4 py-3 overflow-x-auto gap-2 scrollbar-none border-b border-slate-850">
              {repoFiles.map((file, idx) => (
                <button
                  key={file.name}
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 ${
                    selectedFileIdx === idx
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/15'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <FileCode className="h-3.5 w-3.5 text-slate-455" />
                    <span>{file.name}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="p-4 relative">
              <button
                onClick={handleCopyCode}
                className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-750 text-slate-200 p-2 rounded-xl text-xs font-bold flex items-center space-x-1 border border-slate-750 transition"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <pre className="text-xs font-mono bg-slate-950 text-slate-300 rounded-2xl p-5 overflow-x-auto h-[320px] leading-relaxed select-all border border-slate-850/80">
                <code>{repoFiles[selectedFileIdx].code}</code>
              </pre>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Chrome Developers: Quick Unpack Installation</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {INSTALLED_CHROME_EXTENSION_STEPS.map((step, idx) => (
                <div key={idx} className="bg-slate-950 rounded-2xl p-4.5 border border-slate-850 flex flex-col justify-between">
                  <div>
                    <h5 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest font-mono mb-2">{step.title}</h5>
                    <p className="text-[11px] text-slate-450 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
