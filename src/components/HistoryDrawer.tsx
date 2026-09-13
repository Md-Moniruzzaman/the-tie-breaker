import React from 'react';
import { X, Clock, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import { DecisionAnalysis } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: DecisionAnalysis[];
  onSelectDecision: (decision: DecisionAnalysis) => void;
  onDeleteDecision: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedDecisions,
  onSelectDecision,
  onDeleteDecision,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-stone-700" />
            <h3 className="font-bold text-stone-900 font-display text-lg">Decision History</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedDecisions.length === 0 ? (
            <div className="text-center py-16 px-4">
              <BookOpen className="w-8 h-8 text-stone-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-stone-700">No saved decisions yet</p>
              <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                Any dilemma you evaluate with The Tiebreaker will be saved here so you can revisit your trade-offs anytime.
              </p>
            </div>
          ) : (
            savedDecisions.map((dec) => (
              <div
                key={dec.id}
                onClick={() => {
                  onSelectDecision(dec);
                  onClose();
                }}
                className="p-4 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-stone-50/60 transition-all cursor-pointer group shadow-2xs relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-stone-400 font-mono">
                    {new Date(dec.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => onDeleteDecision(dec.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 rounded transition-opacity cursor-pointer"
                    title="Delete decision"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-sm font-bold text-stone-900 font-display line-clamp-2 mt-1">
                  {dec.decisionTitle}
                </h4>

                <div className="mt-2 text-xs text-stone-500 line-clamp-1">
                  Winner: <span className="font-semibold text-amber-800">{dec.tiebreakerRecommendation.headlineVerdict}</span>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-400">
                  <span>{dec.options.length} alternatives weighed</span>
                  <span className="text-amber-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedDecisions.length > 0 && (
          <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">
              {savedDecisions.length} {savedDecisions.length === 1 ? 'decision' : 'decisions'} saved
            </span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
