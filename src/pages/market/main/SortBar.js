import { formatMessage } from 'umi-plugin-locale';

const SortBar = ({ styles, sortTab, setSortTab, upDown, setUpDown }) => {
  const setSort = tab => {
    setSortTab(tab);
    switch (upDown) {
      case 'none':
        setUpDown('up');
        break;
      case 'up':
        setUpDown('down');
        break;
      case 'down':
        setUpDown('none');
        break;
      default:
        setUpDown('none');
        break;
    }
  };
  return (
    <div className={styles.sortBar}>
      <p
        onClick={() => {
          setSort('currency');
        }}
      >
        {formatMessage({ id: 'container.market' })}
        <span className={styles.sortArrow}>{'currency' === sortTab && <i className={`iconfont iconic_sort ${styles[upDown]}`}></i>}</span>/
        {formatMessage({ id: 'queue.list.history_tradedAmount' })}
      </p>
      <p
        onClick={() => {
          setSort('c');
        }}
      >
        {formatMessage({ id: 'trade.list.price' })}
        <span className={styles.sortArrow}>{'c' === sortTab && <i className={`iconfont iconic_sort ${styles[upDown]}`}></i>}</span>
      </p>
      <p
        onClick={() => {
          setSort('rate');
        }}
      >
        24H{formatMessage({ id: 'product.list.change' })}
        <span className={styles.sortArrow}>{'rate' === sortTab && <i className={`iconfont iconic_sort ${styles[upDown]}`}></i>}</span>
      </p>
    </div>
  );
};

export default SortBar;
