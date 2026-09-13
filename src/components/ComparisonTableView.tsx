import React, { useState } from 'react';
import { Sliders, Trophy, ArrowRight, Info, Check } from 'lucide-react';
import { DecisionAnalysis } from '../types';
import { calculateMatrixOptionScore } from '../utils/scoring';

interface ComparisonTableViewProps {
  analysis: DecisionAnalysis;
}

export const ComparisonTableView: React.FC<ComparisonTableViewProps> = ({ analysis }) => {
  const [criteriaWeights, setCriteriaWeights] = useState<Record<string, number>>({});

  const handleWeightChange = (category: string, newWeight: number) => {
    setCriteriaWeights((prev) => ({
      ...prev,
      [category]: newWeight,
    }));
  };

  const { options, comparisonCriteria } = analysis;

  // Find overall leader based on current weights
  const scoresPerOption = options.map((opt) => ({
    opt,
    ...calculateMatrixOptionScore(analysis, opt.id, criteriaWeights),
  }));

  const sortedScores = [...scoresPerOption].sort((a, b) => b.totalScore - a.totalScore);
  const topOption = sortedScores[0];

  return (
    <div id="comparison-matrix-container" className="space-y-6">
      {/* Dynamic Matrix Scorecard Banner */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-stone-900 font-display">
                Multi-Criteria Comparison Matrix
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Adjust the weight multiplier for each criterion below to see how your personal priorities shift the winner.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Matrix Leader:
            </span>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full border border-amber-300">
              {topOption?.opt.name} ({topOption?.percentage}%)
            </span>
          </div>
        </div>

        {/* Option comparison cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {scoresPerOption.map(({ opt, totalScore, percentage }) => {
            const isWinner = opt.id === topOption?.opt.id;
            return (
              <div
                key={opt.id}
                className={`p-4 rounded-xl border transition-all ${
                  isWinner
                    ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-stone-900 text-sm line-clamp-1">{opt.name}</span>
                  {isWinner && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                      Leader
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-stone-900">{percentage}%</span>
                  <span className="text-xs text-stone-500 font-mono">({totalScore} pts)</span>
                </div>
                {/* Visual score bar */}
                <div className="w-full bg-stone-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isWinner ? 'bg-amber-500' : 'bg-stone-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100/70 border-b border-stone-200 text-xs font-bold text-stone-700 uppercase tracking-wider">
                <th className="p-4 w-1/3 min-w-[220px]">Evaluation Axis & Priority Weight</th>
                {options.map((opt) => (
                  <th key={opt.id} className="p-4 min-w-[200px]">
                    <div className="font-bold text-stone-900 normal-case text-sm">{opt.name}</div>
                    <div className="text-[11px] font-normal text-stone-500 normal-case line-clamp-1">{opt.tagline}</div>
                  </th>
                ))}
                <th className="p-4 w-28 text-center">Axis Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {comparisonCriteria.map((criterion, idx) => {
                const currentWeight = criteriaWeights[criterion.category] ?? 1;
                const winnerOpt = options.find((o) => o.id === criterion.winnerOptionId);

                return (
                  <tr key={idx} className="hover:bg-stone-50/60 transition-colors">
                    {/* Criteria label & weight selector */}
                    <td className="p-4 align-top">
                      <div className="font-bold text-stone-900">{criterion.category}</div>
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{criterion.description}</p>
                      
                      {/* Importance weight toggles */}
                      <div className="flex items-center gap-1.5 mt-3">
                        <span className="text-[10px] uppercase font-semibold text-stone-400">Weight:</span>
                        {[1, 2, 3].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => handleWeightChange(criterion.category, w)}
                            className={`px-2 py-0.5 text-xs font-mono rounded cursor-pointer transition-colors ${
                              currentWeight === w
                                ? 'bg-stone-900 text-white font-bold'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                            title={`Set priority to ${w}x`}
                          >
                            {w}x
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Option scores */}
                    {options.map((opt) => {
                      const scoreItem = criterion.scores.find((s) => s.optionId === opt.id);
                      const score = scoreItem ? scoreItem.score : 5;
                      const isCriterionWinner = opt.id === criterion.winnerOptionId;

                      return (
                        <td key={opt.id} className="p-4 align-top">
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`text-sm font-bold font-mono px-2 py-0.5 rounded-md ${
                                score >= 8
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : score >= 5
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {score}/10
                            </span>
                            {isCriterionWinner && (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Advantage</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed mt-1">
                            {scoreItem?.verdict || 'Standard performance.'}
                          </p>
                        </td>
                      );
                    })}

                    {/* Winner badge */}
                    <td className="p-4 align-top text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-200">
                        {winnerOpt?.name || 'Tie'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
