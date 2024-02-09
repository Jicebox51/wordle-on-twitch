import { useState, useEffect, useRef } from "react";
import styles from "./index.module.scss";
import WordLetter from "../WordLetter";
import { gsap } from "gsap";

function RejectionBlock(props) {
  const {
    word,
    user,
    color,
    answer,
    updateInvalidLetterStatus,
    getInvalidLetterStatus,
    playWinSound,
    playWhooshSound,
  } = props;
  const [getRejectionStatusArray, setRejectionStatusArray] = useState(Array(word.length).fill(0));
  const answerLetterArray = answer.split("");
  const wordLetterArray = word.split("");
  const wordContRef = useRef(null);
  const wordRef = useRef(null);
  const scoreBonusRef = useRef(null);

  const hexToRGB = (hexCode) => {
    hexCode = hexCode.replace("#", "");
    const r = parseInt(hexCode.substring(0, 2), 16);
    const g = parseInt(hexCode.substring(2, 4), 16);
    const b = parseInt(hexCode.substring(4, 6), 16);
    return [r, g, b];
  };

  function rgbToLuminance(rgb) {
    const [r, g, b] = rgb.map((val) => val / 255);
    const rLinear =
      r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gLinear =
      g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bLinear =
      b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  function contrastRatio(color1, color2) {
    const luminance1 = rgbToLuminance(color1);
    const luminance2 = rgbToLuminance(color2);
    const brighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (brighter + 0.05) / (darker + 0.05);
  }

  const adjustConstrast = (hexCode) => {
    const background = hexToRGB("#18181b");
    const color = hexToRGB(hexCode);

    const currentContrast = contrastRatio(color, background);
    if (currentContrast >= 4.5) {
      return hexCode; // Color already has adequate contrast
    }

    // Increase brightness of the color until contrast is met
    let adjustedColor = [...color];
    while (contrastRatio(adjustedColor, background) < 4.5) {
      for (let i = 0; i < 3; i++) {
        adjustedColor[i] = Math.min(255, adjustedColor[i] + 10);
      }
    }

    return `#${adjustedColor
      .map((val) => val.toString(16).padStart(2, "0"))
      .join("")}`;
  };

  const initRejectionStatusArray = () => {
    let tempArray = Array(word.length).fill(0);
    let firstCatch = false;
    console.log('attempt to read getInvalidLetterStatus from game index.js: ', getInvalidLetterStatus['e']);

    for (let i = 0; i < wordLetterArray.length; i++) {
        if (firstCatch === false) {
            console.log('wordLetterArray[i]: ', wordLetterArray[i]);
            tempArray[i] = getInvalidLetterStatus[wordLetterArray[i]];
            console.log('getInvalidLetterStatus[wordLetterArray[i]]: ', getInvalidLetterStatus[wordLetterArray[i]]);

          if (getInvalidLetterStatus[wordLetterArray[i]] !== 0) {
            firstCatch = true;
          };
        };
    }
    setRejectionStatusArray([...tempArray]);
  };

  const animateScoreBonus = () => {
    let scoreBonus = scoreBonusRef.current;
    if (scoreBonus) {
      let tl = gsap.timeline();
      tl.fromTo(scoreBonus, { opacity: 0 }, { opacity: 0, duration: 1.5 });
      tl.fromTo(
        scoreBonus,
        { opacity: 1, y: 0 },
        { opacity: 0, y: -30, ease: "linear", duration: 1.5 }
      );
    }
  };

  const animateWordEntry = () => {
    let wordCont = wordContRef.current;
    if (wordCont) {
      gsap.fromTo(
        wordCont,
        { maxHeight: 0 },
        {
          maxHeight: 80,
          ease: "linear",
          duration: 0.5,
          onStart: playWhooshSound,
        }
      );
    }
  };

  const animateLettersOnWin = () => {
    let word = wordRef.current;
    let wordCont = wordContRef.current;
    if (word && word.children && wordCont) {
      let letters = word.children;
      let tl = gsap.timeline();
      tl.fromTo(letters, { y: 0 }, { y: 0, duration: 1.5 });
      tl.fromTo(
        letters,
        { y: 0 },
        {
          y: -15,
          ease: "power2",
          duration: 0.45,
          stagger: 0.15,
          onStart: playWinSound,
        }
      );
      tl.fromTo(
        letters,
        { y: -15 },
        { y: 0, ease: "power2", duration: 0.25, stagger: 0.15, delay: -0.8 }
      );
    }
  };

  useEffect(() => {
    initRejectionStatusArray();
    animateWordEntry();
  }, []);

  return (
    <div className={styles.blockCont} ref={wordContRef}>
      <div className={styles.block}>
        <span className={styles.user} style={{ color: adjustConstrast(color) }}>
          {user.length <= 10 ? user : user.slice(0, 7) + "..."}
        </span>
        <div className={styles.word} ref={wordRef}>
          {wordLetterArray.map((letter, index) => (
            <WordLetter
              key={index}
              letter={letter}
              rejectionStatus={getRejectionStatusArray[index]}
              length={word.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default RejectionBlock;
