import styles from "./index.module.scss";

function WordLetter(props) {
  const { letter, rejectionStatus, status, length } = props;

  return (
    <div
      // adding rejectionStatus
      // 0=not rejected
      // 1=letter gone but used(blue)
      // 2=green not reused or in other spot(purple)
      // 3=yellow not reused or reused in same spot(red)
      className={`${styles.letter} ${rejectionStatus === 3 && styles.red} ${rejectionStatus === 2 && styles.purple} ${rejectionStatus === 1 && styles.blue} ${status === 2 && styles.green} ${
        status === 1 && styles.yellow
      }`}
      style={{
        "--w": `calc(min(60px, 3.75vw) * 5 / ${length})`,
      }}
    >
      {letter}
    </div>
  );
}

export default WordLetter;
