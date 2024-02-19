import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./index.module.scss";

function PenaltyTimer(props) {
  const timerCircleRef = useRef(null);
  console.log('timeout from PenaltyTimer: ', props.invalidGuessPenalty);

  useEffect(() => {
    function startPenaltyTimer() {
      const timerCircle = timerCircleRef.current;

      const tl = gsap.timeline();

      // Animate the timer circle counterclockwise over three seconds
      tl.to(timerCircle, {
        "--p": "100",
        duration: props.invalidGuessPenalty / 1000,
        ease: "linear",
      });
      tl.to(timerCircle, {
        "--c": "#88ff88",
        duration: 0,
        ease: "linear",
      });
      tl.to(timerCircle, {
        opacity: 0,
        duration: 0.3,
        ease: "linear",
      });
    }

    startPenaltyTimer();
  }, []);

  return <div ref={timerCircleRef} className={styles.penaltyTimer}></div>;
}

export default PenaltyTimer;
