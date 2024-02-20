import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./index.module.scss";

function CooldownTimer(props) {
  const timerCircleRef = useRef(null);

  useEffect(() => {
    function startCooldownTimer() {
      const timerCircle = timerCircleRef.current;

      const tl = gsap.timeline();

      // Animate the timer circle counterclockwise over three seconds
      tl.to(timerCircle, {
        "--p": "100",
        duration: props.timeoutLength / 1000,
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

    startCooldownTimer();
  }, []);

  return <div ref={timerCircleRef} className={styles.cooldownTimer}></div>;
}

export default CooldownTimer;
