import { useState, useEffect, useCallback, useRef } from 'react';
import { playSound } from '../services/audioService';
import { ttsService } from '../services/ttsService';
import type { StoryLine } from '../App';

const FADE_DURATION = 1000; // 1 second for fade transition

export const useStoryPlayer = (storyLines: StoryLine[]) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [lineDuration, setLineDuration] = useState(3000); // Default duration
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setCurrentLineIndex(0);
    clearTimers();
    ttsService.cancel();
  }, [clearTimers]);

  const start = useCallback(() => {
    if (storyLines.length > 0) {
      setCurrentLineIndex(0);
      setIsPlaying(true);
      setIsPaused(false);
    }
  }, [storyLines.length]);


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
    // Main player loop
    if (isPlaying && !isPaused) {
      if (currentLineIndex >= storyLines.length) {
        stop();
        return;
      }

      const currentLineData = storyLines[currentLineIndex];
      const currentLineText = currentLineData.text;

      const estimatedDuration = ttsService.getEstimatedDuration(currentLineText);
      setLineDuration(estimatedDuration);
      setImageUrl(currentLineData.imageUrl);

      // Show the line and start speaking
      setIsVisible(true);
      playSound('fadeIn');
      
      ttsService.speak(currentLineText, () => {
        // This callback executes when speech finishes
        setIsVisible(false);
        playSound('fadeOut');

        // Wait for fade-out before moving to the next line
        transitionTimerRef.current = setTimeout(() => {
          setCurrentLineIndex(prevIndex => prevIndex + 1);
        }, FADE_DURATION);
      });
    } else if (!isPlaying) {
      clearTimers();
    }
    
    return () => {
      clearTimers();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isPaused, currentLineIndex, storyLines]);
  
  // Stop playing if the story lines array itself changes
  useEffect(() => {
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyLines]);

  return {
    currentLine: storyLines[currentLineIndex]?.text || '',
    isPlaying,
    isPaused,
    start,
    stop,
    pause,
    resume,
    isVisible,
    duration: lineDuration,
    imageUrl,
  };
};
