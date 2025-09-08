import React from 'react';
import { SpeakerIcon } from './icons/SpeakerIcon';

interface VoiceSelectorProps {
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  onVoiceChange: (voiceURI: string) => void;
  onPreviewVoice: (voiceURI: string) => void;
  disabled: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoiceURI,
  onVoiceChange,
  onPreviewVoice,
  disabled,
}) => {
  if (voices.length === 0) {
    return null; // Don't render if no voices are loaded
  }

  const handlePreviewClick = (e: React.MouseEvent, voiceURI: string) => {
    e.stopPropagation(); // Prevent the li's onClick from firing
    if (!disabled) {
      onPreviewVoice(voiceURI);
    }
  };

  return (
    <div className="w-full max-w-lg mt-6">
      <label className="block text-sm font-medium text-slate-400 mb-2 text-center sm:text-left">
        Narration Voice
      </label>
      <div 
        className="w-full max-h-60 overflow-y-auto bg-slate-700/80 border border-slate-600 rounded-md shadow-sm"
        aria-label="Narration voice selection"
        role="radiogroup"
      >
        <ul className="divide-y divide-slate-600">
          {voices.map((voice) => {
            const isSelected = voice.voiceURI === selectedVoiceURI;
            return (
              <li
                key={voice.voiceURI}
                onClick={() => !disabled && onVoiceChange(voice.voiceURI)}
                className={`flex items-center justify-between p-3 text-sm transition-colors duration-200 ${
                  isSelected
                    ? 'bg-teal-500/30 text-teal-200'
                    : 'text-slate-300'
                } ${
                  disabled
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:bg-slate-600/50 cursor-pointer'
                }`}
                aria-checked={isSelected}
                role="radio"
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                  if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onVoiceChange(voice.voiceURI);
                  }
                }}
              >
                <span className="flex-1 mr-2">{`${voice.name} (${voice.lang})`}</span>
                <button
                  onClick={(e) => handlePreviewClick(e, voice.voiceURI)}
                  disabled={disabled}
                  className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-slate-900 bg-sky-300 rounded-md shadow-sm hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label={`Preview voice ${voice.name}`}
                >
                  <SpeakerIcon className="w-4 h-4" />
                  Preview
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};