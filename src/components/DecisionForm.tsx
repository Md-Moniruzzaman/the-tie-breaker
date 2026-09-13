import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, HelpCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { PRESET_DECISIONS, PresetDecision } from '../data/presets';

interface DecisionFormProps {
  onSubmit: (data: { decision: string; options: string[]; context: string }) => void;
  isLoading: boolean;
}

export const DecisionForm: React.FC<DecisionFormProps> = ({ onSubmit, isLoading }) => {
  const [decision, setDecision] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [context, setContext] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSelectPreset = (preset: PresetDecision) => {
    setDecision(preset.title);
    setOptions(preset.options);
    setContext(preset.context);
    setShowAdvanced(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision.trim()) return;

    const filteredOptions = options.map((o) => o.trim()).filter(Boolean);
    onSubmit({
      decision: decision.trim(),
      options: filteredOptions,
      context: context.trim(),
    });
  };

  return (
    <div id="decision-form-container" className="w-full max-w-3xl mx-auto">
      {/* Preset Suggestions */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold tracking-wider text-stone-500 uppercase">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <span>Need inspiration? Try a real-world dilemma:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_DECISIONS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-left p-3 rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all text-sm group shadow-xs cursor-pointer"
            >
              <div className="text-xs font-medium text-amber-700 mb-1">{preset.category}</div>
              <div className="text-stone-800 group-hover:text-stone-900 font-medium line-clamp-2 leading-snug">
                {preset.title}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <div className="space-y-6">
          {/* Decision Question Input */}
          <div>
            <label htmlFor="decision-input" className="block text-base font-semibold text-stone-900 mb-2">
              What decision do you need to break?
            </label>
            <textarea
              id="decision-input"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="e.g. Should I accept the senior role at a fast-growing startup or stay at my stable corporate job with upcoming promotion?"
              rows={3}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 text-stone-900 placeholder:text-stone-400 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none font-sans"
            />
            <p className="mt-1.5 text-xs text-stone-500">
              State the dilemma clearly. You can provide specific paths below or let the AI extract the natural alternatives.
            </p>
          </div>

          {/* Options toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                <span>The Choices / Alternatives</span>
                <span className="text-xs font-normal text-stone-500">(Optional - we can auto-deduce if blank)</span>
              </label>
              {options.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  disabled={isLoading}
                  className="text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Option</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-none w-7 h-7 rounded-lg bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center border border-stone-200">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={idx === 0 ? 'e.g. Accept Startup Offer' : idx === 1 ? 'e.g. Stay at Current Company' : `Option ${idx + 1}`}
                    disabled={isLoading}
                    className="flex-1 px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      disabled={isLoading}
                      className="p-2 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Context & Constraints Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer py-1"
            >
              <span>{showAdvanced ? '− Hide' : '+ Add'} personal context, constraints, or priorities</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 pt-3 border-t border-stone-100">
                <label htmlFor="context-input" className="block text-xs font-medium text-stone-700 mb-1.5">
                  Personal Priorities, Timeline, or Non-negotiables
                </label>
                <textarea
                  id="context-input"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. 'I have a toddler and need predictable healthcare', 'My #1 priority this year is maximum learning and equity upside', 'Budget is limited to $3,000/mo'"
                  rows={2}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-sans resize-none"
                />
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !decision.trim()}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2.5 shadow-sm ${
                isLoading || !decision.trim()
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-stone-900 hover:bg-stone-800 active:scale-[0.99] cursor-pointer ring-2 ring-stone-900/10'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>The Tiebreaker is evaluating trade-offs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Break the Tie with AI Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-stone-400 mt-2.5">
              Generates a weighted Pros & Cons ledger, multi-criteria comparison matrix, and full SWOT breakdown.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
