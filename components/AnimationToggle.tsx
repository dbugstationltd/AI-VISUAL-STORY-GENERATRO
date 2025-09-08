import React from 'react';
import { MotionIcon } from './icons/MotionIcon';
import { MotionOffIcon } from './icons/MotionOffIcon';

interface AnimationToggleProps {
  isAnimationEnabled: boolean;
  onToggle: () => void;
}

export const AnimationToggle: React.FC<AnimationToggleProps> = ({ isAnimationEnabled, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 right-4 z-50 p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-slate-100 hover:bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-400 transition-all duration-300"
      aria-label={isAnimationEnabled ? 'Pause background animation' : 'Play background animation'}
      title={isAnimationEnabled ? 'Pause background animation' : 'Play background animation'}
    >
      {isAnimationEnabled ? <MotionIcon className="w-6 h-6" /> : <MotionOffIcon className="w-6 h-6" />}
    </button>
  );
};
