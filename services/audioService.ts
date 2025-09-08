const soundFiles = {
  start: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3',
  stop: 'https://assets.mixkit.co/sfx/preview/mixkit-classic-short-click-1116.mp3',
  pause: 'https://assets.mixkit.co/sfx/preview/mixkit-ui-click-433.mp3',
  resume: 'https://assets.mixkit.co/sfx/preview/mixkit-interface-hint-notification-911.mp3',
  generateSuccess: 'https://assets.mixkit.co/sfx/preview/mixkit-quick-positive-video-game-notification-interface-265.mp3',
  fadeIn: 'https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3',
  fadeOut: 'https://assets.mixkit.co/sfx/preview/mixkit-fast-short-whoosh-1708.mp3',
};

// Create a pool of Audio objects to avoid creating them on the fly
const audioPool: { [key in keyof typeof soundFiles]?: HTMLAudioElement } = {};

const initializeAudio = () => {
  for (const key in soundFiles) {
    if (Object.prototype.hasOwnProperty.call(soundFiles, key)) {
      const typedKey = key as keyof typeof soundFiles;
      const audio = new Audio(soundFiles[typedKey]);
      audio.preload = 'auto';
      audioPool[typedKey] = audio;
    }
  }
};

// Initialize audio on module load
initializeAudio();

export type SoundName = keyof typeof soundFiles;

/**
 * Plays a preloaded sound effect.
 * @param soundName The name of the sound to play.
 */
export const playSound = (soundName: SoundName) => {
  const sound = audioPool[soundName];
  if (sound) {
    sound.currentTime = 0; // Rewind to start
    sound.play().catch(error => {
      // Autoplay is often restricted by browsers until the user interacts with the page.
      // We can safely ignore these errors as the user will have interacted to trigger the sounds.
      console.warn(`Could not play sound '${soundName}':`, error.message);
    });
  } else {
    console.warn(`Sound not found: ${soundName}`);
  }
};
