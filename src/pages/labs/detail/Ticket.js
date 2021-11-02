import styles from './Ticket.less';

const Ticket = ({ item }) => {
  const formatDraw = num => {
    const zeroNum = 6;
    if (num.length >= zeroNum) return num;

    if (num) {
      return new Array(zeroNum - num.length)
        .fill(0)
        .concat(num)
        .join('');
    } else {
      return '';
    }
  };
  return <div className={`${styles.ticket} ${item.won === 1 && styles.won}`}>{formatDraw(item.drawNum)}</div>;
};

export default Ticket;
