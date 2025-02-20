"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.scss";
import StartingScreen from "./components/StartingScreen";
import Game from "./components/Game";
import ViewOnlyGame from "./components/ViewOnlyGame";

export default function Home() {
  const searchParams = useSearchParams();
  const [getClient, setClient] = useState(undefined);
  const [getChannel, setChannel] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const tmi = require("tmi.js");

  const playOffline = () => {
    setIsConnected(true);
  };

  const changeChannel = (channel) => {
    setChannel(channel);
  };

  useEffect(() => {
    if (getClient) {
      setIsConnecting(true);
      let tryConnection;
      let connectionTries = 0;

      const checkConnection = () => {
        if (getClient.channels.length > 0) {
          setIsConnected(true);
          clearInterval(tryConnection);
          const params = new URLSearchParams(searchParams.toString());
          params.set("channel", getClient.getChannels()[0].slice(1));
          if (isViewOnly) {
            params.set("view", "true");
          }
          window.history.pushState(null, "", `?${params.toString()}`);
        } else if (connectionTries >= 5) {
          clearInterval(tryConnection);
          alert("Connection failed");
          setChannel("");
          setIsConnecting(false);
          const params = new URLSearchParams(searchParams.toString());
          params.delete("channel");
          const queryString = params.toString();
          const newUrl = queryString ? `?${queryString}` : "/";
          window.history.pushState(null, "", newUrl);
          setClient(null);
        } else {
          connectionTries++;
        }
      };

      tryConnection = setInterval(checkConnection, 500);
    }
  }, [getClient, isViewOnly, searchParams]);

  useEffect(() => {
    if (getChannel && !isViewOnly) {
      let client = new tmi.Client({
        channels: [getChannel],
      });
      setClient(client);
      client.connect();
    }
  }, [getChannel, isViewOnly]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const channelParam = searchParams.get("channel");
    const viewParam = searchParams.get("view");

    if (channelParam) {
      setIsConnecting(true);
      setChannel(channelParam);
    }
    if (viewParam === 'true') {
      setIsViewOnly(true);
      setIsConnected(true);  // Add this line
      console.log("Setting view-only mode and connected state");
    }
    setIsLoading(false);
  }, []);

  console.log("Home component state:", {
    isConnected,
    isConnecting,
    isLoading,
    isViewOnly,
    channel: getChannel
  });

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isViewOnly) {
    console.log("Rendering ViewOnlyGame");
    return <ViewOnlyGame channel={getChannel} />;
  }

  if (!isConnected) {
    if (isConnecting) {
      return <span>Connecting...</span>;
    }
    return (
      <StartingScreen
        changeChannel={changeChannel}
        playOffline={playOffline}
      />
    );
  }

  return <Game client={getClient} channel={getChannel} />;
}

