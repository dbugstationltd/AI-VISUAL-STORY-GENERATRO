import React from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { PauseIcon } from './icons/PauseIcon';
import { playSound } from '../services/audioService';

interface StoryInputProps {
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onGenerate: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
}

export const StoryInput: React.FC<StoryInputProps> = ({
  onStop,
  onPause,
  onResume,
  onGenerate,
  isPlaying,
  isPaused,
  isLoading,
}) => {
  const handleStopClick = () => {
    playSound('stop');
    onStop();
  };

  const handlePauseClick = () => {
    playSound('pause');
    onPause();
  };
  
  const handleResumeClick = () => {
    playSound('resume');
    onResume();
  };

  return (
    <div className="w-full flex flex-col sm:flex-row gap-4 justify-center mt-4">
      {isPlaying ? (
        <>
          {isPaused ? (
            <button
              onClick={handleResumeClick}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 font-semibold text-slate-900 bg-green-400 rounded-md shadow-lg hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-400 transition-all duration-300"
              aria-label="Resume story"
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              Resume
            </button>
          ) : (
            <button
              onClick={handlePauseClick}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 font-semibold text-slate-900 bg-yellow-400 rounded-md shadow-lg hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-yellow-400 transition-all duration-300"
              aria-label="Pause story"
            >
              <PauseIcon className="w-5 h-5 mr-2" />
              Pause
            </button>
          )}
          <button
            onClick={handleStopClick}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 font-semibold text-white bg-red-600 rounded-md shadow-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 transition-all duration-300"
            aria-label="Stop story"
          >
            <StopIcon className="w-5 h-5 mr-2" />
            Stop
          </button>
        </>
      ) : (
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="flex-1 inline-flex items-center justify-center px-6 py-3 font-semibold text-slate-900 bg-sky-300 rounded-md shadow-lg hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <MagicWandIcon className="w-5 h-5 mr-2" />
          )}
          {isLoading ? 'Conjuring...' : 'Generate & Start Story'}
        </button>
      )}
    </div>
  );
};