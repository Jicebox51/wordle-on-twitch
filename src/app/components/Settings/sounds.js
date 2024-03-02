import React, { useState, useEffect } from "react";

export const soundSettings = () => {

  const [getSecretSetting, setSecretSetting] = useState(false);

  const updateSecretSetting = (value) => {
    setSecretSetting(value);
  };

  useEffect(() => {
  }, [getSecretSetting]);

  return {
    getSecretSetting,
    updateSecretSetting,
  }

};