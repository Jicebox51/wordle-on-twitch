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
import SoundUtils from "../SoundUtils";
import { useSettings, displaySettings, difficultySettings, soundSettings } from "../Settings";
import { parseArgs } from "util";

export default function Game(props) {
  const { client } = props;
  const settings = {
    ...useSettings(),
    ...displaySettings(),
    ...difficultySettings(),
    ...soundSettings(),
  };
  const [getAnswer, setAnswer] = useState("");
  const [getChatMessages, setChatMessages] = useState([]);
  const [getGuessArray, setGuessArray] = useState([]);
  const [getChatArray, setChatArray] = useState([]);
  const [getAnswerStatus, setAnswerStatus] = useState([]);
  const [getLetterStatus, setLetterStatus] = useState({});
  const [getTimeoutStatus, setTimeoutStatus] = useState({});
  const [getUserSessionScores, setUserSessionScores] = useState({});
  const [getUserAllTimesScores, setUserAllTimesScores] = useState({});
  const [isWordFound, setIsWordFound] = useState(false);
  const [getErrorType, setErrorType] = useState(0);
  const [getMandatoryYellowLetters, setMandatoryYellowLetters] = useState([]);
  const [getRejectionMessages, setRejectionMessages] = useState([]);
  const [getInvalidChatArray, setInvalidChatArray] = useState([]);
  const [getInvalidLetterStatus, setInvalidLetterStatus] = useState({});
  const [getDeniedYellowPositions, setDeniedYellowPositions] = useState({});
  const timeoutLength = 3000;
  const [cooldown, setCooldown] = useState(false);
  const invalidGuessPenaltyInSeconds = settings.invalidGuessPenalty / 1000;
  const cooldownDurationInSeconds = settings.cooldownDuration / 1000;
  const [getInvalidGuessArray, setInvalidGuessArray] = useState([]);

  // WIP PART
  // TODO:

  // All time scores and temp scores would be cool

  // Make a visual to show players the state of the global cooldown
  // Make sound to play when guess is invalid random from a list
  // Keep thinking about a way to increase difficulty on a per user basis
  // Different penalties based on type of mistake?
  // Penalty could be either points removed and/or longer timeout
  // Penalty could be increased on subsequent "mistakes"
  // Modify settings and debug panels to be just panels and display dynamic stuff in there
  // like settings could become last x answers on a timer then back to settings or display yet something else

  // make a timer so game fade out after x (var/setting) minutes no guess done and "come back" on a guess
  // plus a switch to enable/disable that feat.
  // Also add !hidewordle at the same time

  // if you're feeling really evil, make it exponentially increase the timeout if someone does a guess during their timeout

  const [getPreviousAnswer, setPreviousAnswer] = useState('');
  const [getDefinition, setDefinition] = useState('');

  const initializeRejectionMessages = () => {
    const tempRejectionMessages = [];
    setRejectionMessages(tempRejectionMessages);
  };

  const initializeMandatoryYellowLetters = () => {
    setMandatoryYellowLetters([]);
  };

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
    // console.log('Timed out ' + user, 'for: ' + timeoutDuration);
    setTimeout(function () {
      setTimeoutStatus((prevObject) => ({
        ...prevObject,
        [user]: false,
      }));
      // console.log('Untimed out ' + user);
    }, timeoutDuration);
  };

  // Reset the object keeping track of the answer status to all false
  const initializeAnswerStatus = () => {
    const tempAnswerStatus = [];
    for (let i = 0; i < settings.wordLength; i++) {
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
    let currentSessionScore = getUserSessionScores[user] || 0;
    let newSessionScore = currentSessionScore + scoreChange;
    let currentAllTimesScore = getUserAllTimesScores[user] || 0;
    let newAllTimesScore = currentAllTimesScore + scoreChange;
    // console.log(user + "'s new score: " + newScore);
    setUserSessionScores((prevSessionObject) => ({
      ...prevSessionObject,
      [user]: newSessionScore,
    }));
    localStorage.setItem(`sessionScore_${user}`, newSessionScore.toString());
    setUserAllTimesScores((prevAllTimesObject) => ({
      ...prevAllTimesObject,
      [user]: newAllTimesScore,
    }));
    localStorage.setItem(`allTimesScore_${user}`, newAllTimesScore.toString());
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
    settings.updateInvalidGuessesDisplayed();
    setCooldown(false);
    initializeRejectionMessages();
    initializeMandatoryYellowLetters();
  };

  const isUserTimedOut = (user) => {
    return getTimeoutStatus[user];
  };

  const handleValidGuess = (word, user, color) => {
    setGuessArray((prevGuessArray) => [...prevGuessArray, word]);
    let newChatEntry = [word, user, color];
    // console.log(getChatArray);
    console.log(word, user, color);
    setChatArray((prevChatArray) => [...prevChatArray, newChatEntry]);
    timeoutUser(user);
  };

  const updateDeniedYellowPositions = (letter, position) => {
    setDeniedYellowPositions(prevPositions => ({
      ...prevPositions,
      [letter]: [...prevPositions[letter], position]
    }));
  };

  const updateMandatoryYellowLetters = (letter) => {
    setMandatoryYellowLetters(prevLetters => {
      // if (!prevLetters.includes(letter)) {
      return [...prevLetters, letter];
      // }
      // return prevLetters;
    });
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
  };

  const handleInvalidGuess = (word, user, color) => {
    setInvalidGuessArray((prevInvalidGuessArray) => [...prevInvalidGuessArray, word]);
    let newChatEntry = [word, user, color];
    // console.log(getChatArray);
    setInvalidChatArray((prevInvalidChatArray) => [...prevInvalidChatArray, newChatEntry]);
    timeoutUser(user, settings.invalidGuessPenalty);
  }; // we now need to handle invalid guesses too to display them

  const handleGiveAnswer = () => {
    console.log('tests:', getAnswer, 'Wordplop', '#B22222');
    console.log('inside function:', 'getAnswer:', getAnswer);
    addChatMessage(getAnswer, 'Wordplop', '#B22222');
  };

  console.log('Mandatory letters array:', getMandatoryYellowLetters);

  // Function called when a new word is guessed
  const handleWordEntry = (chat, user, color) => {
    var giveup = getAnswer;
    if (!chat && giveup) {
      handleWordEntry(giveup, 'Wordplop', '#B22222');
      console.log(giveup, 'Wordplop', '#B22222');
      return;
    }
    var word = chat.trim(); //twitch adds white space to allow the broadcaster to repeat the same chat repeatedly it seems
    console.log('new guess: ', word);
    console.log('getAnswer: ', getAnswer);
    if (cooldown === false) {
      if (!isUserTimedOut(user)) {

        if (isWordFound) {
          return;
        } // word for this round has already been found

        if (word.length !== settings.wordLength) {
          return;
        } // not the right length

        if (getGuessArray.includes(word)) {
          handleInvalidGuess(word, user, color);
          return;
        } // already guessed

        if (wordList.includes(word)) {
          var tempDeniedPositionsToBeAdded = [];
          const wordLettersArray = word.split('');

          if (settings.allYellowLettersHaveToBeReused === true) {
            for (let i = 0; i < getMandatoryYellowLetters.length; i++) {
              if (!wordLettersArray.includes(getMandatoryYellowLetters[i])) {
                let letter = getMandatoryYellowLetters[i];
                let uppercaseLetter = letter.toUpperCase();
                let messageString = `: Rejected. ${uppercaseLetter} isn\'t present in your guess.`;
                let userColor = color;
                let rejectionMessage = { user, userColor, word, messageString };
                setRejectionMessages((prevMessages) => [...prevMessages, rejectionMessage]);
                setErrorType(4);
                handleInvalidGuess(word, user, color);
                return;
              }
            }
          }; // all yellow letters must be part of new guess

          for (let i = 0; i < word.length; i++) {
            var letter = word[i];
            if (settings.onlyUseAvailableLetters === true) {

              if (getLetterStatus[word[i]] === 0) {
                let uppercaseLetter = letter.toUpperCase();
                let messageString = `: Rejected. ${uppercaseLetter} isn\'t present in word to find.`;
                let userColor = color;
                let rejectionMessage = { user, userColor, word, messageString };
                setRejectionMessages((prevMessages) => [...prevMessages, rejectionMessage]);
                setErrorType(1);
                console.log(word, ': Rejected by onlyUseAvailableLetters rule.', letter.toUpperCase(), 'isn\'t present in word to find.');
                updateInvalidLetterStatus(letter, 1);
                handleInvalidGuess(word, user, color);
                return;
              } else {
                updateInvalidLetterStatus(letter, 0);
              };

            } else {
              updateInvalidLetterStatus(letter, 0);
            }; // only allow not tried letters in guess

            if (settings.greenLettersHaveToBeUsedInPlace === true) {

              if (getLetterStatus[word[i]] !== 2 && getAnswerStatus[i] === true) {
                let uppercaseLetter = letter.toUpperCase();
                let messageString = `: Rejected. Use of ${uppercaseLetter} isn\'t allowed in position number ${i + 1}.`;
                let userColor = color;
                let rejectionMessage = { user, userColor, word, messageString };
                setRejectionMessages((prevMessages) => [...prevMessages, rejectionMessage]);
                // maybe tell user it should be "letter" in position number "i + 1"?
                setErrorType(2);
                console.log('rejected by greenLettersHaveToBeUsedInPlace');
                updateInvalidLetterStatus(letter, 2);
                handleInvalidGuess(word, user, color);
                return;
              } else {
                updateInvalidLetterStatus(letter, 0);
              };

            } else {
              updateInvalidLetterStatus(letter, 0);
            }; // only allow guesses with green letters in at the right place

            if (settings.onlyAllowNotTriedPositions === true) {
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

              if ((getLetterStatus[letter] === 1 || tempVar === 1) && getDeniedYellowPositions[letter].includes(i)) {
                console.log('Rejected by onlyAllowNotTriedPositions. Reason: ', letter, i);
                let uppercaseLetter = letter.toUpperCase();
                let messageString = `: Rejected. Use of ${uppercaseLetter} isn\'t allowed in position number ${i + 1}.`;
                let userColor = color;
                // let rejectionMessage = `[@${user}] ${word} ${messageString}`;
                let rejectionMessage = { user, userColor, word, messageString };
                setRejectionMessages((prevMessages) => [...prevMessages, rejectionMessage]);
                setErrorType(3);
                // console.log('Invalid letters stuff: ', letter, getInvalidLetterStatus[letter]);
                updateInvalidLetterStatus(letter, 3);
                handleInvalidGuess(word, user, color);
                return;
              } else if (getLetterStatus[letter] === 1 || tempVar === 1 && !getDeniedYellowPositions[letter].includes(i)) {
                tempDeniedPositionsToBeAdded.push([letter, i]);
              }

              // console.log('tempArray: ', tempArray);
              console.log('tempDeniedPositionsToBeAdded:', tempDeniedPositionsToBeAdded, 'i:', i);


              if (wordLetterArray.length - 1 === i) {

                // if (!getDeniedYellowPositions[letter].includes(i)) {
                if (tempDeniedPositionsToBeAdded.length > 0) {
                  for (const [letter, pos] of tempDeniedPositionsToBeAdded) {
                    updateDeniedYellowPositions(letter, pos);
                    console.log('updating', letter, 'with position', pos);
                  }
                } else {
                  console.log('tempDeniedPositionsToBeAdded is empty. Nothing to do');
                }
                // } else {
                //   console.log(letter, i, 'in temp array');
                // }

              } else {
                console.log('Have we reached the end of the word?', wordLetterArray.length - 1 === i, ' && condition 2:', !getDeniedYellowPositions[letter].includes(i));
              }

            } // only allow different position for yellows
          }

          //If it's a valid word, add it the list of guesses so far
          handleValidGuess(word, user, color);
          // Reset invalid letter status for next guess
          initializeInvalidLetterStatus();
          // Global cooldown after a valid guess
          setCooldown(true);
          // console.log('validGuess cooldown starting');
          setTimeout(function () {
            // console.log('validGuess cooldown is over');
            setCooldown(false);
          }, settings.cooldownDuration);
        } else {
          // Word isn't in words list
          setErrorType(0);
          handleInvalidGuess(word, user, color);
          // Message to write in "debug"
          let messageString = ': Rejected by MUST BE a word from the list rule.';
          let userColor = color;
          // let rejectionMessage = `[@${user}] ${word} ${messageString}`;
          let rejectionMessage = { user, userColor, word, messageString };
          setRejectionMessages((prevMessages) => [...prevMessages, rejectionMessage]);

        } // show word not in db in left column

        if (word === getAnswer) {

          if (user.toLowerCase(user) !== 'wordplop') {
            let messageString = `: Congrats, you found it!`;
            let userColor = color;
            let rejectionMessage = { user, userColor, word, messageString };
            setRejectionMessages((prevMessages) => [...prevMessages, rejectionMessage]);
          }

          //If it's the correct answer, show and alert and reset the game board
          setIsWordFound(true); // prevent future guesses until the game has reset
          updateScores(user, settings.wordLength); // give bonus points for getting the answer

          setTimeout(function () {
            reset();
          }, 4500);
        } else {
          console.log("Answer is:", getAnswer);
        }
      } else {
        let messageString = `: Ignored cause of timeout. Try again soon !`;
        let userColor = color;
        let rejectionMessage = { user, userColor, word, messageString };
        setRejectionMessages((prevMessages) => [...prevMessages, rejectionMessage]);
        return;
      }
    } else {
      let messageString = `: Ignored cause of cooldown. Try again soon !`;
      let userColor = color;
      let rejectionMessage = { user, userColor, word, messageString };
      setRejectionMessages((prevMessages) => [...prevMessages, rejectionMessage]);
      return;
    }
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
        const user = tags["display-name"];
        const cost = parseInt(localStorage.getItem('getGiveupCost')) || 25;
        const userGivingupScore = parseInt(localStorage.getItem(`sessionScore_${user}`)) || 0;
        console.log('Current score for', user, ':', userGivingupScore);
        if (message.startsWith('!')) {
          console.log('a command as been issued by', user);

          if (message.toLowerCase(message) === '!giveup') {
            handleGiveAnswer();
            let newuserGivingupScore = userGivingupScore - cost;
            console.log('old score: ', userGivingupScore, 'giveup cost: ', cost, 'new score: ', newuserGivingupScore)
            updateScores(user, newuserGivingupScore);
            let word = '';
            let messageString = ` Used 25 points to skip last word.`;
            let userColor = tags.color;
            let rejectionMessage = { user, userColor, word, messageString };
            setRejectionMessages((prevMessages) => [...prevMessages, rejectionMessage]);
            return;
          }

          if (message.toLowerCase(message) === '!reloadwordle' && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            location.reload();
            return;
          }
          if (message.toLowerCase(message) === '!showdebug' && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            settings.setShowDebug(true);
            localStorage.setItem('showDebug', 'true');
            return;
          }
          if (message.toLowerCase(message) === '!hidedebug' && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            settings.setShowDebug(false);
            localStorage.setItem('showDebug', 'false');
            return;
          }
          if (message.toLowerCase(message) === '!showsettings' && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            settings.setShowSettings(true);
            localStorage.setItem('showSettings', 'true');
            return;
          }
          if (message.toLowerCase(message) === '!hidesettings' && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            settings.setShowSettings(false);
            localStorage.setItem('showSettings', 'false');
            return;
          }
          if (message.toLowerCase(message).startsWith('!setsecretsetting') && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            const args = message.split(' ');
            const value = args[1];
            console.log(args[1]);
            if (value === 'true' || value === 'false') {
              settings.updateSecretSetting(value === 'true' ? true : false);
              localStorage.setItem('secretSetting', value);
            }
            return;
          }
          if (message.toLowerCase(message).startsWith('!setshowscoreboard') && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            const args = message.split(' ');
            const value = args[1];
            console.log(args[1]);
            if (value === 'true' || value === 'false') {
              settings.updateShowScoreboard(value === 'true' ? true : false);
              localStorage.setItem('showScoreboard', value);
            }
            return;
          }
          if (message.toLowerCase(message).startsWith('!setonlyuseavailableletters') && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            const args = message.split(' ');
            const value = args[1];
            console.log(args[1]);
            if (value === 'true' || value === 'false') {
              settings.updateOnlyUseAvailableLetters(value === 'true' ? true : false);
              localStorage.setItem('onlyUseAvailableLetters', value);
            }
            return;
          }
          if (message.toLowerCase(message).startsWith('!setonlyallownottriedpositions') && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            const args = message.split(' ');
            const value = args[1];
            console.log(args[1]);
            if (value === 'true' || value === 'false') {
              settings.updateOnlyAllowNotTriedPositions(value === 'true' ? true : false);
              localStorage.setItem('onlyAllowNotTriedPositions', value);
            }
            return;
          }
          if (message.toLowerCase(message).startsWith('!greenlettershavetobeusedinplace') && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            const args = message.split(' ');
            const value = args[1];
            console.log(args[1]);
            if (value === 'true' || value === 'false') {
              settings.updateGreenLettersHaveToBeUsedInPlace(value === 'true' ? true : false);
              localStorage.setItem('greenLettersHaveToBeUsedInPlace', value);
            }
            return;
          }
          if (message.toLowerCase(message).startsWith('!allyellowlettershavetobereused') && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            const args = message.split(' ');
            const value = args[1];
            console.log(args[1]);
            if (value === 'true' || value === 'false') {
              settings.updateAllYellowLettersHaveToBeReused(value === 'true' ? true : false);
              localStorage.setItem('allYellowLettersHaveToBeReused', value);
            }
            return;
          }
          if (message.toLowerCase(message) === '!test' && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            SoundUtils.playBsSound2();
          }
          if (message.toLowerCase(message).startsWith('!setinvguesses') && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            const args = message.split(' ');
            const value = parseInt(args[1]);
            if (!isNaN(value)) {
              settings.updateInvalidGuessesDisplayed(value);
            }
            return;
          }
          if (message.toLowerCase(message).startsWith('!updatescore') && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            const args = message.split(' ');
            const name = args[1];
            const value = parseInt(args[2]);
            if (!isNaN(value)) {
              updateScores(name, value);
            }
            return;
          }
          if (message.toLowerCase(message).startsWith('!updategiveupcost') && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            const args = message.split(' ');
            const value = parseInt(args[1]);
            if (!isNaN(value)) {
              settings.updateGiveupCost(value);
              localStorage.setItem('getGiveupCost', value);
            }
            return;
          }
          if (message.toLowerCase(message).startsWith('!setcooldownduration') && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            const args = message.split(' ');
            const value = parseInt(args[1]);
            if (!isNaN(value)) {
              settings.updateCooldownDuration(value);
              localStorage.setItem('cooldownDuration', value);
            }
            return;
          }
          if (message.toLowerCase(message).startsWith('!setinvalidguesspenalty') && ('#' + tags.username === channel || tags.username === 'j1c3_' || tags.username === 'evandotpro')) {
            const args = message.split(' ');
            const value = parseInt(args[1]);
            if (!isNaN(value)) {
              settings.updateInvalidGuessPenalty(value);
              localStorage.setItem('invalidGuessPenalty', value);
            }
            return;
          }
          return;
        }
        const doesStringContainLettersOnly = /^[a-zA-Z]+$/.test(message);
        if (!doesStringContainLettersOnly) {
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
    initializeRejectionMessages();
    initializeMandatoryYellowLetters();
  }, [client]);

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

  useEffect(() => {
  }, [getRejectionMessages]);

  useEffect(() => {
  }, [getMandatoryYellowLetters]);

  useEffect(() => {

    function readLocalStorage() {

      const storedShowDebug = localStorage.getItem('showDebug');
      if (storedShowDebug !== null) {
        settings.setShowDebug(JSON.parse(storedShowDebug));
      }

      const storedShowSettings = localStorage.getItem('showSettings');
      if (storedShowSettings !== null) {
        settings.setShowSettings(JSON.parse(storedShowSettings));
      }

      const storedSecretSetting = localStorage.getItem('secretSetting');
      if (storedSecretSetting !== null) {
        settings.updateSecretSetting(JSON.parse(storedSecretSetting));
      }

      const storedShowScoreboard = localStorage.getItem('showScoreboard');
      if (storedShowScoreboard !== null) {
        settings.updateShowScoreboard(JSON.parse(storedShowScoreboard));
      }

      const storedOnlyUseAvailableLetters = localStorage.getItem('onlyUseAvailableLetters');
      if (storedOnlyUseAvailableLetters !== null) {
        settings.updateOnlyUseAvailableLetters(JSON.parse(storedOnlyUseAvailableLetters));
      }

      const storedOnlyAllowNotTriedPositions = localStorage.getItem('onlyAllowNotTriedPositions');
      if (storedOnlyAllowNotTriedPositions !== null) {
        settings.updateOnlyAllowNotTriedPositions(JSON.parse(storedOnlyAllowNotTriedPositions));
      }

      const storedGreenLettersHaveToBeUsedInPlace = localStorage.getItem('greenLettersHaveToBeUsedInPlace');
      if (storedGreenLettersHaveToBeUsedInPlace !== null) {
        settings.updateGreenLettersHaveToBeUsedInPlace(JSON.parse(storedGreenLettersHaveToBeUsedInPlace));
      }

      const storedAllYellowLettersHaveToBeReused = localStorage.getItem('allYellowLettersHaveToBeReused');
      if (storedAllYellowLettersHaveToBeReused !== null) {
        settings.updateAllYellowLettersHaveToBeReused(JSON.parse(storedAllYellowLettersHaveToBeReused));
      }

      const storedCooldownDuration = localStorage.getItem('cooldownDuration');
      if (storedCooldownDuration !== null) {
        settings.updateCooldownDuration(JSON.parse(storedCooldownDuration));
      }

      const storedGetGiveupCost = localStorage.getItem('getGiveupCost');
      if (storedGetGiveupCost !== null) {
        settings.updateGiveupCost(JSON.parse(storedGetGiveupCost));
      }

      const storedInvalidGuessPenalty = localStorage.getItem('invalidGuessPenalty');
      if (storedInvalidGuessPenalty !== null) {
        settings.updateInvalidGuessPenalty(JSON.parse(storedInvalidGuessPenalty));
      }

    }

    function retrieveScoresFromLocalStorage() {

      const sessionKeys = Object.keys(localStorage).filter(key => key.startsWith('sessionScore_'));
      const allTimesKeys = Object.keys(localStorage).filter(key => key.startsWith('allTimesScore_'));

      const sessionScores = {};
      const allTimesScores = {};

      sessionKeys.forEach(key => {
        const user = key.replace('sessionScore_', '');
        sessionScores[user] = parseInt(localStorage.getItem(key));
      });

      allTimesKeys.forEach(key => {
        const user = key.replace('allTimesScore_', '');
        allTimesScores[user] = parseInt(localStorage.getItem(key));
      });

      setUserSessionScores(sessionScores);
      setUserAllTimesScores(allTimesScores);

    }

    readLocalStorage();
    retrieveScoresFromLocalStorage();
  }, []); // Retrieve stuff from localStorage.

  return (
    <div className={styles.gameContainer}>
      <div className={styles.leftContainer}>


        {settings.getShowScoreboard ? (
          <div className={styles.leftTopContainer}>
            <Scoreboard getUserScores={getUserSessionScores} />
          </div>
        ) : (
          <div className={styles.leftTopContainer}></div>
        )}

        <div className={styles.leftBottomContainer}>
          {getInvalidChatArray.slice(settings.getInvalidGuessesDisplayed).map((chatEntry, index) => (
            <RejectionBlock
              key={index}
              word={chatEntry[0]}
              user={chatEntry[1]}
              color={chatEntry[2]}
              answer={getAnswer}
              getInvalidLetterStatus={getInvalidLetterStatus}
              updateInvalidLetterStatus={updateInvalidLetterStatus}
              updateAnswerStatus={updateAnswerStatus}
              invalidGuessPenaltyInSeconds={invalidGuessPenaltyInSeconds}
              getErrorType={getErrorType}
              getSecretSetting={settings.getSecretSetting}
              playNopeSoundM={SoundUtils.playNopeSoundM}
              playNopeSoundF={SoundUtils.playNopeSoundF}
              playFailSound={SoundUtils.playFailSound}
              playBsSound1={SoundUtils.playBsSound1}
              playBsSound2={SoundUtils.playBsSound2}
              playBsSound3={SoundUtils.playBsSound3}
              playBsSound4={SoundUtils.playBsSound4}
            />
          ))}
        </div>
      </div>

      <div className={styles.middleContainer}>
        {/* <div className={styles.header}>
          <h1>Wordplop</h1>
          <h2>Let's make it harder, if we can...</h2>
        </div> */}
        <BigLetters
          answer={getAnswer}
          answerStatus={getAnswerStatus}
          isWordFound={isWordFound}
          playCardSound={SoundUtils.playCardSound}
        />
        <Keyboard
          letterStatus={getLetterStatus}
          playPoint1Sound={SoundUtils.playPoint1Sound}
          playPoint2Sound={SoundUtils.playPoint2Sound}
          playPoint3Sound={SoundUtils.playPoint3Sound}
        />

        {settings.getShowSettings && (
          <div>
            <div className={styles.gameSettings}>
              <h2>Game Settings</h2>
            </div>
            <div className={styles.settingsInfos}>
              <ul>
                <li>Cooldown duration: {cooldownDurationInSeconds} second(s)</li>
                <li>Penalty for invalid guess: {invalidGuessPenaltyInSeconds} second(s)</li>
                <li>Only use available letters: {settings.onlyUseAvailableLetters.toString()}</li>
                <li>Green letters must be reused in place: {settings.greenLettersHaveToBeUsedInPlace.toString()}</li>
                <li>Yellow letter must be tried in new position: {settings.onlyAllowNotTriedPositions.toString()}</li>
                <li>Yellow letters are mandatory in new guess: {settings.allYellowLettersHaveToBeReused.toString()}</li>
                <li>!giveup command cost: {settings.getGiveupCost} point(s)</li>
                <li>Secret setting: {settings.getSecretSetting.toString()}</li>
              </ul>
            </div>
          </div>
        )}

        {settings.getShowDebug && (
          <div>
            <div className={styles.debugMessagesTitle}>
              <h2>Debug part</h2>
            </div>
            <div className={styles.debugMessages}>
              <ul>
                {/* Maybe make the -5 a variable at some point */}
                {getRejectionMessages.slice(-5).map((message, index) => (
                  <li key={index}>
                    <span style={{ color: "white", opacity: 1, textShadow: `1px 1px 7px ${message.userColor}` }}>@{message.user}</span>: {message.word} {message.messageString}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
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
              updateMandatoryYellowLetters={updateMandatoryYellowLetters}
              playWinSound={SoundUtils.playWinSound}
              playWhooshSound={SoundUtils.playWhooshSound}
              timeoutLength={timeoutLength}
            />
          ))}
        </div>
        {!client && (
          <EntryField addChatMessage={addChatMessage} wordLength={settings.wordLength} />
        )}
      </div>
    </div>
  );
}
// seize: slack, sever, sends < sends should have been rejected, sever tells us 2 "e" but sends is accepted
// haste: adieu rebar exact tapes thema theme... broken. should be fixed

// Added localStorage stuff:
// -show/hide debug panel (!showdebug, !hidedebug)
// -show/hide settings (!showsettings, !hidesettings)
// -show/hide scoreboard (!setshowscoreboard true/false)
// -secretSetting switch (!setsecretsetting true/false)
// -onlyUseAvailableLetters switch (!setonlyuseavailableletters true/false)
// -onlyAllowNotTriedPositions switch (!setonlyallownottriedpositions true/false)
// -greenLettersHaveToBeUsedInPlace switch (!greenlettershavetobeusedinplace true/false)
// -allYellowLettersHaveToBeReused switch (!allyellowlettershavetobereused true/false)
// -setcooldownduration command (!setcooldownduration value(in ms))
// -setInvalidGuessPenalty command (!setinvalidguesspenalty value(in ms))
// -setgiveupcost command (!updategiveupcost value(in points))
// Added sounds depending on type of 'failure'