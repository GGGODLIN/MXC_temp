import { useReducer } from 'react';
import classNames from 'classnames';
import { formatMessage } from 'umi-plugin-locale';

import Main from './Main';
import Otc from './Otc';
import Contract from './Contract';
import Margin from './Margin';

import styles from './Account.less';

const initialState = {
  tab: 'main',
  checked: false,
  keyword: ''
};

function reducer(state, payload) {
  return { ...state, ...payload };
}

const Account = ({ eyes, balances }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const { tab, checked, keyword } = state;

  const accountProps = {
    eyes,
    checked,
    keyword,
    balances,
    setFilterState: setState
  };
  const accountMaps = {
    main: <Main {...accountProps} />,
    otc: <Otc {...accountProps} />,
    contract: <Contract {...accountProps} />,
    margin: <Margin {...accountProps} />
  };

  const switchTab = tab => {
    setState({ tab });
    localStorage.setItem('assets.hidden.minBalances', false);
  };

  return (
    <div className={styles.main}>
      <div className={styles.tabs}>
        <div className={classNames({ [styles.active]: tab === 'main' })} onClick={() => switchTab('main')}>
          {formatMessage({ id: 'assets.exchange_account' })}
        </div>
        <div className={classNames({ [styles.active]: tab === 'otc' })} onClick={() => switchTab('otc')}>
          {formatMessage({ id: 'assets.fiat_account' })}
        </div>
        <div className={classNames({ [styles.active]: tab === 'margin' })} onClick={() => switchTab('margin')}>
          {formatMessage({ id: 'margin.title.account' })}
        </div>
        <div className={classNames({ [styles.active]: tab === 'contract' })} onClick={() => switchTab('contract')}>
          {formatMessage({ id: 'assets.swap_account' })}
        </div>
      </div>
      {accountMaps[tab]}
    </div>
  );
};

export default Account;
