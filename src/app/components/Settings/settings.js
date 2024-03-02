import React, { useState, useEffect } from "react";

export const useSettings = () => {

  // Get all settings from URL with a default value if not present in the URL:

  // sound:
  // Cooldowns/Penalties
  // Specific user timeout on valid guess:
  // Time during which any invalid guess will not be taken into account after a user made a valid one
  // (this to avoid penalty when 2 users send almost same time):
  const [cooldownDuration, setCooldownDuration] = useState(1000);
  // Time penalty on invalid guess:
  const [invalidGuessPenalty, setInvalidGuessPenalty] = useState(10000);
  // Self explanatory, cost in points to give up on the current word:
  const [getGiveupCost, setGiveupCost] = useState(25);
  // Unused yet:
  const penaltyForNonExistingWords = false;
  const penaltyForUsingRemovedLetter = false;

  const updateCooldownDuration = (value) => {
    setCooldownDuration(value);
  };

  useEffect(() => {
  }, [cooldownDuration]);

  const updateInvalidGuessPenalty = (value) => {
    setInvalidGuessPenalty(value);
  };

  useEffect(() => {
  }, [invalidGuessPenalty]);

  const updateGiveupCost = (value) => {
    setGiveupCost(value);
  };

  useEffect(() => {
  }, [getGiveupCost]);

  return {
    updateCooldownDuration,
    cooldownDuration,
    updateInvalidGuessPenalty,
    invalidGuessPenalty,
    updateGiveupCost,
    getGiveupCost,
  };
};