import React, { useState } from 'react';
import {
  Award,
  Scale,
  TableProperties,
  Compass,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Share2,
} from 'lucide-react';
import { DecisionAnalysis } from '../types';
import { VerdictView } from './VerdictView';
import { ProsConsView } from './ProsConsView';
import { ComparisonTableView } from './ComparisonTableView';
import { SwotView } from './SwotView';
import { CoinFlipModal } from './CoinFlipModal';
import { generateMarkdownReport } from '../utils/scoring';

interface AnalysisDashboardProps {
  analysis: DecisionAnalysis;
  onNewDecision: () => void;
  onUpdateAnalysis: (updated: DecisionAnalysis) => void;
}

type TabKey = 'verdict' | 'pros_cons' | 'comparison' | 'swot';

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  analysis,
  onNewDecision,
  onUpdateAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('verdict');
  const [copied, setCopied] = useState(false);
  const [showCoinFlip, setShowCoinFlip] = useState(false);

  const handleCopyMarkdown = async () => {
    const report = generateMarkdownReport(analysis);
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const tabs = [
    { key: 'verdict' as TabKey, label: 'Verdict', icon: Award },
    { key: 'pros_cons' as TabKey, label: 'Pros & Cons', icon: Scale },
    { key: 'comparison' as TabKey, label: 'Comparison Matrix', icon: TableProperties },
    { key: 'swot' as TabKey, label: 'SWOT Analysis', icon: Compass },
  ];

  return (
    <div id="analysis-dashboard" className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header card with dilemma and controls */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold tracking-wide">
              <span>Core Tension:</span>
              <span className="text-amber-800 font-bold">{analysis.coreConflict}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-stone-900 tracking-tight leading-snug">
              {analysis.decisionTitle}
            </h1>
            <p className="text-xs text-stone-400">
              Evaluated across {analysis.options.length} alternatives and {analysis.comparisonCriteria.length} decision dimensions.
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowCoinFlip(true)}
              className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Deadlocked? Flip the psychological tiebreaker coin"
            >
              <span>🪙 Flip Coin</span>
            </button>
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy markdown report to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onNewDecision}
              className="px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-300" />
              <span>New Decision</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-6 pt-5 border-t border-stone-100 flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tab Body */}
      <div>
        {activeTab === 'verdict' && (
          <VerdictView
            analysis={analysis}
            onOpenCoinFlip={() => setShowCoinFlip(true)}
            onSelectTab={(t) => setActiveTab(t)}
          />
        )}
        {activeTab === 'pros_cons' && (
          <ProsConsView
            analysis={analysis}
            onUpdateAnalysis={onUpdateAnalysis}
          />
        )}
        {activeTab === 'comparison' && (
          <ComparisonTableView analysis={analysis} />
        )}
        {activeTab === 'swot' && (
          <SwotView analysis={analysis} />
        )}
      </div>

      {/* Coin Flip Modal */}
      {showCoinFlip && (
        <CoinFlipModal
          options={analysis.options}
          onClose={() => setShowCoinFlip(false)}
        />
      )}
    </div>
  );
};
