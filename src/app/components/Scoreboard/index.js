import styles from "./index.module.scss";

function Scoreboard(props) {
  const {
    getUserScores,
    getScoresView,
  } = props;

  // Sort data by score in descending order
  const sortedScores = Object.entries(getUserScores).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div>
      {getScoresView ? (
        <><h3 className={styles.scoreboardType}>Session</h3><h2 className={styles.scoreboardTitle}>Scoreboard:</h2></>
      ) : (
        <><h3 className={styles.scoreboardType}>All Times</h3><h2 className={styles.scoreboardTitle}>Scoreboard:</h2></>
      )}
      <ol>
        {sortedScores.map(([username, score]) => (
          <li key={username} className={styles.scoreboardItem}>
            <span className={styles.username}>{username}</span>
            <span className={styles.score}>{score}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Scoreboard;
