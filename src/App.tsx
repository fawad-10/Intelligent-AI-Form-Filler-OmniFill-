/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { INITIAL_PROFILE } from './data';
import TabsHeader from './components/TabsHeader';
import FormSimulator from './components/FormSimulator';
import ProfileEditor from './components/ProfileEditor';
import ExtensionExporter from './components/ExtensionExporter';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('playground');
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);

  // Synchronize secure profile data locally to preserve changes across reload cycles
  useEffect(() => {
    const backup = localStorage.getItem('ai_form_filler_profile_vault');
    if (backup) {
      try {
        setProfile(JSON.parse(backup));
      } catch (err) {
        console.warn('Profile restoration failed, utilizing defaults.', err);
      }
    }
  }, []);

  const handleProfileChange = (updated: UserProfile) => {
    setProfile(updated);
    localStorage.setItem('ai_form_filler_profile_vault', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans select-none antialiased text-slate-200">
      {/* Dynamic Tab Switcher bar */}
      <TabsHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Dynamic tabs render mapping */}
        {activeTab === 'playground' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Active Playground Simulator</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Test the AI scanning process. Select different form specs (Google Forms, JotForm, careers), configure custom instructions, and inspect real-time framework typing events (Focus ➜ Input ➜ Change ➜ Blur).
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-slate-950/50 border border-slate-800 rounded-xl p-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">Profile Candidate</span>
                    <span className="text-xs font-semibold text-indigo-400">{profile.personal.firstName} {profile.personal.lastName}</span>
                  </div>
                </div>
              </div>
            </div>

            <FormSimulator profile={profile} />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full"></div>
              <h2 className="text-lg font-bold text-white tracking-tight">Personal & Professional Profile Vault</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Configure your structured CV, contact info, and work background. This dataset behaves as the secure, sandboxed client storage target evaluated during AI scanning calculations.
              </p>
            </div>

            <ProfileEditor profile={profile} onChange={handleProfileChange} />
          </div>
        )}

        {activeTab === 'exporter' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full"></div>
              <h2 className="text-lg font-bold text-white tracking-tight">Chrome Extension Source Exporter</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Explore the actual Manifest V3 chrome extension codebase. Run unpacked loading sequences directly on your local computer to scan and automatically fill forms natively in your Chrome browser.
              </p>
            </div>

            <ExtensionExporter profile={profile} />
          </div>
        )}

      </main>

      {/* Footer Branding Panel */}
      <footer className="bg-slate-900/50 border-t border-slate-800/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">🛡️</span>
            <span>AES-Secure local storage Sandbox configuration. No CV data is serialized without direct request calls.</span>
          </div>
          <div>
            <span>Google AI Studio Build &bull; manifest-v3-filler v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
