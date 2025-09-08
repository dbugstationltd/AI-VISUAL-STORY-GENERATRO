import React, { useState, useCallback, useEffect } from 'react';
import { StoryInput } from './components/StoryInput';
import { StoryDisplay } from './components/StoryDisplay';
import { useStoryPlayer } from './hooks/useStoryPlayer';
import { generateStory } from './services/geminiService';
import { splitIntoSentences } from './utils/textUtils';
import { playSound } from './services/audioService';
import { AnimationToggle } from './components/AnimationToggle';
import { VoiceSelector } from './components/VoiceSelector';
import { ttsService } from './services/ttsService';
import { RateSlider } from './components/RateSlider';

const App: React.FC = () => {
  const [storyText, setStoryText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState<boolean>(true);
  const [startPlayback, setStartPlayback] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1);
  
  const lines = React.useMemo(() => splitIntoSentences(storyText), [storyText]);
  const { 
    currentLine, 
    isPlaying, 
    isPaused,
    start, 
    stop, 
    pause,
    resume,
    isVisible,
    duration,
    imageUrl,
    isGeneratingImage,
  } = useStoryPlayer(lines);

  // Fetch available voices on component mount
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const availableVoices = await ttsService.getVoices();
        setVoices(availableVoices);
        const defaultVoice = ttsService.getSelectedVoice();
        if (defaultVoice) {
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      } catch (err) {
        console.error("Could not load TTS voices:", err);
        setError("Text-to-speech voices could not be loaded.");
      }
    };
    fetchVoices();
  }, []);

  const handleGenerateStory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (isPlaying) {
      stop();
    }
    try {
      const prompt = "Write a short, enchanting fantasy story for children in about 3-4 sentences.";
      const newStory = await generateStory(prompt);
      setStoryText(newStory);
      setStartPlayback(true); // Flag to start playback after state update
      playSound('generateSuccess');
    } catch (err) {
      console.error("Failed to generate story:", err);
      setError("Sorry, I couldn't write a story right now. Please try again.");
      setStartPlayback(false);
    } finally {
      // isLoading is set to false after a delay to allow the `start` effect to fire
      setTimeout(() => setIsLoading(false), 200);
    }
  }, [isPlaying, stop]);

  useEffect(() => {
    // Starts playback automatically once a new story is generated and its lines are processed
    if (startPlayback && lines.length > 0) {
      start();
      setStartPlayback(false);
    }
  }, [startPlayback, lines, start]);


  useEffect(() => {
    const shouldPauseAnimation = isPaused || !isAnimationEnabled;
    if (shouldPauseAnimation) {
      document.body.classList.add('animation-paused');
    } else {
      document.body.classList.remove('animation-paused');
    }
  }, [isPaused, isAnimationEnabled]);

  const handleVoiceChange = useCallback((voiceURI: string) => {
    ttsService.setVoice(voiceURI);
    setSelectedVoiceURI(voiceURI);
  }, []);

  const handleRateChange = useCallback((newRate: number) => {
    ttsService.setRate(newRate);
    setSpeechRate(newRate);
  }, []);

  const handlePreviewVoice = useCallback((voiceURI: string) => {
    ttsService.speakPreview('This is a sample narration.', voiceURI);
  }, []);


  return (
    <div className="min-h-screen text-slate-200 flex flex-col items-center justify-center p-4 selection:bg-teal-300 selection:text-slate-900">
      <AnimationToggle 
        isAnimationEnabled={isAnimationEnabled}
        onToggle={() => setIsAnimationEnabled(prev => !prev)}
      />
      <main className="w-full max-w-4xl flex flex-col items-center gap-8">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif bg-gradient-to-r from-teal-300 to-sky-400 text-transparent bg-clip-text mb-2">
            Visual Storyteller AI
          </h1>
          <p className="text-slate-400">
            Watch an AI-generated story come to life, with illustrations.
          </p>
        </header>

        <StoryDisplay
          line={currentLine}
          isVisible={isVisible}
          isPlaying={isPlaying}
          isPaused={isPaused}
          duration={duration}
          imageUrl={imageUrl}
          isGeneratingImage={isGeneratingImage}
        />

        <div className="w-full max-w-lg flex flex-col items-center">
          <StoryInput
            onStop={stop}
            onPause={pause}
            onResume={resume}
            onGenerate={handleGenerateStory}
            isPlaying={isPlaying}
            isPaused={isPaused}
            isLoading={isLoading}
          />
          <VoiceSelector
            voices={voices}
            selectedVoiceURI={selectedVoiceURI}
            onVoiceChange={handleVoiceChange}
            onPreviewVoice={handlePreviewVoice}
            disabled={isPlaying}
          />
          <RateSlider
            rate={speechRate}
            onRateChange={handleRateChange}
            disabled={isPlaying}
          />
        </div>

        {error && <p className="text-red-400 mt-4">{error}</p>}
      </main>
      <footer className="absolute bottom-4 text-center text-slate-500 text-sm">
        <p>Crafted with AI and React</p>
      </footer>
    </div>
  );
};

export default App;