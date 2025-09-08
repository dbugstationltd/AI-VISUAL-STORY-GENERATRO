import { useState, useEffect, useCallback, useRef } from 'react';
import { playSound } from '../services/audioService';
import { ttsService } from '../services/ttsService';
import { generateImage } from '../services/geminiService';

const FADE_DURATION = 1000; // 1 second for fade transition

export const useStoryPlayer = (lines: string[]) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [lineDuration, setLineDuration] = useState(3000); // Default duration
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lineIndexRef = useRef(currentLineIndex);

  useEffect(() => {
    lineIndexRef.current = currentLineIndex;
  }, [currentLineIndex]);


  const clearTimers = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setIsVisible(false);
    setImageUrl(null);
    setIsGeneratingImage(false);
    clearTimers();
    ttsService.cancel();
  }, [clearTimers]);

  const start = useCallback(() => {
    if (lines.length > 0) {
      setCurrentLineIndex(0);
      setIsPlaying(true);
      setIsPaused(false);
    }
  }, [lines.length]);


  const pause = useCallback(() => {
    if (!isPlaying || isPaused) return;
    setIsPaused(true);
    ttsService.pause();
  }, [isPlaying, isPaused]);
  
  const resume = useCallback(() => {
    if (!isPlaying || !isPaused) return;
    setIsPaused(false);
    ttsService.resume();
  }, [isPlaying, isPaused]);


  useEffect(() => {
    // This is the main player loop effect
    if (isPlaying && !isPaused) {
      if (currentLineIndex >= lines.length) {
        stop();
        return;
      }

      const currentLineText = lines[currentLineIndex];

      const estimatedDuration = ttsService.getEstimatedDuration(currentLineText);
      setLineDuration(estimatedDuration);

      // Reset image state and start generation
      setImageUrl(null);
      setIsGeneratingImage(true);
      (async () => {
        const imagePrompt = `A whimsical, enchanting, and vibrant illustration for a children's storybook. The scene depicts: ${currentLineText}`;
        try {
          const newImageUrl = await generateImage(imagePrompt);
          // Only update if we're still on the same line
          if (lineIndexRef.current === currentLineIndex) {
            setImageUrl(newImageUrl);
          }
        } catch (error) {
          console.error("Image generation failed:", error);
          if (lineIndexRef.current === currentLineIndex) {
            setImageUrl(null);
          }
        } finally {
          if (lineIndexRef.current === currentLineIndex) {
            setIsGeneratingImage(false);
          }
        }
      })();


      // Show the line and start speaking
      setIsVisible(true);
      playSound('fadeIn');
      
      ttsService.speak(currentLineText, () => {
        // This callback executes when speech for the current line finishes
        setIsVisible(false);
        playSound('fadeOut');

        // Wait for the fade-out to complete before moving to the next line
        transitionTimerRef.current = setTimeout(() => {
          setCurrentLineIndex(prevIndex => prevIndex + 1);
        }, FADE_DURATION);
      });
    } else if (!isPlaying) {
      // Cleanup if we stop
      clearTimers();
    }
    
    // Cleanup function for when component unmounts or dependencies change.
    return () => {
      clearTimers();
    };
  // We don't include stop/clearTimers in deps to avoid loops. They are stable via useCallback.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isPaused, currentLineIndex, lines]);
  
  // Stop playing if the story lines change (e.g., new story generated)
  useEffect(() => {
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  return {
    currentLine: lines[currentLineIndex] || '',
    isPlaying,
    isPaused,
    start,
    stop,
    pause,
    resume,
    isVisible,
    duration: lineDuration,
    imageUrl,
    isGeneratingImage,
  };
};