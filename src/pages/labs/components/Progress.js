import styles from './Progress.less';

const Progress = ({ rate = 0 }) => {
  return (
    <div className={styles.box}>
      <div className={styles.text}>{rate.toFixed(0)}%</div>
      {rate > 0 && <div className={styles.Progress} style={{ width: `${rate <= 100 ? rate : 100}%` }}></div>}
    </div>
  );
};

export default Progress;
