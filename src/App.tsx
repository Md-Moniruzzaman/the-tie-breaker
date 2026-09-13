import React, { useState, useEffect } from 'react';
import { Scale, Clock, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { DecisionAnalysis } from './types';
import { DecisionForm } from './components/DecisionForm';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { HistoryDrawer } from './components/HistoryDrawer';

const STORAGE_KEY = 'the_tiebreaker_saved_decisions';
const ACTIVE_STORAGE_KEY = 'the_tiebreaker_active_decision';

export default function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState<DecisionAnalysis | null>(null);
  const [savedDecisions, setSavedDecisions] = useState<DecisionAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load saved history and active decision on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedDecisions(JSON.parse(stored));
      }
      const activeStored = localStorage.getItem(ACTIVE_STORAGE_KEY);
      if (activeStored) {
        setCurrentAnalysis(JSON.parse(activeStored));
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
  }, []);

  // Save changes to localStorage
  const saveDecisionsList = (list: DecisionAnalysis[]) => {
    setSavedDecisions(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  const updateCurrentAnalysis = (analysis: DecisionAnalysis | null) => {
    setCurrentAnalysis(analysis);
    try {
      if (analysis) {
        localStorage.setItem(ACTIVE_STORAGE_KEY, JSON.stringify(analysis));
      } else {
        localStorage.removeItem(ACTIVE_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to update active in localStorage', e);
    }
  };

  // Cycling loading message effect
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 2200);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingMessages = [
    'Mapping alternatives & counterweights...',
    'Evaluating weighted pros and cons...',
    'Constructing multi-criteria comparison matrix...',
    'Formulating SWOT internal & external dynamics...',
    'Synthesizing final Tiebreaker recommendation...',
  ];

  const handleAnalyzeDecision = async (formData: {
    decision: string;
    options: string[];
    context: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis request failed.');
      }

      const newAnalysis: DecisionAnalysis = data;
      updateCurrentAnalysis(newAnalysis);

      // Prepend to history
      const updatedList = [newAnalysis, ...savedDecisions.filter((d) => d.id !== newAnalysis.id)];
      saveDecisionsList(updatedList);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(
        err.message || 'Unable to break the tie. Please check your connection or try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDecision = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDecisions.filter((d) => d.id !== id);
    saveDecisionsList(updated);
    if (currentAnalysis?.id === id) {
      updateCurrentAnalysis(null);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear your decision history?')) {
      saveDecisionsList([]);
      updateCurrentAnalysis(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            onClick={() => updateCurrentAnalysis(null)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg text-stone-900 tracking-tight leading-none block">
                The Tiebreaker
              </span>
              <span className="text-[10px] text-stone-500 font-medium tracking-wide uppercase">
                AI Decision Arbiter
              </span>
            </div>
          </div>

          {/* Right Header actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-100/80 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>History</span>
              {savedDecisions.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] font-mono flex items-center justify-center">
                  {savedDecisions.length}
                </span>
              )}
            </button>

            {currentAnalysis && (
              <button
                type="button"
                onClick={() => updateCurrentAnalysis(null)}
                className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>New Decision</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="max-w-3xl mx-auto mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-none mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-rose-900">Analysis Halted</h4>
              <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold text-rose-800 hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State Overlay / Card */}
        {isLoading ? (
          <div className="max-w-lg mx-auto py-20 px-4 text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
              <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Scale className="w-6 h-6 text-stone-800 animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl font-bold font-display text-stone-900 mb-2">
              Breaking the Tie...
            </h3>
            <p className="text-sm text-stone-600 font-medium h-6 transition-all duration-300">
              {loadingMessages[loadingStep]}
            </p>
            <p className="text-xs text-stone-400 mt-4 max-w-xs mx-auto">
              Synthesizing pros & cons, comparing criteria weights, and resolving cognitive blindspots.
            </p>
          </div>
        ) : currentAnalysis ? (
          <AnalysisDashboard
            analysis={currentAnalysis}
            onNewDecision={() => updateCurrentAnalysis(null)}
            onUpdateAnalysis={(updated) => {
              updateCurrentAnalysis(updated);
              const nextList = savedDecisions.map((d) => (d.id === updated.id ? updated : d));
              saveDecisionsList(nextList);
            }}
          />
        ) : (
          <div className="space-y-8">
            {/* Hero / Intro Header */}
            <div className="text-center max-w-2xl mx-auto pt-2 pb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wide uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Multi-Lens Decision Intelligence</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 tracking-tight leading-tight">
                Turn agonizing dilemmas into decisive clarity.
              </h1>
              <p className="mt-3 text-stone-600 text-sm sm:text-base leading-relaxed">
                Provide the choice you’re wrestling with. The Tiebreaker rigorously breaks it down across three strategic lenses: <span className="font-semibold text-stone-900">Weighted Pros & Cons</span>, a <span className="font-semibold text-stone-900">Side-by-Side Comparison Matrix</span>, and an actionable <span className="font-semibold text-stone-900">SWOT Analysis</span>.
              </p>
            </div>

            {/* Decision Form Component */}
            <DecisionForm onSubmit={handleAnalyzeDecision} isLoading={isLoading} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-center text-xs text-stone-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-stone-400" />
            <span className="font-semibold text-stone-700">The Tiebreaker</span>
            <span>— Objective, multi-angle decision resolution</span>
          </div>
          <div>
            Powered by Gemini AI • Pros & Cons • Comparison Matrix • SWOT Analysis
          </div>
        </div>
      </footer>

      {/* Decision History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedDecisions={savedDecisions}
        onSelectDecision={(dec) => updateCurrentAnalysis(dec)}
        onDeleteDecision={handleDeleteDecision}
        onClearAll={handleClearAllHistory}
      />
    </div>
  );
}
