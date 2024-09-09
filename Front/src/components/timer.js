import React, { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds(prevSeconds => prevSeconds + 1);
    }, 700);

    // Cleanup function to clear interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run effect only once on mount
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
  <div>
    please wait
    <div>
      {minutes < 10 ? '0' + minutes : minutes}:
      {remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds} 
    </div>
  </div>
  );
}

export default Timer;
