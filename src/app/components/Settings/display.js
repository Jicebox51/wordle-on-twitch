import React, { useState, useEffect } from "react";

export const displaySettings = () => {

  const [getInvalidGuessesDisplayed, setInvalidGuessesDisplayed] = useState(-12);
  const [getShowScoreboard, setShowScoreboard] = useState(false);
  const [getShowSettings, setShowSettings] = useState(false);
  const [getShowDebug, setShowDebug] = useState(false);
  const [getShowGame, setShowGame] = useState(true);
  const [getScoresView, setScoresView] = useState(true);
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

  const updateScoresView = (value) => {
    setScoresView(value);
  };

  useEffect(() => {
  }, [getScoresView]);

  const updateShowGame = (value) => {
    setShowGame(value);
  };

  useEffect(() => {
  }, [getShowGame]);

  return {
    setShowDebug,
    getShowDebug,
    setShowSettings,
    getShowSettings,
    updateInvalidGuessesDisplayed,
    getInvalidGuessesDisplayed,
    updateShowScoreboard,
    getShowScoreboard,
    updateScoresView,
    getScoresView,
    updateShowGame,
    getShowGame,
  };
};