import React, { useState, useEffect } from "react";

export const difficultySettings = () => {

  // Get all settings from URL with a default value if not present in the URL:

  // Difficulty:
  const wordLength = 5; // need to pass this to SoundUtils
  const [onlyUseAvailableLetters, setOnlyUseAvailableLetters] = useState(true);
  const [onlyAllowNotTriedPositions, setOnlyAllowNotTriedPositions] = useState(true);
  const [greenLettersHaveToBeUsedInPlace, setGreenLettersHaveToBeUsedInPlace] = useState(true);
  const [allYellowLettersHaveToBeReused, setAllYellowLettersHaveToBeReused] = useState(true);

  const updateOnlyUseAvailableLetters = (value) => {
    setOnlyUseAvailableLetters(value);
  };

  useEffect(() => {
  }, [onlyUseAvailableLetters]);

  const updateOnlyAllowNotTriedPositions = (value) => {
    setOnlyAllowNotTriedPositions(value);
  };

  useEffect(() => {
  }, [onlyAllowNotTriedPositions]);

  const updateGreenLettersHaveToBeUsedInPlace = (value) => {
    setGreenLettersHaveToBeUsedInPlace(value);
  };

  useEffect(() => {
  }, [greenLettersHaveToBeUsedInPlace]);

  const updateAllYellowLettersHaveToBeReused = (value) => {
    setAllYellowLettersHaveToBeReused(value);
  };

  useEffect(() => {
  }, [allYellowLettersHaveToBeReused]);

  return {
    wordLength,
    updateOnlyUseAvailableLetters,
    onlyUseAvailableLetters,
    updateOnlyAllowNotTriedPositions,
    onlyAllowNotTriedPositions,
    updateGreenLettersHaveToBeUsedInPlace,
    greenLettersHaveToBeUsedInPlace,
    updateAllYellowLettersHaveToBeReused,
    allYellowLettersHaveToBeReused,
  };
};