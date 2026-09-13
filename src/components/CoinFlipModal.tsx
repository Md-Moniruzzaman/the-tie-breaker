import React, { useState } from 'react';
import { X, Sparkles, RefreshCw } from 'lucide-react';
import { DecisionOption } from '../types';

interface CoinFlipModalProps {
  options: DecisionOption[];
  onClose: () => void;
}

export const CoinFlipModal: React.FC<CoinFlipModalProps> = ({ options, onClose }) => {
  const [flipping, setFlipping] = useState(false);
  const [selectedResult, setSelectedResult] = useState<DecisionOption | null>(null);
  const [flipCount, setFlipCount] = useState(0);

  const optA = options[0];
  const optB = options[1] || options[0];

  const handleFlip = () => {
    if (flipping) return;
    setFlipping(true);
    setSelectedResult(null);

    // Simulate psychological spin
    setTimeout(() => {
      const winner = Math.random() < 0.5 ? optA : optB;
      setSelectedResult(winner);
      setFlipping(false);
      setFlipCount((prev) => prev + 1);
    }, 1300);
  };

  return (
    <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 text-center relative overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 p-2 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>The Subconscious Tiebreaker</span>
        </div>

        <h3 className="text-2xl font-bold text-stone-900 font-display mb-2">
          Flip the Tiebreaker Coin
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6 leading-relaxed">
          The secret of the coin toss: While it spins in mid-air, notice which outcome you find yourself secretly rooting for. That is your true gut instinct.
        </p>

        {/* The Coin Element */}
        <div className="my-8 flex justify-center items-center">
          <div
            onClick={handleFlip}
            className={`w-32 h-32 rounded-full border-4 border-amber-300 bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 shadow-xl flex items-center justify-center cursor-pointer transition-transform select-none ${
              flipping ? 'animate-spin scale-110' : 'hover:scale-105 active:scale-95'
            }`}
          >
            <div className="w-24 h-24 rounded-full border-2 border-amber-500/40 border-dashed flex flex-col items-center justify-center p-2 text-stone-950">
              {flipping ? (
                <span className="text-xs font-mono font-bold uppercase tracking-wider animate-pulse">
                  Spinning...
                </span>
              ) : selectedResult ? (
                <div className="text-center">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber-950">Landed</div>
                  <div className="text-xs font-extrabold line-clamp-2 px-1">
                    {selectedResult.name}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-2xl">🪙</span>
                  <div className="text-[10px] font-bold uppercase tracking-wider mt-1">
                    Tap to Flip
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Outcome or instruction */}
        {selectedResult && !flipping && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wide">
              The Coin Chose:
            </div>
            <div className="text-base font-bold text-stone-900 font-display mt-1">
              {selectedResult.name}
            </div>
            <p className="text-xs text-stone-600 mt-2 italic">
              Did you feel a sense of relief, or a pinch of disappointment? That emotional reaction is your answer.
            </p>
          </div>
        )}

        {/* Action button */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleFlip}
            disabled={flipping}
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${flipping ? 'animate-spin' : ''}`} />
            <span>{flipCount === 0 ? 'Flip Coin' : 'Flip Again'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-medium text-xs transition-colors cursor-pointer"
          >
            Back to Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
