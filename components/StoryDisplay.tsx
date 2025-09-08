import React from 'react';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface StoryDisplayProps {
  line: string;
  isVisible: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  duration?: number;
  imageUrl: string | null;
  isGeneratingImage: boolean;
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ 
  line, 
  isVisible, 
  isPlaying, 
  isPaused, 
  duration, 
  imageUrl, 
  isGeneratingImage 
}) => {
  return (
    <div className="relative w-full h-[65vh] flex flex-col items-center justify-start bg-slate-800/50 rounded-lg p-6 border border-slate-700 shadow-inner overflow-hidden">
      {/* Image container */}
      <div className="relative w-full flex-1 min-h-0 mb-4 flex items-center justify-center">
        {isGeneratingImage && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-700/50 rounded-md animate-pulse">
            <MagicWandIcon className="w-10 h-10 text-slate-500 mb-2" />
            <p className="text-slate-400 font-medium">Conjuring an image...</p>
          </div>
        )}
        {imageUrl && !isGeneratingImage && (
          <img
            src={imageUrl}
            alt="A visual depiction of the current story line."
            className="max-w-full max-h-full object-contain rounded-md shadow-lg"
          />
        )}
      </div>

      {/* Text container */}
      <div className="relative w-full h-28 flex items-center justify-center text-center">
        {isPlaying || line ? (
            <p
            key={line} // Force re-render on line change for animation reset
            className={`font-serif text-3xl md:text-4xl text-slate-100 transition-opacity duration-1000 ease-in-out [text-shadow:0_2px_4px_rgba(0,0,0,0.6)] ${
                isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            >
            {line}
            </p>
        ) : (
            <p className="font-serif text-3xl text-slate-500 [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
                Your story will appear here...
            </p>
        )}
      </div>
      
       <div 
        aria-hidden="true"
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500 ${isPaused ? 'opacity-100' : 'opacity-0'}`} 
      />
      {/* Timer Bar */}
      {isPlaying && isVisible && (
        <div 
          key={line} // Reset animation when line changes
          className={`timer-bar ${isPaused ? 'paused' : ''}`}
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
};