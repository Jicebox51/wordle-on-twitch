import { useState, useEffect, useRef } from "react";
import styles from "./index.module.scss";
import WordLetter from "../WordLetter";
import CooldownTimer from "../CooldownTimer";
import { gsap } from "gsap";

function WordBlock(props) {
  const {
    word,
    user,
    color,
    answer,
    updateLetterStatus,
    updateAnswerStatus,
    updateMandatoryYellowLetters,
    playWinSound,
    playWhooshSound,
  } = props;
  const [getStatusArray, setStatusArray] = useState(Array(word.length).fill(0));
  const answerLetterArray = answer.split("");
  const wordLetterArray = word.split("");
  const solveBonus = word.length;
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

  const initStatusArray = () => {
    let tempArray = Array(word.length).fill(0);
    let answerCheckArray = [...answerLetterArray];

    //Loop through the letters and check if correct letter is in correct space
    for (let i = 0; i < wordLetterArray.length; i++) {
      if (wordLetterArray[i] === answerCheckArray[i]) {
        tempArray[i] = 2;
        answerCheckArray[i] = "-"; //Prevent further checks from counting this found letter
      }
    }
    //Loop through the letters and check if the letter exists in other spaces
    for (let i = 0; i < answerCheckArray.length; i++) {
      let letterFound = false;
      //Check other letters in answer
      for (let j = 0; j < wordLetterArray.length && !letterFound; j++) {
        if (wordLetterArray[i] === answerCheckArray[j] && tempArray[i] !== 2) {
          tempArray[i] = 1;
          updateMandatoryYellowLetters(word[i]);
          console.log('Adding ', word[i], 'to the mandatory yellow letters array.');
          answerCheckArray[j] = "-";
          letterFound = true;
        }
      }
    }

    setStatusArray([...tempArray]);

    //send letter data to game component to update keyboard
    let tempObject = {};
    for (let i = 0; i < wordLetterArray.length; i++) {
      if (
        !tempObject[wordLetterArray[i]] ||
        tempObject[wordLetterArray[i]] < tempArray[i]
      ) {
        tempObject[wordLetterArray[i]] = tempArray[i];
      }
    }
    updateLetterStatus(tempObject, user);
    updateAnswerStatus(tempArray);
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
    initStatusArray();
    animateWordEntry();
    if (word === answer) {
      animateLettersOnWin();
      animateScoreBonus();
    }
  }, []);

  return (
    <div className={styles.blockCont} ref={wordContRef}>
      <div className={styles.block}>
        {word === answer ? (
          <div ref={scoreBonusRef} className={styles.scoreBonus}>
            +{solveBonus}
          </div>
        ) : (
          <CooldownTimer timeoutLength={props.timeoutLength} />
        )}
        <span className={styles.user} style={{ color: adjustConstrast(color) }}>
          {user.length <= 10 ? user : user.slice(0, 7) + "..."}
        </span>
        <div className={styles.word} ref={wordRef}>
          {wordLetterArray.map((letter, index) => (
            <WordLetter
              key={index}
              letter={letter}
              status={getStatusArray[index]}
              length={word.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default WordBlock;
