import type { StoryLine } from '../App';

const STORAGE_KEY = 'visual-storyteller-saved-story';

/**
 * Saves the provided story lines to localStorage.
 * @param storyLines - An array of story lines to save.
 */
export const saveStory = (storyLines: StoryLine[]): void => {
  try {
    const storyJson = JSON.stringify(storyLines);
    localStorage.setItem(STORAGE_KEY, storyJson);
  } catch (error) {
    console.error("Failed to save story to localStorage:", error);
  }
};

/**
 * Loads a story from localStorage.
 * @returns The loaded story lines array, or null if no story is found or on error.
 */
export const loadStory = (): StoryLine[] | null => {
  try {
    const savedStoryJson = localStorage.getItem(STORAGE_KEY);
    if (savedStoryJson) {
      const storyLines: StoryLine[] = JSON.parse(savedStoryJson);
      // Basic validation to ensure it's an array
      if (Array.isArray(storyLines)) {
        return storyLines;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to load story from localStorage:", error);
    return null;
  }
};

/**
 * Checks if a story is saved in localStorage.
 * @returns True if a saved story exists, false otherwise.
 */
export const hasSavedStory = (): boolean => {
  return localStorage.getItem(STORAGE_KEY) !== null;
};
