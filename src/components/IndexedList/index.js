import { useReducer } from 'react';
import { SearchBar, Toast } from 'antd-mobile';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import styles from './index.less';

/**
 * categoryData: {A: [{id: xx, name: AXX}, ...]}
 * sortIndexs: [A, B, C, ...]
 * originData 原始全量数据，用于搜索
 */

const initialState = {
  stickyKey: '',
  anchorKey: '',
  searchList: [],
  keyword: ''
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const IndexedList = ({ categoryData, sortIndexs, originData, onClickRowHandle, onClickCancel, type }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const { anchorKey, stickyKey, searchList, keyword } = state;
  const scrollToAnchor = id => {
    const anchorElement = document.querySelector(`#${id}`);

    if (anchorElement) {
      const top = anchorElement.getBoundingClientRect().top;
      const $main = document.querySelector('#main');

      $main.scrollTo(0, top + $main.scrollTop - 43);

      setState({ anchorKey: id });
    }
  };

  const onChange = keyword => {
    let searchList = [];

    if (keyword) {
      searchList = originData.filter(item => item.currency.toLowerCase().includes(keyword.toLowerCase()));
    }

    setState({ searchList, keyword });
  };

  const onScroll = e => {
    if (keyword) return false;

    for (const item of sortIndexs) {
      const offsetTop = document.querySelector(`#${item}`).getBoundingClientRect().top;

      if (offsetTop <= 44) {
        setState({ stickyKey: item, anchorKey: item });
      }
    }
  };

  const onTouchMove = e => {
    e.persist();
    const movePageY = e.targetTouches[0].pageY;

    for (const item of sortIndexs) {
      const offsetTop = document.querySelector(`.anchor-${item}`).getBoundingClientRect().top;

      if (movePageY - offsetTop >= 0 && movePageY - offsetTop <= 10) {
        scrollToAnchor(item);
      }
    }
  };

  const handleClick = (disable, name) => {
    if (disable) {
      Toast.info(formatMessage({ id: type === 'recharge' ? 'mc_assets_disabled_deposit' : 'mc_assets_disabled_withdraw' }));
    } else {
      onClickRowHandle(name);
    }
  };

  return (
    <div className={styles.wrap}>
      <SearchBar
        placeholder={formatMessage({ id: 'assets.list.search' })}
        className={styles.search}
        showCancelButton
        cancelText={formatMessage({ id: 'common.cancel' })}
        onChange={onChange}
        onCancel={onClickCancel}
      />
      <div className={styles.main} id="main" onScroll={onScroll}>
        {searchList.length !== 0 && (
          <ul className={styles.row}>
            {searchList.map(el => {
              const disalbeClick = type === 'recharge' ? !el.enableDeposit : !el.enableWithdraw;
              return (
                <li
                  key={el.vcoinId}
                  className={classNames({ [styles.disalbe]: disalbeClick })}
                  onClick={() => handleClick(disalbeClick, el.currency)}
                >
                  {el.currency}
                </li>
              );
            })}
          </ul>
        )}
        {!keyword &&
          Object.keys(categoryData).map((key, index) => {
            const item = categoryData[key];
            return (
              <ul className={styles.row} key={index}>
                <li className={styles.title} key={key} id={key}>
                  <div className={classNames({ [styles.sticky]: key === stickyKey })}>{key}</div>
                </li>
                {item.map(el => {
                  const disalbeClick = type === 'recharge' ? !el.enableDeposit : !el.enableWithdraw;
                  return (
                    <li
                      key={el.id}
                      className={classNames({ [styles.disalbe]: disalbeClick })}
                      onClick={() => handleClick(disalbeClick, el.name)}
                    >
                      {el.name}
                    </li>
                  );
                })}
              </ul>
            );
          })}
      </div>
      <ul className={styles.anchor} onTouchMove={onTouchMove}>
        {Object.keys(categoryData).map((key, index) => (
          <li
            key={index}
            className={classNames(`anchor-${key}`, { [styles.active]: key === anchorKey })}
            onClick={() => scrollToAnchor(key)}
          >
            {key}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IndexedList;
