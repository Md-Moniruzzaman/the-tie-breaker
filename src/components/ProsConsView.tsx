import React, { useState } from 'react';
import { Plus, Check, X, ThumbsUp, ThumbsDown, Filter, Sparkles } from 'lucide-react';
import { DecisionAnalysis, DecisionOption, ProConItem } from '../types';
import { calculateOptionProsConsScore } from '../utils/scoring';

interface ProsConsViewProps {
  analysis: DecisionAnalysis;
  onUpdateAnalysis: (updated: DecisionAnalysis) => void;
}

export const ProsConsView: React.FC<ProsConsViewProps> = ({ analysis, onUpdateAnalysis }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(analysis.options[0]?.id || '');
  const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [disabledItemIds, setDisabledItemIds] = useState<Set<string>>(new Set());

  // Quick add form state
  const [newItemText, setNewItemText] = useState('');
  const [newItemType, setNewItemType] = useState<'pro' | 'con'>('pro');
  const [newItemImpact, setNewItemImpact] = useState<'high' | 'medium' | 'low'>('medium');
  const [newItemCategory, setNewItemCategory] = useState('Personal');
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleDisableItem = (itemId: string) => {
    setDisabledItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const weightMap = { high: 5, medium: 3, low: 1 };
    const newItem: ProConItem = {
      id: 'custom-' + Date.now().toString(36),
      text: newItemText.trim(),
      impact: newItemImpact,
      weight: weightMap[newItemImpact],
      category: newItemCategory.trim() || 'Custom',
    };

    const updatedOptions = analysis.options.map((opt) => {
      if (opt.id === selectedOptionId) {
        return {
          ...opt,
          pros: newItemType === 'pro' ? [newItem, ...opt.pros] : opt.pros,
          cons: newItemType === 'con' ? [newItem, ...opt.cons] : opt.cons,
        };
      }
      return opt;
    });

    onUpdateAnalysis({
      ...analysis,
      options: updatedOptions,
    });

    setNewItemText('');
    setShowAddModal(false);
  };

  const currentOption = analysis.options.find((o) => o.id === selectedOptionId) || analysis.options[0];
  const scores = currentOption ? calculateOptionProsConsScore(currentOption, disabledItemIds) : { prosScore: 0, consScore: 0, netScore: 0 };

  const filterItems = (items: ProConItem[]) => {
    if (impactFilter === 'all') return items;
    return items.filter((i) => i.impact === impactFilter);
  };

  return (
    <div id="pros-cons-container" className="space-y-6">
      {/* Option Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {analysis.options.map((opt, idx) => {
            const isSelected = opt.id === selectedOptionId;
            const optScore = calculateOptionProsConsScore(opt, disabledItemIds);

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
                <span className="line-clamp-1">{opt.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                    isSelected
                      ? optScore.netScore >= 0 ? 'bg-emerald-800 text-emerald-100' : 'bg-rose-800 text-rose-100'
                      : optScore.netScore >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {optScore.netScore > 0 ? `+${optScore.netScore}` : optScore.netScore}
                </span>
              </button>
            );
          })}
        </div>

        {/* Impact Filter & Add button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 p-1 rounded-lg text-xs font-medium text-stone-600">
            <Filter className="w-3.5 h-3.5 mx-1.5 text-stone-400" />
            <button
              type="button"
              onClick={() => setImpactFilter('all')}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${impactFilter === 'all' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'hover:text-stone-900'}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setImpactFilter('high')}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${impactFilter === 'high' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'hover:text-stone-900'}`}
            >
              High Impact
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Factor</span>
          </button>
        </div>
      </div>

      {/* Option Tagline & Live Interactive Score Banner */}
      {currentOption && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                Active Option
              </div>
              <h3 className="text-xl font-bold text-stone-900 font-display">{currentOption.name}</h3>
              <p className="text-sm text-stone-500 mt-0.5">{currentOption.tagline}</p>
            </div>

            {/* Score Ledger summary */}
            <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div className="text-center px-2">
                <div className="text-[11px] text-stone-500 uppercase font-semibold">Pros Score</div>
                <div className="text-lg font-bold text-emerald-600 font-mono">+{scores.prosScore}</div>
              </div>
              <div className="text-stone-300 font-light text-xl">−</div>
              <div className="text-center px-2">
                <div className="text-[11px] text-stone-500 uppercase font-semibold">Cons Score</div>
                <div className="text-lg font-bold text-rose-600 font-mono">−{scores.consScore}</div>
              </div>
              <div className="text-stone-300 font-light text-xl">=</div>
              <div className="text-center px-2">
                <div className="text-[11px] text-stone-500 uppercase font-semibold">Net Balance</div>
                <div
                  className={`text-lg font-extrabold font-mono ${
                    scores.netScore > 0 ? 'text-emerald-700' : scores.netScore < 0 ? 'text-rose-700' : 'text-stone-700'
                  }`}
                >
                  {scores.netScore > 0 ? `+${scores.netScore}` : scores.netScore}
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-stone-400 mt-3 italic">
            Tip: Click on any pro or con below to toggle it on/off and simulate "What if this doesn't matter to me?"
          </p>
        </div>
      )}

      {/* Side by side Pros and Cons columns */}
      {currentOption && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PROS COLUMN */}
          <div className="bg-emerald-50/40 rounded-2xl p-5 sm:p-6 border border-emerald-200/70">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/60">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <ThumbsUp className="w-5 h-5 text-emerald-600" />
                <h4 className="text-base font-display">
                  Pros & Upsides ({filterItems(currentOption.pros).length})
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Total: +{scores.prosScore}
              </span>
            </div>

            <div className="space-y-2.5">
              {filterItems(currentOption.pros).map((pro) => {
                const isDisabled = disabledItemIds.has(pro.id);
                return (
                  <div
                    key={pro.id}
                    onClick={() => toggleDisableItem(pro.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isDisabled
                        ? 'bg-stone-100/70 border-stone-200 opacity-40 line-through'
                        : 'bg-white border-emerald-200 hover:border-emerald-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium text-stone-800 leading-snug">
                        {pro.text}
                      </div>
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md flex-none ${
                          isDisabled
                            ? 'bg-stone-200 text-stone-600'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        +{pro.weight}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 pt-1 border-t border-emerald-50 text-[11px] text-stone-500">
                      <span className="font-semibold text-emerald-700 uppercase tracking-wider text-[10px]">
                        {pro.impact} impact
                      </span>
                      <span>•</span>
                      <span>{pro.category}</span>
                      {isDisabled && (
                        <span className="ml-auto text-stone-500 text-[10px] font-normal not-italic no-underline">
                          (Excluded)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONS COLUMN */}
          <div className="bg-rose-50/40 rounded-2xl p-5 sm:p-6 border border-rose-200/70">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-rose-200/60">
              <div className="flex items-center gap-2 text-rose-900 font-bold">
                <ThumbsDown className="w-5 h-5 text-rose-600" />
                <h4 className="text-base font-display">
                  Cons & Risks ({filterItems(currentOption.cons).length})
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                Total: -{scores.consScore}
              </span>
            </div>

            <div className="space-y-2.5">
              {filterItems(currentOption.cons).map((con) => {
                const isDisabled = disabledItemIds.has(con.id);
                return (
                  <div
                    key={con.id}
                    onClick={() => toggleDisableItem(con.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isDisabled
                        ? 'bg-stone-100/70 border-stone-200 opacity-40 line-through'
                        : 'bg-white border-rose-200 hover:border-rose-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium text-stone-800 leading-snug">
                        {con.text}
                      </div>
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md flex-none ${
                          isDisabled
                            ? 'bg-stone-200 text-stone-600'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        -{con.weight}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 pt-1 border-t border-rose-50 text-[11px] text-stone-500">
                      <span className="font-semibold text-rose-700 uppercase tracking-wider text-[10px]">
                        {con.impact} impact
                      </span>
                      <span>•</span>
                      <span>{con.category}</span>
                      {isDisabled && (
                        <span className="ml-auto text-stone-500 text-[10px] font-normal not-italic no-underline">
                          (Excluded)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding custom Pro / Con */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-stone-900 font-display text-lg">
                Add Factor for {currentOption?.name}
              </h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewItemType('pro')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      newItemType === 'pro'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    + Pro (Advantage)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItemType('con')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      newItemType === 'con'
                        ? 'bg-rose-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    − Con (Drawback)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="e.g. Health insurance premium is $200 higher/mo"
                  required
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Impact Level</label>
                  <select
                    value={newItemImpact}
                    onChange={(e: any) => setNewItemImpact(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="high">High (Weight 5)</option>
                    <option value="medium">Medium (Weight 3)</option>
                    <option value="low">Low (Weight 1)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    placeholder="e.g. Financial, Family"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer"
                >
                  Add Factor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
