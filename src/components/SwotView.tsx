import React, { useState } from 'react';
import { Shield, AlertCircle, Zap, Target } from 'lucide-react';
import { DecisionAnalysis } from '../types';

interface SwotViewProps {
  analysis: DecisionAnalysis;
}

export const SwotView: React.FC<SwotViewProps> = ({ analysis }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(analysis.options[0]?.id || '');

  const currentOption = analysis.options.find((o) => o.id === selectedOptionId) || analysis.options[0];

  return (
    <div id="swot-analysis-container" className="space-y-6">
      {/* Option Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {analysis.options.map((opt, idx) => {
            const isSelected = opt.id === selectedOptionId;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOptionId(opt.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-stone-200/40 text-xs flex items-center justify-center font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt.name}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Evaluating internal assets & external environment
        </div>
      </div>

      {/* Option Header info */}
      {currentOption && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            SWOT Evaluation
          </div>
          <h3 className="text-xl font-bold text-stone-900 font-display">{currentOption.name}</h3>
          <p className="text-sm text-stone-500 mt-0.5">{currentOption.tagline}</p>
        </div>
      )}

      {/* 4 Quadrants Matrix */}
      {currentOption && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* STRENGTHS (Internal / Positive) */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-display">Strengths</h4>
                  <span className="text-[11px] font-normal text-stone-500">Internal Advantages</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {currentOption.swot.strengths.length} Factors
              </span>
            </div>

            <ul className="space-y-2.5">
              {currentOption.swot.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-stone-800 leading-relaxed">
                  <span className="text-emerald-500 font-bold mt-1 text-xs">✔</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* WEAKNESSES (Internal / Negative) */}
          <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-rose-800 font-bold">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-display">Weaknesses</h4>
                  <span className="text-[11px] font-normal text-stone-500">Internal Vulnerabilities</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                {currentOption.swot.weaknesses.length} Factors
              </span>
            </div>

            <ul className="space-y-2.5">
              {currentOption.swot.weaknesses.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-stone-800 leading-relaxed">
                  <span className="text-rose-500 font-bold mt-1 text-xs">✖</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* OPPORTUNITIES (External / Positive) */}
          <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-display">Opportunities</h4>
                  <span className="text-[11px] font-normal text-stone-500">External Market & Tailwinds</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                {currentOption.swot.opportunities.length} Factors
              </span>
            </div>

            <ul className="space-y-2.5">
              {currentOption.swot.opportunities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-stone-800 leading-relaxed">
                  <span className="text-amber-500 font-bold mt-1 text-xs">✦</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* THREATS (External / Negative) */}
          <div className="bg-white rounded-2xl p-6 border border-stone-300 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-stone-900 font-bold">
                <div className="w-8 h-8 rounded-lg bg-stone-200 text-stone-800 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-display">Threats</h4>
                  <span className="text-[11px] font-normal text-stone-500">External Headwinds & Risks</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-300">
                {currentOption.swot.threats.length} Factors
              </span>
            </div>

            <ul className="space-y-2.5">
              {currentOption.swot.threats.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-stone-800 leading-relaxed">
                  <span className="text-stone-500 font-bold mt-1 text-xs">▲</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
