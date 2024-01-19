import { useEffect } from "react";

function Timer({secondsRemaining, dispatch}) {
    useEffect(function() {
        const id = setInterval(function() {dispatch({type:"tick"})}, 1000);
        return () => clearInterval(id)
    }, [dispatch])

    const min = Math.floor(secondsRemaining / 60);
    const sec = Math.floor(secondsRemaining % 60)

    return (
      <div className="timer" >
        {min < 10 ? 0 : ""}{min}:{sec < 10 ? 0 : ""}{sec}
      </div>
    );
  }
  
export default Timer;