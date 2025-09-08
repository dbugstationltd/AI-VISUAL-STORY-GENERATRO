
/**
 * Splits a block of text into an array of sentences.
 * This regex looks for sequences of characters that are not sentence-ending
 * punctuation, followed by the punctuation itself. This is more robust
 * than a simple split.
 * @param text The input paragraph.
 * @returns An array of strings, where each string is a sentence.
 */
export const splitIntoSentences = (text: string): string[] => {
  if (!text) {
    return [];
  }
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  return sentences ? sentences.map(s => s.trim()) : [text.trim()];
};
