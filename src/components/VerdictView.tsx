import React from 'react';
import { Award, AlertTriangle, ArrowUpRight, Compass, ShieldCheck, CheckCircle2, Split } from 'lucide-react';
import { DecisionAnalysis } from '../types';
import { calculateOptionProsConsScore, calculateMatrixOptionScore } from '../utils/scoring';

interface VerdictViewProps {
  analysis: DecisionAnalysis;
  onOpenCoinFlip: () => void;
  onSelectTab: (tab: 'pros_cons' | 'comparison' | 'swot') => void;
}

export const VerdictView: React.FC<VerdictViewProps> = ({
  analysis,
  onOpenCoinFlip,
  onSelectTab,
}) => {
  const { tiebreakerRecommendation, options } = analysis;
  const recommendedOpt = options.find((o) => o.id === tiebreakerRecommendation.recommendedOptionId);

  return (
    <div id="verdict-view-container" className="space-y-6">
      {/* Primary Verdict Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 border border-stone-800 shadow-md relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold tracking-wide uppercase border border-amber-500/30 mb-4">
            <Award className="w-4 h-4 text-amber-400" />
            <span>The Tiebreaker Verdict</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight leading-snug mb-3">
            {tiebreakerRecommendation.headlineVerdict}
          </h2>

          <p className="text-stone-300 text-base leading-relaxed max-w-3xl mb-6">
            {tiebreakerRecommendation.reasoning}
          </p>

          {/* Quick Option Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {options.map((opt) => {
              const isRecommended = opt.id === tiebreakerRecommendation.recommendedOptionId;
              const pcScore = calculateOptionProsConsScore(opt);
              const matrixScore = calculateMatrixOptionScore(analysis, opt.id);

              return (
                <div
                  key={opt.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isRecommended
                      ? 'bg-amber-950/40 border-amber-500/40 text-white ring-1 ring-amber-500/30'
                      : 'bg-stone-800/60 border-stone-700/60 text-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm line-clamp-1">{opt.name}</span>
                    {isRecommended && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-stone-950">
                        Top Pick
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-1 mb-3">{opt.tagline}</p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 font-mono">
                    <span className="text-stone-400">Net Pros/Cons:</span>
                    <span className={pcScore.netScore >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {pcScore.netScore > 0 ? `+${pcScore.netScore}` : pcScore.netScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 font-mono">
                    <span className="text-stone-400">Matrix Fit:</span>
                    <span className="text-amber-300 font-bold">{matrixScore.percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conditional Guidance & Decision Trees */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Split className="w-5 h-5 text-stone-700" />
          <h3 className="text-lg font-bold text-stone-900 font-display">
            Conditional Decision Trees
          </h3>
        </div>
        <p className="text-sm text-stone-500 mb-5">
          Decisions are rarely one-size-fits-all. Align your choice directly with your core priority:
        </p>

        <div className="space-y-3">
          {tiebreakerRecommendation.conditionalAdvice.map((adv, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-stone-50 border border-stone-200 hover:border-amber-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-none mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                    {adv.condition}
                  </div>
                  <div className="text-sm font-semibold text-stone-900 mt-0.5">
                    {adv.choice}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two column: Blindspot Radar & Next Step */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Blindspot Radar */}
        <div className="bg-amber-50/70 rounded-2xl p-6 border border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-900 font-bold mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-display">Overlooked Blindspot</h3>
            </div>
            <p className="text-sm text-amber-950/90 leading-relaxed">
              {tiebreakerRecommendation.blindspotWarning}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200/60 text-xs text-amber-800 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Pressure-test this risk before taking an irreversible leap.</span>
          </div>
        </div>

        {/* Immediate Next Step Action */}
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-white font-bold mb-3">
              <Compass className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-display">Actionable Micro-Next-Step</h3>
            </div>
            <p className="text-sm text-stone-300 leading-relaxed">
              {tiebreakerRecommendation.recommendedNextStep}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <span>Commit to testing within 48 hours</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Navigation Prompts to Deep Dive */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-stone-900 text-sm">Need to inspect the raw data?</h4>
          <p className="text-xs text-stone-500">
            Audit the weighted pros and cons ledger, criteria matrix scores, or SWOT quadrants.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onSelectTab('pros_cons')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer"
          >
            Pros & Cons Ledger
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('comparison')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer"
          >
            Comparison Matrix
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('swot')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer"
          >
            SWOT Analysis
          </button>
          <button
            type="button"
            onClick={onOpenCoinFlip}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Deadlocked? Try the psychological coin toss test"
          >
            <span>🪙 Flip a Coin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
