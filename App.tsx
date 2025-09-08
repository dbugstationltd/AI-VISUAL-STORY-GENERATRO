import React, { useState, useCallback, useEffect } from 'react';
import { StoryInput } from './components/StoryInput';
import { StoryDisplay } from './components/StoryDisplay';
import { useStoryPlayer } from './hooks/useStoryPlayer';
import { generateStory, generateImage } from './services/geminiService';
import { splitIntoSentences } from './utils/textUtils';
import { playSound } from './services/audioService';
import { AnimationToggle } from './components/AnimationToggle';
import { VoiceSelector } from './components/VoiceSelector';
import { ttsService } from './services/ttsService';
import { RateSlider } from './components/RateSlider';
import { saveStory, loadStory, hasSavedStory } from './services/storageService';

export type StoryLine = {
  text: string;
  imageUrl: string;
};

const App: React.FC = () => {
  const [storyLines, setStoryLines] = useState<StoryLine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState<boolean>(true);
  const [startPlayback, setStartPlayback] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [isStorySaved, setIsStorySaved] = useState<boolean>(false);
  const [saveButtonText, setSaveButtonText] = useState<string>('Save Story');
  
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
  } = useStoryPlayer(storyLines);

  // Fetch available voices and check for saved story on component mount
  useEffect(() => {
    setIsStorySaved(hasSavedStory());
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
    setStoryLines([]); // Clear old story immediately
    setSaveButtonText('Save Story'); // Reset save button text

    try {
      const prompt = "Write a short, enchanting fantasy story for children in about 3-4 sentences.";
      const newStoryText = await generateStory(prompt);
      const storySentences = splitIntoSentences(newStoryText);

      if (storySentences.length === 0) {
        throw new Error("Generated story was empty.");
      }
      
      const imagePromises = storySentences.map(sentence => {
        const imagePrompt = `A whimsical, enchanting, and vibrant illustration for a children's storybook, in a cinematic 16:9 aspect ratio. The scene depicts: ${sentence}`;
        return generateImage(imagePrompt);
      });

      const imageUrls = await Promise.all(imagePromises);

      const newStoryLines = storySentences.map((sentence, index) => ({
        text: sentence,
        imageUrl: imageUrls[index],
      }));

      setStoryLines(newStoryLines);
      setStartPlayback(true);
      playSound('generateSuccess');

    } catch (err) {
      console.error("Failed to generate story and images:", err);
      setError("Sorry, I couldn't create a story right now. Please try again.");
      setStartPlayback(false);
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, stop]);

  useEffect(() => {
    // Starts playback automatically once a new story is generated and its lines are processed
    if (startPlayback && storyLines.length > 0) {
      start();
      setStartPlayback(false);
    }
  }, [startPlayback, storyLines, start]);


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
  
  const handleSaveStory = useCallback(() => {
    if (storyLines.length > 0) {
      saveStory(storyLines);
      setIsStorySaved(true);
      setSaveButtonText('Saved!');
      playSound('generateSuccess');
      setTimeout(() => {
        setSaveButtonText('Save Story');
      }, 2500);
    }
  }, [storyLines]);

  const handleLoadStory = useCallback(() => {
    stop(); // Ensure everything is reset before loading
    const loadedStory = loadStory();
    if (loadedStory && loadedStory.length > 0) {
      setStoryLines(loadedStory);
      setStartPlayback(true);
      setError(null);
      setSaveButtonText('Save Story');
    } else {
      setError("Could not load the saved story. It might be corrupted.");
      setIsStorySaved(false); // Update state if loading fails
    }
  }, [stop]);


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
          isGeneratingStory={isLoading}
        />

        <div className="w-full max-w-lg flex flex-col items-center">
          <StoryInput
            onStop={stop}
            onPause={pause}
            onResume={resume}
            onGenerate={handleGenerateStory}
            onSave={handleSaveStory}
            onLoad={handleLoadStory}
            isPlaying={isPlaying}
            isPaused={isPaused}
            isLoading={isLoading}
            isStorySaved={isStorySaved}
            saveButtonText={saveButtonText}
            hasStory={storyLines.length > 0}
          />
          <VoiceSelector
            voices={voices}
            selectedVoiceURI={selectedVoiceURI}
            onVoiceChange={handleVoiceChange}
            onPreviewVoice={handlePreviewVoice}
            disabled={isPlaying || isLoading}
          />
          <RateSlider
            rate={speechRate}
            onRateChange={handleRateChange}
            disabled={isPlaying || isLoading}
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