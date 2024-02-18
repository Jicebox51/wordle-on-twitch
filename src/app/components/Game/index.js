"use client";
import React, { useState, useEffect } from "react";
import styles from "./index.module.scss";
import Scoreboard from "../Scoreboard";
import Keyboard from "../Keyboard";
import BigLetters from "../BigLetters";
import WordBlock from "../WordBlock";
import RejectionBlock from "../RejectionBlock";
import EntryField from "../EntryField";
import answerList from "@/app/data/5letters/solutionwords.json";
import wordList from "@/app/data/5letters/words.json";

export default function Game(props) {
  const { client } = props;
  const [getAnswer, setAnswer] = useState("");
  const [getChatMessages, setChatMessages] = useState([]);
  const [getGuessArray, setGuessArray] = useState([]);
  const [getInvalidGuessArray, setInvalidGuessArray] = useState([]);
  const [getChatArray, setChatArray] = useState([]);
  const [getInvalidChatArray, setInvalidChatArray] = useState([]);
  const [getAnswerStatus, setAnswerStatus] = useState([]);
  const [getLetterStatus, setLetterStatus] = useState({});
  const [getInvalidLetterStatus, setInvalidLetterStatus] = useState({});
  const [getTimeoutStatus, setTimeoutStatus] = useState({});
  const [getUserScores, setUserScores] = useState({});
  const [isWordFound, setIsWordFound] = useState(false);
  const wordLength = 5;
  const timeoutLength = 3000;
  const whooshSound = new Audio("/sounds/whoosh.wav");
  const pointSound1 = new Audio("/sounds/coin3.wav");
  const pointSound2 = new Audio("/sounds/coin2.wav");
  const pointSound3 = new Audio("/sounds/coin.wav");
  const cardSound = new Audio("/sounds/card.wav");
  const winSound = new Audio("/sounds/success.wav");
  // WIP PART
  // TODO get that from URL you dumbass
  const [getInvalidGuessesDisplayed, setInvalidGuessesDisplayed] = useState(-3);
  const onlyUseAvailableLetters = true;
  const [getDeniedYellowPositions, setDeniedYellowPositions] = useState({});
  const onlyAllowNotTriedPositions = true;
  const greenLettersHaveToBeUsedInPlace = true;
  // Penalty could be either points removed and/or longer timeout
  // Penalty could be increased on subsequent "mistakes"
  const [cooldown, setCooldown] = useState(false);
  const cooldownDuration = 10000;
  const penaltyForNonExistingWords = false;
  const penaltyForUsingRemovedLetter = false;
  // All time scores and temp scores would be cool
  // ["invalid word", ("length doesn't fit",) "already guessed", "green not right place", "use of a gone letter", 
  //  {"yellow[letter]: position"} ]

  whooshSound.volume = 0.5;
  pointSound1.volume = 0.3;
  pointSound2.volume = 0.4;
  pointSound3.volume = 0.5;
  winSound.volume = 0.8;

  const updateInvalidGuessesDisplayed = (value) => {
    if (!isNaN(value)) {
      setInvalidGuessesDisplayed(value);
    }
  }

  const initializeDeniedYellowPositions = () => {
    const tempDeniedYellowPositions = {};
    const qwertyAlphabet = "qwertyuiopasdfghjklzxcvbnm";
    for (let i = 0; i < qwertyAlphabet.length; i++) {
      tempDeniedYellowPositions[qwertyAlphabet[i]] = [];
    }
    setDeniedYellowPositions(tempDeniedYellowPositions);
  };

  const timeoutUser = (user, timeoutDuration) => {
    if (!timeoutDuration) {
      timeoutDuration = timeoutLength;
    }
    setTimeoutStatus((prevObject) => ({
      ...prevObject,
      [user]: true,
    }));
    console.log('Timed out ' + user, 'for: ' + timeoutDuration);
    setTimeout(function () {
      setTimeoutStatus((prevObject) => ({
        ...prevObject,
        [user]: false,
      }));
      console.log('Untimed out ' + user);
    }, timeoutDuration);
  };

  // Reset the object keeping track of the answer status to all false
  const initializeAnswerStatus = () => {
    const tempAnswerStatus = [];
    for (let i = 0; i < wordLength; i++) {
      tempAnswerStatus.push(false);
    }
    setAnswerStatus(tempAnswerStatus);
  };

  // Reset the object keeping track of the letter status to all -1
  const initializeLetterStatus = () => {
    const qwertyAlphabet = "qwertyuiopasdfghjklzxcvbnm";
    const tempLetterStatus = {};

    for (let i = 0; i < qwertyAlphabet.length; i++) {
      tempLetterStatus[qwertyAlphabet[i]] = -1;
    }

    setLetterStatus(tempLetterStatus);
  };

  // Reset the object keeping track of the letter status to all -1
  const initializeInvalidLetterStatus = () => {
    const qwertyAlphabet = "qwertyuiopasdfghjklzxcvbnm";
    const tempInvalidLetterStatus = {};

    for (let i = 0; i < qwertyAlphabet.length; i++) {
      tempInvalidLetterStatus[qwertyAlphabet[i]] = 0;
    }

    setInvalidLetterStatus(tempInvalidLetterStatus);
  };

  // Update the object keeping track of the status of each letter in the answer.
  // Used to update the big letter visual.
  // The "statusFromGuess" parameter is passed each time a word is added to the guess list,
  // and this function updates the corresponding getAnswerStatus entry to true if a letter was newly found in a correct spot.
  // It never changes it back to false because you cannot "unfind" a letter. (initializeAnswerStatus is used to reset after the word is found)
  // false = letter not yet found (default state)
  // true = letter in correct place
  const updateAnswerStatus = (statusFromGuess) => {
    let tempAnswerStatus = [...getAnswerStatus];
    for (let i = 0; i < statusFromGuess.length; i++) {
      if (statusFromGuess[i] === 2) {
        tempAnswerStatus[i] = true;
      }
    }
    setAnswerStatus([...tempAnswerStatus]);
  };

  // Update the object keeping track of the letter status.
  // Used to update the keyboard visual.
  //-1 = unset (default state)
  // 0 = letter not in word
  // 1 = letter in wrong place
  // 2 = letter in correct place
  const updateLetterStatus = (statusObject, user) => {
    let scoreChange = 0;

    Object.keys(statusObject).forEach(function (letter) {
      if (getLetterStatus[letter] < statusObject[letter]) {

        let letterDifference = statusObject[letter] - getLetterStatus[letter];
        scoreChange += letterDifference;
        // console.log("Letter difference: " + letterDifference);
        setLetterStatus((prevObject) => ({
          ...prevObject,
          [letter]: statusObject[letter],
        }));
      }
    });
    updateScores(user, scoreChange);
  };

  const updateScores = (user, scoreChange) => {
    let currentScore = getUserScores[user] || 0;
    let newScore = currentScore + scoreChange;
    // console.log(user + "'s new score: " + newScore);
    setUserScores((prevObject) => ({
      ...prevObject,
      [user]: newScore,
    }));
  };

  // Set the answer to a new random word from the list
  const setAnswerAsRandomWord = () => {
    let newWord = getAnswer;

    // Make sure it's actually a new word (don't repeat the same word twice)
    while (newWord === getAnswer) {
      newWord = answerList[Math.floor(Math.random() * answerList.length)];
    }

    console.log(newWord);
    setAnswer(newWord);
  };

  // Reset the game board (called when the word is solved)
  const reset = () => {
    setAnswerAsRandomWord();
    setGuessArray([]);
    setInvalidGuessArray([]);
    setChatMessages([]);
    setChatArray([]);
    setInvalidChatArray([]);
    initializeLetterStatus();
    initializeInvalidLetterStatus();
    initializeAnswerStatus();
    setIsWordFound(false);
    setTimeoutStatus({});
    initializeDeniedYellowPositions();
    updateInvalidGuessesDisplayed();
    setCooldown(false);
  };

  const isUserTimedOut = (user) => {
    // console.log(getTimeoutStatus);
    return getTimeoutStatus[user];
  };

  const handleValidGuess = (word, user, color) => {
    setGuessArray((prevGuessArray) => [...prevGuessArray, word]);
    let newChatEntry = [word, user, color];
    // console.log(getChatArray);
    setChatArray((prevChatArray) => [...prevChatArray, newChatEntry]);
    timeoutUser(user);
  };

  const updateDeniedYellowPositions = (letter, position) => {
    setDeniedYellowPositions(prevPositions => ({
      ...prevPositions,
      [letter]: [...prevPositions[letter], position]
    }));
  };

  const updateInvalidLetterStatus = (letter, status) => {
    // adding rejectionStatus
    // 0=not rejected
    // 1=letter gone but used(blue)
    // 2=green not reused or in other spot(purple)
    // 3=yellow not reused or reused in same spot(red)
    setInvalidLetterStatus((prevObject) => ({
      ...prevObject,
      [letter]: status
    }));
    // console.log('in update invalid letter: ', letter, status)
  };

  const handleInvalidGuess = (word, user, color) => {
    setInvalidGuessArray((prevInvalidGuessArray) => [...prevInvalidGuessArray, word]);
    let newChatEntry = [word, user, color];
    // console.log(getChatArray);
    setInvalidChatArray((prevInvalidChatArray) => [...prevInvalidChatArray, newChatEntry]);
    timeoutUser(user, 30000);
  }; // we now need to handle invalid guesses too to display them

  // Function called when a new word is guessed
  const handleWordEntry = (chat, user, color) => {
    var word = chat.trim(); //twitch adds white space to allow the broadcaster to repeat the same chat repeatedly it seems
    var legitGuess = true;
    console.log('new guess: ', word);
    console.log('too early for:' + user, 'cooldown: ' + cooldown);
    if (cooldown === false) {
      if (!isUserTimedOut(user)) {

        if (isWordFound) {
          return;
        } // word for this round has already been found

        if (word.length !== wordLength) {
          return;
        } // not the right length

        if (getGuessArray.includes(word)) {
          handleInvalidGuess(word, user, color);
          legitGuess = false;
          return;
        } // already guessed

        if (wordList.includes(word)) {
          var tempDeniedPositionsToBeAdded = [];

          for (let i = 0; i < word.length; i++) {
            var letter = word[i];
            if (onlyUseAvailableLetters === true) {

              if (getLetterStatus[word[i]] === 0) {
                console.log('rejected by onlyUseAvailableLetters');
                updateInvalidLetterStatus(letter, 1);
                handleInvalidGuess(word, user, color);
                legitGuess = false;
                return;
              } else {
                updateInvalidLetterStatus(letter, 0);
              };

            } else {
              updateInvalidLetterStatus(letter, 0)
            };// only allow not tried letters in guess

            if (greenLettersHaveToBeUsedInPlace === true) {

              if (getLetterStatus[word[i]] !== 2 && getAnswerStatus[i] === true) {
                console.log('rejected by greenLettersHaveToBeUsedInPlace');
                updateInvalidLetterStatus(letter, 2);
                handleInvalidGuess(word, user, color);
                legitGuess = false;
                return;
              } else {
                updateInvalidLetterStatus(letter, 0);
              };

            } else {
              updateInvalidLetterStatus(letter, 0);
            };// only allow guesses with green letters in at the right place

            if (onlyAllowNotTriedPositions === true) {
              // console.log('from check', letter, getDeniedYellowPositions[letter]);
              let tempArray = Array(word.length).fill(0);
              let wordLetterArray = word.split("");
              let answerLetterArray = getAnswer.split("");

              //Loop through the letters and check if correct letter is in correct space
              
              if (wordLetterArray[i] === answerLetterArray[i]) {
                tempArray[i] = 2;
                answerLetterArray[i] = "-"; //Prevent further checks from counting this found letter
              }
              

              //Loop through the letters and check if the letter exists in other spaces
              
              let letterFound = false;
              //Check other letters in answer
              for (let j = 0; j < wordLetterArray.length && !letterFound; j++) {
                if (wordLetterArray[i] === answerLetterArray[j] && tempArray[i] !== 2) {
                  tempArray[i] = 1;
                  answerLetterArray[j] = "-";
                  letterFound = true;
                }
              }              

              var tempVar = tempArray[i];
              console.log('i: ', i, 'tempVar: ', tempVar);


              if ((getLetterStatus[letter] === 1 || tempVar === 1) && getDeniedYellowPositions[letter].includes(i)) {
                console.log('rejected by onlyAllowNotTriedPositions');
                console.log('rejected cause of ', letter, i);
                console.log('Invalid letters stuff: ', letter, getInvalidLetterStatus[letter]);
                updateInvalidLetterStatus(letter, 3);
                handleInvalidGuess(word, user, color);
                legitGuess = false;
                console.log('legitGuess: ', legitGuess);
                return;
              } else if (getLetterStatus[letter] === 1 || tempVar === 1 && !getDeniedYellowPositions[letter].includes(i)) {
                tempDeniedPositionsToBeAdded.push([letter, i]);
              }

              console.log('tempArray: ', tempArray);
              console.log('tempDeniedPositionsToBeAdded', tempDeniedPositionsToBeAdded);

              
              if (wordLetterArray.length - 1 === i && !getDeniedYellowPositions[letter].includes(i)) {
                if (tempDeniedPositionsToBeAdded.length > 0) {
                  for (const [letter, pos] of tempDeniedPositionsToBeAdded) { 
                    updateDeniedYellowPositions(letter, pos);
                    console.log('updating', letter, 'with position', pos);
                  }
                }
              }
              
            } // only allow different position for yellows
          }

          //If it's a valid word, add it the list of guesses so far
          handleValidGuess(word, user, color);
          initializeInvalidLetterStatus();
          setCooldown(true);
          console.log('validGuess cooldown starting');
          setTimeout(function () {
          console.log('validGuess cooldown is over');
          setCooldown(false);
          }, cooldownDuration);
        } else {
            
          handleInvalidGuess(word, user, color);

        } // show word not in db in left column

        if (word === getAnswer) {
          //If it's the correct answer, show and alert and reset the game board
          setIsWordFound(true); // prevent future guesses until the game has reset
          updateScores(user, wordLength); // give bonus points for getting the answer

          setTimeout(function () {
            reset();
          }, 4500);
        }
      }
    }
  };

  const playCardSound = (n) => {
    if (n === undefined) {
      n = wordLength;
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

  const playWhooshSound = () => {
    // console.log('playWhooshSound');
    whooshSound.play();
  };

  const playPoint1Sound = () => {
    // console.log('playPoint1Sound');
    pointSound1.play();
  };

  const playPoint2Sound = () => {
    // console.log('playPoint2Sound');
    pointSound2.play();
  };

  const playPoint3Sound = () => {
    // console.log('playPoint3Sound');
    pointSound3.play();
  };

  const playWinSound = () => {
    // console.log('playWinSound');
    winSound.play();
  };

  const addChatMessage = (word, user, color) => {
    let newChatMessage = [word, user, color];
    setChatMessages((prevChatMessages) => [
      ...prevChatMessages,
      newChatMessage,
    ]);
  };

  useEffect(() => {
    if (client) {
      client.on("message", (channel, tags, message, self) => {
        if (message === '!reloadwordle' && '#' + tags.username === channel) {
          location.reload();
          return;
        }
        if (message === '!giveup' && '#' + tags.username === channel) {
          reset();
          return;
        }
        if (message.startsWith('!setInvGuesses')) {
          const args = message.split(' ');
          const value = parseInt(args[1]);
          console.log(args[1]);
          if (!isNaN(value)) {
            updateInvalidGuessesDisplayed(value);
          }
          return;
        }
        addChatMessage(message, tags["display-name"], tags["color"]);
      });
    }

    setAnswerAsRandomWord();
    initializeAnswerStatus();
    initializeLetterStatus();
    initializeInvalidLetterStatus();
    initializeDeniedYellowPositions();
  }, []);

  useEffect(() => {
    if (getChatMessages.length) {
      let latestChat = getChatMessages[getChatMessages.length - 1];
      handleWordEntry(
        latestChat[0].trim().toLowerCase(),
        latestChat[1],
        latestChat[2]
      );
    }
  }, [getChatMessages]);

  return (
    <div className={styles.gameContainer}>
      <div className={styles.leftContainer}>
        <div className={styles.leftTopContainer}>
          <Scoreboard getUserScores={getUserScores} />
        </div>
        <div className={styles.leftBottomContainer}>
          {getInvalidChatArray.slice(getInvalidGuessesDisplayed).map((chatEntry, index) => (
            <RejectionBlock
              key={index}
              word={chatEntry[0]}
              user={chatEntry[1]}
              color={chatEntry[2]}
              answer={getAnswer}
              getInvalidLetterStatus={getInvalidLetterStatus}
              updateInvalidLetterStatus={updateInvalidLetterStatus}
              updateAnswerStatus={updateAnswerStatus}
            // playDeniedSound={playDeniedSound}
            />
          ))}
        </div>
      </div>

      <div className={styles.middleContainer}>
        <div className={styles.header}>
          <h1>Wordle on Twitch</h1>
          <h2>Let's make it harder, if we can...</h2>
        </div>
        <BigLetters
          answer={getAnswer}
          answerStatus={getAnswerStatus}
          isWordFound={isWordFound}
          playCardSound={playCardSound}
        />
        <Keyboard
          letterStatus={getLetterStatus}
          playPoint1Sound={playPoint1Sound}
          playPoint2Sound={playPoint2Sound}
          playPoint3Sound={playPoint3Sound}
        />
      </div>
      <div className={styles.rightContainer}>
        <div className={styles.wordBlockContainer}>
          {getChatArray.map((chatEntry, index) => (
            <WordBlock
              key={index}
              word={chatEntry[0]}
              user={chatEntry[1]}
              color={chatEntry[2]}
              answer={getAnswer}
              updateLetterStatus={updateLetterStatus}
              updateAnswerStatus={updateAnswerStatus}
              playWinSound={playWinSound}
              playWhooshSound={playWhooshSound}
            />
          ))}
        </div>
        {!client && (
          <EntryField addChatMessage={addChatMessage} wordLength={wordLength} />
        )}
      </div>
    </div>
  );
}

// haste: adieu rebar exact tapes thema theme... broken
