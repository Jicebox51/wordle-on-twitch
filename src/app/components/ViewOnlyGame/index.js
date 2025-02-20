import React, { useState, useEffect, useRef } from 'react';

export default function ViewOnlyGame({ channel }) {
  const [gameHTML, setGameHTML] = useState('');
  const wsRef = useRef(null);
  const updateIntervalRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/ws?channel=${channel}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('ViewOnlyGame: Connected to WebSocket server');
      requestRender();
    };

    ws.onmessage = (event) => {
        const processData = (jsonData) => {
          const data = JSON.parse(jsonData);
          if (data.type === 'gameRender') {
            setGameHTML(data.payload.html);
          } else if (data.type === 'triggerUpdate') {
            startUpdateInterval();
          }
        };
      
        if (event.data instanceof Blob) {
          event.data.text().then(text => {
            processData(text);
          }).catch(error => {
            console.error('Error processing Blob data:', error);
          });
        } else {
          try {
            processData(event.data);
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        }
      };
      

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [channel]);

  const requestRender = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'requestRender' }));
    }
  };

  const startUpdateInterval = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
    let updateCount = 0;
    updateIntervalRef.current = setInterval(() => {
      requestRender();
      updateCount++;
      if (updateCount >= 3000) { // 3 seconds (100 * 30ms)
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    }, 30);
  };

  return (
    <div dangerouslySetInnerHTML={{ __html: gameHTML }} />
  );
}
