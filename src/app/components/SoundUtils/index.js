let whooshSound,
  pointSound1,
  pointSound2,
  pointSound3,
  cardSound,
  winSound,
  failSound,
  nopeSoundM,
  nopeSoundF,
  bsSound1,
  bsSound2,
  bsSound3,
  bsSound4;

if (typeof window !== "undefined") {
  whooshSound = new Audio("/sounds/whoosh.wav");
  pointSound1 = new Audio("/sounds/coin3.wav");
  pointSound2 = new Audio("/sounds/coin2.wav");
  pointSound3 = new Audio("/sounds/coin.wav");
  cardSound = new Audio("/sounds/card.wav");
  winSound = new Audio("/sounds/success.wav");
  failSound = new Audio("/sounds/error1.wav");
  nopeSoundM = new Audio("/sounds/nopeMale.wav");
  nopeSoundF = new Audio("/sounds/nopeFemale.wav");
  bsSound1 = new Audio("/sounds/BS1.wav");
  bsSound2 = new Audio("/sounds/BS2.wav");
  bsSound3 = new Audio("/sounds/BS3.wav");
  bsSound4 = new Audio("/sounds/BS4-comeon.wav");

  // Maybe make sounds volumes settings
  whooshSound.volume = 0.5;
  pointSound1.volume = 0.3;
  pointSound2.volume = 0.4;
  pointSound3.volume = 0.5;
  winSound.volume = 0.8;
  failSound.volume = 1;
  nopeSoundM.volume = 1;
  nopeSoundF.volume = 1;
  bsSound1.volume = 1;
  bsSound2.volume = 1;
  bsSound3.volume = 1;
  bsSound4.volume = 1;
}

export const playCardSound = (n) => {
  if (n === undefined) {
    n = 5; // gotta get wordLength from Game/index.js
  } // Play the sound one time for each letter
  if (n <= 0) {
    return;
  }

  cardSound.currentTime = 0;
  // console.log('playCardSound');
  cardSound.play(); // Play the audio clip
  // Schedule the next play after a 0.1-second delay
  setTimeout(() => {
    playCardSound(n - 1); // Play the audio clip n-1 more times
  }, 100);
};

export const playWhooshSound = () => {
  whooshSound.play();
};

export const playPoint1Sound = () => {
  pointSound1.play();
};

export const playPoint2Sound = () => {
  pointSound2.play();
};

export const playPoint3Sound = () => {
  pointSound3.play();
};

export const playWinSound = () => {
  winSound.play();
};

export const playFailSound = () => {
  failSound.play();
};

export const playNopeSoundM = () => {
  nopeSoundM.play();
};

export const playNopeSoundF = () => {
  nopeSoundF.play();
};

export const playBsSound1 = () => {
  bsSound1.play();
};

export const playBsSound2 = () => {
  bsSound2.play();
};

export const playBsSound3 = () => {
  bsSound3.play();
};

export const playBsSound4 = () => {
  bsSound4.play();
};

export default {
  playCardSound,
  playWhooshSound,
  playPoint1Sound,
  playPoint2Sound,
  playPoint3Sound,
  playWinSound,
  playFailSound,
  playNopeSoundM,
  playNopeSoundF,
  playBsSound1,
  playBsSound2,
  playBsSound3,
  playBsSound4,
};