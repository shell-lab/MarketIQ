"use client";

import { useState, useEffect } from 'react';

const TerminalView = () => {
  const [log, setLog] = useState([]);

  useEffect(() => {
    const messages = [
      "Initializing market data stream...",
      "Connecting to data feed...",
      "Connection established.",
      "Streaming real-time quotes...",
      "[INFO] AAPL: $172.25 (+1.50)",
      "[INFO] GOOGL: $139.80 (-0.75)",
      "[INFO] MSFT: $370.95 (+2.10)",
      "[ALERT] High volume detected for NVDA.",
      "[INFO] NVDA: $490.60 (+15.20)",
      "[INFO] TSLA: $240.15 (-3.50)",
      "[INFO] AMZN: $145.30 (+0.90)",
      "[INFO] META: $330.80 (-1.20)",
      "[SUCCESS] Trade executed: BUY 100 shares of AAPL @ $172.25",
      "[ERROR] Connection to secondary feed lost. Reconnecting...",
      "[INFO] Reconnected to secondary feed.",
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setLog(prevLog => [...prevLog, messages[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-green-400 font-mono text-sm rounded-lg p-4 h-96 overflow-y-scroll">
      <div className="border-b border-gray-700 mb-2 pb-2">
        <h2 className="text-lg font-bold">Market Data Stream</h2>
      </div>
      <div>
        {log.map((line, index) => (
          <div key={index} className="flex">
            <span className="text-gray-500 mr-2">{`[${new Date().toLocaleTimeString()}]`}</span>
            <span>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TerminalView;
