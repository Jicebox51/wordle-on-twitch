import React, { useState, useEffect } from "react";

export const displaySettings = () => {

  const [getInvalidGuessesDisplayed, setInvalidGuessesDisplayed] = useState(-12);
  const [getShowScoreboard, setShowScoreboard] = useState(false);
  const [getShowSettings, setShowSettings] = useState(false);
  const [getShowDebug, setShowDebug] = useState(false);
  // need !hidegame and !showgame
  // fade out feat. when no guesses for x minutes

  const updateInvalidGuessesDisplayed = (value) => {
    if (!isNaN(value)) {
      setInvalidGuessesDisplayed(value);
    }
  };

  useEffect(() => {
  }, [getInvalidGuessesDisplayed]);

  const updateShowScoreboard = (value) => {
    setShowScoreboard(value);
  };

  useEffect(() => {
  }, [getShowScoreboard]);

  return {
    setShowDebug,
    getShowDebug,
    setShowSettings,
    getShowSettings,
    updateInvalidGuessesDisplayed,
    getInvalidGuessesDisplayed,
    updateShowScoreboard,
    getShowScoreboard,
  };
};