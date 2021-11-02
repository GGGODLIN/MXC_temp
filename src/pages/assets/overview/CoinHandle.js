import { useReducer, useEffect } from 'react';
import { Checkbox, InputItem } from 'antd-mobile';
import classNames from 'classnames';
import styles from './CoinHandle.less';
import { formatMessage } from 'umi-plugin-locale';

const AgreeItem = Checkbox.AgreeItem;

let timer = null;

const initialState = { checked: false, keyword: '', sticky: false };

function reducer(state, payload) {
  return { ...state, ...payload };
}
const CoinHandle = ({ setFilterState, checked }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const { sticky } = state;
  const hiddenMinBalances = localStorage.getItem('assets.hidden.minBalances') === 'true' ? true : false;

  useEffect(() => {
    //定时检测CoinHandle距离顶部距离，实现sticky
    timer = setInterval(Interval, 200);

    setFilterState({ checked: hiddenMinBalances });

    return () => clearInterval(timer);
  }, []);

  const Interval = e => {
    const { top } = document.querySelector('#handleBar').getBoundingClientRect();

    if (top <= 0) {
      setState({ sticky: true });
    } else {
      setState({ sticky: false });
    }
  };

  const checkedHandler = e => {
    const checked = e.target.checked;

    localStorage.setItem('assets.hidden.minBalances', checked);
    setFilterState({ checked });
  };

  return (
    <div className={styles.main} id="handleBar">
      <div className={classNames(styles.content, { [styles.sticky]: sticky })}>
        <div className={styles.checkbox}>
          <AgreeItem onChange={checkedHandler} checked={checked}>
            {formatMessage({ id: 'assets.hide_0' })}
          </AgreeItem>
        </div>
        <div className={styles.search}>
          <InputItem
            className="am-search-input am-input-small"
            placeholder={formatMessage({ id: 'assets.list.search' })}
            onChange={keyword => setFilterState({ keyword, checked: false })}
            clear
          >
            <i className="iconfont iconsousuo"></i>
          </InputItem>
        </div>
      </div>
    </div>
  );
};

export default CoinHandle;
