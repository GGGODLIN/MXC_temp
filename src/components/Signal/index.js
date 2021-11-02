import { useEffect } from 'react';
import styles from './index.less';

const Signal = ({ height = 12, width = 4, thresholds = [500, 1000, 2000, 8000], strength = 9999 }) => {
  // console.log('strength ', strength);
  return (
    <ul className={styles.signalStrength} style={{ height }}>
      <li
        style={{
          width,
          backgroundColor: strength > thresholds[3] ? '#bbbbbb' : 'var(--up-color)',
          marginTop: (3 * height) / 4
        }}
      ></li>
      <li
        style={{
          width,
          backgroundColor: strength > thresholds[2] ? '#bbbbbb' : 'var(--up-color)',
          marginTop: (2 * height) / 4
        }}
      ></li>
      <li
        style={{
          width,
          backgroundColor: strength > thresholds[1] ? '#bbbbbb' : 'var(--up-color)',
          marginTop: (1 * height) / 4
        }}
      ></li>
      <li
        style={{
          width,
          backgroundColor: strength > thresholds[0] ? '#bbbbbb' : 'var(--up-color)'
        }}
      ></li>
    </ul>
  );
};

export default Signal;
